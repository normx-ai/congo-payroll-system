import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireExercice } from '@/lib/exercice-guard'
import { BulletinGenerator } from '@/lib/bulletin-generator'
import { BulletinStorageService } from '@/lib/bulletin-storage'
import { calculatePayroll } from '@/lib/payroll'
import { convertToLegacy } from '@/lib/payroll/legacy-converter'
import { handleCatchError } from '@/lib/error-handler'
import { BulletinData } from '@/lib/bulletin-types'

// Force Node.js runtime pour supporter react-dom/server
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 2. Vérifier exercice
    const exerciceGuard = await requireExercice(session.user.tenantId)
    if (exerciceGuard) return exerciceGuard

    // 3. Validation des paramètres
    const { employeeId, periode, rubriquesSaisies = [], chargesDeductibles = 0, joursTravailles = 26, skipPdfGeneration = false } = await req.json()

    console.log('📥 API /bulletins/generate - Données reçues:', {
      employeeId,
      periode,
      joursTravailles,
      rubriquesSaisiesCount: rubriquesSaisies.length,
      rubriquesSaisies,
      chargesDeductibles,
      skipPdfGeneration
    })

    if (!employeeId || !periode) {
      return NextResponse.json(
        { error: 'employeeId et periode requis' },
        { status: 400 }
      )
    }

    if (!/^\d{4}-\d{2}$/.test(periode)) {
      return NextResponse.json(
        { error: 'Format période invalide (YYYY-MM)' },
        { status: 400 }
      )
    }

    // 4. Récupérer données employé + entreprise
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, tenantId: session.user.tenantId, isActive: true },
      include: { tenant: true, department: true }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 })
    }

    // 5. Calculer bulletin de paie
    const [month, year] = [periode.split('-')[1], periode.split('-')[0]]
    const employeeForPayroll = {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeCode: employee.employeeCode,
      position: employee.position,
      baseSalary: Number(employee.baseSalary),
      email: employee.email ?? undefined,
      phone: employee.phone ?? undefined,
      hireDate: employee.hireDate,
      childrenCount: Number(employee.childrenCount ?? 0),
      maritalStatus: employee.maritalStatus ?? undefined,
      isActive: employee.isActive ?? true,
      department: employee.department,
      salaryCategory: employee.salaryCategory ?? undefined,
      cnssNumber: employee.cnssNumber ?? undefined,
      niu: employee.tenant.nui ?? undefined
    }

    // Les rubriquesSaisies contiennent déjà les charges fixes (ajoutées côté client)
    // IMPORTANT: Convertir tous les montants en nombres
    const allRubriques = rubriquesSaisies.map((r: { code: string; montant: string | number }) => ({
      code: r.code,
      montant: typeof r.montant === 'string' ? parseFloat(r.montant) : Number(r.montant)
    }))

    // Debug: Log tenantId avant calcul
    console.log('[DEBUG] session.user.tenantId:', session.user.tenantId, 'type:', typeof session.user.tenantId)
    console.log('[DEBUG] employee.tenantId:', employee.tenantId, 'type:', typeof employee.tenantId)

    console.log('⚙️ Calcul de paie avec:', {
      employeeName: `${employee.firstName} ${employee.lastName}`,
      tenantId: String(employee.tenantId),
      joursTravailles,
      rubriquesSaisiesTotal: allRubriques.length,
      allRubriques
    })

    const bulletinPaie = await calculatePayroll(employeeForPayroll, periode, {
      tenantId: String(employee.tenantId),
      quotientFamilial: 1, // TODO: calculer selon situation familiale
      joursTravailles: joursTravailles || 26,
      rubriquesSaisies: allRubriques,
      chargesDeductibles
    })

    console.log('✅ Bulletin calculé:', {
      brutSocial: bulletinPaie.gains?.totalBrutSocial || 0,
      netAPayer: bulletinPaie.netAPayer,
      gainsCount: bulletinPaie.gains?.rubriques?.length || 0,
      gainsDetails: bulletinPaie.gains?.rubriques?.map(g => ({ code: g.code, libelle: g.libelle, montant: g.montant })) || [],
      retenuesCount: bulletinPaie.retenues?.cotisationsEmploye ? 1 : 0
    })

    // Convertir BulletinPaie vers PayrollCalculation pour compatibilité
    // Utiliser le dernier jour du mois de la période comme date de référence
    const referenceDate = new Date(parseInt(year), parseInt(month), 0) // Dernier jour du mois
    const calculation = convertToLegacy(employeeForPayroll, bulletinPaie, referenceDate)

    // 6. Préparer données bulletin
    const bulletinData: BulletinData = {
      calculation,
      month,
      year,
      employeeId,
      company: {
        name: employee.tenant.companyName || 'Entreprise',
        address: employee.tenant.companyAddress || 'Adresse non renseignée',
        city: '', // Éviter la duplication de l'adresse
        niu: employee.tenant.nui || undefined,
        logoUrl: employee.tenant.logoUrl || undefined
      }
    }

    // 7. Générer et sauvegarder bulletin (avec ou sans PDF selon flag)
    let bulletinId: string
    let pdfPath: string | null = null

    if (skipPdfGeneration) {
      // V1: Sauvegarde uniquement sans PDF (optimisation)
      console.log('⏩ Mode V1: Sauvegarde sans génération PDF')
      bulletinId = await BulletinStorageService.saveWithoutPdf(bulletinData)
    } else {
      // Génération complète avec PDF
      console.log('📄 Génération complète avec PDF')
      const result = await BulletinGenerator.generateBulletin(bulletinData)
      const saved = await BulletinStorageService.saveBulletin(bulletinData, result)
      bulletinId = saved.bulletinId
      pdfPath = saved.pdfPath
    }

    return NextResponse.json({
      success: true,
      bulletin: {
        id: bulletinId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        periode,
        pdfPath,
        montants: {
          brutSocial: calculation.totalGains,
          netAPayer: calculation.salaireNet,
          totalRetenues: calculation.totalRetenues,
          chargesEmployeur: calculation.cotisationsEmployeur
        }
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}