'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Save, RefreshCw, AlertCircle } from 'lucide-react'
import { ConstantCard } from './ConstantCard'

interface PayrollConstant {
  id: string
  name: string
  description: string
  value: number
  unit: '%' | 'FCFA' | 'days' | 'heures'
  category: 'social' | 'tax' | 'legal' | 'overtime'
}

export function PayrollConstants() {
  const [constants, setConstants] = useState<PayrollConstant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [modifiedIds, setModifiedIds] = useState<Set<string>>(new Set())

  // Charger les paramètres depuis l'API
  useEffect(() => {
    fetchParameters()
  }, [])

  const fetchParameters = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/parametres/fiscaux')
      if (!response.ok) throw new Error('Erreur lors du chargement')

      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Erreur inconnue')

      // Mapper les données de l'API vers le format du composant
      type ApiParameter = {
        id: string
        code: string
        libelle: string
        description: string | null
        value: string
        unit: string | null
      }

      const mappedConstants: PayrollConstant[] = result.data.parametres.map((param: ApiParameter) => {
        let category: PayrollConstant['category'] = 'legal'

        if (param.code.startsWith('CNSS_') || param.code.startsWith('CAMU_') ||
            param.code.startsWith('AF_') || param.code.startsWith('AT_')) {
          category = 'social'
        } else if (param.code.startsWith('TUS_') || param.code.startsWith('IRPP_') ||
                   param.code.includes('EXONERATION')) {
          category = 'tax'
        } else if (param.code.startsWith('HS_') || param.code.includes('HEURES_')) {
          category = 'overtime'
        }

        return {
          id: param.id,
          name: param.libelle,
          description: param.description || '',
          value: Number(param.value),
          unit: param.unit || '%',
          category
        }
      })

      setConstants(mappedConstants)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (id: string, newValue: number) => {
    setConstants(prev => prev.map(constant =>
      constant.id === id ? { ...constant, value: newValue } : constant
    ))
    setHasChanges(true)
    setModifiedIds(prev => new Set(prev).add(id))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Sauvegarder tous les paramètres modifiés
      const updates = constants.filter(c => modifiedIds.has(c.id))

      for (const constant of updates) {
        const response = await fetch('/api/parametres/fiscaux', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: constant.id,
            value: constant.value
          })
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || 'Erreur lors de la sauvegarde')
        }
      }

      setHasChanges(false)
      setModifiedIds(new Set())

      // Recharger les données
      await fetchParameters()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur lors de la sauvegarde:', err)
    } finally {
      setSaving(false)
    }
  }

  const groupedConstants = constants.reduce((acc, constant) => {
    if (!acc[constant.category]) acc[constant.category] = []
    acc[constant.category].push(constant)
    return acc
  }, {} as Record<PayrollConstant['category'], PayrollConstant[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paramètres Fiscaux</h2>
          <p className="text-gray-600 mt-1">Gestion des taux et plafonds de cotisations</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchParameters}
            disabled={loading || saving}
            variant="outline"
            className="border-gray-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Erreur</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {constants.length === 0 && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">Aucun paramètre fiscal configuré</p>
          <p className="text-sm text-gray-500 mt-2">
            Exécutez le script de seed pour initialiser les paramètres
          </p>
        </div>
      )}

      {Object.entries(groupedConstants).map(([category, categoryConstants]) => (
        <ConstantCard
          key={category}
          category={category as PayrollConstant['category']}
          constants={categoryConstants}
          onValueChange={handleValueChange}
        />
      ))}
    </div>
  )
}