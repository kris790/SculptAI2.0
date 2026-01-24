
import { useState, useCallback } from 'react'

interface UseAsyncActionResult<T> {
  execute: (action: () => Promise<T>) => Promise<T | null>
  loading: boolean
  error: Error | null
  clearError: () => void
}

export function useAsyncAction<T = unknown>(): UseAsyncActionResult<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async (action: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await action()
      setLoading(false)
      return result
    } catch (err) {
      let error = err instanceof Error ? err : new Error('An unknown error occurred');
      
      // Specifically handle 'Failed to fetch' which is a common network error
      if (error.message === 'Failed to fetch') {
        error = new Error('Connectivity Error: Could not reach the server. Please check your internet connection or if the service is available.');
      }
      
      setError(error)
      setLoading(false)
      
      console.error('SculptAI Async action error:', error)
      
      return null
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { execute, loading, error, clearError }
}
