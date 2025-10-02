import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/rate-limiter'
import { handleCatchError } from '@/lib/error-handler'

async function handleGetStats() {
  try {
    const session = await getServerSession(authOptions)
    console.log('Stats API - Session:', session?.user?.email, 'TenantId:', session?.user?.tenantId)

    if (!session?.user?.tenantId) {
      console.log('Stats API - No tenantId in session')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const [totalEmployees, activeEmployees, inactiveEmployees] = await Promise.all([
      prisma.employee.count({
        where: { tenantId: session.user.tenantId }
      }),
      prisma.employee.count({
        where: {
          tenantId: session.user.tenantId,
          isActive: true
        }
      }),
      prisma.employee.count({
        where: {
          tenantId: session.user.tenantId,
          isActive: false
        }
      })
    ])

    const onLeaveEmployees = inactiveEmployees

    console.log('Stats API - Results:', { totalEmployees, activeEmployees, onLeaveEmployees })

    return NextResponse.json({
      totalEmployees,
      activeEmployees,
      onLeaveEmployees
    })
  } catch (error) {
    return handleCatchError(error)
  }
}

export const GET = withRateLimit(handleGetStats, 'api')