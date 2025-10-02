'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { TopBar } from '@/components/layout/TopBar'
import { CompanySettings } from '@/components/parametres/CompanySettings'
import { ExercicesManager } from '@/components/parametres/ExercicesManager'
import { DepartementsManager } from '@/components/parametres/DepartementsManager'
import { DepartmentsFixer } from '@/components/DepartmentsFixer'
import { Calendar, Building2, Briefcase } from 'lucide-react'

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState('exercices')

  const tabs = [
    { id: 'exercices', label: 'Exercices Fiscaux', icon: Calendar },
    { id: 'departements', label: 'Départements', icon: Briefcase },
    { id: 'entreprise', label: 'Entreprise', icon: Building2 }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <DepartmentsFixer />
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-indigo-900">Paramètres</h1>
            <p className="text-indigo-600 mt-1">Configuration du système de paie</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'exercices' && <ExercicesManager />}
            {activeTab === 'departements' && <DepartementsManager />}
            {activeTab === 'entreprise' && <CompanySettings />}
          </div>
        </main>
      </div>
    </div>
  )
}