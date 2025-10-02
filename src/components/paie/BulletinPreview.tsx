'use client'

import { PayrollCalculation } from '@/lib/payroll'
import { BulletinHeader } from './BulletinHeader'
import { BulletinTable } from './BulletinTable'
import { BulletinFooter } from './BulletinFooter'

interface BulletinPreviewProps {
  calculation: PayrollCalculation
  month: string
  year: string
  employeeId?: string
  company: {
    name: string
    address: string
    city: string
    niu?: string
  }
  modeReglement?: string
  datePaiement?: string
}

export function BulletinPreview({
  calculation,
  month,
  year,
  employeeId,
  company,
  modeReglement,
  datePaiement
}: BulletinPreviewProps) {
  const periodStart = `01/${month}/${year}`
  const periodEnd = new Date(parseInt(year), parseInt(month), 0).getDate() + `/${month}/${year}`

  return (
    <div className="bg-white mx-auto text-sm" style={{width: '210mm', padding: '10mm'}}>
      <BulletinHeader
        company={company}
        calculation={calculation}
        periodStart={periodStart}
        periodEnd={periodEnd}
      />

      <BulletinTable calculation={calculation} />

      <BulletinFooter
        calculation={calculation}
        month={month}
        year={year}
        employeeId={employeeId}
        hireDate={calculation.employeeData?.dateEmbauche}
        modeReglement={modeReglement}
        datePaiement={datePaiement}
      />
    </div>
  )
}