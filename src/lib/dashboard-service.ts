import { prisma } from './prisma'
import type { DashboardStats, Activity, Task } from '@/types'

export class DashboardService {
  static async getDashboardData(tenantId: string) {
    const [stats, recentActivities, upcomingTasks] = await Promise.all([
      this.getStats(tenantId),
      this.getRecentActivities(tenantId),
      this.getUpcomingTasks()
    ])

    return {
      stats,
      recentActivities,
      upcomingTasks
    }
  }

  private static async getStats(tenantId: string): Promise<DashboardStats> {
    const [totalEmployees, averageSalary] = await Promise.all([
      prisma.employee.count({
        where: { tenantId, isActive: true }
      }),
      prisma.employee.aggregate({
        where: { tenantId, isActive: true },
        _avg: { baseSalary: true }
      })
    ])

    const totalPayroll = averageSalary._avg.baseSalary
      ? Math.round(Number(averageSalary._avg.baseSalary) * totalEmployees)
      : 0

    return {
      totalEmployees,
      totalPayroll,
      generatedPayslips: 0, // À implémenter quand le module paie sera créé
      growthRate: 0 // À calculer selon la logique métier
    }
  }

  private static async getRecentActivities(tenantId: string): Promise<Activity[]> {
    const recentEmployees = await prisma.employee.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        firstName: true,
        lastName: true,
        createdAt: true,
        id: true
      }
    })

    return recentEmployees.map(emp => ({
      id: emp.id,
      message: `Nouvel employé ajouté: ${emp.firstName} ${emp.lastName}`,
      timestamp: emp.createdAt || new Date()
    }))
  }

  private static async getUpcomingTasks(): Promise<Task[]> {
    // Pour l'instant, retourner des tâches statiques
    // À améliorer quand le système de tâches sera implémenté
    return [
      {
        id: '1',
        title: 'Préparer les fiches de paie du mois',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
        priority: 'high' as const
      },
      {
        id: '2',
        title: 'Vérifier les déclarations CNSS',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 jours
        priority: 'medium' as const
      }
    ]
  }
}