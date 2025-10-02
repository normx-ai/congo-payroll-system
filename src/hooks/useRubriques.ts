import { useState, useEffect, useMemo } from 'react'
import { rubriquesDiponibles as RUBRIQUES_PAIE } from '@/components/parametres/rubriquesData'
import type { Rubrique } from '@/components/parametres/rubriquesData'

export type RubriqueUI = Rubrique & {
  // isActive déjà dans Rubrique de rubriquesData.ts - pas de champs supplémentaires
}

export function useRubriques() {
  const [rubriques, setRubriques] = useState<RubriqueUI[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE'>('ALL')
  const [expandedCategories, setExpandedCategories] = useState({
    GAIN_BRUT: true,
    COTISATION: true,
    GAIN_NON_SOUMIS: true,
    RETENUE_NON_SOUMISE: true
  })

  useEffect(() => {
    // Les rubriques de rubriquesData.ts ont déjà isActive
    setRubriques(RUBRIQUES_PAIE as RubriqueUI[])
  }, [])

  const filteredRubriques = useMemo(() => {
    let filtered = rubriques

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(r => r.type === selectedCategory)
    }

    return filtered
  }, [rubriques, searchTerm, selectedCategory])

  const gainsBreut = filteredRubriques.filter(r => r.type === 'GAIN_BRUT')
  const cotisations = filteredRubriques.filter(r => r.type === 'COTISATION')
  const gainsNonSoumis = filteredRubriques.filter(r => r.type === 'GAIN_NON_SOUMIS')
  const retenuesNonSoumises = filteredRubriques.filter(r => r.type === 'RETENUE_NON_SOUMISE')

  const counts = {
    total: rubriques.length,
    gainsBreut: gainsBreut.length,
    cotisations: cotisations.length,
    gainsNonSoumis: gainsNonSoumis.length,
    retenuesNonSoumises: retenuesNonSoumises.length
  }

  const toggleRubrique = (code: string) => {
    setRubriques(prev =>
      prev.map(r =>
        r.code === code ? { ...r, isActive: !r.isActive } : r
      )
    )
  }

  const toggleCategory = (category: keyof typeof expandedCategories) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const toggleAllInCategory = (category: 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE', active: boolean) => {
    setRubriques(prev =>
      prev.map(r =>
        r.type === category ? { ...r, isActive: active } : r
      )
    )
  }

  const resetToDefaults = () => {
    if (confirm('Réinitialiser toutes les rubriques aux valeurs par défaut ?')) {
      setRubriques(RUBRIQUES_PAIE as RubriqueUI[])
    }
  }

  const getTotalActives = () => rubriques.filter(r => r.isActive).length

  return {
    rubriques,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    expandedCategories,
    filteredRubriques,
    gainsBreut,
    cotisations,
    gainsNonSoumis,
    retenuesNonSoumises,
    counts,
    toggleRubrique,
    toggleCategory,
    toggleAllInCategory,
    resetToDefaults,
    getTotalActives
  }
}