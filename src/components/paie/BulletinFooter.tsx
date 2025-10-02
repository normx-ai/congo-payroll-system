'use client'
import { PayrollCalculation } from '@/lib/payroll'
import { formatAmount } from '@/components/employees/employee-utils'
import { useState, useEffect } from 'react'
import { CumulAnnuel, fetchCumulAnnuel, calculateCurrentCumuls } from './cumuls-calculator'
import { CongesInfo, calculateConges } from './conges-calculator'
import {
  calculateSalaireBrutMensuel,
  calculateNetImposableMensuel,
  calculateChargesSalarialesMensuelles,
  calculateChargesPatronalesMensuelles,
  calculateIRPPMensuel,
  calculateTOLMensuel
} from './bulletin-amounts'

interface BulletinFooterProps {
  calculation: PayrollCalculation
  month?: string
  year?: string
  employeeId?: string
  hireDate?: string
  modeReglement?: string
  datePaiement?: string
}

export function BulletinFooter({
  calculation,
  month,
  year,
  employeeId,
  hireDate,
  modeReglement = "Virement",
  datePaiement
}: BulletinFooterProps) {
  const [cumulAnnuel, setCumulAnnuel] = useState<CumulAnnuel>({
    salaireBrut: 0, netImposable: 0, chargesSalariales: 0, chargesPatronales: 0,
    basConges: 0, irpp: 0, tol: 0
  })
  const [conges, setConges] = useState<CongesInfo>({
    acquis: 0, pris: 0, restants: 0
  })

  useEffect(() => {
    const loadData = async () => {
      if (month && year && employeeId) {
        // Récupérer les cumuls des mois précédents
        const cumulsPrecedents = await fetchCumulAnnuel(employeeId, year, month, calculation)

        // Ajouter le bulletin actuel aux cumuls
        const cumulActuel = calculateCurrentCumuls(calculation)
        const cumulTotal = {
          salaireBrut: cumulsPrecedents.salaireBrut + cumulActuel.salaireBrut,
          netImposable: cumulsPrecedents.netImposable + cumulActuel.netImposable,
          chargesSalariales: cumulsPrecedents.chargesSalariales + cumulActuel.chargesSalariales,
          chargesPatronales: cumulsPrecedents.chargesPatronales + cumulActuel.chargesPatronales,
          basConges: cumulsPrecedents.basConges + cumulActuel.basConges,
          irpp: cumulsPrecedents.irpp + cumulActuel.irpp,
          tol: cumulsPrecedents.tol + cumulActuel.tol
        }

        setCumulAnnuel(cumulTotal)
        const congesData = await calculateConges(hireDate, month, year, employeeId)
        setConges(congesData)
      } else {
        setCumulAnnuel(calculateCurrentCumuls(calculation))
        const congesData = await calculateConges(hireDate, month, year)
        setConges(congesData)
      }
    }
    loadData()
  }, [calculation, month, year, employeeId, hireDate])

  return (
    <div className="mt-4 border border-black">
      <div className="grid grid-cols-8 text-xs">
        <div className="border-r border-black p-2 flex items-center" style={{gridColumn: 'span 6'}}>
          <div><strong>Mode de Règlement :</strong> {modeReglement}</div>
        </div>
        <div className="p-2 text-right" style={{gridColumn: 'span 2'}}>
          <div className="text-lg">NET A PAYER</div>
          <div className="text-xl font-bold">{formatAmount(calculation.salaireNet)}</div>
        </div>
      </div>

      {/* Summary table */}
      <div className="border-t border-black">
        <div className="grid grid-cols-8 bg-gray-100 border-b border-black text-center font-bold text-xs">
          <div className="border-r border-black p-1">Cumuls</div>
          <div className="border-r border-black p-1">Salaire Brut</div>
          <div className="border-r border-black p-1">Net Imposable</div>
          <div className="border-r border-black p-1">Ch. Salariales</div>
          <div className="border-r border-black p-1">Ch. Patronales</div>
          <div className="border-r border-black p-1">Base Congés</div>
          <div className="border-r border-black p-1">IRPP</div>
          <div className="p-1">TOL</div>
        </div>
        <div className="grid grid-cols-8 border-b border-black text-center text-xs">
          <div className="border-r border-black p-1 font-bold">Mois</div>
          <div className="border-r border-black p-1">{formatAmount(calculateSalaireBrutMensuel(calculation))}</div>
          <div className="border-r border-black p-1">{formatAmount(calculateNetImposableMensuel(calculation))}</div>
          <div className="border-r border-black p-1">{formatAmount(calculateChargesSalarialesMensuelles(calculation))}</div>
          <div className="border-r border-black p-1">{formatAmount(calculateChargesPatronalesMensuelles(calculation))}</div>
          <div className="border-r border-black p-1">{formatAmount(calculateSalaireBrutMensuel(calculation))}</div>
          <div className="border-r border-black p-1">{formatAmount(calculateIRPPMensuel(calculation))}</div>
          <div className="p-1">{formatAmount(calculateTOLMensuel(calculation))}</div>
        </div>
        <div className="grid grid-cols-8 text-center text-xs">
          <div className="border-r border-black p-1 font-bold">Année</div>
          <div className="border-r border-black p-1">{formatAmount(cumulAnnuel.salaireBrut)}</div>
          <div className="border-r border-black p-1">{formatAmount(cumulAnnuel.netImposable)}</div>
          <div className="border-r border-black p-1">{formatAmount(cumulAnnuel.chargesSalariales)}</div>
          <div className="border-r border-black p-1">{formatAmount(cumulAnnuel.chargesPatronales)}</div>
          <div className="border-r border-black p-1">{formatAmount(cumulAnnuel.basConges)}</div>
          <div className="border-r border-black p-1">{formatAmount(cumulAnnuel.irpp)}</div>
          <div className="p-1">{formatAmount(cumulAnnuel.tol)}</div>
        </div>
      </div>

      {/* Congés info */}
      <div className="border-t border-black p-2 text-xs">
        <div className="grid grid-cols-4 gap-4">
          <div><strong>Congés</strong></div>
          <div><strong>Acquis</strong></div>
          <div><strong>Pris</strong></div>
          <div><strong>Restants</strong></div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-1">
          <div>{year || new Date().getFullYear()}</div>
          <div>{conges.acquis.toFixed(2)}</div>
          <div>{conges.pris.toFixed(2)}</div>
          <div>{conges.restants.toFixed(2)}</div>
        </div>
      </div>

      {/* Footer text */}
      <div className="border-t border-black p-2 text-center" style={{fontSize: '10px'}}>
        Dans votre intérêt et pour vous aider à faire valoir vos droits, conserver ce bulletin de paie sans limitation de durée
      </div>

      {/* Signature boxes */}
      <div className="border-t border-black grid grid-cols-2 text-xs">
        <div className="border-r border-black p-4">
          <div className="mb-2"><strong>L&apos;employeur :</strong></div>
          <div className="border border-gray-300 h-16"></div>
        </div>
        <div className="p-4">
          <div className="mb-2"><strong>L&apos;employé :</strong></div>
          <div className="border border-gray-300 h-16"></div>
        </div>
      </div>
    </div>
  )
}