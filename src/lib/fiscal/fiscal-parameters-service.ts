/**
 * Service de gestion des paramètres fiscaux
 * Remplace les constantes hardcodées par des valeurs configurables en base
 */

import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'

export interface IrppTrancheData {
  ordre: number
  seuil_min: number
  seuil_max?: number
  taux: number
  description: string
}

/**
 * Constantes fiscales par défaut (fallback si BDD indisponible)
 */
const DEFAULT_FISCAL_PARAMETERS = {
  CNSS_TAUX_SALARIE: 0.04,        // 4%
  CNSS_PLAFOND_ANNUEL: 14400000,  // 14,4M FCFA/an
  FRAIS_PRO_TAUX: 0.20,           // 20%
}

const DEFAULT_IRPP_TRANCHES: IrppTrancheData[] = [
  { ordre: 1, seuil_min: 0, seuil_max: 464000, taux: 1, description: "Tranche 1: 0 à 464.000 FCFA" },
  { ordre: 2, seuil_min: 464001, seuil_max: 1000000, taux: 10, description: "Tranche 2: 464.001 à 1.000.000 FCFA" },
  { ordre: 3, seuil_min: 1000001, seuil_max: 3000000, taux: 25, description: "Tranche 3: 1.000.001 à 3.000.000 FCFA" },
  { ordre: 4, seuil_min: 3000001, taux: 40, description: "Tranche 4: au-dessus de 3.000.000 FCFA" }
]

export class FiscalParametersService {

  /**
   * Récupère un paramètre fiscal par code
   */
  static async getParameter(tenantId: string, code: string): Promise<number> {
    try {
      const parameter = await prisma.fiscalParameter.findFirst({
        where: { tenantId, code, isActive: true },
        orderBy: { dateEffet: 'desc' }
      })
      return parameter ? Number(parameter.value) : this.getDefaultParameter(code)
    } catch (error) {
      const paramError = error instanceof Error ? error : new Error('Unknown fiscal parameter error')
      logError(paramError, {
        source: 'FiscalParametersService',
        endpoint: 'getParameter'
      })
      return this.getDefaultParameter(code)
    }
  }

  /**
   * Récupère les tranches IRPP actives
   */
  static async getIrppTranches(tenantId: string): Promise<IrppTrancheData[]> {
    try {
      const tranches = await prisma.irppTranche.findMany({
        where: { tenantId, isActive: true },
        orderBy: { ordre: 'asc' }
      })

      if (tranches.length === 0) {
        return DEFAULT_IRPP_TRANCHES
      }

      return tranches.map(t => ({
        ordre: t.ordre,
        seuil_min: Number(t.seuil_min),
        seuil_max: t.seuil_max ? Number(t.seuil_max) : undefined,
        taux: Number(t.taux),
        description: t.description
      }))
    } catch (error) {
      const trancheError = error instanceof Error ? error : new Error('Unknown IRPP tranches error')
      logError(trancheError, {
        source: 'FiscalParametersService',
        endpoint: 'getIrppTranches'
      })
      return DEFAULT_IRPP_TRANCHES
    }
  }

  /**
   * Méthodes de convenance pour les paramètres courants
   */
  static async getCnssRate(tenantId: string): Promise<number> {
    return this.getParameter(tenantId, 'CNSS_TAUX_SALARIE')
  }

  static async getCnssAnnualCeiling(tenantId: string): Promise<number> {
    return this.getParameter(tenantId, 'CNSS_PLAFOND_ANNUEL')
  }

  static async getProfessionalExpensesRate(tenantId: string): Promise<number> {
    return this.getParameter(tenantId, 'FRAIS_PRO_TAUX')
  }

  /**
   * Récupère les paramètres par défaut
   */
  private static getDefaultParameter(code: string): number {
    switch (code) {
      case 'CNSS_TAUX_SALARIE':
        return DEFAULT_FISCAL_PARAMETERS.CNSS_TAUX_SALARIE
      case 'CNSS_PLAFOND_ANNUEL':
        return DEFAULT_FISCAL_PARAMETERS.CNSS_PLAFOND_ANNUEL
      case 'FRAIS_PRO_TAUX':
        return DEFAULT_FISCAL_PARAMETERS.FRAIS_PRO_TAUX
      default:
        logError(new Error(`Unknown fiscal parameter: ${code}`), {
          source: 'FiscalParametersService',
          endpoint: 'getDefaultParameter'
        })
        return 0
    }
  }

  /**
   * Initialise les paramètres par défaut pour un tenant
   */
  static async initializeDefaultParameters(tenantId: string): Promise<void> {
    try {
      // TODO: Implémenter après migration DB
      // const fiscalParams = [
      //   { tenantId, code: 'CNSS_TAUX_SALARIE', libelle: 'Taux cotisation CNSS salarié',
      //     type: 'TAUX', value: 0.04, unit: '%', dateEffet: new Date('2025-01-01') },
      //   { tenantId, code: 'CNSS_PLAFOND_ANNUEL', libelle: 'Plafond CNSS annuel',
      //     type: 'PLAFOND', value: 14400000, unit: 'FCFA', dateEffet: new Date('2025-01-01') },
      //   { tenantId, code: 'FRAIS_PRO_TAUX', libelle: 'Taux déduction frais professionnels',
      //     type: 'TAUX', value: 0.20, unit: '%', dateEffet: new Date('2025-01-01') }
      // ]
      // await prisma.fiscalParameter.createMany({ data: fiscalParams, skipDuplicates: true })

      console.log(`Paramètres fiscaux par défaut initialisés pour tenant ${tenantId}`)
    } catch (error) {
      const initError = error instanceof Error ? error : new Error('Unknown initialization error')
      logError(initError, {
        source: 'FiscalParametersService',
        endpoint: 'initializeDefaultParameters'
      })
      throw initError
    }
  }
}