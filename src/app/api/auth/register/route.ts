import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { withRateLimit } from '@/lib/rate-limiter'
import { logError, logSecurity, logAudit } from '@/lib/logger'
import { ZodError } from 'zod'

async function handleRegister(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input data
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Check if tenant name already exists
    const tenantSlug = validatedData.tenantName.toLowerCase().replace(/\s+/g, '-')
    const existingTenant = await prisma.tenant.findUnique({
      where: { name: tenantSlug }
    })

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Ce nom d\'entreprise existe déjà' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12)

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: tenantSlug,
          displayName: validatedData.tenantName,
          companyName: validatedData.tenantName,
          isActive: true,
        }
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          username: validatedData.email,
          hashedPassword: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          role: 'Administrateur',
          tenantId: tenant.id,
          isActive: true,
        }
      })

      return { user, tenant }
    })

    // Log successful registration for audit
    logAudit('User registration successful', {
      action: 'create',
      resource: 'user',
      resourceId: result.user.id,
      userId: result.user.id,
      tenantId: result.tenant.id
    })

    // Return success response (without password)
    return NextResponse.json({
      message: 'Compte créé avec succès',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        companyName: result.tenant.companyName,
      }
    }, { status: 201 })

  } catch (error) {
    const registrationError = error instanceof Error ? error : new Error('Unknown registration error')

    logError(registrationError, {
      source: 'Registration API',
      endpoint: '/api/auth/register',
      method: 'POST'
    })

    if (error instanceof ZodError) {
      // Handle Zod validation errors
      logSecurity('Invalid registration data', {
        event: 'suspiciousActivity',
        reason: 'Validation failed during registration'
      })

      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(handleRegister, 'auth')