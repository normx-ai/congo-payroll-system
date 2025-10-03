import { prisma } from '@/lib/prisma'

/**
 * Service d'accès aux paramètres fiscaux depuis la base de données
 */
export class ParametresFiscauxService {
  /**
   * Récupère un paramètre fiscal par code
   * Prend le paramètre valide à la date donnée ou le plus récent si pas de date
   */
  static async getParametre(
    tenantId: string,
    code: string,
    periode?: Date
  ) {
    const whereClause: {
      tenantId: string
      code: string
      isActive: true
      dateEffet?: { lte: Date }
      OR?: Array<{ dateFin: null } | { dateFin: { gte: Date } }>
    } = {
      tenantId,
      code,
      isActive: true
    }

    if (periode) {
      whereClause.dateEffet = { lte: periode }
      whereClause.OR = [
        { dateFin: null },
        { dateFin: { gte: periode } }
      ]
    }

    const parametre = await prisma.fiscalParameter.findFirst({
      where: whereClause,
      orderBy: { dateEffet: 'desc' }
    })

    if (!parametre) {
      throw new Error(`Paramètre fiscal '${code}' non trouvé`)
    }

    return parametre
  }

  /**
   * Récupère la valeur d'un paramètre fiscal
   */
  static async getValue(
    tenantId: string,
    code: string,
    periode?: Date
  ): Promise<number> {
    const parametre = await this.getParametre(tenantId, code, periode)
    return Number(parametre.value)
  }

  /**
   * Récupère plusieurs paramètres fiscaux en une seule requête
   * Prend les paramètres valides à la date donnée ou les plus récents si pas de date
   */
  static async getParametres(
    tenantId: string,
    codes: string[],
    periode?: Date
  ): Promise<Record<string, number>> {
    const whereClause: {
      tenantId: string
      code: { in: string[] }
      isActive: true
      dateEffet?: { lte: Date }
      OR?: Array<{ dateFin: null } | { dateFin: { gte: Date } }>
    } = {
      tenantId,
      code: { in: codes },
      isActive: true
    }

    if (periode) {
      whereClause.dateEffet = { lte: periode }
      whereClause.OR = [
        { dateFin: null },
        { dateFin: { gte: periode } }
      ]
    }

    // Récupérer tous les paramètres actifs pour ce tenant
    const parametres = await prisma.fiscalParameter.findMany({
      where: whereClause,
      orderBy: { dateEffet: 'desc' }
    })

    // Grouper par code et prendre le plus récent
    const result: Record<string, number> = {}
    const foundCodes = new Set<string>()

    for (const param of parametres) {
      if (!foundCodes.has(param.code)) {
        result[param.code] = Number(param.value)
        foundCodes.add(param.code)
      }
    }

    // Vérifier que tous les codes demandés ont été trouvés
    for (const code of codes) {
      if (!foundCodes.has(code)) {
        throw new Error(`Paramètre fiscal '${code}' non trouvé`)
      }
    }

    return result
  }

  /**
   * Récupère tous les paramètres fiscaux actifs
   */
  static async getAllParametres(
    tenantId: string
  ) {
    const allParams = await prisma.fiscalParameter.findMany({
      where: {
        tenantId,
        isActive: true
      },
      orderBy: [
        { code: 'asc' },
        { dateEffet: 'desc' }
      ]
    })

    // Grouper par code et prendre le plus récent
    const uniqueParams = new Map()
    for (const param of allParams) {
      if (!uniqueParams.has(param.code)) {
        uniqueParams.set(param.code, param)
      }
    }

    return Array.from(uniqueParams.values())
  }
}
