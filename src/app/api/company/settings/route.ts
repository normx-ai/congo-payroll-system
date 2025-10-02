import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limiter'
import { handleCatchError } from '@/lib/error-handler'
import { prisma } from '@/lib/prisma'

// GET /api/company/settings - Récupérer les paramètres de l'entreprise
async function handleGetCompanySettings() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        companyName: true,
        companyAddress: true,
        companyPhone: true,
        companyEmail: true,
        nui: true,
        rccm: true,
        cnssNumber: true
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      name: tenant.companyName,
      address: tenant.companyAddress || '',
      phone: tenant.companyPhone || '',
      email: tenant.companyEmail || '',
      nui: tenant.nui || '',
      rccm: tenant.rccm || '',
      cnssNumber: tenant.cnssNumber || ''
    })
  } catch (error) {
    return handleCatchError(error)
  }
}

// PUT /api/company/settings - Mettre à jour les paramètres de l'entreprise
async function handleUpdateCompanySettings(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, address, phone, email, nui, rccm, cnssNumber } = body

    // Validation basique
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Le nom de l\'entreprise est requis' }, { status: 400 })
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: {
        companyName: name.trim(),
        companyAddress: address?.trim() || null,
        companyPhone: phone?.trim() || null,
        companyEmail: email?.trim() || null,
        nui: nui?.trim() || null,
        rccm: rccm?.trim() || null,
        cnssNumber: cnssNumber?.trim() || null
      },
      select: {
        companyName: true,
        companyAddress: true,
        companyPhone: true,
        companyEmail: true,
        nui: true,
        rccm: true,
        cnssNumber: true
      }
    })

    return NextResponse.json({
      name: updatedTenant.companyName,
      address: updatedTenant.companyAddress || '',
      phone: updatedTenant.companyPhone || '',
      email: updatedTenant.companyEmail || '',
      nui: updatedTenant.nui || '',
      rccm: updatedTenant.rccm || '',
      cnssNumber: updatedTenant.cnssNumber || ''
    })
  } catch (error) {
    return handleCatchError(error)
  }
}

export const GET = withRateLimit(handleGetCompanySettings, 'api')
export const PUT = withRateLimit(handleUpdateCompanySettings, 'api')