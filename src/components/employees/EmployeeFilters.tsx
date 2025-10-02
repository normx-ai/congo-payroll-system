'use client'

import { Search, Filter, CheckCircle, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface EmployeeFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterStatus: 'all' | 'active' | 'inactive'
  onFilterChange: (status: 'all' | 'active' | 'inactive') => void
}

export function EmployeeFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange
}: EmployeeFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un employé..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('all')}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Tous
        </Button>
        <Button
          variant={filterStatus === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('active')}
          className="text-green-600 flex items-center justify-center w-10 h-8 p-0"
          title="Employés actifs"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
        <Button
          variant={filterStatus === 'inactive' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('inactive')}
          className="text-red-600 flex items-center justify-center w-10 h-8 p-0"
          title="Employés inactifs"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}