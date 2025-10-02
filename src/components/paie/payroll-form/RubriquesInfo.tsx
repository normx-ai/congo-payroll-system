'use client'

import { AlertTriangle } from 'lucide-react'

export function RubriquesInfo() {
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4" />
        <span className="font-medium">Rubriques appliquées automatiquement :</span>
      </div>
      <div className="text-xs space-y-1">
        <div>• <span className="font-medium">1 gain de base</span> : Salaire selon grille officielle</div>
        <div>• <span className="font-medium">7 cotisations obligatoires</span> : CNSS (4%), IRPP, Allocations familiales (10.03%), Accidents travail (2.25%), TUS (7.5%), CAMU (0.5%), TOL (1000 FCFA)</div>
        <div>• <span className="font-medium">1 avantage non imposable</span> : Indemnité transport (25 000 FCFA)</div>
        <div>• <span className="font-medium">Prime ancienneté automatique</span> : Si &gt; 2 ans (5% × années/2)</div>
        <div className="text-indigo-600 font-medium mt-2">🇨🇬 Conformité légale Congo-Brazzaville</div>
      </div>
    </div>
  )
}