'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { TopBar } from '@/components/layout/TopBar'
import { PayrollWorkflow } from '@/components/paie/PayrollWorkflow'
import { MonthSelector } from '@/components/paie/MonthSelector'
import TabsNavigation from '@/components/paie/TabsNavigation'
import { RubriquesProvider } from '@/contexts/RubriquesContext'
import { useExercices } from '@/hooks/useExercices'
import { useExerciceMonths } from '@/hooks/useExerciceMonths'
import { PayrollConstants } from '@/components/parametres/PayrollConstants'
import { IrppBareme } from '@/components/parametres/IrppBareme'
import { BaremeIndemnites } from '@/components/parametres/BaremeIndemnites'
import { QuotientFamilial } from '@/components/parametres/QuotientFamilial'
import { ConstantesLegales } from '@/components/parametres/ConstantesLegales'
import { RubriqueTable } from '@/components/parametres/RubriqueTable'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
  salaireBase?: number
  anciennete?: number
  categorieProfessionnelle?: number
  echelon?: number
  conventionCollective?: string
}

function PaiePageContent() {
  const { exerciceActif } = useExercices()
  const { currentMonthData } = useExerciceMonths()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [, setLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return currentMonthData?.value || `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  })
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString()
  })
  const [activeTab, setActiveTab] = useState('traitement')

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (exerciceActif) {
      setSelectedYear(exerciceActif.annee.toString())
    }
  }, [exerciceActif])

  useEffect(() => {
    if (currentMonthData) {
      setSelectedMonth(currentMonthData.value)
    }
  }, [currentMonthData])

  const handleMonthSelect = (monthValue: string) => {
    setSelectedMonth(monthValue)
    // Extraire l'année du mois sélectionné (format: YYYY-MM)
    const [year] = monthValue.split('-')
    setSelectedYear(year)
    // Réinitialiser l'employé sélectionné pour un nouveau traitement
    setSelectedEmployee('')
  }

  // Fonction getAvailableMonths supprimée car non utilisée


  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/employees?page=1&size=100', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.employees || [])
      } else if (response.status === 401) {
        // Non autorisé - pas d'employés
        setEmployees([])
      }
    } catch (error) {
      console.error('Erreur récupération employés:', error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <TopBar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-indigo-900">Traitement de Paie</h1>
            <p className="text-indigo-600 mt-1">Configurer et traiter les salaires mensuels</p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Tab Content */}
          {activeTab === 'traitement' ? (
            <div className="flex h-full">
              {/* Panel de sélection des mois */}
              <div className="w-72 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
                <MonthSelector
                  selectedMonth={selectedMonth}
                  onMonthSelect={handleMonthSelect}
                />
              </div>

              {/* Zone de travail principale */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto">
                  <PayrollWorkflow
                    employees={employees}
                    selectedEmployee={selectedEmployee}
                    setSelectedEmployee={setSelectedEmployee}
                    month={selectedMonth.split('-')[1]} // Extraire le mois (MM)
                    year={selectedYear}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === 'rubriques' && <RubriqueTable />}
              {activeTab === 'fiscaux' && <PayrollConstants />}
              {activeTab === 'irpp' && <IrppBareme />}
              {activeTab === 'quotient' && <QuotientFamilial />}
              {activeTab === 'indemnites' && <BaremeIndemnites />}
              {activeTab === 'legales' && <ConstantesLegales />}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function PaiePage() {
  return (
    <RubriquesProvider>
      <PaiePageContent />
    </RubriquesProvider>
  )
}