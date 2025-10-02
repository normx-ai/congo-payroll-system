import { useState, useEffect } from 'react'
// import { api } from '@/lib/api' // Will be used later for real notifications

interface NotificationData {
  unreadCount: number
  notifications: Array<{
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'error'
    read: boolean
    createdAt: Date
  }>
}

export function useNotifications() {
  const [data, setData] = useState<NotificationData>({
    unreadCount: 0,
    notifications: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)

        // Vérifier si l'utilisateur est connecté
        const token = localStorage.getItem('authToken')
        if (!token) {
          setData({ unreadCount: 0, notifications: [] })
          setLoading(false)
          return
        }

        // Pour l'instant, afficher quelques notifications par défaut
        // TODO: Implémenter l'endpoint notifications côté backend
        setData({
          unreadCount: 0,
          notifications: []
        })
        setLoading(false)

      } catch (error) {
        setLoading(false)
        setData({ unreadCount: 0, notifications: [] })
        console.error('Erreur notifications:', error)
      }
    }

    fetchNotifications()
  }, [])

  return { ...data, loading }
}