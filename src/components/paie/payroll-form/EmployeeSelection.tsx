'use client'

import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
}

interface EmployeeSelectionProps {
  employees: Employee[]
  selectedEmployee: string
  searchTerm: string
  loading: boolean
  onSearchChange: (term: string) => void
  onEmployeeSelect: (employeeId: string) => void
}

export function EmployeeSelection({
  employees,
  selectedEmployee,
  searchTerm,
  loading,
  onSearchChange,
  onEmployeeSelect
}: EmployeeSelectionProps) {
  // Filtrer les employés selon la recherche - seulement si il y a un terme de recherche
  const filteredEmployees = !searchTerm ? [] : employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase()
    return (
      emp.firstName?.toLowerCase().includes(searchLower) ||
      emp.lastName?.toLowerCase().includes(searchLower) ||
      emp.employeeCode?.toLowerCase().includes(searchLower) ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Employé à traiter</label>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher par nom, prénom ou matricule..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
        {!searchTerm ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <div className="text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Tapez un nom, prénom ou matricule pour rechercher un employé</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-gray-500">Recherche...</span>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex items-center justify-center py-4 text-gray-500">
            <span className="text-sm">Aucun employé trouvé pour &quot;{searchTerm}&quot;</span>
          </div>
        ) : (
          filteredEmployees.map(emp => (
            <div
              key={emp.id}
              className={`flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer border ${
                selectedEmployee === emp.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent'
              }`}
              onClick={() => onEmployeeSelect(emp.id)}
            >
              <div className={`w-3 h-3 rounded-full border-2 ${
                selectedEmployee === emp.id ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
              }`} />
              <span className="text-sm flex-1">
                {emp.employeeCode} - {emp.firstName} {emp.lastName}
              </span>
              <span className="text-xs text-gray-500">{emp.position}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}