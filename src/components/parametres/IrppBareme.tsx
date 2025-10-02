'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Save, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react'

interface IrppTranche {
  id: string
  ordre: number
  seuil_min: number
  seuil_max: number | null
  taux: number
  description: string
}

export function IrppBareme() {
  const [tranches, setTranches] = useState<IrppTranche[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [modifiedIds, setModifiedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchBareme()
  }, [])

  const fetchBareme = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/parametres/irpp')
      if (!response.ok) throw new Error('Erreur lors du chargement')

      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Erreur inconnue')

      setTranches(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTauxChange = (id: string, newTaux: number) => {
    setTranches(prev => prev.map(tranche =>
      tranche.id === id ? { ...tranche, taux: newTaux } : tranche
    ))
    setHasChanges(true)
    setModifiedIds(prev => new Set(prev).add(id))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const updates = tranches.filter(t => modifiedIds.has(t.id))

      for (const tranche of updates) {
        const response = await fetch('/api/parametres/irpp', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: tranche.id,
            taux: tranche.taux
          })
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || 'Erreur lors de la sauvegarde')
        }
      }

      setHasChanges(false)
      setModifiedIds(new Set())
      await fetchBareme()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur lors de la sauvegarde:', err)
    } finally {
      setSaving(false)
    }
  }

  const formatAmount = (amount: number | null) => {
    if (amount === null) return 'Illimité'
    return amount.toLocaleString('fr-FR') + ' FCFA'
  }

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
          <h2 className="text-2xl font-bold text-gray-900">Barème IRPP</h2>
          <p className="text-gray-600 mt-1">
            Impôt sur le Revenu des Personnes Physiques - Barème progressif
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchBareme}
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

      {tranches.length === 0 && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">Aucune tranche IRPP configurée</p>
          <p className="text-sm text-gray-500 mt-2">
            Exécutez le script de seed pour initialiser le barème
          </p>
        </div>
      )}

      {tranches.length > 0 && (
        <Card className="shadow-sm border-l-4 bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
              <TrendingUp className="w-4 h-4" />
              Tranches Progressives
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {tranches.map((tranche) => (
                <div
                  key={tranche.id}
                  className="flex items-center justify-between p-4 bg-white rounded-md border border-gray-100"
                >
                  <div className="flex-1 pr-4">
                    <h3 className="font-medium text-gray-900 text-sm">
                      Tranche {tranche.ordre}
                    </h3>
                    <p className="text-xs text-gray-500 leading-4 mt-1">
                      {tranche.description}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      {formatAmount(tranche.seuil_min)} → {formatAmount(tranche.seuil_max)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={tranche.taux}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        if (!isNaN(value)) {
                          handleTauxChange(tranche.id, value)
                        }
                      }}
                      className="w-20 text-right text-sm h-8"
                    />
                    <span className="text-xs font-medium text-gray-700 w-6">
                      %
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-900 text-sm mb-1">Information</h3>
          <p className="text-sm text-blue-800">
            Le barème de l&apos;IRPP est progressif par tranches. Chaque portion du salaire imposable est taxée au taux correspondant à sa tranche.
          </p>
        </div>
      </div>
    </div>
  )
}
