'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Building2 } from 'lucide-react'

interface CompanyLegal {
  nui: string
  rccm: string
  cnssNumber: string
}

interface CompanyLegalCardProps {
  companyInfo: CompanyLegal
  onInputChange: (field: keyof CompanyLegal, value: string) => void
}

export function CompanyLegalCard({ companyInfo, onInputChange }: CompanyLegalCardProps) {
  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 text-sm">
          <Building2 className="w-3 h-3" />
          Identifiants Légaux
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              NUI
            </label>
            <Input
              value={companyInfo.nui}
              onChange={(e) => onInputChange('nui', e.target.value)}
              placeholder="P123456789X"
              className="w-full h-8 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                RCCM
              </label>
              <Input
                value={companyInfo.rccm}
                onChange={(e) => onInputChange('rccm', e.target.value)}
                placeholder="CG-BZV-01-..."
                className="w-full h-8 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                N° CNSS
              </label>
              <Input
                value={companyInfo.cnssNumber}
                onChange={(e) => onInputChange('cnssNumber', e.target.value)}
                placeholder="123456"
                className="w-full h-8 text-sm"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}