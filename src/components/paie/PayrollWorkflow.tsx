'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { useRubriques } from '@/contexts/RubriquesContext'
import { WorkflowStepper } from './workflow/WorkflowStepper'
import { EmployeeStep } from './workflow/EmployeeStep'
import { RubriquesStep } from './workflow/RubriquesStep'
import { ParametersStep } from './workflow/ParametersStep'
import { AmountsStep } from './workflow/AmountsStep'
import { CalculateStep } from './workflow/CalculateStep'
import { ReviewStep } from './workflow/ReviewStep'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
  baseSalary?: number
  salaireBase?: number // Garde pour compatibilité
  chargesFixes?: EmployeeChargeFixe[]
  // Ajout des autres propriétés nécessaires
  hireDate?: Date | string
  department?: { id: string; name: string } | null
  conventionCollective?: string
  contractType?: string
  categorieProfessionnelle?: number
  maritalStatus?: string
  childrenCount?: number
  echelon?: number
  salaryCategory?: string
  nui?: string
  cnssNumber?: string
  seniority?: string
}

interface EmployeeChargeFixe {
  id: string
  employeeId: string
  rubriqueCode: string
  amount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface PayrollWorkflowProps {
  employees: Employee[]
  selectedEmployee: string
  setSelectedEmployee: (employeeId: string) => void
  month: string
  year: string
}

interface RubriqueAmount {
  employeeId: string
  rubriqueCode: string
  amount: number
}

interface PayrollParameter {
  employeeId: string
  parameter: string
  value: number
}

export function PayrollWorkflow({ employees, selectedEmployee, setSelectedEmployee, month, year }: PayrollWorkflowProps) {
  const { showToast, ToastContainer } = useToast()
  const { rubriques } = useRubriques()

  const [amounts, setAmounts] = useState<RubriqueAmount[]>([])
  const [parameters, setParameters] = useState<PayrollParameter[]>([])
  const [currentStep, setCurrentStep] = useState<'employee' | 'rubriques' | 'parameters' | 'amounts' | 'calculate' | 'review'>('employee')
  const [calculationDone, setCalculationDone] = useState(false)

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee)
  const hasActiveRubriques = rubriques.some(r => r.isActive)
  const parametricRubriques = rubriques.filter(r => r.isActive && r.formule?.includes('joursTravailles'))

  // Ne considérer que les rubriques cochées par l'utilisateur pour les montants manuels
  const selectedRubriques = rubriques.filter(r => r.isActive)
  const configuredRubriquesCodes = selectedEmployeeData?.chargesFixes
    ?.filter(cf => cf.isActive && cf.amount > 0)
    ?.map(cf => cf.rubriqueCode) || []

  const manualEntryRubriques = selectedRubriques.filter(r =>
    r.formule === '' && !configuredRubriquesCodes.includes(r.code)
  )

  // L'étape amounts doit être affichée s'il y a des rubriques sélectionnées (configurées + manuelles + calculées)
  const hasAmountsToShow = selectedRubriques.length > 0

  const hasParameters = parametricRubriques.length === 0 || parameters.length > 0
  const hasAmounts = manualEntryRubriques.length === 0 || amounts.length > 0

  const canAccessStep = (step: string) => {
    switch (step) {
      case 'employee': return true
      case 'rubriques': return !!selectedEmployee
      case 'parameters': return !!selectedEmployee && hasActiveRubriques
      case 'amounts': return !!selectedEmployee && hasActiveRubriques && hasParameters && hasAmountsToShow
      case 'calculate': return !!selectedEmployee && hasActiveRubriques && hasParameters && hasAmounts
      case 'review': return calculationDone
      default: return false
    }
  }

  const canGoBackTo = (step: string) => {
    const stepOrder = ['employee', 'rubriques', 'parameters', 'amounts', 'calculate', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    const targetIndex = stepOrder.indexOf(step)
    return targetIndex < currentIndex
  }

  const updateAmount = (rubriqueCode: string, amount: number) => {
    if (!selectedEmployee) return

    setAmounts(prev => {
      const existing = prev.find(a =>
        a.employeeId === selectedEmployee && a.rubriqueCode === rubriqueCode
      )

      if (existing) {
        return prev.map(a =>
          a.employeeId === selectedEmployee && a.rubriqueCode === rubriqueCode
            ? { ...a, amount }
            : a
        )
      } else {
        return [...prev, {
          employeeId: selectedEmployee,
          rubriqueCode,
          amount
        }]
      }
    })
  }

  const updateParameter = (parameter: string, value: number) => {
    if (!selectedEmployee) return

    setParameters(prev => {
      const existing = prev.find(p =>
        p.employeeId === selectedEmployee && p.parameter === parameter
      )

      if (existing) {
        return prev.map(p =>
          p.employeeId === selectedEmployee && p.parameter === parameter
            ? { ...p, value }
            : p
        )
      } else {
        return [...prev, {
          employeeId: selectedEmployee,
          parameter,
          value
        }]
      }
    })
  }

  const handleCalculate = () => {
    showToast('Calcul de la paie effectué avec succès', 'success')
    setCalculationDone(true)
    setCurrentStep('review')
  }

  const handleValidate = () => {
    showToast('Bulletin de paie validé avec succès', 'success')
  }

  const handleRevise = () => {
    setCurrentStep('rubriques')
    setCalculationDone(false)
    showToast('Retour à la sélection des rubriques pour révision', 'info')
  }

  return (
    <>
      <ToastContainer />
      <div className="space-y-6">
        <WorkflowStepper
          currentStep={currentStep}
          canAccessStep={(step) => canAccessStep(step) || canGoBackTo(step)}
          onStepChange={(step) => setCurrentStep(step as typeof currentStep)}
          selectedEmployee={selectedEmployee}
          hasActiveRubriques={hasActiveRubriques}
          hasParameters={hasParameters}
          hasAmounts={hasAmounts}
          payrollPeriod={`${month}/${year}`}
        />

        {currentStep === 'employee' && (
          <EmployeeStep
            employees={employees}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            onNext={() => setCurrentStep('rubriques')}
          />
        )}

        {currentStep === 'rubriques' && canAccessStep('rubriques') && (
          <RubriquesStep
            onNext={() => setCurrentStep('parameters')}
            onBack={() => setCurrentStep('employee')}
          />
        )}

        {currentStep === 'parameters' && canAccessStep('parameters') && (
          <ParametersStep
            selectedEmployee={selectedEmployee}
            parameters={parameters}
            onUpdateParameter={updateParameter}
            onNext={() => setCurrentStep(hasAmountsToShow ? 'amounts' : 'calculate')}
            onBack={() => setCurrentStep('rubriques')}
          />
        )}

        {currentStep === 'amounts' && canAccessStep('amounts') && hasAmountsToShow && (
          <AmountsStep
            selectedEmployee={selectedEmployee}
            selectedEmployeeData={selectedEmployeeData}
            amounts={amounts}
            onUpdateAmount={updateAmount}
            onNext={() => setCurrentStep('calculate')}
            onBack={() => setCurrentStep('parameters')}
          />
        )}

        {currentStep === 'calculate' && canAccessStep('calculate') && (
          <CalculateStep
            selectedEmployeeData={selectedEmployeeData}
            onCalculate={handleCalculate}
          />
        )}

        {currentStep === 'review' && canAccessStep('review') && (
          <ReviewStep
            selectedEmployeeData={selectedEmployeeData}
            parameters={parameters}
            amounts={amounts}
            month={month}
            year={year}
            onValidate={handleValidate}
            onRevise={handleRevise}
          />
        )}
      </div>
    </>
  )
}