import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limiter'
import { handleCatchError } from '@/lib/error-handler'
import { z } from 'zod'

// Interfaces pour les résultats de vérification
interface DuplicateEmployee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  similarity?: number
}

type DuplicateResult = DuplicateEmployee[]

const duplicateCheckSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().optional().transform(val => val ? new Date(val) : undefined),
  excludeId: z.string().optional(),
  threshold: z.number().min(0.5).max(1).optional().default(0.8)
})

async function handleCheckDuplicate(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = duplicateCheckSchema.parse(body)

    // Vérification des doublons exacts (TODO: implémenter)
    const exactDuplicates: DuplicateResult = []

    // Vérification des similarités (TODO: implémenter)
    const similarEmployees: DuplicateResult = []

    const response = {
      hasExactDuplicates: exactDuplicates.length > 0,
      hasSimilarEmployees: similarEmployees.length > 0,
      exactDuplicates,
      similarEmployees,
      summary: {
        exact: exactDuplicates.length,
        similar: similarEmployees.length,
        threshold: validatedData.threshold
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    return handleCatchError(error)
  }
}

export const POST = withRateLimit(handleCheckDuplicate, 'api')