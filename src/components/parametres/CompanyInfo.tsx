'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Building2, Mail, Phone } from 'lucide-react'

interface CompanyInfo {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  nui: string
  rccm: string
  cnssNumber: string
  taxNumber: string
}

interface CompanyInfoCardProps {
  companyInfo: CompanyInfo
  onInputChange: (field: keyof CompanyInfo, value: string) => void
}

export function CompanyInfoCard({ companyInfo, onInputChange }: CompanyInfoCardProps) {
  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 text-sm">
          <Building2 className="w-3 h-3" />
          Informations Générales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 pb-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nom de l&apos;entreprise
          </label>
          <Input
            value={companyInfo.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="SARL EXEMPLE"
            className="h-8 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-2 top-2 w-3 h-3 text-gray-400" />
            <Input
              type="email"
              value={companyInfo.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="contact@entreprise.cg"
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Téléphone
          </label>
          <div className="relative">
            <Phone className="absolute left-2 top-2 w-3 h-3 text-gray-400" />
            <Input
              value={companyInfo.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="+242 XX XX XX XX"
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}