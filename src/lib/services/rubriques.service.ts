import { prisma } from '@/lib/prisma'
import { rubriquesDiponibles } from '@/components/parametres/rubriquesData'

export interface RubriqueDefinition {
  code: string
  libelle: string
  type: 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE' | 'ELEMENT_NON_IMPOSABLE'
  base: string | null
  taux: number | null
  formule: string | null
  imposable: boolean
  isActive: boolean
}

/**
 * Service de gestion des rubriques de paie
 * Utilise la base de données en priorité, fallback sur rubriquesData.ts
 */
export class RubriquesService {

  /**
   * Récupère une rubrique par code
   */
  static async getRubrique(
    tenantId: string,
    code: string
  ): Promise<RubriqueDefinition | null> {
    // Tentative de récupération depuis la base
    const rubriqueDb = await prisma.rubrique.findFirst({
      where: {
        tenantId,
        code,
        isActive: true
      }
    })

    if (rubriqueDb) {
      return {
        code: rubriqueDb.code,
        libelle: rubriqueDb.libelle,
        type: rubriqueDb.type as any,
        base: rubriqueDb.base,
        taux: rubriqueDb.taux ? Number(rubriqueDb.taux) : null,
        formule: rubriqueDb.formule,
        imposable: rubriqueDb.imposable,
        isActive: rubriqueDb.isActive
      }
    }

    // Fallback sur rubriquesData.ts
    const rubriqueStatic = rubriquesDiponibles.find(r => r.code === code)
    if (rubriqueStatic) {
      return {
        code: rubriqueStatic.code,
        libelle: rubriqueStatic.libelle,
        type: rubriqueStatic.type,
        base: rubriqueStatic.base,
        taux: rubriqueStatic.taux,
        formule: rubriqueStatic.formule,
        imposable: rubriqueStatic.imposable,
        isActive: rubriqueStatic.isActive
      }
    }

    return null
  }

  /**
   * Récupère toutes les rubriques actives
   */
  static async getAllRubriques(tenantId: string): Promise<RubriqueDefinition[]> {
    // Tentative de récupération depuis la base
    const rubriquesDb = await prisma.rubrique.findMany({
      where: {
        tenantId,
        isActive: true
      },
      orderBy: { code: 'asc' }
    })

    if (rubriquesDb.length > 0) {
      return rubriquesDb.map(r => ({
        code: r.code,
        libelle: r.libelle,
        type: r.type as any,
        base: r.base,
        taux: r.taux ? Number(r.taux) : null,
        formule: r.formule,
        imposable: r.imposable,
        isActive: r.isActive
      }))
    }

    // Fallback sur rubriquesData.ts
    return rubriquesDiponibles.map(r => ({
      code: r.code,
      libelle: r.libelle,
      type: r.type,
      base: r.base,
      taux: r.taux,
      formule: r.formule,
      imposable: r.imposable,
      isActive: r.isActive
    }))
  }

  /**
   * Récupère les rubriques de cotisations
   */
  static async getCotisationsRubriques(tenantId: string): Promise<RubriqueDefinition[]> {
    const all = await this.getAllRubriques(tenantId)
    return all.filter(r => r.type === 'COTISATION' && r.isActive)
  }
}
