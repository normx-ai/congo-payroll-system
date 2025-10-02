import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'

// Types spécifiques pour les logs
interface LogContext {
  userId?: string
  tenantId?: string
  requestId?: string
  endpoint?: string
  method?: string
  userAgent?: string
  ip?: string
  source?: string
}

interface SecurityEventDetails {
  event: 'loginAttempt' | 'failedAuth' | 'suspiciousActivity' | 'csrfDetected' | 'rateLimitExceeded'
  userId?: string
  ip?: string
  userAgent?: string
  attempts?: number
  reason?: string
}

interface AuditEventDetails {
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'import'
  resource: string
  resourceId?: string
  userId: string
  tenantId: string
  changes?: Record<string, { old: string | number; new: string | number }>
}

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Configuration pour les logs rotatifs
const fileRotateTransport = new DailyRotateFile({
  filename: path.join('logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d', // Garder 14 jours
  maxSize: '20m',   // Max 20MB par fichier
  format: logFormat
})

const errorFileTransport = new DailyRotateFile({
  filename: path.join('logs', 'errors-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d', // Garder 30 jours pour les erreurs
  maxSize: '20m',
  level: 'error',
  format: logFormat
})

// Logger principal
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    fileRotateTransport,
    errorFileTransport,
    // Console en développement
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
})

// Méthodes utilitaires
export const logError = (error: Error, context?: LogContext) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    context
  })
}

export const logSecurity = (event: string, details: SecurityEventDetails) => {
  logger.warn('Security event', {
    event,
    details,
    timestamp: new Date().toISOString()
  })
}

export const logAudit = (action: string, details: AuditEventDetails) => {
  logger.info('Audit event', {
    action,
    details,
    timestamp: new Date().toISOString()
  })
}