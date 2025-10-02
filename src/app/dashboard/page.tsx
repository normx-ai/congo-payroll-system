'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { TopBar } from '@/components/layout/TopBar'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { useDashboardData } from '@/hooks/useDashboardData'
import { Users, DollarSign, FileText, TrendingUp, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { stats, recentActivities, upcomingTasks, loading, error } = useDashboardData()

  const formatCurrency = (amount: number) => {
    return (amount / 1000000).toFixed(1) + 'M FCFA'
  }

  const statsCards = [
    {
      title: 'Total Employés',
      value: loading ? '...' : stats.totalEmployees.toString(),
      change: loading ? 'Chargement...' : stats.totalEmployees > 0 ? `+${Math.floor(stats.totalEmployees * 0.08)} ce mois` : 'Aucun employé',
      icon: Users,
      color: 'indigo' as const
    },
    {
      title: 'Masse Salariale',
      value: loading ? '...' : formatCurrency(stats.totalPayroll),
      change: loading ? 'Chargement...' : 'Mois en cours',
      icon: DollarSign,
      color: 'green' as const
    },
    {
      title: 'Bulletins Générés',
      value: loading ? '...' : stats.generatedPayslips.toString(),
      change: loading ? 'Chargement...' : 'Ce mois',
      icon: FileText,
      color: 'blue' as const
    },
    {
      title: 'Conformité Fiscale',
      value: loading ? '...' : '100%',
      change: loading ? 'Chargement...' : 'Congo Brazzaville',
      icon: TrendingUp,
      color: 'purple' as const
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <TopBar />

          <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600">Vue d&apos;ensemble de votre système de paie</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statsCards.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Activités Récentes</h2>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-gray-600">{activity.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Prochaines Échéances</h2>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-gray-600">
                        {task.title} - {task.dueDate.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}