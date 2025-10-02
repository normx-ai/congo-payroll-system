import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmployeeFormData } from '@/types/employee'
import { getSalaireConvention } from '@/lib/payroll/salaires'
import { useEffect, useState } from 'react'

interface SalaryFieldsProps {
  formData: EmployeeFormData
  onChange: (field: keyof EmployeeFormData, value: string | number) => void
}

export function SalaryFields({ formData, onChange }: SalaryFieldsProps) {
  const [calculatedSalary, setCalculatedSalary] = useState<number>(0)

  // Calculer automatiquement le salaire quand la catégorie ou l'échelon change
  useEffect(() => {
    if (formData.categorieProfessionnelle && formData.echelon && formData.conventionCollective) {
      try {
        const salary = getSalaireConvention(
          formData.categorieProfessionnelle,
          formData.echelon,
          formData.conventionCollective
        )
        console.log('💰 Calcul salaire:', {
          categorie: formData.categorieProfessionnelle,
          echelon: formData.echelon,
          convention: formData.conventionCollective,
          salary: salary
        })
        setCalculatedSalary(salary)
        // Mise à jour du salaire dans le formulaire seulement si différent
        if (formData.baseSalary !== salary) {
          onChange('baseSalary', salary)
        }
      } catch (error) {
        console.warn('Erreur calcul salaire:', error)
        setCalculatedSalary(0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.categorieProfessionnelle, formData.echelon, formData.conventionCollective])

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="conventionCollective">Convention Collective *</Label>
        <Select value={formData.conventionCollective || ''} onValueChange={(value) => onChange('conventionCollective', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Commerce">Commerce</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categorieProfessionnelle">Catégorie Professionnelle *</Label>
        <Select value={formData.categorieProfessionnelle?.toString() || ''} onValueChange={(value) => onChange('categorieProfessionnelle', parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent>
            {[1,2,3,4,5,6,7,8,9,10].map(cat => (
              <SelectItem key={cat} value={cat.toString()}>
                Catégorie {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="echelon">Échelon *</Label>
        <Select value={formData.echelon?.toString() || ''} onValueChange={(value) => onChange('echelon', parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent>
            {[1,2,3,4,5].map(ech => (
              <SelectItem key={ech} value={ech.toString()}>
                Échelon {ech}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="baseSalary">Salaire de base (FCFA) *</Label>
        <Input
          id="baseSalary"
          type="number"
          value={formData.baseSalary || calculatedSalary}
          readOnly
          disabled
          className="bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed"
          placeholder="Sera calculé automatiquement selon la convention"
        />
        {calculatedSalary > 0 && (
          <p className="text-xs text-indigo-600">
            Calculé selon la convention collective Commerce - Cat. {formData.categorieProfessionnelle} / Éch. {formData.echelon}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnssNumber">Numéro CNSS</Label>
        <Input
          id="cnssNumber"
          value={formData.cnssNumber}
          onChange={(e) => onChange('cnssNumber', e.target.value)}
          placeholder="22278401 13"
          className="border-indigo-200 focus:border-indigo-500"
          maxLength={12}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nui">NUI</Label>
        <Input
          id="nui"
          value={formData.nui}
          onChange={(e) => onChange('nui', e.target.value)}
          placeholder="P1234567890123456"
          className="border-indigo-200 focus:border-indigo-500"
          maxLength={17}
        />
      </div>
    </>
  )
}