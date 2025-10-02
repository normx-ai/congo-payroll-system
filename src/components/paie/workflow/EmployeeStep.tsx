'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, User } from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
  salaireBase?: number
}

interface EmployeeStepProps {
  employees: Employee[]
  selectedEmployee: string
  setSelectedEmployee: (employeeId: string) => void
  onNext: () => void
}

export function EmployeeStep({ employees, selectedEmployee, setSelectedEmployee, onNext }: EmployeeStepProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee)

  const filteredEmployees = employees.filter(emp => {
    if (!searchTerm) return false
    const searchLower = searchTerm.toLowerCase()
    return (
      emp.firstName?.toLowerCase().includes(searchLower) ||
      emp.lastName?.toLowerCase().includes(searchLower) ||
      emp.employeeCode?.toLowerCase().includes(searchLower) ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower)
    )
  })

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <User className="w-5 h-5 text-indigo-600" />
            Étape 1: Sélection Employé
          </CardTitle>
          {selectedEmployee && (
            <Button
              onClick={onNext}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 h-auto text-sm"
            >
              Suivant: Ajouter les rubriques
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom, prénom ou matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Liste des employés filtrés */}
        <div className="max-h-32 overflow-y-auto border rounded-md">
          {!searchTerm ? (
            <div className="flex items-center justify-center py-4 text-gray-500">
              <div className="text-center">
                <Search className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                <p className="text-xs">Recherchez un employé</p>
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex items-center justify-center py-3 text-gray-500">
              <span className="text-xs">Aucun résultat pour &quot;{searchTerm}&quot;</span>
            </div>
          ) : (
            <div className="p-1 space-y-1">
              {filteredEmployees.map(emp => (
                <div
                  key={emp.id}
                  className={`flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer border ${
                    selectedEmployee === emp.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedEmployee(emp.id)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                    selectedEmployee === emp.id ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                  }`} />
                  <span className="text-xs flex-1 font-medium">
                    {emp.employeeCode} - {emp.firstName} {emp.lastName}
                  </span>
                  <span className="text-xs text-gray-500 truncate max-w-20">{emp.position}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedEmployeeData && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {selectedEmployeeData.firstName[0]}{selectedEmployeeData.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {selectedEmployeeData.firstName} {selectedEmployeeData.lastName}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="truncate">{selectedEmployeeData.position}</span>
                  {selectedEmployeeData.salaireBase && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-indigo-700">
                        {new Intl.NumberFormat('fr-FR').format(selectedEmployeeData.salaireBase)} FCFA
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}