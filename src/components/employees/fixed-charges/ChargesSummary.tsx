'use client'

interface ChargesSummaryProps {
  selectedCharges: { [rubriqueCode: string]: number }
  availableRubriques: Array<{
    code: string
    libelle: string
  }>
}

export function ChargesSummary({ selectedCharges, availableRubriques }: ChargesSummaryProps) {
  const chargesWithAmounts = Object.entries(selectedCharges)
    .filter(([, amount]) => amount > 0)

  const totalAmount = chargesWithAmounts.reduce((sum, [, amount]) => sum + amount, 0)

  if (chargesWithAmounts.length === 0) {
    return null
  }

  return (
    <div className="bg-blue-50 p-4 rounded-md">
      <h5 className="font-medium text-sm mb-3">Résumé des charges fixes :</h5>
      <div className="space-y-1">
        {chargesWithAmounts.map(([rubriqueCode, amount]) => {
          const rubrique = availableRubriques.find(r => r.code === rubriqueCode)
          return (
            <div key={rubriqueCode} className="flex justify-between text-sm">
              <span>{rubrique?.libelle || rubriqueCode}</span>
              <span className="font-medium">
                {amount.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          )
        })}
        <div className="border-t pt-2 mt-2 flex justify-between font-medium">
          <span>Total mensuel :</span>
          <span>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>
    </div>
  )
}