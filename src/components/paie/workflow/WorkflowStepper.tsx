'use client'

import { Calculator, Settings, CreditCard, User, Check, Calendar, FileText } from 'lucide-react'

interface WorkflowStepperProps {
  currentStep: string
  canAccessStep: (step: string) => boolean
  onStepChange: (step: string) => void
  selectedEmployee: string
  hasActiveRubriques: boolean
  hasParameters: boolean
  hasAmounts: boolean
  payrollPeriod?: string
}

export function WorkflowStepper({
  currentStep,
  canAccessStep,
  onStepChange,
  selectedEmployee,
  hasActiveRubriques,
  hasParameters,
  hasAmounts,
  payrollPeriod
}: WorkflowStepperProps) {
  const steps = [
    { id: 'employee', title: 'Employé', icon: User },
    { id: 'rubriques', title: 'Rubriques', icon: Settings },
    { id: 'parameters', title: 'Paramètres', icon: Calendar },
    { id: 'amounts', title: 'Montants', icon: CreditCard },
    { id: 'calculate', title: 'Calculer', icon: Calculator },
    { id: 'review', title: 'Aperçu', icon: FileText }
  ]

  const isCompleted = (stepId: string) => {
    switch (stepId) {
      case 'employee': return !!selectedEmployee
      case 'rubriques': return !!selectedEmployee && hasActiveRubriques
      case 'parameters': return !!selectedEmployee && hasActiveRubriques && hasParameters
      case 'amounts': return !!selectedEmployee && hasActiveRubriques && hasParameters && hasAmounts
      default: return false
    }
  }

  // Formatter la période pour affichage
  const formatPeriod = (period: string) => {
    if (!period) return 'Période non sélectionnée'
    const [month, year] = period.split('/')
    const monthNames = [
      '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    return `${monthNames[parseInt(month)]} ${year}`
  }

  return (
    <div className="mb-6">
      {/* Indicateur de période */}
      {payrollPeriod && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">
              Traitement paie: {formatPeriod(payrollPeriod)}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const canAccess = canAccessStep(step.id)
          const completed = isCompleted(step.id)

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => canAccess && onStepChange(step.id)}
                disabled={!canAccess}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : canAccess
                    ? 'border-indigo-300 text-indigo-300 hover:border-indigo-500 hover:text-indigo-500'
                    : 'border-gray-300 text-gray-300 cursor-not-allowed'
                }`}
              >
                {completed ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </button>
              <span className={`ml-2 text-sm ${canAccess ? 'text-gray-700' : 'text-gray-400'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && <div className="w-8 h-px bg-gray-300 ml-4" />}
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}