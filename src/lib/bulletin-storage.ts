import { promises as fs } from 'fs'
import { join } from 'path'
import { prisma } from './prisma'
import { BulletinData, BulletinResult } from './bulletin-types'

export class BulletinStorageService {
  /**
   * Génère le chemin de stockage pour un bulletin
   */
  static generateFilePath(employeeId: string, periode: string): string {
    const [year, month] = periode.split('-')
    return `uploads/bulletins/${year}/${month}/${employeeId}.pdf`
  }

  /**
   * Assure que le répertoire existe
   */
  static async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = join(process.cwd(), filePath.split('/').slice(0, -1).join('/'))
    await fs.mkdir(dir, { recursive: true })
  }

  /**
   * Sauvegarde un bulletin PDF sur disque
   */
  static async saveBulletinPDF(
    employeeId: string,
    periode: string,
    pdfBuffer: Buffer
  ): Promise<string> {
    const filePath = this.generateFilePath(employeeId, periode)
    const fullPath = join(process.cwd(), filePath)

    await this.ensureDirectoryExists(filePath)
    await fs.writeFile(fullPath, pdfBuffer)

    return filePath
  }

  /**
   * Sauvegarde un bulletin complet en base de données
   */
  static async saveBulletinToDatabase(
    data: BulletinData,
    result: BulletinResult,
    pdfPath: string
  ): Promise<string> {
    const { calculation, month, year, employeeId } = data
    const [monthNum, yearNum] = [parseInt(month), parseInt(year)]

    // Préparer les données JSON complètes
    const bulletinDataJson = {
      calculation,
      generatedAt: new Date().toISOString(),
      version: '1.0',
      rubriques: {
        gains: calculation.rubriques.gains,
        retenues: calculation.rubriques.retenues
      },
      totaux: {
        gains: calculation.totalGains,
        retenues: calculation.totalRetenues,
        net: calculation.salaireNet,
        chargesEmployeur: calculation.cotisationsEmployeur
      },
      employee: calculation.employeeData
    }

    // Insérer ou mettre à jour le bulletin
    const bulletin = await prisma.bulletinPaie.upsert({
      where: {
        employeeId_periode: {
          employeeId,
          periode: `${year}-${month.padStart(2, '0')}`
        }
      },
      update: {
        pdfPath,
        status: 'validated',
        grossSalary: calculation.totalGains,
        netSalary: calculation.salaireNet,
        totalDeductions: calculation.totalRetenues,
        totalChargesPatronales: calculation.cotisationsEmployeur,
        dataJson: JSON.parse(JSON.stringify(bulletinDataJson)),
        updatedAt: new Date()
      },
      create: {
        employeeId,
        tenantId: await this.getTenantIdFromEmployee(employeeId),
        month: monthNum,
        year: yearNum,
        periode: `${year}-${month.padStart(2, '0')}`,
        pdfPath,
        status: 'validated',
        grossSalary: calculation.totalGains,
        netSalary: calculation.salaireNet,
        totalDeductions: calculation.totalRetenues,
        totalChargesPatronales: calculation.cotisationsEmployeur,
        dataJson: JSON.parse(JSON.stringify(bulletinDataJson))
      }
    })

    return bulletin.id
  }

  /**
   * Récupère le tenant ID d'un employé
   */
  private static async getTenantIdFromEmployee(employeeId: string): Promise<string> {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { tenantId: true }
    })

    if (!employee) {
      throw new Error(`Employee not found: ${employeeId}`)
    }

    return employee.tenantId
  }

  /**
   * Sauvegarde complète d'un bulletin (PDF + BDD)
   */
  static async saveBulletin(
    data: BulletinData,
    result: BulletinResult
  ): Promise<{
    bulletinId: string
    pdfPath: string
  }> {
    const { employeeId, month, year } = data
    const periode = `${year}-${month.padStart(2, '0')}`

    // Sauvegarder le PDF
    const pdfPath = await this.saveBulletinPDF(employeeId, periode, result.pdf)

    // Sauvegarder en base
    const bulletinId = await this.saveBulletinToDatabase(data, result, pdfPath)

    return { bulletinId, pdfPath }
  }
}