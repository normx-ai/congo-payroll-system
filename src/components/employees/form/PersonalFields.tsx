import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmployeeFormData } from '@/types/employee'

interface PersonalFieldsProps {
  formData: EmployeeFormData
  onChange: (field: keyof EmployeeFormData, value: string | number) => void
}

export function PersonalFields({ formData, onChange }: PersonalFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="firstName">Prénom *</Label>
        <Input
          id="firstName"
          value={formData.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
          placeholder="Jean-Pierre"
          className="border-indigo-200 focus:border-indigo-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Nom *</Label>
        <Input
          id="lastName"
          value={formData.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
          placeholder="Mbemba"
          className="border-indigo-200 focus:border-indigo-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="jean.mbemba@exemple.cg"
          className="border-indigo-200 focus:border-indigo-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="+242 06 123 45 67"
          className="border-indigo-200 focus:border-indigo-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Sexe *</Label>
        <Select value={formData.gender || ''} onValueChange={(value) => onChange('gender', value)}>
          <SelectTrigger className="border-indigo-200 focus:border-indigo-500 bg-white">
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            <SelectItem value="male" className="hover:bg-indigo-50">Masculin</SelectItem>
            <SelectItem value="female" className="hover:bg-indigo-50">Féminin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maritalStatus">Situation familiale *</Label>
        <Select value={formData.maritalStatus || ''} onValueChange={(value) => onChange('maritalStatus', value)}>
          <SelectTrigger className="border-indigo-200 focus:border-indigo-500 bg-white">
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            <SelectItem value="single" className="hover:bg-indigo-50">Célibataire</SelectItem>
            <SelectItem value="married" className="hover:bg-indigo-50">Marié(e)</SelectItem>
            <SelectItem value="divorced" className="hover:bg-indigo-50">Divorcé(e)</SelectItem>
            <SelectItem value="widowed" className="hover:bg-indigo-50">Veuf/Veuve</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="childrenCount">Nombre d&apos;enfants</Label>
        <Input
          id="childrenCount"
          type="number"
          value={formData.childrenCount}
          onChange={(e) => onChange('childrenCount', parseInt(e.target.value) || 0)}
          className="border-indigo-200 focus:border-indigo-500"
          min="0"
          max="10"
        />
      </div>
    </>
  )
}