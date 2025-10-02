// API client for application communication
import type { EmployeeCreateRequest, Employee } from '@/types/employee'
import { getSession } from 'next-auth/react'

const API_BASE_URL = typeof window !== 'undefined' ? (window.location.origin || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint: string, options: RequestInit = {}) {
    // Pour NextAuth, pas besoin de token manuel
    const url = `${this.baseURL}${endpoint}`

    console.log('[API Client] Request:', {
      url,
      method: options.method || 'GET',
      baseURL: this.baseURL,
      endpoint
    })

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important pour NextAuth cookies
      ...options,
    }

    try {
      const response = await fetch(url, config)

      console.log('[API Client] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[API Client] Error:', errorData)
        throw new Error(errorData.error || errorData.detail || `API Error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error('[API Client] Fetch error:', error)
      throw error
    }

  }

  // Auth methods - NextAuth gère l'auth différemment
  auth = {
    // Ces méthodes sont maintenant gérées par NextAuth
    session: () => getSession(),
  }

  // Dashboard methods
  dashboard = {
    getData: () => this.request('/api/dashboard')
  }

  // Employee methods
  employees = {
    create: (data: EmployeeCreateRequest): Promise<Employee> =>
      this.request('/api/employees', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    list: (params?: { page?: number; size?: number; search?: string }): Promise<{
      employees: Employee[]
      total: number
      page: number
      size: number
      totalPages: number
    }> => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.size) searchParams.append('size', params.size.toString())
      if (params?.search) searchParams.append('search', params.search)

      const query = searchParams.toString()
      return this.request(`/api/employees${query ? `?${query}` : ''}`)
    },
    getById: (id: string): Promise<Employee> => this.request(`/api/employees/${id}`),
    toggleStatus: (id: string, isActive: boolean): Promise<{ success: boolean }> =>
      this.request(`/api/employees/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive })
      }),
    delete: (id: string): Promise<{ success: boolean; deactivated?: boolean; message?: string }> =>
      this.request(`/api/employees/${id}`, {
        method: 'DELETE'
      })
  }
}

export const api = new ApiClient()

// Helper function for employee operations
export const createEmployee = (data: EmployeeCreateRequest): Promise<Employee> =>
  api.employees.create(data)