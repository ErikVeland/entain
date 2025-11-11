import { defineStore } from 'pinia'
import { type SimulationController } from '../game/simulatedRace'
import { persistenceManager } from '../utils/persistenceManager'

// Commentary state tracking
export type GapCategory = 'neck-and-neck' | 'narrow' | 'clear' | 'none'
export type RacePhase = 'early' | 'mid' | 'late'
export type CommentaryType = 'leader' | 'gap' | 'phase' | 'generic'

export interface CommentaryState {
  currentLeaderId: string | null
  currentSecondId: string | null
  lastGapCategory: GapCategory
  lastCommentaryTimestamp: number
  lastCommentaryType: CommentaryType
  racePhase: RacePhase
  commentaryHistory: Array<{
    message: string
    timestamp: number
    type: CommentaryType
  }>
}

// Race lifecycle status
export type RaceLifecycleStatus = 
  | 'pending' 
  | 'countdown' 
  | 'running' 
  | 'finished_simulation' 
  | 'finished_displayed' 
  | 'expired'

// Display state for results
export interface DisplayState {
  status: 'hidden' | 'displaying' | 'grace_period' | 'eligible_for_cleanup'
  displayStartTime: number | null
  gracePeriodStartTime: number | null
  hasUserBets: boolean
  hasWinningBets: boolean
}

// Define the simulation state structure
interface SimulationState {
  controllers: Map<string, SimulationController>
  activeRaces: Set<string>
  raceStatus: Map<string, RaceLifecycleStatus>
  speedMultipliers: Map<string, number>
  raceProgress: Map<string, {
    progressByRunner: Record<string, number>
    order: string[]
    gaps: Record<string, number>
    etaMs: number
  }>
  commentaryState: Map<string, CommentaryState>
  displayState: Map<string, DisplayState>
  cleanupTimers: Map<string, number>
}

// Timing configuration constants
export const TIMING_CONFIG = {
  RESULTS_DISPLAY_MIN_DURATION: 15000, // 15 seconds
  RESULTS_DISPLAY_WITH_BETS_DURATION: 30000, // 30 seconds
  RESULTS_DISPLAY_WITH_WIN_DURATION: 45000, // 45 seconds
  GRACE_PERIOD_DURATION: 45000, // 45 seconds
  COMMENTARY_THROTTLE_SAME_TYPE: 5000, // 5 seconds
  COMMENTARY_THROTTLE_DIFF_LEADER: 3000, // 3 seconds
}

export const useSimulationStore = defineStore('simulation', {
  state: (): SimulationState => ({
    controllers: new Map(),
    activeRaces: new Set(),
    raceStatus: new Map(),
    speedMultipliers: new Map(),
    raceProgress: new Map(),
    commentaryState: new Map(),
    displayState: new Map(),
    cleanupTimers: new Map()
  }),
  
  getters: {
    getSimulationController: (state) => (raceId: string) => {
      return state.controllers.get(raceId)
    },
    
    isRaceActive: (state) => (raceId: string) => {
      return state.activeRaces.has(raceId)
    },
    
    getRaceStatus: (state) => (raceId: string) => {
      return state.raceStatus.get(raceId) || 'pending'
    },
    
    getSpeedMultiplier: (state) => (raceId: string) => {
      return state.speedMultipliers.get(raceId) || 1
    },
    
    getRaceLeader: (state) => (raceId: string) => {
      const progress = state.raceProgress.get(raceId)
      if (progress && progress.order.length > 0) {
        return progress.order[0] // Return the ID of the leader
      }
      return null
    },
    
    getCommentaryState: (state) => (raceId: string) => {
      return state.commentaryState.get(raceId)
    },
    
    getDisplayState: (state) => (raceId: string) => {
      return state.displayState.get(raceId)
    },
    
    isEligibleForCleanup: (state) => (raceId: string) => {
      const status = state.raceStatus.get(raceId)
      const displayState = state.displayState.get(raceId)
      return status === 'expired' || displayState?.status === 'eligible_for_cleanup'
    }
  },
  
  actions: {
    /**
     * Initialize store with persisted state
     */
    initFromPersistence(): void {
      try {
        // Load persisted state for speed multipliers (v1 schema)
        const persistedSpeedMultipliers = persistenceManager.load<Record<string, number>>('simulation:speedMultipliers', 1);
        
        if (persistedSpeedMultipliers) {
          // Convert the record back to a Map
          this.speedMultipliers = new Map(Object.entries(persistedSpeedMultipliers));
        }
      } catch (error) {
        console.warn('Failed to initialize simulation store from persistence:', error);
      }
    },

    /**
     * Persist speed multipliers to localStorage
     */
    persistSpeedMultipliers(): void {
      try {
        // Convert Map to Record for persistence
        const speedMultipliersRecord: Record<string, number> = {};
        for (const [raceId, multiplier] of this.speedMultipliers) {
          speedMultipliersRecord[raceId] = multiplier;
        }
        persistenceManager.save('simulation:speedMultipliers', speedMultipliersRecord, 1);
      } catch (error) {
        console.warn('Failed to persist speed multipliers:', error);
      }
    },

    addSimulationController(raceId: string, controller: SimulationController) {
      this.controllers.set(raceId, controller)
      this.raceStatus.set(raceId, 'pending')
      
      // Initialize commentary state
      this.commentaryState.set(raceId, {
        currentLeaderId: null,
        currentSecondId: null,
        lastGapCategory: 'none',
        lastCommentaryTimestamp: 0,
        lastCommentaryType: 'generic',
        racePhase: 'early',
        commentaryHistory: []
      })
      
      // Initialize display state
      this.displayState.set(raceId, {
        status: 'hidden',
        displayStartTime: null,
        gracePeriodStartTime: null,
        hasUserBets: false,
        hasWinningBets: false
      })
    },
    
    removeSimulationController(raceId: string) {
      const controller = this.controllers.get(raceId)
      if (controller) {
        controller.stop()
        this.controllers.delete(raceId)
        this.activeRaces.delete(raceId)
        this.raceStatus.delete(raceId)
        this.speedMultipliers.delete(raceId)
        this.raceProgress.delete(raceId)
        this.commentaryState.delete(raceId)
        this.displayState.delete(raceId)
        
        // Clear any pending cleanup timer
        const timer = this.cleanupTimers.get(raceId)
        if (timer) {
          clearTimeout(timer)
          this.cleanupTimers.delete(raceId)
        }
      }
    },
    
    startSimulation(raceId: string) {
      const controller = this.controllers.get(raceId)
      if (controller) {
        controller.start()
        this.activeRaces.add(raceId)
        this.raceStatus.set(raceId, 'running')
      }
    },
    
    stopSimulation(raceId: string) {
      const controller = this.controllers.get(raceId)
      if (controller) {
        controller.stop()
        this.raceStatus.set(raceId, 'expired')
      }
    },
    
    finishSimulation(raceId: string) {
      this.raceStatus.set(raceId, 'finished_simulation')
      this.activeRaces.delete(raceId)
    },
    
    updateCommentaryState(raceId: string, updates: Partial<CommentaryState>) {
      const current = this.commentaryState.get(raceId)
      if (current) {
        this.commentaryState.set(raceId, { ...current, ...updates })
      }
    },
    
    addCommentaryToHistory(raceId: string, message: string, type: CommentaryType) {
      const state = this.commentaryState.get(raceId)
      if (state) {
        const history = [...state.commentaryHistory, {
          message,
          timestamp: Date.now(),
          type
        }]
        // Keep only last 5 entries
        if (history.length > 5) {
          history.shift()
        }
        this.commentaryState.set(raceId, {
          ...state,
          commentaryHistory: history,
          lastCommentaryTimestamp: Date.now(),
          lastCommentaryType: type
        })
      }
    },
    
    updateDisplayState(raceId: string, updates: Partial<DisplayState>) {
      const current = this.displayState.get(raceId)
      if (current) {
        this.displayState.set(raceId, { ...current, ...updates })
      }
    },
    
    startResultsDisplay(raceId: string, hasUserBets: boolean, hasWinningBets: boolean) {
      this.updateDisplayState(raceId, {
        status: 'displaying',
        displayStartTime: Date.now(),
        hasUserBets,
        hasWinningBets
      })
      
      // Calculate display duration based on bet status
      let duration = TIMING_CONFIG.RESULTS_DISPLAY_MIN_DURATION
      if (hasWinningBets) {
        duration = TIMING_CONFIG.RESULTS_DISPLAY_WITH_WIN_DURATION
      } else if (hasUserBets) {
        duration = TIMING_CONFIG.RESULTS_DISPLAY_WITH_BETS_DURATION
      }
      
      // Schedule transition to displayed state
      const timer = setTimeout(() => {
        this.transitionToDisplayed(raceId)
      }, duration)
      
      this.cleanupTimers.set(raceId, timer as unknown as number)
    },
    
    transitionToDisplayed(raceId: string) {
      this.raceStatus.set(raceId, 'finished_displayed')
      this.updateDisplayState(raceId, {
        status: 'grace_period',
        gracePeriodStartTime: Date.now()
      })
      
      // Schedule transition to eligible for cleanup
      const timer = setTimeout(() => {
        this.markEligibleForCleanup(raceId)
      }, TIMING_CONFIG.GRACE_PERIOD_DURATION)
      
      this.cleanupTimers.set(raceId, timer as unknown as number)
    },
    
    markEligibleForCleanup(raceId: string) {
      this.raceStatus.set(raceId, 'expired')
      this.updateDisplayState(raceId, {
        status: 'eligible_for_cleanup'
      })
    },
    
    setSpeedMultiplier(raceId: string, multiplier: number) {
      this.speedMultipliers.set(raceId, multiplier)
      // Persist the change
      this.persistSpeedMultipliers();
    },
    
    updateRaceProgress(raceId: string, progress: {
      progressByRunner: Record<string, number>
      order: string[]
      gaps: Record<string, number>
      etaMs: number
    }) {
      this.raceProgress.set(raceId, progress)
    },
    
    getRaceProgress(raceId: string) {
      return this.raceProgress.get(raceId)
    },
    
    resetSimulation(raceId: string) {
      // Ensure smooth transition by properly cleaning up before resetting
      const controller = this.controllers.get(raceId)
      if (controller) {
        controller.stop()
      }
      this.activeRaces.delete(raceId)
      this.raceStatus.set(raceId, 'pending')
      this.raceProgress.delete(raceId)
      
      // Clear any pending cleanup timer
      const timer = this.cleanupTimers.get(raceId)
      if (timer) {
        clearTimeout(timer)
        this.cleanupTimers.delete(raceId)
      }
      
      // Persist the change
      this.persistSpeedMultipliers();
    },
    
    resetAllSimulations() {
      // Ensure all simulations are properly stopped before clearing
      for (const [raceId, controller] of this.controllers.entries()) {
        controller.stop()
      }
      
      // Clear all cleanup timers
      for (const timer of this.cleanupTimers.values()) {
        clearTimeout(timer)
      }
      
      // Clear all simulation state
      this.controllers.clear()
      this.activeRaces.clear()
      this.raceStatus.clear()
      this.speedMultipliers.clear()
      this.raceProgress.clear()
      this.commentaryState.clear()
      this.displayState.clear()
      this.cleanupTimers.clear()
      
      // Persist the reset state
      this.persistSpeedMultipliers();
    }
  }
})
