import { prisma } from './prisma'
import { NextRequest } from 'next/server'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW'

// Types spécifiques pour les valeurs d'audit
interface AuditValue {
  [key: string]: string | number | boolean | Date | null | undefined
}

interface EmployeeAuditData {
  firstName?: string | null
  lastName?: string | null
  baseSalary?: number | string | null
  position?: string | null
  email?: string | null
  isActive?: boolean | null
  hireDate?: Date | null
  [key: string]: string | number | boolean | Date | null | undefined
}


interface AuditLogData {
  tenantId: string
  userId: string
  action: AuditAction
  entity: string
  entityId?: string
  oldValue?: AuditValue
  newValue?: AuditValue
  ip?: string
  userAgent?: string
}

export class AuditService {
  static getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0] ||
           request.headers.get('x-real-ip') ||
           request.headers.get('cf-connecting-ip') ||
           'unknown'
  }

  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          oldValue: data.oldValue ? JSON.parse(JSON.stringify(data.oldValue)) : null,
          newValue: data.newValue ? JSON.parse(JSON.stringify(data.newValue)) : null,
          ip: data.ip,
          userAgent: data.userAgent
        }
      })
    } catch (error) {
      // Ne pas faire échouer l'opération si l'audit échoue
      console.error('Audit log failed:', error)
    }
  }

  static async logEmployeeAction(
    action: AuditAction,
    employeeId: string,
    tenantId: string,
    userId: string,
    request?: NextRequest,
    oldData?: EmployeeAuditData,
    newData?: EmployeeAuditData
  ) {
    await this.log({
      tenantId,
      userId,
      action,
      entity: 'Employee',
      entityId: employeeId,
      oldValue: oldData,
      newValue: newData,
      ip: request ? this.getClientIP(request) : undefined,
      userAgent: request?.headers.get('user-agent') || undefined
    })
  }

  static async logLogin(
    userId: string,
    tenantId: string,
    success: boolean,
    request?: NextRequest
  ) {
    await this.log({
      tenantId,
      userId: userId || 'anonymous',
      action: 'LOGIN',
      entity: 'User',
      entityId: userId,
      newValue: { success, timestamp: new Date() },
      ip: request ? this.getClientIP(request) : undefined,
      userAgent: request?.headers.get('user-agent') || undefined
    })
  }

  static async getAuditLogs(
    tenantId: string,
    filters?: {
      userId?: string
      entity?: string
      entityId?: string
      startDate?: Date
      endDate?: Date
      limit?: number
    }
  ) {
    return prisma.auditLog.findMany({
      where: {
        tenantId,
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.entity && { entity: filters.entity }),
        ...(filters?.entityId && { entityId: filters.entityId }),
        ...(filters?.startDate && {
          createdAt: {
            gte: filters.startDate,
            ...(filters?.endDate && { lte: filters.endDate })
          }
        })
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100
    })
  }
}