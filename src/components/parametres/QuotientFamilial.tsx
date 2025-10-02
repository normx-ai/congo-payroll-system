'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Save, RefreshCw, AlertCircle, Users } from 'lucide-react'

interface BaremeQuotientFamilial {
  id: string
  situationFamiliale: string
  nbEnfantsMin: number
  nbEnfantsMax: number | null
  parts: number
  description: string | null
  ordre: number
}

const SITUATION_LABELS: Record<string, string> = {
  'CELIBATAIRE': '👤 Célibataire',
  'DIVORCE': '💔 Divorcé(e)',
  'MARIE': '💑 Marié(e)',
  'VEUF': '🖤 Veuf/Veuve'
}

const SITUATION_ORDER = ['CELIBATAIRE', 'DIVORCE', 'MARIE', 'VEUF']

export function QuotientFamilial() {
  const [baremes, setBaremes] = useState<BaremeQuotientFamilial[]>([])
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
      const response = await fetch('/api/parametres/quotient-familial')
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

  const handleValueChange = (id: string, value: number) => {
    setBaremes(prev => prev.map(b =>
      b.id === id ? { ...b, parts: value } : b
    ))
    setHasChanges(true)
    setModifiedIds(prev => new Set(prev).add(id))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      for (const bareme of baremes.filter(b => modifiedIds.has(b.id))) {
        const response = await fetch('/api/parametres/quotient-familial', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: bareme.id,
            parts: bareme.parts
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
    if (!acc[b.situationFamiliale]) acc[b.situationFamiliale] = []
    acc[b.situationFamiliale].push(b)
    return acc
  }, {} as Record<string, BaremeQuotientFamilial[]>)

  // Trier selon l'ordre défini
  const sortedSituations = SITUATION_ORDER.filter(sit => groupedBaremes[sit])

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
          <h2 className="text-2xl font-bold text-gray-900">Quotient Familial</h2>
          <p className="text-gray-600 mt-1">Article 91 CGI Congo - Parts fiscales (plafond: 6.5 parts)</p>
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

      {sortedSituations.map((situation) => (
        <Card key={situation} className="shadow-sm border-l-4 bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
              <Users className="w-4 h-4" />
              {SITUATION_LABELS[situation] || situation}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {groupedBaremes[situation].map((bareme) => (
                <div key={bareme.id} className="flex items-center justify-between p-3 bg-white rounded-md border">
                  <div className="flex-1 pr-4">
                    <p className="text-sm text-gray-900 font-medium">
                      {bareme.nbEnfantsMin === 0 && bareme.nbEnfantsMax === 0
                        ? 'Sans enfant à charge'
                        : bareme.nbEnfantsMin === bareme.nbEnfantsMax
                        ? `${bareme.nbEnfantsMin} enfant${bareme.nbEnfantsMin > 1 ? 's' : ''} à charge`
                        : bareme.nbEnfantsMax === null
                        ? `${bareme.nbEnfantsMin}+ enfants à charge`
                        : `${bareme.nbEnfantsMin} à ${bareme.nbEnfantsMax} enfants à charge`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="6.5"
                      value={bareme.parts}
                      onChange={(e) => handleValueChange(bareme.id, parseFloat(e.target.value) || 0)}
                      className="w-20 text-right text-sm h-8"
                    />
                    <span className="text-xs font-medium text-gray-700 w-12">part{bareme.parts > 1 ? 's' : ''}</span>
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
