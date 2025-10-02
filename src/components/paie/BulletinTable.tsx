'use client'

import { PayrollCalculation } from '@/lib/payroll'
import { formatAmount } from '@/components/employees/employee-utils'

interface BulletinTableProps {
  calculation: PayrollCalculation
}

export function BulletinTable({ calculation }: BulletinTableProps) {
  return (
    <div className="border border-black">
      {/* En-tête unifié avec grille de 9 colonnes */}
      <div className="grid bg-gray-100 border-b border-black text-center font-bold text-xs"
           style={{gridTemplateColumns: '40px 250px 50px 70px 50px 70px 70px 50px 70px'}}>
        <div className="border-r border-black p-1 flex items-center justify-center">n°</div>
        <div className="border-r border-black p-1 flex items-center justify-center">désignation</div>
        <div className="border-r border-black p-1 flex items-center justify-center">qté</div>
        <div className="border-r border-black p-1 flex items-center justify-center">base</div>
        <div className="border-r border-black p-1" style={{gridColumn: 'span 3'}}>part salariale</div>
        <div className="p-1" style={{gridColumn: 'span 2'}}>part patronale</div>
      </div>

      <div className="grid bg-gray-100 border-b border-black text-center font-bold text-xs"
           style={{gridTemplateColumns: '40px 250px 50px 70px 50px 70px 70px 50px 70px'}}>
        <div style={{gridColumn: 'span 4'}}></div>
        <div className="border-r border-black p-1">taux(%)</div>
        <div className="border-r border-black p-1">gain</div>
        <div className="border-r border-black p-1">retenue</div>
        <div className="border-r border-black p-1">taux(%)</div>
        <div className="p-1">retenue</div>
      </div>

      {/* Gains soumis */}
      {calculation.rubriques.gains
        .filter(gain => gain.type === 'GAIN_BRUT')
        .map((gain, index) => {
          const isNegative = gain.montant < 0
          return (
            <div key={`gain-soumis-${index}`} className="grid border-b border-gray-300 text-xs"
                 style={{gridTemplateColumns: '40px 250px 50px 70px 50px 70px 70px 50px 70px'}}>
              <div className="border-r border-black p-1 text-center">{gain.code}</div>
              <div className="border-r border-black p-0.5">{gain.designation}</div>
              <div className="border-r border-black p-1 text-center">
                {(['0100', '0110', '0120'].includes(gain.code)) ? (gain.quantite || '') : ''}
              </div>
              <div className="border-r border-black p-1 text-right">
                {gain.code === '1010' ? formatAmount(gain.base || 0) : ''}
              </div>
              <div className="border-r border-black p-1 text-center">{gain.code === '1010' ? (gain.taux?.replace('%', '') || '') : ''}</div>
              {/* Si négatif : afficher en valeur absolue dans colonne retenue, sinon dans colonne gain */}
              <div className="border-r border-black p-1 text-right">
                {!isNegative ? formatAmount(gain.montant) : ''}
              </div>
              <div className="border-r border-black p-1 text-right">
                {isNegative ? formatAmount(Math.abs(gain.montant)) : ''}
              </div>
              <div className="border-r border-black p-0.5"></div>
              <div className="p-0.5"></div>
            </div>
          )
        })}

      {/* Total Gains soumis */}
      <div className="grid border-b border-black text-xs font-bold bg-gray-50"
           style={{gridTemplateColumns: '40px 250px 50px 70px 50px 70px 70px 50px 70px'}}>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1">Total Brut</div>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1 text-right">
          {formatAmount(
            calculation.rubriques.gains
              .filter(gain => gain.type === 'GAIN_BRUT')
              .reduce((sum, gain) => sum + gain.montant, 0)
          )}
        </div>
        <div className="border-r border-black p-1"></div>
        <div className="p-1"></div>
      </div>

      {/* Cotisations */}
      {calculation.rubriques.retenues
        .filter(retenue => (retenue.type === 'COTISATION' || retenue.type === 'RETENUE_NON_SOUMISE') && !retenue.code.startsWith('5') && !retenue.code.startsWith('6'))
        .map((retenue, index) => (
          <div key={`cotisation-${index}`} className="grid border-b border-gray-300 text-xs"
               style={{gridTemplateColumns: '40px 250px 50px 70px 50px 70px 70px 50px 70px'}}>
            <div className="border-r border-black p-1 text-center">{retenue.code}</div>
            <div className="border-r border-black p-1">{retenue.designation}</div>
            <div className="border-r border-black p-1 text-center"></div>
            <div className="border-r border-black p-1 text-right">{retenue.base ? formatAmount(retenue.base) : ''}</div>
            {['3100'].includes(retenue.code) ? (
              <>
                <div className="border-r border-black p-1 text-center">4</div>
                <div className="border-r border-black p-1"></div>
                <div className="border-r border-black p-1 text-right">{formatAmount(retenue.montant * (4/12))}</div>
              </>
            ) : ['3510', '3540', '3550', '3560', '3570'].includes(retenue.code) ? (
              <>
                <div className="border-r border-black p-1 text-center">{retenue.taux?.replace('%', '') || ''}</div>
                <div className="border-r border-black p-1"></div>
                <div className="border-r border-black p-1 text-right">{formatAmount(retenue.montant)}</div>
              </>
            ) : (
              <>
                <div className="border-r border-black p-1 text-center"></div>
                <div className="border-r border-black p-1"></div>
                <div className="border-r border-black p-1"></div>
              </>
            )}
            {['3100'].includes(retenue.code) ? (
              <>
                <div className="border-r border-black p-1 text-center">8</div>
                <div className="p-1 pr-2 text-right">{formatAmount(retenue.montant * (8/12))}</div>
              </>
            ) : ['3110', '3120', '3530', '3130'].includes(retenue.code) ? (
              <>
                <div className="border-r border-black p-1 text-center">{retenue.taux?.replace('%', '') || ''}</div>
                <div className="p-1 pr-2 text-right">{formatAmount(retenue.montant)}</div>
              </>
            ) : ['3510', '3540', '3550', '3560', '3570'].includes(retenue.code) ? (
              <>
                <div className="border-r border-black p-1 text-center"></div>
                <div className="p-1 pr-2 text-right"></div>
              </>
            ) : (
              <>
                <div className="border-r border-black p-1 text-center">{retenue.taux?.replace('%', '') || ''}</div>
                <div className="p-1 pr-2 text-right">{formatAmount(retenue.montant)}</div>
              </>
            )}
          </div>
        ))}

      {/* Total Cotisations */}
      <div className="grid border-b border-black text-xs font-bold bg-gray-50"
           style={{gridTemplateColumns: '40px 250px 50px 70px 50px 70px 70px 50px 70px'}}>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1">Total Cotisations</div>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1 text-right">
          {formatAmount(
            calculation.rubriques.retenues
              .filter(retenue => retenue.code === '3100')
              .reduce((sum, retenue) => sum + (retenue.montant * (4/12)), 0) +
            calculation.rubriques.retenues
              .filter(retenue => ['3510', '3540', '3550', '3560', '3570'].includes(retenue.code))
              .reduce((sum, retenue) => sum + retenue.montant, 0)
          )}
        </div>
        <div className="border-r border-black p-1"></div>
        <div className="p-1 pr-2 text-right">
          {formatAmount(
            calculation.rubriques.retenues
              .filter(retenue => retenue.code === '3100')
              .reduce((sum, retenue) => sum + (retenue.montant * (8/12)), 0) +
            calculation.rubriques.retenues
              .filter(retenue => ['3110', '3120', '3530', '3130'].includes(retenue.code))
              .reduce((sum, retenue) => sum + retenue.montant, 0)
          )}
        </div>
      </div>

      {/* Retenues non soumises */}
      {calculation.rubriques.retenues
        .filter(retenue => retenue.code.startsWith('5') || retenue.code.startsWith('6'))
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((retenue, index) => (
          <div key={`retenue-non-soumise-${index}`} className="grid border-b border-gray-300 text-xs"
               style={{gridTemplateColumns: '40px 250px 50px 70px 50px 70px 70px 50px 70px'}}>
            <div className="border-r border-black p-1 text-center">{retenue.code}</div>
            <div className="border-r border-black p-1">{retenue.designation}</div>
            <div className="border-r border-black p-1 text-center"></div>
            <div className="border-r border-black p-1 text-right">
              {retenue.code === '3510' ? '' :
               retenue.code === '3540' ? (retenue.base ? formatAmount(retenue.base) : '') :
               (['3550', '6120', '6130', '6140', '6110'].includes(retenue.code) ? '' :
               (retenue.base ? formatAmount(retenue.base) : ''))}
            </div>
            <div className="border-r border-black p-1 text-center">{retenue.taux?.replace('%', '') || ''}</div>
            <div className="border-r border-black p-1"></div>
            <div className="border-r border-black p-1 text-right">{formatAmount(retenue.montant)}</div>
            <div className="border-r border-black p-1"></div>
            <div className="p-1"></div>
          </div>
        ))}

      {/* Bloc 3: Gains non soumis (5xxx), Retenues non soumises (6xxx), Éléments non imposables (9xxx) */}
      {[
        ...calculation.rubriques.gains.filter(gain => gain.type === 'GAIN_NON_SOUMIS'),
        ...calculation.rubriques.retenues.filter(retenue => retenue.type === 'ELEMENT_NON_IMPOSABLE'),
        ...(calculation.rubriques.autresRetenues || [])
      ]
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((item, index) => {
          // Pour l'arrondi (9110), afficher dans gain si positif, dans retenue si négatif
          const isArrondi = item.code === '9110'
          const montantPositif = item.montant > 0

          return (
            <div key={`non-soumis-${index}`} className="grid border-b border-gray-300 text-xs"
                 style={{gridTemplateColumns: '40px 250px 50px 70px 50px 70px 70px 50px 70px'}}>
              <div className="border-r border-black p-1 text-center">{item.code}</div>
              <div className="border-r border-black p-1">{item.designation}</div>
              <div className="border-r border-black p-1 text-center">{item.code === '5010' ? '' : ((item as { quantite?: number }).quantite || '')}</div>
              <div className="border-r border-black p-1 text-right"></div>
              <div className="border-r border-black p-1 text-center">{(item as { taux?: string }).taux?.replace('%', '') || ''}</div>

              {/* Colonne Gain : afficher montant si gain OU si arrondi positif */}
              <div className="border-r border-black p-1 text-right">
                {(item.type === 'GAIN_NON_SOUMIS' || (isArrondi && montantPositif)) ? formatAmount(Math.abs(item.montant)) : ''}
              </div>

              {/* Colonne Retenue : afficher montant si retenue OU si arrondi négatif */}
              <div className="border-r border-black p-1 text-right">
                {(item.type !== 'GAIN_NON_SOUMIS' && (!isArrondi || !montantPositif)) ? formatAmount(Math.abs(item.montant)) : ''}
              </div>

              <div className="border-r border-black p-1"></div>
              <div className="p-1"></div>
            </div>
          )
        })}

      {/* Total Éléments non soumis */}
      <div className="grid border-b border-black text-xs font-bold bg-gray-50"
           style={{gridTemplateColumns: '40px 250px 50px 70px 50px 70px 70px 50px 70px'}}>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1">Total Éléments Non Soumis</div>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1"></div>
        <div className="border-r border-black p-1 text-right">
          {formatAmount(
            calculation.rubriques.gains
              .filter(gain => gain.type === 'GAIN_NON_SOUMIS')
              .reduce((sum, gain) => sum + gain.montant, 0) +
            // Ajouter arrondi positif dans les gains
            calculation.rubriques.retenues
              .filter(retenue => retenue.code === '9110' && retenue.montant > 0)
              .reduce((sum, retenue) => sum + retenue.montant, 0)
          )}
        </div>
        <div className="border-r border-black p-1 text-right">
          {formatAmount(
            [
              ...calculation.rubriques.retenues.filter(retenue => retenue.code.startsWith('5') || retenue.code.startsWith('6')),
              // Ajouter arrondi négatif dans les retenues
              ...calculation.rubriques.retenues.filter(retenue => retenue.code === '9110' && retenue.montant <= 0),
              ...(calculation.rubriques.autresRetenues || [])
            ].reduce((sum, retenue) => sum + Math.abs(retenue.montant), 0)
          )}
        </div>
        <div className="border-r border-black p-1"></div>
        <div className="p-1"></div>
      </div>
    </div>
  )
}