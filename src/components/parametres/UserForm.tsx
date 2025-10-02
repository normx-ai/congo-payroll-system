'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Save } from 'lucide-react'
import { User } from './UserTypes'

interface UserFormProps {
  newUser: {
    name: string
    email: string
    role: User['role']
  }
  setNewUser: (user: { name: string; email: string; role: User['role'] }) => void
  onAddUser: () => void
  onCancel: () => void
}

export function UserForm({ newUser, setNewUser, onAddUser, onCancel }: UserFormProps) {
  return (
    <Card className="shadow-sm border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
          <Plus className="w-4 h-4" />
          Nouvel Utilisateur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <Input
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              placeholder="Jean Dupont"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              placeholder="jean.dupont@entreprise.cg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value as User['role']})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="VIEWER">Consultation</option>
              <option value="USER">Utilisateur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            onClick={onAddUser}
            disabled={!newUser.name || !newUser.email}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Créer
          </Button>
          <Button onClick={onCancel} variant="outline">
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}