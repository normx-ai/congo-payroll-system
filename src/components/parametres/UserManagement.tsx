'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { User } from './UserTypes'
import { UserForm } from './UserForm'
import { UserList } from './UserList'

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Admin Principal',
    email: 'admin@entreprise.cg',
    role: 'ADMIN',
    status: 'active',
    lastLogin: new Date()
  },
  {
    id: '2',
    name: 'Comptable',
    email: 'comptable@entreprise.cg',
    role: 'USER',
    status: 'active',
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
]

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'USER' as User['role']
  })

  const handleAddUser = () => {
    const user: User = {
      id: Date.now().toString(),
      ...newUser,
      status: 'active'
    }
    setUsers([...users, user])
    setNewUser({ name: '', email: '', role: 'USER' })
    setIsAddingUser(false)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId))
  }

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } as User
        : user
    ))
  }

  const handleCancel = () => {
    setIsAddingUser(false)
    setNewUser({ name: '', email: '', role: 'USER' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-gray-600 mt-1">Gérer les accès et permissions</p>
        </div>
        <Button
          onClick={() => setIsAddingUser(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Utilisateur
        </Button>
      </div>

      {isAddingUser && (
        <UserForm
          newUser={newUser}
          setNewUser={setNewUser}
          onAddUser={handleAddUser}
          onCancel={handleCancel}
        />
      )}

      <UserList
        users={users}
        onToggleStatus={handleToggleStatus}
        onDeleteUser={handleDeleteUser}
        onEditUser={() => {}}
      />
    </div>
  )
}