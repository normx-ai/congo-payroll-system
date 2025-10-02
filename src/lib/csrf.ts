import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Type pour le contexte Next.js
interface RouteContext {
  params?: Record<string, string>
}

// Store des tokens CSRF (en production, utiliser Redis)
const csrfTokens = new Map<string, { token: string; expires: number }>()

// Générer un token CSRF
export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = Date.now() + 4 * 60 * 60 * 1000 // 4 heures

  csrfTokens.set(sessionId, { token, expires })

  // Nettoyer les tokens expirés
  if (Math.random() < 0.1) {
    const now = Date.now()
    for (const [key, value] of csrfTokens.entries()) {
      if (value.expires < now) {
        csrfTokens.delete(key)
      }
    }
  }

  return token
}

// Valider un token CSRF
export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId)

  if (!stored) return false
  if (stored.expires < Date.now()) {
    csrfTokens.delete(sessionId)
    return false
  }

  return stored.token === token
}

// Middleware CSRF pour les mutations (POST, PUT, DELETE)
export function withCSRFProtection(
  handler: (req: NextRequest, ctx?: RouteContext) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx?: RouteContext): Promise<NextResponse> => {
    // Ignorer pour GET et HEAD
    if (['GET', 'HEAD'].includes(req.method)) {
      return handler(req, ctx)
    }

    // Récupérer le token CSRF du header ou body
    const csrfToken = req.headers.get('x-csrf-token') ||
                     req.headers.get('csrf-token')

    if (!csrfToken) {
      return NextResponse.json(
        { error: 'Token CSRF manquant' },
        { status: 403 }
      )
    }

    // TODO: Récupérer sessionId depuis JWT
    // Pour l'instant, on utilise une validation simplifiée
    const sessionId = req.headers.get('x-session-id') || 'default'

    if (!validateCSRFToken(sessionId, csrfToken)) {
      return NextResponse.json(
        { error: 'Token CSRF invalide' },
        { status: 403 }
      )
    }

    return handler(req, ctx)
  }
}