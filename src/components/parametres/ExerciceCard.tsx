import { CheckCircle, Unlock, Lock, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Exercice } from './exercicesData'

interface ExerciceCardProps {
  exercice: Exercice
  onActiver: (id: string) => void
  onCloturer: (id: string) => void
  onOuvrir: (id: string) => void
}

export function ExerciceCard({ exercice, onActiver, onCloturer, onOuvrir }: ExerciceCardProps) {
  const getStatusBadge = () => {
    if (exercice.isActif) {
      return <Badge className="bg-indigo-100 text-indigo-800">Actif</Badge>
    }
    if (exercice.isClos) {
      return <Badge className="bg-gray-100 text-gray-800">Clos</Badge>
    }
    return <Badge className="bg-indigo-100 text-indigo-800">Ouvert</Badge>
  }

  const getActions = () => {
    const actions = []

    if (!exercice.isActif && !exercice.isClos) {
      actions.push(
        <Button
          key="activer"
          size="sm"
          variant="outline"
          onClick={() => onActiver(exercice.id)}
          className="text-green-600 border-green-200 hover:bg-green-50 p-2"
        >
          <Unlock className="w-4 h-4" />
        </Button>
      )
    }

    if (!exercice.isClos) {
      actions.push(
        <Button
          key="cloturer"
          size="sm"
          variant="outline"
          onClick={() => onCloturer(exercice.id)}
          className="text-red-600 border-red-200 hover:bg-red-50 p-2"
        >
          <Lock className="w-4 h-4" />
        </Button>
      )
    } else {
      actions.push(
        <Button
          key="rouvrir"
          size="sm"
          variant="outline"
          onClick={() => onOuvrir(exercice.id)}
          className="text-blue-600 border-blue-200 hover:bg-blue-50 p-2"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      )
    }

    return actions
  }

  return (
    <div
      className={`p-3 rounded-lg border ${
        exercice.isActif
          ? 'border-indigo-200 bg-indigo-50'
          : exercice.isClos
          ? 'border-gray-200 bg-gray-50'
          : 'border-indigo-200 bg-indigo-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900">{exercice.libelle}</h3>
            {getStatusBadge()}
            {exercice.isActif && (
              <CheckCircle className="w-4 h-4 text-indigo-600" />
            )}
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>
              <span className="font-medium">Période :</span>{' '}
              {new Date(exercice.dateDebut).toLocaleDateString('fr-FR')} -{' '}
              {new Date(exercice.dateFin).toLocaleDateString('fr-FR')}
            </div>
            {exercice.description && (
              <div>
                <span className="font-medium">Description :</span> {exercice.description}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {getActions()}
        </div>
      </div>
    </div>
  )
}