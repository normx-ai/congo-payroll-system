import { NextRequest, NextResponse } from 'next/server'

// Configuration des limites
export const rateLimitConfig = {
  auth: { windowMs: 15 * 60 * 1000, max: 5 },
  api: { windowMs: 15 * 60 * 1000, max: 100 },
  create: { windowMs: 60 * 1000, max: 10 }
}

// Store des tentatives
const attempts = new Map<string, { count: number; resetTime: number }>()

// Extraction IP client
const getClientIP = (req: NextRequest): string =>
  req.headers.get('x-forwarded-for')?.split(',')[0] ||
  req.headers.get('x-real-ip') ||
  '127.0.0.1'

// Middleware principal
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  type: keyof typeof rateLimitConfig = 'api'
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const config = rateLimitConfig[type]
    const ip = getClientIP(req)
    const key = `${type}:${ip}`
    const now = Date.now()

    let current = attempts.get(key)

    // Réinitialiser si expiré ou nouvelle tentative
    if (!current || current.resetTime < now) {
      current = { count: 1, resetTime: now + config.windowMs }
      attempts.set(key, current)
      return handler(req)
    }

    // Vérifier limite
    if (current.count >= config.max) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez plus tard.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString()
          }
        }
      )
    }

    // Incrémenter et continuer
    current.count++
    return handler(req)
  }
}