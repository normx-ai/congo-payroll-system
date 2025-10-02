import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { DashboardService } from '@/lib/dashboard-service'
import { handleCatchError } from '@/lib/error-handler'
import { withRateLimit } from '@/lib/rate-limiter'

async function handleGetDashboard() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const dashboardData = await DashboardService.getDashboardData(session.user.tenantId)
    return NextResponse.json(dashboardData)
  } catch (error) {
    return handleCatchError(error)
  }
}

export const GET = withRateLimit(handleGetDashboard, 'api')