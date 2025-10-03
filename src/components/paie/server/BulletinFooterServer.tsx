import { PayrollCalculation } from '@/lib/payroll'
import { CumulAnnuel } from '../cumuls-calculator'
import { CongesInfo } from '../conges-calculator'

interface BulletinFooterServerProps {
  calculation: PayrollCalculation
  month?: string
  year?: string
  modeReglement?: string
  cumulAnnuel: CumulAnnuel
  conges: CongesInfo
}

function formatAmount(amount: number): string {
  // Format sans espaces pour PDF
  return Math.round(amount).toString()
}

// Fonctions de calcul inline
function calculateSalaireBrut(calc: PayrollCalculation): number {
  return calc.rubriques.gains.filter(g => g.type === 'GAIN_BRUT').reduce((s, g) => s + g.montant, 0)
}

function calculateNetImposable(calc: PayrollCalculation): number {
  const brut = calculateSalaireBrut(calc)
  const cnssTotal = calc.rubriques.retenues.filter(r => r.code === '3100').reduce((s, r) => s + r.montant, 0)
  return (brut - cnssTotal * (4/12)) * 0.80
}

function calculateChargesSalariales(calc: PayrollCalculation): number {
  const cnssTotal = calc.rubriques.retenues.filter(r => r.code === '3100').reduce((s, r) => s + r.montant, 0)
  const autres = calc.rubriques.retenues.filter(r => ['3510', '3540', '3550'].includes(r.code)).reduce((s, r) => s + r.montant, 0)
  return cnssTotal * (4/12) + autres
}

function calculateChargesPatronales(calc: PayrollCalculation): number {
  const cnssTotal = calc.rubriques.retenues.filter(r => r.code === '3100').reduce((s, r) => s + r.montant, 0)
  const autres = calc.rubriques.retenues.filter(r => ['3110', '3120', '3530', '3130', '3560', '3570'].includes(r.code)).reduce((s, r) => s + r.montant, 0)
  return cnssTotal * (8/12) + autres
}

function calculateIRPP(calc: PayrollCalculation): number {
  return calc.rubriques.retenues.filter(r => r.code === '3510').reduce((s, r) => s + r.montant, 0)
}

function calculateTOL(calc: PayrollCalculation): number {
  return calc.rubriques.retenues.filter(r => r.code === '3550').reduce((s, r) => s + r.montant, 0)
}

export function BulletinFooterServer({
  calculation,
  year,
  modeReglement = "Virement",
  cumulAnnuel,
  conges
}: BulletinFooterServerProps) {
  return (
    <div className="mt-2 border border-black" style={{fontSize: '9px'}}>
      <div className="grid grid-cols-8">
        <div className="border-r border-black py-1 px-2 flex items-center" style={{gridColumn: 'span 6'}}>
          <div><strong>Mode de Règlement :</strong> {modeReglement}</div>
        </div>
        <div className="py-1 px-2 text-right" style={{gridColumn: 'span 2'}}>
          <div style={{fontSize: '11px'}}>NET A PAYER</div>
          <div style={{fontSize: '14px'}} className="font-semibold">{formatAmount(calculation.salaireNet)}</div>
        </div>
      </div>

      <div className="border-t border-black">
        <div className="grid grid-cols-8 bg-gray-100 border-b border-black text-center font-normal">
          <div className="border-r border-black py-0.5 px-0.5">Cumuls</div>
          <div className="border-r border-black py-0.5 px-0.5">Sal. Brut</div>
          <div className="border-r border-black py-0.5 px-0.5">Net Imp.</div>
          <div className="border-r border-black py-0.5 px-0.5">Ch. Sal.</div>
          <div className="border-r border-black py-0.5 px-0.5">Ch. Pat.</div>
          <div className="border-r border-black py-0.5 px-0.5">Base Cg</div>
          <div className="border-r border-black py-0.5 px-0.5">IRPP</div>
          <div className="py-0.5 px-0.5">TOL</div>
        </div>
        <div className="grid grid-cols-8 border-b border-black text-center">
          <div className="border-r border-black py-0.5 px-0.5 font-normal">Mois</div>
          <div className="border-r border-black py-0.5 px-0.5">{formatAmount(calculateSalaireBrut(calculation))}</div>
          <div className="border-r border-black py-0.5 px-0.5">{formatAmount(calculateNetImposable(calculation))}</div>
          <div className="border-r border-black py-0.5 px-0.5">{formatAmount(calculateChargesSalariales(calculation))}</div>
          <div className="border-r border-black py-0.5 px-0.5">{formatAmount(calculateChargesPatronales(calculation))}</div>
          <div className="border-r border-black py-0.5 px-0.5">{formatAmount(calculateSalaireBrut(calculation))}</div>
          <div className="border-r border-black py-0.5 px-0.5">{formatAmount(calculateIRPP(calculation))}</div>
          <div className="py-0.5 px-0.5">{formatAmount(calculateTOL(calculation))}</div>
        </div>
        <div className="grid grid-cols-8 text-center">
          <div className="border-r border-black py-0.5 px-0.5 font-normal">Année</div>
          <div className="border-r border-black py-0.5 px-0.5">{formatAmount(cumulAnnuel.salaireBrut)}</div>
          <div className="border-r border-black py-0.5 px-0.5">{formatAmount(cumulAnnuel.netImposable)}</div>
          <div className="border-r border-black py-0.5 px-0.5">{formatAmount(cumulAnnuel.chargesSalariales)}</div>
          <div className="border-r border-black py-0.5 px-0.5">{formatAmount(cumulAnnuel.chargesPatronales)}</div>
          <div className="border-r border-black py-0.5 px-0.5">{formatAmount(cumulAnnuel.basConges)}</div>
          <div className="border-r border-black py-0.5 px-0.5">{formatAmount(cumulAnnuel.irpp)}</div>
          <div className="py-0.5 px-0.5">{formatAmount(cumulAnnuel.tol)}</div>
        </div>
      </div>

      <div className="border-t border-black py-1 px-2">
        <div className="grid grid-cols-4 gap-2">
          <div><strong>Congés</strong></div>
          <div><strong>Acquis</strong></div>
          <div><strong>Pris</strong></div>
          <div><strong>Restants</strong></div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div>{year || new Date().getFullYear()}</div>
          <div>{conges.acquis.toFixed(2)}</div>
          <div>{conges.pris.toFixed(2)}</div>
          <div>{conges.restants.toFixed(2)}</div>
        </div>
      </div>

      <div className="border-t border-black py-1 px-2 text-center" style={{fontSize: '8px'}}>
        Dans votre intérêt et pour vous aider à faire valoir vos droits, conserver ce bulletin de paie sans limitation de durée
      </div>

      <div className="border-t border-black grid grid-cols-2">
        <div className="border-r border-black py-2 px-3">
          <div className="mb-1"><strong>L&apos;employeur :</strong></div>
          <div className="border border-gray-300 h-12"></div>
        </div>
        <div className="py-2 px-3">
          <div className="mb-1"><strong>L&apos;employé :</strong></div>
          <div className="border border-gray-300 h-12"></div>
        </div>
      </div>
    </div>
  )
}
