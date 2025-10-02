'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { TopBar } from '@/components/layout/TopBar'
import { EmployeeStats } from '@/components/employees/EmployeeStats'
import { EmployeeList } from '@/components/employees/EmployeeList'
import { RubriquesProvider } from '@/contexts/RubriquesContext'
import { DepartmentsFixer } from '@/components/DepartmentsFixer'


export default function EmployeesPage() {
  const [refreshStatsFunction, setRefreshStatsFunction] = useState<(() => void) | null>(null)

  const handleRefreshRequest = useCallback((refreshFn: () => void) => {
    setRefreshStatsFunction(() => refreshFn)
  }, [])

  const handleEmployeeChanged = useCallback(() => {
    if (refreshStatsFunction) {
      refreshStatsFunction()
    }
  }, [refreshStatsFunction])

  return (
    <div className="flex h-screen bg-gray-50">
      <DepartmentsFixer />
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-indigo-900">Gestion des Employés</h1>
            <p className="text-indigo-600 mt-1">Gérez votre équipe et leurs informations</p>
          </div>

          <EmployeeStats onRefreshRequest={handleRefreshRequest} />
          <RubriquesProvider>
            <EmployeeList onEmployeeChanged={handleEmployeeChanged} />
          </RubriquesProvider>
        </main>
      </div>
    </div>
  )
}