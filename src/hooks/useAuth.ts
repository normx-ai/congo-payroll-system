import { useSession } from 'next-auth/react'
import type { AuthData } from '@/types'

export function useAuth(): AuthData {
  const { data: session, status } = useSession()

  return {
    user: session?.user ? {
      id: session.user.id,
      firstName: session.user.name || '',
      lastName: '',
      email: session.user.email || '',
      role: session.user.role || ''
    } : null,
    tenant: session?.user ? {
      id: session.user.tenantId,
      code: session.user.tenantName,
      companyName: session.user.tenantName,
      entityType: 'company' as const
    } : null,
    loading: status === 'loading',
    error: null
  }
}