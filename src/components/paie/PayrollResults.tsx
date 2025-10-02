'use client'

import { CheckCircle, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PayrollCalculator, PayrollCalculation } from '@/lib/payroll'

interface PayrollResultsProps {
  calculations: PayrollCalculation[]
  month: string
  year: string
  onGenerateBulletins?: () => void
}

export function PayrollResults({
  calculations,
  month,
  year,
  onGenerateBulletins
}: PayrollResultsProps) {
  const totalGains = calculations.reduce((sum, calc) => sum + calc.totalGains, 0)
  const totalRetenues = calculations.reduce((sum, calc) => sum + calc.totalRetenues, 0)
  const totalSalairesNets = calculations.reduce((sum, calc) => sum + calc.salaireNet, 0)

  return (
    <div className="mt-6 p-4 border rounded-lg bg-blue-50">
      <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        Résultats du Traitement de Paie - {month}/{year}
      </h3>

      {/* Résumé global */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div className="bg-green-100 p-3 rounded">
          <div className="text-green-700 font-semibold">Total Gains</div>
          <div className="text-green-900 font-bold">
            {PayrollCalculator.formatCurrency(totalGains)}
          </div>
        </div>
        <div className="bg-red-100 p-3 rounded">
          <div className="text-red-700 font-semibold">Total Retenues</div>
          <div className="text-red-900 font-bold">
            {PayrollCalculator.formatCurrency(totalRetenues)}
          </div>
        </div>
        <div className="bg-indigo-100 p-3 rounded">
          <div className="text-indigo-700 font-semibold">Salaires Nets</div>
          <div className="text-indigo-900 font-bold">
            {PayrollCalculator.formatCurrency(totalSalairesNets)}
          </div>
        </div>
      </div>

      {/* Détails par employé */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {calculations.map(calc => (
          <div key={calc.employeeId} className="bg-white p-3 rounded border">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">{calc.employeeName}</span>
              <span className="font-bold text-green-600">
                {PayrollCalculator.formatCurrency(calc.salaireNet)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div>Gains: {PayrollCalculator.formatCurrency(calc.totalGains)}</div>
              <div>Retenues: {PayrollCalculator.formatCurrency(calc.totalRetenues)}</div>
              <div>Charges patronales: {PayrollCalculator.formatCurrency(calc.cotisationsEmployeur)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t text-center">
        <Button size="sm" variant="outline" onClick={onGenerateBulletins}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Générer les Bulletins
        </Button>
      </div>
    </div>
  )
}