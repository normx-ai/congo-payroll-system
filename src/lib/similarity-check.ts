import { prisma } from './prisma'

// Interface pour les filtres de recherche de similarité
interface SimilarityFilter {
  tenantId: string
  isActive: boolean
  id?: { not: string }
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  if (longer.length === 0) return 1.0
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  for (let i = 0; i <= str2.length; i++) matrix[i] = [i]
  for (let j = 0; j <= str1.length; j++) matrix[0][j] = j

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }
  return matrix[str2.length][str1.length]
}

function normalizeString(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, ' ')
}

interface SimilarEmployee {
  id: string
  firstName: string
  lastName: string
  similarity: number
  reason: string
}

interface SimilarityCheckResult {
  hasSimilar: boolean
  similarEmployees: SimilarEmployee[]
  confidenceLevel: 'high' | 'medium' | 'low'
}

export class SimilarityCheckService {

  static async checkSimilarNames(
    firstName: string,
    lastName: string,
    tenantId: string,
    excludeId?: string,
    threshold: number = 0.8
  ): Promise<SimilarityCheckResult> {

    const normalizedFirst = normalizeString(firstName)
    const normalizedLast = normalizeString(lastName)
    const fullName = `${normalizedFirst} ${normalizedLast}`

    const where: SimilarityFilter = { tenantId, isActive: true }
    if (excludeId) where.id = { not: excludeId }

    const employees = await prisma.employee.findMany({
      where,
      select: { id: true, firstName: true, lastName: true }
    })

    const similarEmployees: SimilarEmployee[] = []

    for (const employee of employees) {
      const empFirst = normalizeString(employee.firstName)
      const empLast = normalizeString(employee.lastName)
      const empFullName = `${empFirst} ${empLast}`

      const firstSimilarity = calculateSimilarity(normalizedFirst, empFirst)
      const lastSimilarity = calculateSimilarity(normalizedLast, empLast)
      const fullSimilarity = calculateSimilarity(fullName, empFullName)

      let maxSimilarity = Math.max(firstSimilarity, lastSimilarity, fullSimilarity)
      let reason = ''

      if (firstSimilarity >= threshold) {
        reason = `Prénom similaire (${Math.round(firstSimilarity * 100)}%)`
      } else if (lastSimilarity >= threshold) {
        reason = `Nom similaire (${Math.round(lastSimilarity * 100)}%)`
      } else if (fullSimilarity >= threshold) {
        reason = `Nom complet similaire (${Math.round(fullSimilarity * 100)}%)`
      }

      if (empFirst === normalizedFirst && empLast === normalizedLast) {
        maxSimilarity = 1.0
        reason = 'Nom identique'
      }

      if (maxSimilarity >= threshold) {
        similarEmployees.push({
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          similarity: maxSimilarity,
          reason
        })
      }
    }

    similarEmployees.sort((a, b) => b.similarity - a.similarity)

    let confidenceLevel: 'high' | 'medium' | 'low' = 'low'
    if (similarEmployees.length > 0) {
      const maxSim = similarEmployees[0].similarity
      if (maxSim >= 0.95) confidenceLevel = 'high'
      else if (maxSim >= 0.85) confidenceLevel = 'medium'
    }

    return {
      hasSimilar: similarEmployees.length > 0,
      similarEmployees,
      confidenceLevel
    }
  }

  static async checkAllSimilarities(tenantId: string, threshold: number = 0.85): Promise<Array<{
    employee1: { id: string; firstName: string; lastName: string }
    employee2: { id: string; firstName: string; lastName: string }
    similarity: number
  }>> {

    const employees = await prisma.employee.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, firstName: true, lastName: true }
    })

    const duplicates = []

    for (let i = 0; i < employees.length; i++) {
      for (let j = i + 1; j < employees.length; j++) {
        const emp1 = employees[i]
        const emp2 = employees[j]

        const name1 = `${normalizeString(emp1.firstName)} ${normalizeString(emp1.lastName)}`
        const name2 = `${normalizeString(emp2.firstName)} ${normalizeString(emp2.lastName)}`

        const similarity = calculateSimilarity(name1, name2)

        if (similarity >= threshold) {
          duplicates.push({ employee1: emp1, employee2: emp2, similarity })
        }
      }
    }

    return duplicates.sort((a, b) => b.similarity - a.similarity)
  }
}