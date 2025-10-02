import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Scale } from 'lucide-react'
import type { RegisterData } from '@/types'
import { FISCAL_REGIMES } from '@/types/fiscal'

interface CompanyFieldsProps {
  formData: RegisterData
  setFormData: (data: RegisterData) => void
  type: 'company' | 'cabinet'
}

export function CompanyFields({ formData, setFormData, type }: CompanyFieldsProps) {
  const generateTenant = (companyName: string) => {
    return companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30)
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-indigo-700">
          {type === 'cabinet' ? 'Nom du Cabinet' : 'Nom de l\'Entreprise'}
        </Label>
        <Input
          id="companyName"
          placeholder={type === 'cabinet' ? 'Cabinet Comptable XYZ' : 'Tech Congo SARL'}
          value={formData.companyName}
          onChange={(e) => {
            const newName = e.target.value
            const newTenant = generateTenant(newName)
            setFormData({...formData, companyName: newName, tenant: newTenant})
          }}
          className="border-indigo-200 focus:border-indigo-500"
          required
        />
        <p className="text-xs text-indigo-600">
          {type === 'cabinet'
            ? 'Vous pourrez gérer plusieurs entreprises clientes'
            : 'Raison sociale de votre entreprise'
          }
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenant" className="text-indigo-700">
          <Building2 className="w-4 h-4 inline mr-2" />
          Code d&apos;identification
        </Label>
        <Input
          id="tenant"
          placeholder={type === 'cabinet' ? 'code-cabinet' : 'code-entreprise'}
          value={formData.tenant}
          readOnly
          className="border-indigo-200 bg-indigo-50 text-indigo-700"
        />
        <p className="text-xs text-indigo-600">
          Généré automatiquement à partir du nom
        </p>
      </div>

      {type === 'company' && (
        <div className="space-y-2">
          <Label className="text-indigo-700">
            <Scale className="w-4 h-4 inline mr-2" />
            Régime Fiscal
          </Label>
          <Select value={formData.fiscalRegime} onValueChange={(value: 'forfait' | 'reel') => setFormData({...formData, fiscalRegime: value})}>
            <SelectTrigger className="border-indigo-200 focus:border-indigo-500 focus:ring-0 focus:ring-offset-0 data-[state=open]:border-indigo-500 data-[state=closed]:border-indigo-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-indigo-200">
              {Object.entries(FISCAL_REGIMES).map(([key, regime]) => (
                <SelectItem key={key} value={key} className="hover:bg-indigo-50 focus:bg-indigo-50 border-0 outline-none">
                  {regime.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-indigo-600">
            Choisissez selon votre chiffre d&apos;affaires prévu
          </p>
        </div>
      )}
    </>
  )
}