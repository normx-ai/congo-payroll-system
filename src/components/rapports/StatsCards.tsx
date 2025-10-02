// Composant cartes de statistiques

import React from 'react'
import { TrendingUp, Users, DollarSign, Receipt } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalBulletins: number
    totalBrut: number
    totalNet: number
    employesDistincts: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      notation: montant > 1000000 ? 'compact' : 'standard'
    }).format(montant)
  }

  const cards = [
    {
      title: 'Bulletins générés',
      value: stats.totalBulletins,
      icon: Receipt,
      color: 'bg-indigo-500'
    },
    {
      title: 'Employés',
      value: stats.employesDistincts,
      icon: Users,
      color: 'bg-indigo-400'
    },
    {
      title: 'Masse salariale brute',
      value: formatMontant(stats.totalBrut),
      icon: DollarSign,
      color: 'bg-indigo-600'
    },
    {
      title: 'Total net à payer',
      value: formatMontant(stats.totalNet),
      icon: TrendingUp,
      color: 'bg-indigo-700'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${card.color} rounded-lg p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}