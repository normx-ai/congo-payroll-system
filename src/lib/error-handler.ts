import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { logger, logError } from './logger'

// Types spécifiques pour la gestion d'erreurs
type ApiError = Error | ZodError | Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientUnknownRequestError | string | null

const isDevelopment = process.env.NODE_ENV === 'development'

function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error ||
    error instanceof ZodError ||
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    typeof error === 'string' ||
    error === null
  )
}

export function handleCatchError(error: unknown): NextResponse {
  if (isApiError(error)) {
    return handleApiError(error)
  }
  return handleApiError(new Error(`Erreur inconnue: ${String(error)}`))
}

export function handleApiError(error: ApiError): NextResponse {
  // Log structuré pour tous les environnements
  if (error instanceof Error) {
    logError(error, { source: 'API Handler' })
  } else {
    logger.error('Unknown error', { error: String(error) })
  }

  // Erreur Prisma (base de données)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.[0]
      const messages: Record<string, string> = {
        cnssNumber: 'Ce numéro CNSS est déjà utilisé',
        nui: 'Ce NUI est déjà utilisé',
        email: 'Cet email est déjà utilisé'
      }
      return NextResponse.json(
        { error: messages[field] || 'Donnée déjà existante' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: isDevelopment ? error.message : 'Erreur de données' },
      { status: 400 }
    )
  }

  // Erreur Zod (validation)
  if (error instanceof ZodError) {
    // Récupérer le premier message d'erreur le plus clair
    const firstIssue = error.issues[0]
    const fieldName = firstIssue.path.join('.')
    const message = firstIssue.message

    // Messages personnalisés pour les champs spécifiques
    const fieldMessages: Record<string, string> = {
      'cnssNumber': 'Format CNSS invalide (ex: 22278401 11)',
      'nui': 'Format NUI invalide (ex: P220000001491719)',
      'firstName': 'Le prénom est requis (minimum 2 caractères)',
      'lastName': 'Le nom est requis (minimum 2 caractères)',
      'position': 'Le poste est requis (minimum 2 caractères)',
      'baseSalary': 'Le salaire de base doit être un nombre positif',
      'gender': 'Le genre doit être spécifié (Homme/Femme)',
      'contractType': 'Le type de contrat doit être spécifié (CDI/CDD/Stage)',
      'maritalStatus': 'Le statut marital doit être spécifié',
      'hireDate': 'La date d\'embauche est invalide'
    }

    const userFriendlyMessage = fieldMessages[fieldName] || message || 'Données invalides'

    return NextResponse.json(
      {
        error: userFriendlyMessage,
        field: fieldName,
        ...(isDevelopment && { details: error.issues })
      },
      { status: 400 }
    )
  }

  // Erreur métier avec message safe
  if (error instanceof Error) {
    const safeErrors = [
      'Non autorisé',
      'Email déjà utilisé',
      'CNSS déjà utilisé',
      'NUI déjà utilisé',
      'Employé non trouvé'
    ]

    const message = safeErrors.some(msg => error.message.includes(msg))
      ? error.message
      : 'Une erreur est survenue'

    return NextResponse.json(
      {
        error: message,
        ...(isDevelopment && { stack: error.stack })
      },
      { status: error.message.includes('autorisé') ? 401 : 400 }
    )
  }

  // Erreur inconnue
  return NextResponse.json(
    { error: isDevelopment ? String(error) : 'Erreur interne du serveur' },
    { status: 500 }
  )
}