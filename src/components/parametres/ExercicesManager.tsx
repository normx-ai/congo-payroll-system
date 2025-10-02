'use client'

import { useState } from 'react'
import { Calendar, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useExercices } from '@/hooks/useExercices'
import { ExerciceStats } from './ExerciceStats'
import { ExerciceCard } from './ExerciceCard'
import { ExerciceInfo } from './ExerciceInfo'
import { CreateExerciceModal } from './CreateExerciceModal'

export function ExercicesManager() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const {
    exercices,
    counts,
    loading,
    activerExercice,
    cloturerExercice,
    ouvrirExercice,
    ajouterExercice
  } = useExercices()

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Gestion des Exercices Fiscaux
          </CardTitle>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Exercice
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ExerciceStats counts={counts} />

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Chargement des exercices...</div>
            </div>
          ) : exercices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Aucun exercice</h3>
              <p className="text-sm text-center mb-4">
                Créez votre premier exercice fiscal pour commencer à traiter la paie.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un exercice
              </Button>
            </div>
          ) : (
            exercices.map(exercice => (
              <ExerciceCard
                key={exercice.id}
                exercice={exercice}
                onActiver={activerExercice}
                onCloturer={cloturerExercice}
                onOuvrir={ouvrirExercice}
              />
            ))
          )}
        </div>

        <ExerciceInfo />

        {showCreateModal && (
          <CreateExerciceModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={ajouterExercice}
          />
        )}
      </CardContent>
    </Card>
  )
}