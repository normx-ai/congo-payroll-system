/**
 * Utilitaires pour le calcul des rubriques
 * Fichier: <150 lignes
 */

export interface Rubrique {
  code: string
  libelle: string
  type: string
  formule: string
  isActive: boolean
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
  salaireBase?: number
}

export interface RubriqueAmount {
  employeeId: string
  rubriqueCode: string
  amount: number
}

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(amount)
}

export const calculateRubriqueValue = (
  rubrique: Rubrique,
  salaireBase: number,
  getParameterValue?: (param: string) => number
): number => {
  if (rubrique.formule === '') {
    return 0 // Saisie manuelle
  }

  // Calculs spécifiques selon le code de la rubrique
  switch (rubrique.code) {
    case '0110': {
      const montantSursalaire = getParameterValue?.('montantSursalaire') || 0
      const joursTravailles = getParameterValue?.('joursTravailles') || 30
      return (montantSursalaire * joursTravailles)
    }

    case '003': {
      const tauxPrimeProd = getParameterValue?.('tauxPrimeProduction') || 0
      return (salaireBase * tauxPrimeProd / 100)
    }

    case '004': {
      const montantTransport = getParameterValue?.('montantTransport') || 15000
      return montantTransport
    }

    case '1020': {
      const montantLogement = getParameterValue?.('montantLogement') || 0
      return montantLogement
    }

    default:
      // Pour les autres rubriques, essayer d'évaluer la formule
      try {
        // Remplacer les variables dans la formule
        let formule = rubrique.formule
        formule = formule.replace(/salaireBase/gi, salaireBase.toString())

        // Évaluation sécurisée de la formule (basique)
        if (/^[\d\s+\-*/().]+$/.test(formule)) {
          return eval(formule) || 0
        }
      } catch {
        // En cas d'erreur, retourner 0
      }

      return 0
  }
}

export const initializeAmountsFromData = (
  amounts: RubriqueAmount[],
  employeeId: string
): { [key: string]: number } => {
  const employeeAmounts = amounts.filter(a => a.employeeId === employeeId)
  const localAmounts: { [key: string]: number } = {}

  employeeAmounts.forEach(amount => {
    localAmounts[amount.rubriqueCode] = amount.amount
  })

  return localAmounts
}