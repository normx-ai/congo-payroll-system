import { Settings } from 'lucide-react'

export function ExerciceInfo() {
  return (
    <div className="mt-4 p-3 bg-green-50 rounded text-sm text-green-700">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="w-4 h-4" />
        <span className="font-medium">Gestion des exercices fiscaux</span>
      </div>
      <div className="text-xs space-y-1">
        <div>• Exercice actif : Seul exercice autorisé pour les traitements de paie</div>
        <div>• Exercice ouvert : Prêt à être activé, mais paie bloquée tant qu&apos;il n&apos;est pas actif</div>
        <div>• Exercice clos : Archive, définitivement fermé</div>
        <div className="text-green-600 font-medium mt-2">🇨🇬 Exercices fiscaux Congo-Brazzaville</div>
      </div>
    </div>
  )
}