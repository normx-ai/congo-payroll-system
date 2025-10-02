'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, UserCheck, UserX } from 'lucide-react'

interface StatsData {
  totalEmployees: number
  activeEmployees: number
  onLeaveEmployees: number
}

interface EmployeeStatsProps {
  onRefreshRequest?: (refreshFn: () => void) => void
}

export function EmployeeStats({ onRefreshRequest }: EmployeeStatsProps = {}) {
  const [stats, setStats] = useState<StatsData>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveEmployees: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/employees/stats', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Erreur API stats:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Erreur récupération stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // Exposer la fonction de rafraîchissement si demandé
  useEffect(() => {
    if (onRefreshRequest) {
      onRefreshRequest(fetchStats)
    }
  }, [onRefreshRequest])

  const statsCards = [
    {
      label: 'Total Employés',
      value: loading ? '...' : stats.totalEmployees.toString(),
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      label: 'Actifs',
      value: loading ? '...' : stats.activeEmployees.toString(),
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      label: 'Inactifs',
      value: loading ? '...' : stats.onLeaveEmployees.toString(),
      icon: UserX,
      color: 'bg-orange-500'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {statsCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="border-l-4 border-l-indigo-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}