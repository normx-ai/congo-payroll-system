'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Save, RefreshCw, AlertCircle, Scale } from 'lucide-react'

interface ConstanteLegale {
  id: string
  type: string
  code: string
  libelle: string
  valeur: number
  unite: string | null
  description: string | null
}

const TYPE_LABELS: Record<string, string> = {
  'TEMPS_TRAVAIL': '⏰ Temps de travail',
  'CONGES': '🏖️ Congés payés',
  'CONVERSION': '🔄 Facteurs de conversion',
  'SEUIL_LEGAL': '📏 Seuils légaux'
}

const TYPE_ORDER = ['TEMPS_TRAVAIL', 'CONGES', 'CONVERSION', 'SEUIL_LEGAL']

export function ConstantesLegales() {
  const [constantes, setConstantes] = useState<ConstanteLegale[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [modifiedIds, setModifiedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchConstantes()
  }, [])

  const fetchConstantes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/parametres/constantes-legales')
      if (!response.ok) throw new Error('Erreur lors du chargement')

      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Erreur inconnue')

      setConstantes(result.data.constantes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (id: string, value: number) => {
    setConstantes(prev => prev.map(c =>
      c.id === id ? { ...c, valeur: value } : c
    ))
    setHasChanges(true)
    setModifiedIds(prev => new Set(prev).add(id))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      for (const constante of constantes.filter(c => modifiedIds.has(c.id))) {
        const response = await fetch('/api/parametres/constantes-legales', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: constante.id,
            valeur: constante.valeur
          })
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || 'Erreur lors de la sauvegarde')
        }
      }

      setHasChanges(false)
      setModifiedIds(new Set())
      await fetchConstantes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const groupedConstantes = constantes.reduce((acc, c) => {
    if (!acc[c.type]) acc[c.type] = []
    acc[c.type].push(c)
    return acc
  }, {} as Record<string, ConstanteLegale[]>)

  // Trier selon l'ordre défini
  const sortedTypes = TYPE_ORDER.filter(type => groupedConstantes[type])

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
          <h2 className="text-2xl font-bold text-gray-900">Constantes Légales</h2>
          <p className="text-gray-600 mt-1">Paramètres du Code du travail congolais</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchConstantes} disabled={loading || saving} variant="outline">
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

      {sortedTypes.map((type) => (
        <Card key={type} className="shadow-sm border-l-4 bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
              <Scale className="w-4 h-4" />
              {TYPE_LABELS[type] || type}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {groupedConstantes[type].map((constante) => (
                <div key={constante.id} className="flex items-center justify-between p-3 bg-white rounded-md border">
                  <div className="flex-1 pr-4">
                    <h3 className="font-medium text-gray-900 text-sm">{constante.libelle}</h3>
                    {constante.description && (
                      <p className="text-xs text-gray-500 mt-1">{constante.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 font-mono">{constante.code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={constante.valeur}
                      onChange={(e) => handleValueChange(constante.id, parseFloat(e.target.value) || 0)}
                      className="w-24 text-right text-sm h-8"
                    />
                    {constante.unite && (
                      <span className="text-xs font-medium text-gray-700 w-16">{constante.unite}</span>
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
