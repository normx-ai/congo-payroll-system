'use client'

import { User } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
  salaireBase?: number
}

interface EmployeeSelectorProps {
  employees: Employee[]
  selectedEmployee: string
  onEmployeeChange: (employeeId: string) => void
}

export function EmployeeSelector({
  employees,
  selectedEmployee,
  onEmployeeChange
}: EmployeeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        <User className="inline h-4 w-4 mr-1" />
        Sélectionner un employé
      </label>
      <Select value={selectedEmployee} onValueChange={onEmployeeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choisir un employé..." />
        </SelectTrigger>
        <SelectContent>
          {employees.map((emp) => (
            <SelectItem key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName} - {emp.employeeCode}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}