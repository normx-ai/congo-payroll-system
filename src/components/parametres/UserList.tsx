'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Edit, Trash2 } from 'lucide-react'
import { User, getRoleBadgeColor, getStatusBadgeColor } from './UserTypes'

interface UserListProps {
  users: User[]
  onToggleStatus: (userId: string) => void
  onDeleteUser: (userId: string) => void
  onEditUser: (userId: string) => void
}

export function UserList({ users, onToggleStatus, onDeleteUser, onEditUser }: UserListProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Users className="w-5 h-5" />
          Utilisateurs ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                    {user.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.lastLogin && (
                    <p className="text-xs text-gray-500">
                      Dernière connexion: {user.lastLogin.toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onToggleStatus(user.id)}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  {user.status === 'active' ? 'Désactiver' : 'Activer'}
                </Button>
                <Button
                  onClick={() => onEditUser(user.id)}
                  size="sm"
                  variant="outline"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  onClick={() => onDeleteUser(user.id)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}