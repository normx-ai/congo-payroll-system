// import { PrismaClient } from '@prisma/client'

interface ErrorLog {
  id: string
  timestamp: Date
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  userId?: string
  tenantId?: string
  endpoint?: string
  userAgent?: string
  ip?: string
  metadata?: Record<string, string | number | boolean>
}

interface ErrorSummary {
  total: number
  byLevel: Record<string, number>
  byEndpoint: Record<string, number>
  recent: ErrorLog[]
  trends: {
    hourly: number[]
    daily: number[]
  }
}

// const prisma = new PrismaClient() // Unused for now

export class ErrorMonitoringService {

  static async logError(error: ErrorLog): Promise<void> {
    try {
      // TODO: créer table errorLog dans schema.prisma
      console.log('Error logged:', error)
    } catch (e) {
      console.error('Failed to log error:', e)
    }
  }

  static async getErrorSummary(): Promise<ErrorSummary> {
    // TODO: implémenter avec table errorLog
    return {
      total: 0,
      byLevel: {},
      byEndpoint: {},
      recent: [],
      trends: {
        hourly: [],
        daily: []
      }
    }
  }

  private static async getHourlyTrends(): Promise<number[]> {
    // TODO: implémenter avec table errorLog
    return Array.from({ length: 24 }, () => 0)
  }

  private static async getDailyTrends(): Promise<number[]> {
    // TODO: implémenter avec table errorLog
    return Array.from({ length: 7 }, () => 0)
  }

  static async cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
    // TODO: implémenter avec table errorLog
    console.log('Cleanup old logs older than', daysToKeep, 'days')

  }
}