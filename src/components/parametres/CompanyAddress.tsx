'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin } from 'lucide-react'

interface CompanyAddress {
  address: string
  city: string
  postalCode: string
}

interface CompanyAddressCardProps {
  companyInfo: CompanyAddress
  onInputChange: (field: keyof CompanyAddress, value: string) => void
}

export function CompanyAddressCard({ companyInfo, onInputChange }: CompanyAddressCardProps) {
  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 text-sm">
          <MapPin className="w-3 h-3" />
          Adresse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 pb-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Adresse
          </label>
          <Input
            value={companyInfo.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            placeholder="123 Avenue de la Paix"
            className="h-8 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Ville
            </label>
            <Input
              value={companyInfo.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Code Postal
            </label>
            <Input
              value={companyInfo.postalCode}
              onChange={(e) => onInputChange('postalCode', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}