import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { loginSchema } from './validations'
import { logError, logSecurity } from './logger'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const validatedFields = loginSchema.safeParse(credentials)
          if (!validatedFields.success) return null

          const { email, password } = validatedFields.data
          const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
          })

          if (!user || !user.isActive) return null

          const passwordMatch = await bcrypt.compare(password, user.hashedPassword)
          if (!passwordMatch) return null

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          })

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            tenantId: user.tenantId,
            tenantName: user.tenant?.companyName || 'N/A'
          }
        } catch (error) {
          const authError = error instanceof Error ? error : new Error('Unknown authentication error')

          logError(authError, {
            source: 'Auth',
            endpoint: '/api/auth/signin',
            method: 'POST'
          })

          // Log security event for failed authentication
          logSecurity('Failed authentication attempt', {
            event: 'failedAuth',
            reason: 'Auth error during validation'
          })

          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 heures
    updateAge: 2 * 60 * 60 // 2 heures
  },
  jwt: {
    maxAge: 8 * 60 * 60
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.firstName = (user as { firstName?: string }).firstName || user.name?.split(' ')[0] || ''
        token.lastName = (user as { lastName?: string }).lastName || user.name?.split(' ')[1] || ''
        token.role = user.role
        token.tenantId = user.tenantId
        token.tenantName = user.tenantName
      }

      if (trigger === 'update' && session) {
        return { ...token, ...session.user }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = `${token.firstName || ''} ${token.lastName || ''}`.trim() || 'Utilisateur'
        ;(session.user as { firstName?: string }).firstName = token.firstName as string
        ;(session.user as { lastName?: string }).lastName = token.lastName as string
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string
        session.user.tenantName = token.tenantName as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
}