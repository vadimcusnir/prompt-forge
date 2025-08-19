import { useState, useEffect } from 'react'

interface ComingSoonStatus {
  enabled: boolean
  loading: boolean
  error: string | null
}

export function useComingSoon() {
  const [status, setStatus] = useState<ComingSoonStatus>({
    enabled: false,
    loading: true,
    error: null
  })

  useEffect(() => {
    checkComingSoonStatus()
  }, [])

  const checkComingSoonStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/toggle-coming-soon')
      if (!response.ok) {
        throw new Error('Eroare la verificarea statusului coming soon')
      }
      
      const data = await response.json()
      setStatus({
        enabled: data.coming_soon_enabled || false,
        loading: false,
        error: null
      })
    } catch (error) {
      setStatus({
        enabled: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Eroare necunoscută'
      })
    }
  }

  const toggleComingSoon = async (enabled: boolean, orgId?: string) => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/toggle-coming-soon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled, org_id: orgId })
      })

      if (!response.ok) {
        throw new Error('Eroare la actualizarea statusului coming soon')
      }

      const data = await response.json()
      
      // Actualizează statusul local
      setStatus(prev => ({
        ...prev,
        enabled: data.data.value,
        loading: false,
        error: null
      }))

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Eroare necunoscută'
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      throw error
    }
  }

  return {
    ...status,
    toggleComingSoon,
    refresh: checkComingSoonStatus
  }
}
