/**
 * API Route - Agent Chat
 * Point d'entrée pour l'agent fiscal (Phase 1)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FiscalAgent } from '@/agents/fiscal-agent'
import type { IRPPCalculationParams } from '@/agents/types'

// Validation des inputs
const QuestionSchema = z.object({
  question: z.string().min(1, 'Question requise'),
  tenantId: z.string().uuid('Tenant ID invalide'),
  periode: z.string().optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
})

const IRPPCalculationSchema = z.object({
  type: z.literal('irpp'),
  salaireBrut: z.number().positive('Salaire brut doit être positif'),
  nombreEnfants: z.number().int().min(0).max(20),
  situationFamiliale: z.enum(['célibataire', 'marié', 'divorcé', 'veuf']),
  tenantId: z.string().uuid(),
  periode: z.string().optional(),
})

const RequestSchema = z.union([QuestionSchema, IRPPCalculationSchema])

/**
 * POST /api/agents/chat
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Vérifier l'authentification (optionnel pour dev)
    // const session = await getServerSession()
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'Non authentifié' },
    //     { status: 401 }
    //   )
    // }

    // 2. Parser et valider le body
    const body = await req.json()
    const validatedData = RequestSchema.parse(body)

    // 3. Initialiser l'agent fiscal
    const agent = new FiscalAgent()

    // 4. Déterminer le type de requête
    if ('type' in validatedData && validatedData.type === 'irpp') {
      // Calcul IRPP
      const params: IRPPCalculationParams = {
        salaireBrut: validatedData.salaireBrut,
        nombreEnfants: validatedData.nombreEnfants,
        situationFamiliale: validatedData.situationFamiliale,
        tenantId: validatedData.tenantId,
        periode: validatedData.periode
          ? new Date(validatedData.periode)
          : new Date(),
      }

      const result = await agent.calculateIRPP(params)

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        type: 'irpp_calculation',
        data: result.data,
        metadata: result.metadata,
      })
    } else {
      // Question générale
      if ('question' in validatedData) {
        const result = await agent.process({
          question: validatedData.question,
          context: {
            tenantId: validatedData.tenantId,
            periode: validatedData.periode
              ? new Date(validatedData.periode)
              : new Date(),
          },
          conversationHistory: validatedData.conversationHistory || [],
        })

        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          type: 'question',
          data: result.data,
          sources: result.sources,
          metadata: result.metadata,
        })
      }
    }
  } catch (error) {
    console.error('[Agent Chat API] Error:', error)

    // Erreur de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation échouée',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    // Autres erreurs
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur interne',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/agents/chat (info)
 */
export async function GET() {
  return NextResponse.json({
    name: 'Agent Chat API',
    version: '1.0.0',
    phase: 'Phase 1 - Agent Fiscal',
    endpoints: {
      POST: {
        description: 'Envoyer une question ou demander un calcul IRPP',
        examples: {
          question: {
            question: 'Comment calculer l\'IRPP au Congo ?',
            tenantId: 'uuid',
          },
          irpp: {
            type: 'irpp',
            salaireBrut: 800000,
            nombreEnfants: 2,
            situationFamiliale: 'marie',
            tenantId: 'uuid',
          },
        },
      },
    },
  })
}
