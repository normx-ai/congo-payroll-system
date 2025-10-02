import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      // Si pas de session, essayer de récupérer depuis localStorage (fallback)
      return NextResponse.json({
        name: "",
        address: "",
        city: "",
        niu: "",
        rccm: "",
        telephone: "",
        email: ""
      })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        id: true,
        companyName: true,
        companyAddress: true,
        companyPhone: true,
        companyEmail: true,
        nui: true,
        rccm: true,
        logoUrl: true
      }
    })

    if (!tenant) {
      return NextResponse.json({
        name: "",
        address: "",
        city: "",
        niu: "",
        rccm: "",
        telephone: "",
        email: ""
      })
    }

    return NextResponse.json({
      id: tenant.id || "",
      name: tenant.companyName || "",
      address: tenant.companyAddress || "",
      city: "Brazzaville", // Valeur par défaut
      niu: tenant.nui || "",
      rccm: tenant.rccm || "",
      telephone: tenant.companyPhone || "",
      email: tenant.companyEmail || "",
      logoUrl: tenant.logoUrl || ""
    })
  } catch (error) {
    console.error('Erreur API entreprise:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()

    // Sauvegarder dans la base de données
    await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        companyName: body.name,
        companyAddress: body.address,
        companyPhone: body.telephone,
        companyEmail: body.email,
        nui: body.niu, // Attention: body utilise 'niu' mais DB utilise 'nui'
        rccm: body.rccm
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Informations entreprise mises à jour'
    })
  } catch (error) {
    console.error('Erreur mise à jour entreprise:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}