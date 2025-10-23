import { ref, Ref } from 'vue'
import { useRacesStore, type RaceSummary } from '../stores/races'

interface UseFetchRacesReturn {
  fetchRaces: () => Promise<void>
  loading: Ref<boolean>
  error: Ref<string | null>
}

/**
 * Composable for fetching races from the Neds API
 * Handles loading states and errors
 */
export function useFetchRaces(): UseFetchRacesReturn {
  const store = useRacesStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRaces = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await store.fetchRaces()
      if (store.loadState === 'error') {
        error.value = store.errorMessage
      }
    } catch (err) {
      // Handle different types of errors
      if (err instanceof Error) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          error.value = 'Network error: Unable to connect to the server'
        } else {
          error.value = err.message
        }
      } else if (typeof err === 'string') {
        error.value = err
      } else {
        error.value = 'An unknown error occurred'
      }
      
      // Log error for debugging
      console.error('Error fetching races:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    fetchRaces,
    loading,
    error
  }
}