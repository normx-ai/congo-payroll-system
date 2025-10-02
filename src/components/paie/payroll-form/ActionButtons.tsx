'use client'

import { Button } from '@/components/ui/button'
import { Calculator, Loader2, FileText } from 'lucide-react'

interface ActionButtonsProps {
  selectedCount: number
  processing: boolean
  hasActiveExercise: boolean
  exercicesLoading: boolean
  onPreview: () => void
  onProcess: () => void
}

export function ActionButtons({
  selectedCount,
  processing,
  hasActiveExercise,
  exercicesLoading,
  onPreview,
  onProcess
}: ActionButtonsProps) {
  const isDisabled = processing || selectedCount === 0 || !hasActiveExercise || exercicesLoading

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={onPreview}
          disabled={isDisabled}
          variant="outline"
          className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
        >
          <FileText className="w-4 h-4 mr-2" />
          Aperçu Bulletin
        </Button>
        <Button
          onClick={onProcess}
          disabled={isDisabled}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calcul...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              Calculer ({selectedCount})
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-center text-gray-500">
        Aperçu : Prévisualisation rapide • Calculer : Traitement complet
      </p>
    </div>
  )
}