'use client'

import { User, DollarSign, Settings, Edit, Trash2, CheckCircle, XCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatSalary } from './employee-utils'
import type { Employee } from '@/types/employee'

interface EmployeeTableProps {
  employees: Employee[]
  loading: boolean
  searchTerm: string
  onEdit: (employee: Employee) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
  onConfigureCharges: (employee: Employee) => void
}

export function EmployeeTable({
  employees,
  loading,
  searchTerm,
  onEdit,
  onDelete,
  onToggleStatus,
  onConfigureCharges
}: EmployeeTableProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chargement des employés...</p>
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {searchTerm ? 'Aucun employé trouvé pour cette recherche' : 'Aucun employé enregistré'}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white">
        <thead className="bg-gray-50">
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Matricule
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Nom
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Salaire
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <span className="font-mono text-sm text-gray-900">
                  {employee.employeeCode}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">
                  {employee.firstName} {employee.lastName}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-gray-600">{employee.position}</span>
              </td>
              <td className="px-4 py-3">
                <span className="font-medium text-gray-900">
                  {formatSalary(employee.baseSalary)}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                  employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`} title={employee.isActive ? 'Actif' : 'Inactif'}>
                  {employee.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(employee)}
                    className="text-orange-600 flex items-center justify-center w-8 h-8 p-0"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(employee.id)}
                    className="text-red-600 flex items-center justify-center w-8 h-8 p-0"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConfigureCharges(employee)}
                    className="text-indigo-600 flex items-center justify-center w-8 h-8 p-0"
                    title="Gérer les charges fixes"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(employee.id, employee.isActive)}
                    className={`${employee.isActive ? 'text-yellow-600' : 'text-green-600'} flex items-center justify-center w-8 h-8 p-0`}
                    title={employee.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {employee.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}