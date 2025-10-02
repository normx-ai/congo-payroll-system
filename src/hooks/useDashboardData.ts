import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import type { DashboardData } from '@/types'

export function useDashboardData(): DashboardData & { refresh: () => void } {
  const { data: session, status } = useSession()
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalEmployees: 0,
      totalPayroll: 0,
      generatedPayslips: 0,
      growthRate: 0
    },
    recentActivities: [],
    upcomingTasks: [],
    loading: true,
    error: null
  })

  const fetchDashboardData = useCallback(async () => {
    try {
      // Vérifier si l'utilisateur est authentifié via NextAuth
      if (status === 'loading') {
        setData(prev => ({ ...prev, loading: true }))
        return
      }

      if (status === 'unauthenticated' || !session) {
        setData(prev => ({ ...prev, loading: false, error: 'Non authentifié' }))
        return
      }

      setData(prev => ({ ...prev, loading: true }))

      try {
        const dashboardData = await api.dashboard.getData()

        setData({
          stats: dashboardData.stats || {
            totalEmployees: 0,
            totalPayroll: 0,
            generatedPayslips: 0,
            growthRate: 0
          },
          recentActivities: dashboardData.recentActivities?.map((activity: { id: string; message: string; timestamp: string }) => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          })) || [],
          upcomingTasks: dashboardData.upcomingTasks?.map((task: { id: string; title: string; dueDate: string; priority: string }) => ({
            ...task,
            dueDate: new Date(task.dueDate)
          })) || [],
          loading: false,
          error: null
        })
      } catch {
        // Fallback si l'API n'est pas disponible
        setData({
          stats: {
            totalEmployees: 0,
            totalPayroll: 0,
            generatedPayslips: 0,
            growthRate: 0
          },
          recentActivities: [],
          upcomingTasks: [],
          loading: false,
          error: 'Aucune donnée disponible - Backend non connecté'
        })
      }

    } catch {
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Erreur lors du chargement des données'
      }))
    }
  }, [status, session])

  useEffect(() => {
    fetchDashboardData()

    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(fetchDashboardData, 30000)

    return () => clearInterval(interval)
  }, [session, status, fetchDashboardData])

  return { ...data, refresh: fetchDashboardData }
}