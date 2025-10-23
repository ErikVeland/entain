import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFetchRaces } from '../useFetchRaces'
import { useRacesStore } from '../../stores/races'
import { createTestingPinia } from '@pinia/testing'

describe('useFetchRaces', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        races: {
          loadState: 'idle',
          errorMessage: ''
        }
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns initial state correctly', () => {
    const { fetchRaces, loading, error } = useFetchRaces()

    expect(typeof fetchRaces).toBe('function')
    expect(loading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('sets loading state when fetch starts', async () => {
    const store = useRacesStore()
    store.fetchRaces = vi.fn().mockResolvedValue(undefined)
    
    const { fetchRaces, loading, error } = useFetchRaces()
    
    const fetchPromise = fetchRaces()
    expect(loading.value).toBe(true)
    expect(error.value).toBe(null)
    
    await fetchPromise
    expect(loading.value).toBe(false)
  })

  it('handles fetch errors correctly', async () => {
    const store = useRacesStore()
    store.fetchRaces = vi.fn().mockRejectedValue(new Error('Network error'))
    store.loadState = 'error'
    store.errorMessage = 'Network error'
    
    const { fetchRaces, loading, error } = useFetchRaces()
    
    await fetchRaces()
    
    expect(loading.value).toBe(false)
    expect(error.value).toBe('Network error')
  })

  it('handles store errors correctly', async () => {
    const store = useRacesStore()
    store.fetchRaces = vi.fn().mockResolvedValue(undefined)
    store.loadState = 'error'
    store.errorMessage = 'API error'
    
    const { fetchRaces, loading, error } = useFetchRaces()
    
    await fetchRaces()
    
    expect(loading.value).toBe(false)
    expect(error.value).toBe('API error')
  })
})