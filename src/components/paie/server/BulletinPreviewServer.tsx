import { PayrollCalculation } from '@/lib/payroll'
import { BulletinHeaderServer } from './BulletinHeaderServer'
import { BulletinTableServer } from './BulletinTableServer'
import { BulletinFooterServer } from './BulletinFooterServer'
import { CumulAnnuel } from '../cumuls-calculator'
import { CongesInfo } from '../conges-calculator'

interface BulletinPreviewServerProps {
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
  cumulAnnuel: CumulAnnuel
  conges: CongesInfo
}

export function BulletinPreviewServer({
  calculation,
  month,
  year,
  company,
  modeReglement,
  cumulAnnuel,
  conges
}: BulletinPreviewServerProps) {
  const periodStart = `01/${month}/${year}`
  const periodEnd = new Date(parseInt(year), parseInt(month), 0).getDate() + `/${month}/${year}`

  return (
    <div className="bg-white mx-auto text-xs font-light" style={{width: '210mm', padding: '8mm'}}>
      <BulletinHeaderServer
        company={company}
        calculation={calculation}
        periodStart={periodStart}
        periodEnd={periodEnd}
      />

      <BulletinTableServer calculation={calculation} />

      <BulletinFooterServer
        calculation={calculation}
        month={month}
        year={year}
        modeReglement={modeReglement}
        cumulAnnuel={cumulAnnuel}
        conges={conges}
      />
    </div>
  )
}
