'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, FileText } from 'lucide-react'
import { PayrollCalculator, PayrollCalculation, UnifiedEmployee } from '@/lib/payroll'
import { PayrollResults } from './PayrollResults'
import { useExercices } from '@/hooks/useExercices'
import { PeriodSelector } from './payroll-form/PeriodSelector'
import { EmployeeSelection } from './payroll-form/EmployeeSelection'
import { ActionButtons } from './payroll-form/ActionButtons'

interface PayrollFormProps {
  employees: UnifiedEmployee[]
  loading: boolean
  selectedMonth: string
  selectedYear: string
  selectedEmployee: string
  setSelectedEmployee: (employeeId: string) => void
}

export function PayrollForm({ employees, loading, selectedMonth, selectedYear, selectedEmployee, setSelectedEmployee }: PayrollFormProps) {
  const { exercicesPourPaie, exerciceActif, loading: exercicesLoading } = useExercices()

  const [month, setMonth] = useState<string>(selectedMonth)
  const [year, setYear] = useState<string>(exerciceActif?.annee.toString() || selectedYear)
  const [processing, setProcessing] = useState(false)
  const [calculations, setCalculations] = useState<PayrollCalculation[]>([])
  const [showCalculations, setShowCalculations] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleProcess = async () => {
    if (!selectedEmployee) {
      alert('Veuillez sélectionner un employé')
      return
    }

    if (!exerciceActif) {
      alert('Aucun exercice actif. Veuillez créer et activer un exercice avant de traiter la paie.')
      return
    }

    setProcessing(true)

    const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee)
    if (selectedEmployeeData) {
      const payrollCalculations = [await PayrollCalculator.calculatePayroll(selectedEmployeeData)]

      setTimeout(() => {
        setCalculations(payrollCalculations)
        setShowCalculations(true)
        setPreviewMode(false)
        setProcessing(false)
      }, 2000)
    }
  }

  const handlePreview = async () => {
    if (!selectedEmployee) {
      alert('Veuillez sélectionner un employé pour l\'aperçu')
      return
    }

    if (!exerciceActif) {
      alert('Aucun exercice actif. Veuillez créer et activer un exercice avant de prévisualiser la paie.')
      return
    }

    const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee)
    if (selectedEmployeeData) {
      const payrollCalculations = [await PayrollCalculator.calculatePayroll(selectedEmployeeData)]
      setCalculations(payrollCalculations)
      setPreviewMode(true)
      setShowCalculations(true)
    }
  }

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Calculator className="w-5 h-5 text-indigo-600" />
          Sélection pour Traitement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PeriodSelector
          month={month}
          year={year}
          exercices={exercicesPourPaie}
          exercicesLoading={exercicesLoading}
          onMonthChange={setMonth}
          onYearChange={setYear}
        />

        <EmployeeSelection
          employees={employees}
          selectedEmployee={selectedEmployee}
          searchTerm={searchTerm}
          loading={loading}
          onSearchChange={setSearchTerm}
          onEmployeeSelect={setSelectedEmployee}
        />

        <ActionButtons
          selectedCount={selectedEmployee ? 1 : 0}
          processing={processing}
          hasActiveExercise={!!exerciceActif}
          exercicesLoading={exercicesLoading}
          onPreview={handlePreview}
          onProcess={handleProcess}
        />

        {showCalculations && calculations.length > 0 && (
          <>
            {previewMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  Mode Aperçu - Prévisualisation du bulletin
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Ceci est un aperçu rapide. Pour le traitement final, utilisez &quot;Calculer&quot;.
                </p>
              </div>
            )}
            <PayrollResults
              calculations={calculations}
              month={month}
              year={year}
            />
          </>
        )}

      </CardContent>
    </Card>
  )
}