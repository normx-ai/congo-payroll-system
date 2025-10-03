import { useState, useEffect } from 'react'

/**
 * Interface pour les paramètres fiscaux
 */
export interface ParametresFiscaux {
  cnss: {
    tauxEmploye: number
    tauxEmployeur: number
    plafond: number
  }
  allocationsFamiliales: {
    taux: number
    plafond: number
  }
  accidentsTravail: {
    taux: number
    plafond: number
  }
  tus: {
    tauxAdminFiscale: number
    tauxSecuSociale: number
  }
  camu: {
    taux: number
    seuil: number
  }
  taxesLocales: {
    local: number
    expat: number
    regionale: number
  }
}

/**
 * Valeurs par défaut (fallback si API échoue)
 */
const DEFAULT_PARAMETRES: ParametresFiscaux = {
  cnss: {
    tauxEmploye: 4,
    tauxEmployeur: 8,
    plafond: 1200000,
  },
  allocationsFamiliales: {
    taux: 10.03,
    plafond: 600000,
  },
  accidentsTravail: {
    taux: 2.25,
    plafond: 600000,
  },
  tus: {
    tauxAdminFiscale: 4.125,
    tauxSecuSociale: 3.375,
  },
  camu: {
    taux: 0.5,
    seuil: 500000,
  },
  taxesLocales: {
    local: 1000,
    expat: 5000,
    regionale: 2400,
  },
}

/**
 * Cache en mémoire pour éviter les appels API multiples
 */
let cachedParams: ParametresFiscaux | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Hook pour récupérer les paramètres fiscaux depuis l'API
 * Avec système de cache pour optimiser les performances
 *
 * @param periode - Période au format YYYY-MM (optionnel)
 * @returns {parametres, loading, error, refresh}
 */
export function useParametresFiscaux(periode?: string) {
  const [parametres, setParametres] = useState<ParametresFiscaux>(DEFAULT_PARAMETRES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchParametres = async (force = false) => {
    try {
      setLoading(true)
      setError(null)

      // Vérifier le cache
      const now = Date.now()
      if (!force && cachedParams && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
        console.log('[useParametresFiscaux] Utilisation du cache')
        setParametres(cachedParams)
        setLoading(false)
        return
      }

      // Construire l'URL avec paramètres
      const url = periode
        ? `/api/parametres/fiscaux-cache?periode=${periode}`
        : '/api/parametres/fiscaux-cache'

      console.log('[useParametresFiscaux] Fetching depuis API:', url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error('Format de réponse invalide')
      }

      // Mettre à jour le cache
      cachedParams = result.data
      cacheTimestamp = now

      setParametres(result.data)
    } catch (err) {
      console.error('[useParametresFiscaux] Erreur:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      // En cas d'erreur, utiliser les valeurs par défaut
      setParametres(DEFAULT_PARAMETRES)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParametres()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode])

  return {
    parametres,
    loading,
    error,
    refresh: () => fetchParametres(true),
  }
}

/**
 * Hook simplifié pour obtenir les paramètres sans gérer le loading/error
 * Retourne directement les paramètres (avec valeurs par défaut si nécessaire)
 */
export function useParametresFiscauxSync(periode?: string): ParametresFiscaux {
  const { parametres } = useParametresFiscaux(periode)
  return parametres
}
