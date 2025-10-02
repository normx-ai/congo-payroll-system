import { PayrollCalculation } from '@/lib/payroll'

interface BulletinHeaderServerProps {
  company: {
    name: string
    address: string
    city: string
    niu?: string
    logoUrl?: string
  }
  calculation: PayrollCalculation
  periodStart: string
  periodEnd: string
}

export function BulletinHeaderServer({ company, calculation, periodStart, periodEnd }: BulletinHeaderServerProps) {
  return (
    <div className="border border-black mb-4">
      <div className="grid grid-cols-3 border-b border-black">
        <div className="border-r border-black p-2 font-bold bg-gray-100">
          BULLETIN DE PAIE
        </div>
        <div className="border-r border-black p-2 text-center">
          XAF
        </div>
        <div className="p-2 text-center">
          <div>PAIE DU {periodStart} AU {periodEnd}</div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="border-r border-black p-4">
          <div className="flex items-start gap-6">
            {company.logoUrl && (
              <div className="flex-shrink-0">
                <div className="relative w-40 h-32">
                  <img
                    src={company.logoUrl.startsWith('http') ? company.logoUrl : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${company.logoUrl}`}
                    alt={`Logo ${company.name}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            )}
            <div className="flex-1">
              <div className="font-bold mb-2">{company.name}</div>
              <div>{company.address}</div>
              {company.city && <div>{company.city}</div>}
              <div className="mt-2">NIU : {company.niu || ''}</div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-1 text-xs">
          <div className="font-bold text-base mb-2 uppercase border-b border-gray-300 pb-1">
            {calculation.firstName || ''} {calculation.lastName || ''}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>Matricule : {calculation.employeeCode}</div>
            <div>Date d&apos;embauche : {calculation.employeeData?.dateEmbauche || 'N/A'}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>Département : {calculation.employeeData?.departement || ''}</div>
            <div>Ancienneté : {calculation.employeeData?.anciennete || 'N/A'}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>Service : {calculation.employeeData?.service || ''}</div>
            <div>Qualif. : {calculation.employeeData?.qualification || ''}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>Emploi : {calculation.position}</div>
            <div>Cat. : {calculation.employeeData?.categorie || ''}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>Situation familiale : {calculation.employeeData?.situationFamiliale || 'Célibataire'}</div>
            <div>Indice : {calculation.employeeData?.indice || ''}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>Nombre d&apos;enfants : {calculation.employeeData?.nombreEnfants || 0}</div>
            <div>Niveau : {calculation.employeeData?.niveau || ''}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>Nombre de parts : {calculation.employeeData?.nombreParts || 1}</div>
            <div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>NIU : {calculation.employeeData?.niu || ''}</div>
            <div>N° CNSS : {calculation.employeeData?.numeroCNSS || ''}</div>
          </div>
        </div>
      </div>

    </div>
  )
}
