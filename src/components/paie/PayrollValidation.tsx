'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
}

interface PayrollValidationProps {
  employees: Employee[]
  selectedMonth: string
  selectedYear: string
}

interface ValidationResult {
  employeeId: string
  employeeName: string
  status: 'success' | 'warning' | 'error'
  message: string
  grossSalary?: number
  netSalary?: number
}

export function PayrollValidation({ employees, selectedMonth, selectedYear }: PayrollValidationProps) {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [validating, setValidating] = useState(false)

  const runValidation = async () => {
    setValidating(true)

    // Simulation de validation
    const results: ValidationResult[] = employees.map((emp, index) => {
      const grossSalary = 800000 + (index * 50000)
      const netSalary = grossSalary * 0.75 // Simulation après déductions

      const statuses = ['success', 'warning', 'error'] as const
      const status = statuses[index % 3]

      const messages = {
        success: 'Calculs validés avec succès',
        warning: 'Attention: heures supplémentaires manquantes',
        error: 'Erreur: données de base manquantes'
      }

      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        status,
        message: messages[status],
        grossSalary,
        netSalary
      }
    })

    setTimeout(() => {
      setValidationResults(results)
      setValidating(false)
    }, 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const successCount = validationResults.filter(r => r.status === 'success').length
  const warningCount = validationResults.filter(r => r.status === 'warning').length
  const errorCount = validationResults.filter(r => r.status === 'error').length

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <CheckCircle className="w-5 h-5 text-indigo-600" />
          Validation des Calculs - {selectedMonth}/{selectedYear}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationResults.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune validation effectuée</p>
            <Button
              onClick={runValidation}
              disabled={validating || employees.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {validating ? 'Validation en cours...' : `Valider les calculs (${employees.length} employés)`}
            </Button>
          </div>
        ) : (
          <>
            {/* Résumé */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-1" />
                  <span className="font-bold text-green-700">{successCount}</span>
                </div>
                <p className="text-xs text-green-600">Validés</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="font-bold text-yellow-700">{warningCount}</span>
                </div>
                <p className="text-xs text-yellow-600">Avertissements</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <XCircle className="w-5 h-5 text-red-500 mr-1" />
                  <span className="font-bold text-red-700">{errorCount}</span>
                </div>
                <p className="text-xs text-red-600">Erreurs</p>
              </div>
            </div>

            {/* Liste des résultats */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {validationResults.map((result) => (
                <div
                  key={result.employeeId}
                  className={`p-3 rounded-lg border-l-4 ${
                    result.status === 'success' ? 'border-green-500 bg-green-50' :
                    result.status === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium text-sm">{result.employeeName}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{result.message}</p>
                  {result.grossSalary && (
                    <div className="text-xs text-gray-500 mt-1">
                      Brut: {result.grossSalary.toLocaleString()} FCFA •
                      Net: {result.netSalary?.toLocaleString()} FCFA
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={runValidation}
                variant="outline"
                disabled={validating}
                className="flex-1"
              >
                Revalider
              </Button>
              <Button
                disabled={errorCount > 0}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Approuver la Paie
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}