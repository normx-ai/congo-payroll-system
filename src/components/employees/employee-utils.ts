/**
 * Utilitaires pour la gestion des employés
 * Fichier: <150 lignes
 */

import type { Employee } from '@/types/employee'

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('fr-FR')
}

export const formatSalary = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)
}

export const formatAmount = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)
}

export const filterEmployees = (
  employees: Employee[],
  searchTerm: string,
  filterStatus: 'all' | 'active' | 'inactive'
): Employee[] => {
  return employees.filter((employee) => {
    const matchesSearch = !searchTerm ||
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && employee.isActive) ||
      (filterStatus === 'inactive' && !employee.isActive)

    return matchesSearch && matchesStatus
  })
}