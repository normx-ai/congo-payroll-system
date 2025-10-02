import { EmployeeFormData } from '@/types/employee'
import { PersonalFields } from './PersonalFields'
import { ProfessionalFields } from './ProfessionalFields'
import { SalaryFields } from './SalaryFields'

interface EmployeeFormFieldsProps {
  formData: EmployeeFormData
  onChange: (field: keyof EmployeeFormData, value: string | number) => void
}

export function EmployeeFormFields({ formData, onChange }: EmployeeFormFieldsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-indigo-900 mb-4">Informations personnelles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PersonalFields formData={formData} onChange={onChange} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-indigo-900 mb-4">Informations professionnelles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfessionalFields formData={formData} onChange={onChange} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-indigo-900 mb-4">Salaire et Convention</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SalaryFields formData={formData} onChange={onChange} />
        </div>
      </div>
    </div>
  )
}