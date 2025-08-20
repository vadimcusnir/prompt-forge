import { useState, useEffect } from 'react'

interface ComingSoonStatus {
  enabled: boolean
  message: string
  updated_at?: string
}

export function useComingSoon() {
  const [status, setStatus] = useState<ComingSoonStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/toggle-coming-soon')
        
        if (response.ok) {
          const result = await response.json()
          setStatus(result.data)
        } else {
          setError('Failed to fetch coming soon status')
        }
      } catch (err) {
        setError('Network error while checking status')
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [])

  const toggleStatus = async (enabled: boolean): Promise<boolean> => {
    try {
      // Note: In a real app, you'd get this token from your auth system
      const token = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-token'
      
      const response = await fetch('/api/toggle-coming-soon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        const result = await response.json()
        setStatus(result.data)
        return true
      } else {
        setError('Failed to toggle coming soon status')
        return false
      }
    } catch (err) {
      setError('Network error while toggling status')
      return false
    }
  }

  return {
    status,
    loading,
    error,
    toggleStatus
  }
}
