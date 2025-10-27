// src/composables/useFetchRaces.ts
import { ref, Ref } from 'vue'

interface Race {
  id: string
  meeting_name: string
  race_number: number
  advertised_start: {
    seconds: number
  }
  category_id: string
}

interface ApiResponse {
  status: number
  data?: {
    next_to_go_ids: string[]
    race_summaries: Record<string, Race>
  }
  message?: string
}

/**
 * Fetch races from the Neds API with retry logic
 * @returns Promise resolving to race data or throwing an error
 */
export async function fetchRaces(retryCount = 0): Promise<ApiResponse> {
  const maxRetries = 3
  const retryDelay = Math.pow(2, retryCount) * 1000 // Exponential backoff: 1s, 2s, 4s
  
  try {
    const response = await fetch(
      'https://api.neds.com.au/rest/v1/racing/?method=nextraces&count=10',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: ApiResponse = await response.json()
    
    if (data.status !== 200) {
      throw new Error(data.message || 'API returned non-200 status')
    }
    
    if (!data.data) {
      throw new Error('API response missing data')
    }
    
    return data
  } catch (err) {
    // If we haven't reached max retries and the error is network-related, retry
    if (retryCount < maxRetries) {
      // Check if error is network-related
      const isNetworkError = err instanceof TypeError && 
        (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to fetch'))
      
      // Also retry on 5xx server errors
      const isServerError = err instanceof Error && 
        (err.message.includes('500') || err.message.includes('503'))
      
      if (isNetworkError || isServerError) {
        // Wait for the retry delay
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        // Retry the fetch
        return fetchRaces(retryCount + 1)
      }
    }
    
    // If we've exhausted retries or it's not a retryable error, throw it
    throw err
  }
}