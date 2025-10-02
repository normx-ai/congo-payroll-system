// Composant de navigation par onglets pour la page rapports

import React from 'react'
import { FileText, BookOpen, Calculator, BarChart3 } from 'lucide-react'

interface TabsNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function TabsNavigation({ activeTab, onTabChange }: TabsNavigationProps) {
  const tabs = [
    { id: 'bulletins', label: 'Bulletins de paie', icon: FileText },
    { id: 'livre-paie', label: 'Livre de paie', icon: BookOpen },
    { id: 'etat-charges', label: 'État des charges', icon: Calculator },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 }
  ]

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
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