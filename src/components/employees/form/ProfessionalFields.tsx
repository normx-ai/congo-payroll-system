import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmployeeFormData } from '@/types/employee'
import { useDepartments } from '@/hooks/useDepartments'

interface ProfessionalFieldsProps {
  formData: EmployeeFormData
  onChange: (field: keyof EmployeeFormData, value: string | number) => void
}

export function ProfessionalFields({ formData, onChange }: ProfessionalFieldsProps) {
  const { departments, loading: departmentsLoading } = useDepartments()

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="position">Poste *</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) => onChange('position', e.target.value)}
          placeholder="Développeur Senior"
          className="border-indigo-200 focus:border-indigo-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="departmentId">Département *</Label>
        <Select value={formData.departmentId || ''} onValueChange={(value) => onChange('departmentId', value)} disabled={departments.length === 0 && !departmentsLoading}>
          <SelectTrigger className="border-indigo-200 focus:border-indigo-500 bg-white">
            <SelectValue placeholder={
              departmentsLoading
                ? "Chargement..."
                : departments.length === 0
                  ? "Aucun département disponible - Créez d'abord un département dans Paramètres"
                  : "Sélectionner un département..."
            } />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            {departments.length === 0 && !departmentsLoading ? (
              <div className="px-2 py-1.5 text-sm text-gray-400">
                Aucun département créé
              </div>
            ) : (
              departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id} className="hover:bg-indigo-50">
                  {dept.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {departments.length === 0 && !departmentsLoading && (
          <p className="text-sm text-amber-600">
            ⚠️ Vous devez créer au moins un département dans les paramètres avant d&apos;ajouter un employé.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hireDate">Date d&apos;embauche *</Label>
        <Input
          id="hireDate"
          type="date"
          value={formData.hireDate}
          onChange={(e) => onChange('hireDate', e.target.value)}
          className="border-indigo-200 focus:border-indigo-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contractType">Type de contrat *</Label>
        <Select value={formData.contractType || ''} onValueChange={(value) => onChange('contractType', value)}>
          <SelectTrigger className="border-indigo-200 focus:border-indigo-500 bg-white">
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            <SelectItem value="cdi" className="hover:bg-indigo-50">CDI</SelectItem>
            <SelectItem value="cdd" className="hover:bg-indigo-50">CDD</SelectItem>
            <SelectItem value="stage" className="hover:bg-indigo-50">Stage</SelectItem>
            <SelectItem value="consultant" className="hover:bg-indigo-50">Consultant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="salaryCategory">Catégorie *</Label>
        <Select value={formData.salaryCategory || ''} onValueChange={(value) => onChange('salaryCategory', value)}>
          <SelectTrigger className="border-indigo-200 focus:border-indigo-500 bg-white">
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            <SelectItem value="ouvrier" className="hover:bg-indigo-50">Ouvrier</SelectItem>
            <SelectItem value="employé" className="hover:bg-indigo-50">Employé</SelectItem>
            <SelectItem value="agentMaitrise" className="hover:bg-indigo-50">Agent de Maîtrise</SelectItem>
            <SelectItem value="cadre" className="hover:bg-indigo-50">Cadre</SelectItem>
            <SelectItem value="cadreSuperieur" className="hover:bg-indigo-50">Cadre Supérieur</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}