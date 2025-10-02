'use client'

import { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Exercice } from './exercicesData'

interface CreateExerciceModalProps {
  onClose: () => void
  onSubmit: (exercice: Omit<Exercice, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>) => Promise<boolean>
}

export function CreateExerciceModal({ onClose, onSubmit }: CreateExerciceModalProps) {
  const [formData, setFormData] = useState({
    libelle: '',
    annee: new Date().getFullYear(),
    dateDebut: `${new Date().getFullYear()}-01-01`,
    dateFin: `${new Date().getFullYear()}-12-31`,
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const success = await onSubmit({
        libelle: formData.libelle,
        annee: formData.annee,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        isActif: false,
        isClos: false,
        description: formData.description || undefined
      })

      if (success) {
        onClose()
      } else {
        setError('Erreur lors de la création de l\'exercice')
      }
    } catch (err) {
      console.error('Erreur création exercice:', err)
      setError('Erreur lors de la création de l\'exercice')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnneeChange = (annee: number) => {
    setFormData(prev => ({
      ...prev,
      annee,
      libelle: `Exercice ${annee}`,
      dateDebut: `${annee}-01-01`,
      dateFin: `${annee}-12-31`
    }))
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Nouvel Exercice Fiscal</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Année
            </label>
            <Input
              type="number"
              min="2020"
              max="2030"
              value={formData.annee}
              onChange={(e) => handleAnneeChange(parseInt(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Libellé
            </label>
            <Input
              type="text"
              value={formData.libelle}
              onChange={(e) => setFormData(prev => ({ ...prev, libelle: e.target.value }))}
              placeholder="Exercice 2025"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <Input
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData(prev => ({ ...prev, dateDebut: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <Input
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData(prev => ({ ...prev, dateFin: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optionnel)
            </label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de l'exercice..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.libelle.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-400 disabled:text-white disabled:hover:bg-indigo-400"
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}