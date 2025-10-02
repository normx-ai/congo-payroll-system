'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react'
import { RubriqueRow } from './RubriqueRow'
import { AddRubriqueRow } from './AddRubriqueRow'
import { rubriquesDiponibles, type Rubrique } from './rubriquesData'

type SortOrder = 'asc' | 'desc' | 'none'

export function RubriqueTable() {
  const [rubriques, setRubriques] = useState<Rubrique[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('none')

  useEffect(() => {
    fetchRubriques()
  }, [])

  const fetchRubriques = async () => {
    try {
      setLoading(true)
      // Simuler un chargement API - remplacer par un vrai appel API si disponible
      await new Promise(resolve => setTimeout(resolve, 300))
      setRubriques(rubriquesDiponibles)
    } catch (error) {
      console.error('Erreur lors du chargement des rubriques:', error)
      setRubriques(rubriquesDiponibles)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (code: string) => {
    setEditingCode(code)
  }

  const handleSave = (code: string, updatedRubrique: Partial<Rubrique>) => {
    setRubriques(prev =>
      prev.map(r => r.code === code ? { ...r, ...updatedRubrique } : r)
    )
    setEditingCode(null)
  }

  const handleDelete = (code: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette rubrique ?')) {
      setRubriques(prev => prev.filter(r => r.code !== code))
    }
  }

  const handleToggleActive = (code: string) => {
    setRubriques(prev =>
      prev.map(r => r.code === code ? { ...r, isActive: !r.isActive } : r)
    )
  }

  const handleAddNew = (newRubrique: Rubrique) => {
    setRubriques(prev => [...prev, newRubrique])
    setIsAddingNew(false)
  }

  const handleSort = () => {
    let newSortOrder: SortOrder
    if (sortOrder === 'none') {
      newSortOrder = 'asc'
    } else if (sortOrder === 'asc') {
      newSortOrder = 'desc'
    } else {
      newSortOrder = 'none'
    }
    setSortOrder(newSortOrder)
  }

  const getSortedRubriques = () => {
    if (sortOrder === 'none') {
      return rubriques
    }

    return [...rubriques].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.code.localeCompare(b.code)
      } else {
        return b.code.localeCompare(a.code)
      }
    })
  }

  const getSortIcon = () => {
    if (sortOrder === 'asc') return <ArrowUp className="w-4 h-4" />
    if (sortOrder === 'desc') return <ArrowDown className="w-4 h-4" />
    return <ArrowUpDown className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Chargement des rubriques...</span>
      </div>
    )
  }

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-900">Configuration des Rubriques de Paie</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={fetchRubriques}
              disabled={loading}
              variant="outline"
              className="border-gray-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button
              onClick={() => setIsAddingNew(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Rubrique
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold text-gray-900 w-20">
                  <button
                    onClick={handleSort}
                    className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                  >
                    Code
                    {getSortIcon()}
                  </button>
                </th>
                <th className="text-left p-3 font-semibold text-gray-900 w-80">Libellé</th>
                <th className="text-left p-3 font-semibold text-gray-900 w-40">Type</th>
                <th className="text-left p-3 font-semibold text-gray-900 w-48">Base</th>
                <th className="text-left p-3 font-semibold text-gray-900 w-20">Taux (%)</th>
                <th className="text-left p-3 font-semibold text-gray-900 w-32">Formule</th>
                <th className="text-left p-3 font-semibold text-gray-900 w-24">Statut</th>
                <th className="text-left p-3 font-semibold text-gray-900 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isAddingNew && (
                <AddRubriqueRow
                  onSave={handleAddNew}
                  onCancel={() => setIsAddingNew(false)}
                />
              )}

              {getSortedRubriques().map((rubrique) => (
                <RubriqueRow
                  key={rubrique.code}
                  rubrique={rubrique}
                  isEditing={editingCode === rubrique.code}
                  onEdit={() => handleEdit(rubrique.code)}
                  onSave={(updated) => handleSave(rubrique.code, updated)}
                  onCancel={() => setEditingCode(null)}
                  onDelete={() => handleDelete(rubrique.code)}
                  onToggleActive={() => handleToggleActive(rubrique.code)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}