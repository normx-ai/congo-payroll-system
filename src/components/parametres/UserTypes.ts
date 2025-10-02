export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER' | 'VIEWER'
  status: 'active' | 'inactive'
  lastLogin?: Date
}

export const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'bg-red-100 text-red-800'
    case 'USER': return 'bg-blue-100 text-blue-800'
    case 'VIEWER': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusBadgeColor = (status: string) => {
  return status === 'active'
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800'
}