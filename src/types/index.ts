// Types centralis�s pour l'application NORM PAIE

// ===== AUTH TYPES =====
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export interface Tenant {
  id: string
  code: string
  companyName: string
  entityType: 'company' | 'cabinet'
  fiscalRegime?: 'forfait' | 'reel'
}

export interface AuthData {
  user: User | null
  tenant: Tenant | null
  loading: boolean
  error: string | null
}

export interface LoginData {
  email: string
  password: string
}

// Version complète pour RegisterForm (avec confirmPassword et phone)
export interface RegisterData {
  entityType: 'company' | 'cabinet'
  tenant: string
  companyName: string
  fiscalRegime: 'forfait' | 'reel'
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

// Version simplifiée pour API (sans confirmPassword et phone)
export interface RegisterApiData {
  firstName: string
  lastName: string
  email: string
  password: string
  companyName: string
  entityType: string
  fiscalRegime: string
}

// ===== DASHBOARD TYPES =====
export interface DashboardStats {
  totalEmployees: number
  totalPayroll: number
  generatedPayslips: number
  growthRate: number
}

export interface Activity {
  id: string
  message: string
  timestamp: Date
}

export interface Task {
  id: string
  title: string
  dueDate: Date
  priority: 'low' | 'medium' | 'high'
}

export interface DashboardData {
  stats: DashboardStats
  recentActivities: Activity[]
  upcomingTasks: Task[]
  loading: boolean
  error: string | null
}

// ===== COMPONENT PROPS =====
export interface RegisterFormProps {
  onSubmit: (data: RegisterData) => Promise<void>
}