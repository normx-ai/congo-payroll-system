import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { DataQualityService } from '@/lib/data-quality'
import { withRateLimit } from '@/lib/rate-limiter'
import { handleCatchError } from '@/lib/error-handler'

async function handleGetDataQuality() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !['SUPER_ADMIN', 'TENANT_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const report = await DataQualityService.generateReport()

    return NextResponse.json({
      success: true,
      report,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    return handleCatchError(error)
  }
}

export const GET = withRateLimit(handleGetDataQuality, 'api')