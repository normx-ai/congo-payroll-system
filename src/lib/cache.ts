import Redis from 'ioredis'

// Types spécifiques pour le cache
interface SessionData {
  userId: string
  tenantId: string
  email: string
  expires: string
  [key: string]: string | number | boolean
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  baseSalary: number
  [key: string]: string | number | boolean | Date
}

interface DashboardData {
  totalEmployees: number
  totalPayroll: number
  pendingBulletins: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

interface ReportData {
  type: string
  generatedAt: string
  data: Array<Record<string, string | number | boolean>>
  summary: {
    totalRecords: number
    filters: Record<string, string | number>
  }
}

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  lazyConnect: true
})

redis.on('error', (err) => {
  console.error('Redis connection error:', err)
})

export class CacheService {

  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error)
      return null
    }
  }

  static async set(key: string, value: string | number | boolean | object | null, ttlSeconds: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error)
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error)
    }
  }

  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error)
    }
  }

  // Cache spécifique pour les sessions
  static async getSession(sessionId: string) {
    return this.get(`session:${sessionId}`)
  }

  static async setSession(sessionId: string, data: SessionData, ttl: number = 28800) {
    return this.set(`session:${sessionId}`, data, ttl)
  }

  static async delSession(sessionId: string) {
    return this.del(`session:${sessionId}`)
  }

  // Cache pour les employés
  static async getEmployees(tenantId: string) {
    return this.get(`employees:${tenantId}`)
  }

  static async setEmployees(tenantId: string, employees: Employee[]) {
    return this.set(`employees:${tenantId}`, employees, 1800) // 30 min
  }

  static async delEmployees(tenantId: string) {
    return this.del(`employees:${tenantId}`)
  }

  // Cache pour le dashboard
  static async getDashboard(tenantId: string) {
    return this.get(`dashboard:${tenantId}`)
  }

  static async setDashboard(tenantId: string, data: DashboardData) {
    return this.set(`dashboard:${tenantId}`, data, 600) // 10 min
  }

  static async delDashboard(tenantId: string) {
    return this.del(`dashboard:${tenantId}`)
  }

  // Cache pour les rapports
  static async getReport(tenantId: string, type: string) {
    return this.get(`report:${tenantId}:${type}`)
  }

  static async setReport(tenantId: string, type: string, data: ReportData) {
    return this.set(`report:${tenantId}:${type}`, data, 3600) // 1h
  }

  // Invalidation en masse
  static async invalidateTenant(tenantId: string) {
    await Promise.all([
      this.delPattern(`employees:${tenantId}*`),
      this.delPattern(`dashboard:${tenantId}*`),
      this.delPattern(`report:${tenantId}*`)
    ])
  }
}

export default CacheService