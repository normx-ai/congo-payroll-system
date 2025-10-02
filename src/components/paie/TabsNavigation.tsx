// Composant de navigation par onglets pour la page Traitement de Paie

import React from 'react'
import { FileText, Scale, TrendingUp, Users, Gift, BookOpen, Calculator } from 'lucide-react'

interface TabsNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function TabsNavigation({ activeTab, onTabChange }: TabsNavigationProps) {
  const tabs = [
    { id: 'traitement', label: 'Traitement de Paie', icon: Calculator },
    { id: 'rubriques', label: 'Rubriques de Paie', icon: FileText },
    { id: 'fiscaux', label: 'Paramètres Fiscaux', icon: Scale },
    { id: 'irpp', label: 'Barème IRPP', icon: TrendingUp },
    { id: 'quotient', label: 'Quotient Familial', icon: Users },
    { id: 'indemnites', label: 'Barèmes Indemnités', icon: Gift },
    { id: 'legales', label: 'Constantes Légales', icon: BookOpen }
  ]

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  )
}
