import { defineStore } from 'pinia'
import { useBetsStore } from './bets'
import { getSimulatedRunners } from '../composables/useOddsSimulation'
import { timerManager } from '../utils/timerManager'
import { persistenceManager } from '../utils/persistenceManager'

/**
 * Category IDs as specified by the task brief.
 */
export const CATEGORY_IDS = {
  HORSE: '4a2788f8-e825-4d36-9894-efd4baf1cfae',
  GREYHOUND: '9daef0d7-bf3c-4f50-921d-8e818c60fe61',
  HARNESS: '161d9be2-e909-4326-8c2c-35ed71fb460b'
} as const

export type CategoryId = typeof CATEGORY_IDS[keyof typeof CATEGORY_IDS]

/**
 * Minimal shape of a race item coming from Neds API after normalization.
 */
export interface RaceSummary {
  id: string
  meeting_name: string
  race_number: number
  advertised_start_ms: number
  category_id: CategoryId | string
}

interface NedsApiRaceRaw {
  race_id: string
  meeting_name: string
  race_number: number | string
  advertised_start: {
    seconds: number | string
  }
  category_id: string
}

interface NedsApiResponse {
  status: number
  data?: {
    next_to_go_ids: string[]
    race_summaries: Record<string, NedsApiRaceRaw>
  }
  message?: string
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

/**
 * Cache entry structure
 */
interface CacheEntry {
  data: RaceSummary[]
  timestamp: number
  ttl: number // time to live in milliseconds
}

/**
 * Utility: current epoch ms
 */
const now = () => Date.now()

/**
 * Normalize raw API race to internal model.
 */
function normalizeRace(raw: NedsApiRaceRaw): RaceSummary {
  const secs = typeof raw.advertised_start?.seconds === 'string'
    ? parseInt(raw.advertised_start.seconds, 10)
    : Number(raw.advertised_start?.seconds ?? 0)

  const result = {
    id: raw.race_id,
    meeting_name: raw.meeting_name,
    race_number: typeof raw.race_number === 'string' ? parseInt(raw.race_number, 10) : Number(raw.race_number),
    advertised_start_ms: secs * 1000,
    category_id: raw.category_id
  }
  
  return result
}

/**
 * Store configuration:
 * - Holds fetched races
 * - Maintains selected categories
 * - Exposes derived "next five" filtered and sorted
 * - Handles expiry (remove after 60s post start)
 * - Manages polling + ticking intervals with cleanup
 */
export const useRacesStore = defineStore('races', {
  state: () => ({
    races: [] as RaceSummary[],
    selectedCategories: new Set<CategoryId | string>([
      CATEGORY_IDS.HORSE,
      CATEGORY_IDS.GREYHOUND,
      CATEGORY_IDS.HARNESS
    ]),
    loadState: 'idle' as LoadState,
    errorMessage: '' as string,
    // Search and filter state
    searchQuery: '' as string,
    timeFilter: 'all' as 'all' | 'next-hour' | 'next-2-hours' | 'next-4-hours',
    sortOrder: 'time-asc' as 'time-asc' | 'time-desc' | 'name-asc' | 'name-desc',
    // Caching
    cache: new Map<string, CacheEntry>(),
    cacheTTL: 30000, // 30 seconds cache TTL
    // Internal timers
    _tickHandle: null as number | null,
    _pollHandle: null as number | null
  }),
  
  getters: {
    /**
     * Active races filtered by selected categories and not expired.
     * Sorted by soonest advertised_start.
     */
    activeRaces(state): RaceSummary[] {
      const cutoffNow = now()
      let filtered = state.races
        .filter(r => state.selectedCategories.has(r.category_id))
        .filter(r => !isExpired(r, cutoffNow))
      
      // Apply search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(r => 
          r.meeting_name.toLowerCase().includes(query) ||
          r.race_number.toString().includes(query) ||
          // In simulation mode, also filter by runner names
          (isInSimulationMode() && raceHasRunnerMatchingQuery(r, query))
        )
      }
      
      // Apply time filter
      const currentTime = now()
      switch (state.timeFilter) {
        case 'next-hour':
          filtered = filtered.filter(r => r.advertised_start_ms <= currentTime + 3600000)
          break
        case 'next-2-hours':
          filtered = filtered.filter(r => r.advertised_start_ms <= currentTime + 7200000)
          break
        case 'next-4-hours':
          filtered = filtered.filter(r => r.advertised_start_ms <= currentTime + 14400000)
          break
      }
      
      // Apply sorting
      switch (state.sortOrder) {
        case 'time-asc':
          filtered.sort((a, b) => a.advertised_start_ms - b.advertised_start_ms)
          break
        case 'time-desc':
          filtered.sort((a, b) => b.advertised_start_ms - a.advertised_start_ms)
          break
        case 'name-asc':
          filtered.sort((a, b) => a.meeting_name.localeCompare(b.meeting_name))
          break
        case 'name-desc':
          filtered.sort((a, b) => b.meeting_name.localeCompare(a.meeting_name))
          break
      }
      
      return filtered
    },
    /**
     * Slice of the next five races.
     */
    nextFive(state): RaceSummary[] {
      // Use the activeRaces getter which already applies all filters and sorting
      const activeRaces = this.activeRaces
      
      return activeRaces.slice(0, 5)
    },
    /**
     * Group active races by meeting name for the meetings view.
     */
    racesByMeeting(state): Record<string, RaceSummary[]> {
      const cutoffNow = now()
      let filtered = this.activeRaces
      
      const grouped: Record<string, RaceSummary[]> = {}
      
      for (const race of filtered) {
        if (!grouped[race.meeting_name]) {
          grouped[race.meeting_name] = []
        }
        grouped[race.meeting_name].push(race)
      }
      
      // Sort races within each meeting by race number
      for (const meeting in grouped) {
        grouped[meeting].sort((a, b) => a.race_number - b.race_number)
      }
      
      return grouped
    }
  },
  
  actions: {
    /**
     * Initialize store with persisted state
     */
    initFromPersistence(): void {
      try {
        // Define migration function for selectedCategories (v1 to v2)
        const migrateSelectedCategories = (data: any): string[] => {
          if (Array.isArray(data)) {
            return data;
          }
          return [
            CATEGORY_IDS.HORSE,
            CATEGORY_IDS.GREYHOUND,
            CATEGORY_IDS.HARNESS
          ];
        };

        // Load persisted state for selected categories (v2 schema)
        const persistedCategories = persistenceManager.load<string[]>(
          'races:selectedCategories', 
          2, 
          migrateSelectedCategories
        );
        
        if (persistedCategories) {
          // Replace the Set with a new one created from the persisted array
          this.selectedCategories = new Set(persistedCategories);
        }

        // Load persisted state for search and filter settings (v1 schema)
        const persistedSettings = persistenceManager.load<{
          searchQuery: string;
          timeFilter: 'all' | 'next-hour' | 'next-2-hours' | 'next-4-hours';
          sortOrder: 'time-asc' | 'time-desc' | 'name-asc' | 'name-desc';
        }>('races:settings', 1);
        
        if (persistedSettings) {
          this.searchQuery = persistedSettings.searchQuery || '';
          this.timeFilter = persistedSettings.timeFilter || 'all';
          this.sortOrder = persistedSettings.sortOrder || 'time-asc';
        }
      } catch (error) {
        console.warn('Failed to initialize races store from persistence:', error);
      }
    },

    /**
     * Persist selected categories to localStorage
     */
    persistSelectedCategories(): void {
      try {
        persistenceManager.save('races:selectedCategories', Array.from(this.selectedCategories), 2);
      } catch (error) {
        console.warn('Failed to persist selected categories:', error);
      }
    },

    /**
     * Persist search and filter settings to localStorage
     */
    persistSettings(): void {
      try {
        const settings = {
          searchQuery: this.searchQuery,
          timeFilter: this.timeFilter,
          sortOrder: this.sortOrder
        };
        persistenceManager.save('races:settings', settings, 1);
      } catch (error) {
        console.warn('Failed to persist settings:', error);
      }
    },

    /**
     * Fetch races from the Neds endpoint, normalize, and merge.
     * Keeps a bounded list (e.g., last 50) to avoid unbounded growth.
     */
    async fetchRaces(retryCount = 0): Promise<void> {
      this.loadState = this.loadState === 'idle' ? 'loading' : this.loadState
      this.errorMessage = ''
      
      // Check cache first
      const cacheKey = 'races'
      const cached = this.cache.get(cacheKey)
      const currentTime = now()
      
      if (cached && (currentTime - cached.timestamp) < cached.ttl) {
        // Use cached data
        this.races = cached.data
        this.loadState = 'ready'
        return
      }
      
      try {
        const res = await fetch('/api/rest/v1/racing/?method=nextraces&count=10', {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        })

        if (!res.ok) {
          let errorMsg = `Failed to fetch races: HTTP ${res.status}`
          switch (res.status) {
            case 404:
              errorMsg = 'Races data not found (404)'
              break
            case 500:
              errorMsg = 'Server error occurred while fetching races (500)'
              break
            case 503:
              errorMsg = 'Races service temporarily unavailable (503)'
              break
            case 429:
              errorMsg = 'Too many requests. Please try again later (429)'
              break
            default:
              if (res.status >= 500) {
                errorMsg = `Server error occurred while fetching races (${res.status})`
              } else if (res.status >= 400) {
                errorMsg = `Client error occurred while fetching races (${res.status})`
              }
          }
          throw new Error(errorMsg)
        }

        const json = (await res.json()) as NedsApiResponse

        if (!json || json.status !== 200 || !json.data) {
          throw new Error(json?.message || 'Unexpected API response format')
        }

        const items: RaceSummary[] = json.data.next_to_go_ids
          .map((id) => json.data!.race_summaries[id])
          .filter(Boolean)
          .map(normalizeRace)

        // Merge unique by id (prefer newest attributes)
        const map = new Map<string, RaceSummary>()
        for (const existing of this.races) {
          map.set(existing.id, existing)
        }
        for (const item of items) {
          map.set(item.id, item)
        }

        // Replace state with deduped, then drop expired
        const merged = Array.from(map.values())
        const t = now()
        this.races = merged
          .filter(r => !isExpired(r, t))
          .sort((a, b) => a.advertised_start_ms - b.advertised_start_ms)
          .slice(0, 50) // bound
          
        // Cache the results
        this.cache.set(cacheKey, {
          data: this.races,
          timestamp: currentTime,
          ttl: this.cacheTTL
        })
        
        this.loadState = 'ready'
        
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        
        // Implement retry mechanism for transient errors
        if (retryCount < 3 && (msg.includes('500') || msg.includes('503') || msg.includes('network') || msg.includes('fetch'))) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, retryCount) * 1000
          setTimeout(() => {
            // Use the action directly
            this.fetchRaces(retryCount + 1)
          }, delay)
          return
        }
        
        this.errorMessage = msg
        this.loadState = 'error'
      }
    },

    /**
     * Toggle a category filter on/off.
     */
    toggleCategory(categoryId: CategoryId | string): void {
      if (this.selectedCategories.has(categoryId)) {
        this.selectedCategories.delete(categoryId)
      } else {
        this.selectedCategories.add(categoryId)
      }
      // Persist the change
      this.persistSelectedCategories();
    },

    /**
     * Set search query for filtering races.
     */
    setSearchQuery(query: string): void {
      this.searchQuery = query
      // Persist the change
      this.persistSettings();
    },

    /**
     * Set time filter for races.
     */
    setTimeFilter(filter: 'all' | 'next-hour' | 'next-2-hours' | 'next-4-hours'): void {
      this.timeFilter = filter
      // Persist the change
      this.persistSettings();
    },

    /**
     * Set sort order for races.
     */
    setSortOrder(order: 'time-asc' | 'time-desc' | 'name-asc' | 'name-desc'): void {
      this.sortOrder = order
      // Persist the change
      this.persistSettings();
    },

    /**
     * Clear the cache.
     */
    clearCache(): void {
      this.cache.clear()
    },

    /**
     * Set cache TTL (in milliseconds).
     */
    setCacheTTL(ttl: number): void {
      this.cacheTTL = ttl
    },

    /**
     * Ensure no expired races remain in state.
     */
    pruneExpired(): void {
      const t = now()
      if (this.races.length === 0) return
      const before = this.races.length
      const filteredRaces = this.races.filter(r => !isExpired(r, t))
      const after = filteredRaces.length
      
      // Only update if there's a change
      if (after !== before) {
        // If we removed races and now have fewer than 5, fetch more
        if (before > after && after < 5) {
          // Trigger a fetch in the background
          setTimeout(() => {
            // Get the store instance and call the action
            const store = useRacesStore()
            store.fetchRaces()
          }, 100)
        }
        
        // Keep sorted when pruning affects order
        filteredRaces.sort((a, b) => a.advertised_start_ms - b.advertised_start_ms)
        
        // Update races array
        this.races = filteredRaces
        
        // Clear cache when pruning
        this.clearCache()
      }
    },

    /**
     * Begin ticking (once per second) to:
     *  - trigger reactive countdown updates in UI
     *  - prune expired entries
     * Also starts a light polling loop to refresh races every 15s.
     */
    startLoops(): void {
      if (this._tickHandle == null) {
        this._tickHandle = timerManager.setInterval(() => {
          // Trigger reactivity by touching a derived piece of state:
          // we don't store "now" in state to avoid re-renders everywhere.
          // Instead, we prune expired and any countdown component can
          // observe Date.now() or computed props.
          this.pruneExpired()
        }, 2000)
      }

      if (this._pollHandle == null) {
        // Stagger initial fetch to avoid immediate double-hit when startLoops is called
        // by mounting + manual fetch in setup.
        this._pollHandle = timerManager.setInterval(() => {
          // Fire and forget; errors are reflected in state
          void this.fetchRaces()
        }, 30000)
      }
    },

    /**
     * Stop all timers — call this in onUnmounted of root or when
     * navigating away to avoid leaks.
     */
    stopLoops(): void {
      if (this._tickHandle != null) {
        timerManager.clearTimer(this._tickHandle)
        this._tickHandle = null
      }
      if (this._pollHandle != null) {
        timerManager.clearTimer(this._pollHandle)
        this._pollHandle = null
      }
    },

    /**
     * Hard reset state (useful for e2e tests or error recoveries).
     */
    reset(): void {
      this.stopLoops()
      this.races = []
      this.selectedCategories = new Set<CategoryId | string>([
        CATEGORY_IDS.HORSE,
        CATEGORY_IDS.GREYHOUND,
        CATEGORY_IDS.HARNESS
      ])
      this.searchQuery = ''
      this.timeFilter = 'all'
      this.sortOrder = 'time-asc'
      this.cache.clear()
      this.loadState = 'idle'
      this.errorMessage = ''
      
      // Persist the reset state
      this.persistSelectedCategories();
      this.persistSettings();
    }
  }
})

/**
 * A race is considered expired 60,000ms after its advertised start time.
 */
function isExpired(r: RaceSummary, t: number): boolean {
  const result = t >= (r.advertised_start_ms + 60000);
  return result;
}

// Helper function to check if we're in simulation mode
function isInSimulationMode(): boolean {
  const betsStore = useBetsStore()
  return betsStore.showGame && betsStore.useSimulatedData
}

// Helper function to check if a race has runners matching the search query
function raceHasRunnerMatchingQuery(race: RaceSummary, query: string): boolean {
  // Only check runner names in simulation mode
  if (!isInSimulationMode()) {
    return false
  }
  
  const runners = getSimulatedRunners(race.id)
  
  return runners.some((runner: any) => 
    runner.name.toLowerCase().includes(query)
  )
}