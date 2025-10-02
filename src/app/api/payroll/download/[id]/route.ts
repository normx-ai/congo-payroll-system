// API Route pour télécharger un bulletin PDF individuel - Next.js App Router

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { handleCatchError } from '@/lib/error-handler'
import { prisma } from '@/lib/prisma'
import { BulletinGenerator, BulletinTemplate, EntrepriseInfo, EmployeeInfo } from '@/lib/bulletin'
import { BulletinPDFGenerator } from '@/lib/bulletin-pdf'

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const bulletinId = params.id

    // 2. Récupérer le bulletin avec vérification tenant
    const bulletin = await prisma.bulletinPaie.findFirst({
      where: {
        id: bulletinId,
        tenantId: session.user.tenantId
      },
      include: {
        employee: true,
        tenant: true
      }
    })

    if (!bulletin) {
      return NextResponse.json(
        { error: 'Bulletin non trouvé' },
        { status: 404 }
      )
    }

    // 3. Générer le PDF à partir des données stockées

    // Préparer les données entreprise
    const entrepriseInfo: EntrepriseInfo = {
      nom: bulletin.tenant.companyName || 'Entreprise',
      adresse: bulletin.tenant.companyAddress || '',
      telephone: bulletin.tenant.companyPhone || '',
      email: bulletin.tenant.companyEmail || '',
      nui: bulletin.tenant.nui || '',
      rccm: bulletin.tenant.rccm || ''
    }

    // Préparer les données employé
    const employeeInfo: EmployeeInfo = {
      nom: bulletin.employee.lastName,
      prenom: bulletin.employee.firstName,
      matricule: bulletin.employee.employeeCode || bulletin.employee.id,
      poste: bulletin.employee.position || 'Non spécifié',
      categorie: String(bulletin.employee.categorieProfessionnelle || 0),
      echelon: Number(bulletin.employee.echelon) || 0,
      dateEmbauche: bulletin.employee.hireDate ?
        bulletin.employee.hireDate.toISOString().split('T')[0] : '',
      cnssNumero: bulletin.employee.cnssNumber || '',
      nui: bulletin.employee.nui || '',
      situationFamiliale: 'Célibataire',
      enfantsACharge: 0
    }

    // Créer le template
    const template: BulletinTemplate = {
      entreprise: entrepriseInfo,
      employe: employeeInfo,
      periode: bulletin.periode,
      bulletin: {
        employeeId: bulletin.employeeId,
        periode: bulletin.periode,
        dateCalcul: new Date(),
        gains: {
          rubriques: [],
          totalBrutSocial: 0,
          totalBrutFiscal: 0,
          totalGainsNonSoumis: 0,
          totalGains: 0
        },
        retenues: {
          cotisationsEmploye: {
            cnss: 0,
            irpp: 0,
            camu: 0,
            total: 0
          },
          autresRetenues: {
            rubriques: [],
            total: 0
          },
          totalRetenues: 0
        },
        cotisations: {
          rubriques: [],
          totalCotisations: 0
        },
        chargesEmployeur: {
          cnss: 0,
          allocationsFamiliales: 0,
          accidentsTravail: 0,
          taxeUniqueSS: 0,
          tus: 0,
          total: 0
        },
        netAPayer: Number(bulletin.netSalary) || 0,
        coutTotalEmployeur: Number(bulletin.totalChargesPatronales) || 0
      },
      options: {
        afficherChargesEmployeur: true,
        afficherCoutTotal: true,
        masquerRubriquesNulles: false,
        grouperParType: true
      }
    }

    // 4. Générer le PDF
    const html = BulletinGenerator.generateHTML(template)
    const pdfBuffer = await BulletinPDFGenerator.generatePDF(html)

    // 5. Retourner le PDF avec les headers appropriés
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="bulletin-${bulletin.periode}-${bulletin.employee.employeeCode || bulletin.employee.id}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Bulletin-Id': bulletin.id,
        'X-Employee-Name': `${bulletin.employee.firstName} ${bulletin.employee.lastName}`,
        'X-Period': bulletin.periode
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}

// GET pour obtenir les infos d'un bulletin sans le PDF
export async function HEAD(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const bulletin = await prisma.bulletinPaie.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      },
      select: {
        id: true,
        periode: true,
        status: true,
        createdAt: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true
          }
        }
      }
    })

    if (!bulletin) {
      return NextResponse.json(
        { error: 'Bulletin non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      bulletin: {
        id: bulletin.id,
        periode: bulletin.periode,
        status: bulletin.status,
        employeeName: `${bulletin.employee.firstName} ${bulletin.employee.lastName}`,
        employeeCode: bulletin.employee.employeeCode,
        createdAt: bulletin.createdAt
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}