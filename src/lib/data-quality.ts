import { prisma } from './prisma'

// Interface pour les résultats d'analyse de qualité
interface DataQualityIssues {
  duplicates: number
  invalidDates: number
  invalidSalaries: number
  invalidFormats: number
  missingFields: number
}
import { logger } from './logger'

export interface DataQualityReport {
  timestamp: string
  totalEmployees: number
  totalTenants: number
  issues: {
    duplicates: number
    invalidDates: number
    invalidSalaries: number
    invalidFormats: number
    missingFields: number
  }
  qualityScore: number
  recommendations: string[]
}

export class DataQualityService {

  static async generateReport(): Promise<DataQualityReport> {
    logger.info('Starting data quality analysis')

    const [totalEmployees, totalTenants, duplicateIssues, dateIssues, salaryIssues, formatIssues, missingFieldIssues] = await Promise.all([
      this.getTotalEmployees(),
      this.getTotalTenants(),
      this.checkDuplicates(),
      this.checkInvalidDates(),
      this.checkInvalidSalaries(),
      this.checkInvalidFormats(),
      this.checkMissingFields()
    ])

    const totalIssues = duplicateIssues + dateIssues + salaryIssues + formatIssues + missingFieldIssues
    const qualityScore = Math.max(0, 100 - (totalIssues / totalEmployees) * 100)

    const report: DataQualityReport = {
      timestamp: new Date().toISOString(),
      totalEmployees,
      totalTenants,
      issues: { duplicates: duplicateIssues, invalidDates: dateIssues, invalidSalaries: salaryIssues, invalidFormats: formatIssues, missingFields: missingFieldIssues },
      qualityScore: Math.round(qualityScore * 100) / 100,
      recommendations: this.generateRecommendations({ duplicates: duplicateIssues, invalidDates: dateIssues, invalidSalaries: salaryIssues, invalidFormats: formatIssues, missingFields: missingFieldIssues })
    }

    logger.info('Data quality analysis completed', { qualityScore: report.qualityScore })
    return report
  }

  private static async getTotalEmployees(): Promise<number> {
    return await prisma.employee.count({ where: { isActive: true } })
  }

  private static async getTotalTenants(): Promise<number> {
    return await prisma.tenant.count({ where: { isActive: true } })
  }

  private static async checkDuplicates(): Promise<number> {
    const cnssDuplicates = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM (
        SELECT "cnssNumber", "tenantId" FROM employees WHERE "cnssNumber" IS NOT NULL AND "cnssNumber" != '' AND "isActive" = true
        GROUP BY "cnssNumber", "tenantId" HAVING COUNT(*) > 1
      ) duplicates`

    const emailDuplicates = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM (
        SELECT email, "tenantId" FROM employees WHERE email IS NOT NULL AND email != '' AND "isActive" = true
        GROUP BY email, "tenantId" HAVING COUNT(*) > 1
      ) duplicates`

    return Number(cnssDuplicates[0]?.count || 0) + Number(emailDuplicates[0]?.count || 0)
  }

  private static async checkInvalidDates(): Promise<number> {
    const invalidDates = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM employees WHERE "isActive" = true AND (
        "dateOfBirth" > "hireDate" OR
        "dateOfBirth" > CURRENT_DATE - INTERVAL '16 years' OR
        "dateOfBirth" < CURRENT_DATE - INTERVAL '80 years' OR
        ("contractStartDate" IS NOT NULL AND "contractStartDate" < "hireDate") OR
        ("contractEndDate" IS NOT NULL AND "contractStartDate" IS NOT NULL AND "contractEndDate" < "contractStartDate")
      )`
    return Number(invalidDates[0]?.count || 0)
  }

  private static async checkInvalidSalaries(): Promise<number> {
    const invalidSalaries = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM employees WHERE "isActive" = true AND (
        "baseSalary" <= 0 OR "baseSalary" < 50000 OR "baseSalary" > 10000000
      )`
    return Number(invalidSalaries[0]?.count || 0)
  }

  private static async checkInvalidFormats(): Promise<number> {
    const invalidFormats = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM employees WHERE "isActive" = true AND (
        ("cnssNumber" IS NOT NULL AND LENGTH("cnssNumber") != 10) OR
        ("cnssNumber" IS NOT NULL AND "cnssNumber" !~ '^[0-9]+$') OR
        (nui IS NOT NULL AND nui !~ '^P[0-9]{16}$') OR
        (email IS NOT NULL AND email !~ '^[^@]+@[^@]+\\.[^@]+$')
      )`
    return Number(invalidFormats[0]?.count || 0)
  }

  private static async checkMissingFields(): Promise<number> {
    const missingFields = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM employees WHERE "isActive" = true AND (
        "firstName" IS NULL OR "firstName" = '' OR
        "lastName" IS NULL OR "lastName" = '' OR
        "hireDate" IS NULL OR "baseSalary" IS NULL
      )`
    return Number(missingFields[0]?.count || 0)
  }

  private static generateRecommendations(issues: DataQualityIssues): string[] {
    const recommendations: string[] = []
    if ((issues.duplicates as number) > 0) recommendations.push(`Nettoyer ${issues.duplicates} doublons détectés`)
    if ((issues.invalidDates as number) > 0) recommendations.push(`Corriger ${issues.invalidDates} dates incohérentes`)
    if ((issues.invalidSalaries as number) > 0) recommendations.push(`Réviser ${issues.invalidSalaries} salaires invalides`)
    if ((issues.invalidFormats as number) > 0) recommendations.push(`Corriger ${issues.invalidFormats} formats invalides (CNSS/NUI/Email)`)
    if ((issues.missingFields as number) > 0) recommendations.push(`Compléter ${issues.missingFields} champs obligatoires manquants`)
    if (recommendations.length === 0) recommendations.push('Excellente qualité des données ! Continuer le monitoring.')
    return recommendations
  }
}