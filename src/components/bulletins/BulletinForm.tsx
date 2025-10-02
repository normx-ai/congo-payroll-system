'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Eye, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
}

interface BulletinFormProps {
  employees: Employee[]
  loading: boolean
  onGenerate: (employeeId: string, month: string, year: string) => Promise<void>
  onEmployeeChange?: (employeeId: string) => void
}

const months = [
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
]

export function BulletinForm({ employees, loading, onGenerate, onEmployeeChange }: BulletinFormProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'))
  const [selectedYear, setSelectedYear] = useState<string>('2024')
  const [generating, setGenerating] = useState(false)

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId)
    onEmployeeChange?.(employeeId)
  }

  const handleGenerate = async () => {
    if (!selectedEmployee || !selectedMonth || !selectedYear) {
      alert('Veuillez sélectionner un employé et une période')
      return
    }
    setGenerating(true)
    await onGenerate(selectedEmployee, selectedMonth, selectedYear)
    setGenerating(false)
  }

  return (
    <Card className="border-l-4 border-l-indigo-500 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <FileText className="w-5 h-5 text-indigo-600" />
          Générer un Bulletin
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Employé</label>
          {loading ? (
            <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-md bg-gray-50">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-gray-500">Chargement des employés...</span>
            </div>
          ) : (
            <select
              value={selectedEmployee}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="">Sélectionner un employé</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeCode} - {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mois</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Mois" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleGenerate}
            disabled={generating || !selectedEmployee}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Génération...</>
            ) : (
              <><FileText className="w-4 h-4 mr-2" />Générer le Bulletin</>
            )}
          </Button>
          <Button
            variant="outline"
            disabled={!selectedEmployee}
            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          >
            <Eye className="w-4 h-4 mr-2" />Aperçu
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}