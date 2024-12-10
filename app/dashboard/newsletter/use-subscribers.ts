import { useState, useEffect, useCallback } from 'react'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'

interface Subscriber {
  id: string
  email: string
  isVerified: boolean
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
}

export function useSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSubscribers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/newsletter')
      if (!response.ok) throw new Error('Failed to fetch subscribers')
      const data = await response.json()
      setSubscribers(data)
      setError(null)
    } catch (error) {
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  const deleteSubscriber = async (id: string) => {
    const response = await fetch(`/api/newsletter/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete subscriber')
    await fetchSubscribers() // Refresh the list after deletion
  }

  const exportSubscribers = async () => {
    const csvContent = [
      ['Email', 'Status', 'Subscription Date', 'Verification Date'],
      ...subscribers.map(sub => [
        sub.email,
        sub.isVerified ? 'Verified' : 'Pending',
        format(new Date(sub.createdAt), 'yyyy-MM-dd'),
        sub.verifiedAt ? format(new Date(sub.verifiedAt), 'yyyy-MM-dd') : '-'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, `subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`)
  }

  return {
    subscribers,
    isLoading,
    error,
    deleteSubscriber,
    exportSubscribers,
    refresh: fetchSubscribers,
  }
} 