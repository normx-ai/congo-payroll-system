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
    <div className="border border-black mb-2" style={{fontSize: '9px'}}>
      <div className="grid grid-cols-3 border-b border-black">
        <div className="border-r border-black py-0.5 px-1 font-normal bg-gray-100">
          BULLETIN DE PAIE
        </div>
        <div className="border-r border-black py-0.5 px-1 text-center">
          XAF
        </div>
        <div className="py-0.5 px-1 text-center">
          <div>PAIE DU {periodStart} AU {periodEnd}</div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="border-r border-black p-2">
          <div className="flex items-start gap-3">
            {company.logoUrl && (
              <div className="flex-shrink-0">
                <div className="relative w-24 h-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
              <div className="font-normal mb-1">{company.name}</div>
              <div>{company.address}</div>
              {company.city && <div>{company.city}</div>}
              <div className="mt-1">NIU : {company.niu || ''}</div>
            </div>
          </div>
        </div>

        <div className="p-2 space-y-0.5">
          <div className="font-normal mb-1 uppercase border-b border-gray-300 pb-0.5" style={{fontSize: '10px'}}>
            {calculation.firstName || ''} {calculation.lastName || ''}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>Matricule : {calculation.employeeCode}</div>
            <div>Date emb. : {calculation.employeeData?.dateEmbauche || 'N/A'}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>Dépt. : {calculation.employeeData?.departement || ''}</div>
            <div>Anc. : {calculation.employeeData?.anciennete || 'N/A'}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>Service : {calculation.employeeData?.service || ''}</div>
            <div>Qualif. : {calculation.employeeData?.qualification || ''}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>Emploi : {calculation.position}</div>
            <div>Cat. : {calculation.employeeData?.categorie || ''}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>Sit. fam. : {calculation.employeeData?.situationFamiliale || 'Célibataire'}</div>
            <div>Indice : {calculation.employeeData?.indice || ''}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>Nb enfants : {calculation.employeeData?.nombreEnfants || 0}</div>
            <div>Niveau : {calculation.employeeData?.niveau || ''}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>Nb parts : {calculation.employeeData?.nombreParts || 1}</div>
            <div></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>NIU : {calculation.employeeData?.niu || ''}</div>
            <div>N° CNSS : {calculation.employeeData?.numeroCNSS || ''}</div>
          </div>
        </div>
      </div>

    </div>
  )
}
