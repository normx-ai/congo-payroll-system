'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Save, RefreshCw, AlertCircle, Gift } from 'lucide-react'

interface BaremeIndemnite {
  id: string
  type: string
  libelle: string
  description: string | null
  seuilMin: number | null
  seuilMax: number | null
  taux: number | null
  montantMois: number | null
  ancienneteMinMois: number | null
  ordre: number
}

export function BaremeIndemnites() {
  const TYPE_LABELS: Record<string, string> = {
    'RETRAITE': 'Indemnité de Retraite',
    'LICENCIEMENT': 'Indemnité de Licenciement',
    'COMPRESSION': 'Indemnité de Compression',
    'MATERNITE': 'Congé de Maternité',
    'FIN_ANNEE': 'Prime de Fin d\'Année'
  }

  const [baremes, setBaremes] = useState<BaremeIndemnite[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [modifiedIds, setModifiedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchBaremes()
  }, [])

  const fetchBaremes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/parametres/indemnites')
      if (!response.ok) throw new Error('Erreur lors du chargement')

      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Erreur inconnue')

      setBaremes(result.data.baremes)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (id: string, field: 'taux' | 'montantMois', value: number) => {
    setBaremes(prev => prev.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ))
    setHasChanges(true)
    setModifiedIds(prev => new Set(prev).add(id))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      for (const bareme of baremes.filter(b => modifiedIds.has(b.id))) {
        const response = await fetch('/api/parametres/indemnites', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: bareme.id,
            taux: bareme.taux,
            montantMois: bareme.montantMois
          })
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || 'Erreur lors de la sauvegarde')
        }
      }

      setHasChanges(false)
      setModifiedIds(new Set())
      await fetchBaremes()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const groupedBaremes = baremes.reduce((acc, b) => {
    if (!acc[b.type]) acc[b.type] = []
    acc[b.type].push(b)
    return acc
  }, {} as Record<string, BaremeIndemnite[]>)

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
          <h2 className="text-2xl font-bold text-gray-900">Barèmes d'Indemnités</h2>
          <p className="text-gray-600 mt-1">Convention Collective Commerce Congo</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchBaremes} disabled={loading || saving} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving} className="bg-indigo-600">
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

      {Object.entries(groupedBaremes).map(([type, items]) => (
        <Card key={type} className="shadow-sm border-l-4 bg-amber-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
              <Gift className="w-4 h-4" />
              {TYPE_LABELS[type] || type}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {items.map((bareme) => (
                <div key={bareme.id} className="flex items-center justify-between p-3 bg-white rounded-md border">
                  <div className="flex-1 pr-4">
                    <h3 className="font-medium text-gray-900 text-sm">{bareme.libelle}</h3>
                    <p className="text-xs text-gray-500 mt-1">{bareme.description}</p>
                    {bareme.seuilMin !== null && (
                      <p className="text-xs text-gray-600 mt-1">
                        {bareme.seuilMin} - {bareme.seuilMax || '∞'} ans
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {bareme.taux !== null && (
                      <>
                        <Input
                          type="number"
                          step="0.1"
                          value={bareme.taux}
                          onChange={(e) => handleValueChange(bareme.id, 'taux', parseFloat(e.target.value) || 0)}
                          className="w-20 text-right text-sm h-8"
                        />
                        <span className="text-xs font-medium text-gray-700">%</span>
                      </>
                    )}
                    {bareme.montantMois !== null && (
                      <>
                        <Input
                          type="number"
                          value={bareme.montantMois}
                          onChange={(e) => handleValueChange(bareme.id, 'montantMois', parseInt(e.target.value) || 0)}
                          className="w-16 text-right text-sm h-8"
                        />
                        <span className="text-xs font-medium text-gray-700">mois</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
