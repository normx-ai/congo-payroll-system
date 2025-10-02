import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Mail, Phone } from 'lucide-react'
import type { RegisterData } from '@/types'

interface FieldsProps {
  formData: RegisterData
  setFormData: (data: RegisterData) => void
}

export function PersonalFields({ formData, setFormData }: FieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName" className="text-indigo-700">
          <User className="w-4 h-4 inline mr-2" />
          Prénom
        </Label>
        <Input
          id="firstName"
          placeholder="Votre prénom"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          className="border-indigo-200 focus:border-indigo-500"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName" className="text-indigo-700">Nom</Label>
        <Input
          id="lastName"
          placeholder="Votre nom"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          className="border-indigo-200 focus:border-indigo-500"
          required
        />
      </div>
    </div>
  )
}

export function ContactFields({ formData, setFormData }: FieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-indigo-700">
          <Mail className="w-4 h-4 inline mr-2" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@entreprise.cg"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="border-indigo-200 focus:border-indigo-500"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-indigo-700">
          <Phone className="w-4 h-4 inline mr-2" />
          Téléphone
        </Label>
        <Input
          id="phone"
          placeholder="+242 XX XX XX XX"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="border-indigo-200 focus:border-indigo-500"
          required
        />
      </div>
    </>
  )
}

export function PasswordFields({ formData, setFormData }: FieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-indigo-700">
          <Lock className="w-4 h-4 inline mr-2" />
          Mot de passe
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="border-indigo-200 focus:border-indigo-500 focus:ring-0 focus:ring-offset-0"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-indigo-700">Confirmer</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          className="border-indigo-200 focus:border-indigo-500 focus:ring-0 focus:ring-offset-0"
          required
        />
      </div>
    </div>
  )
}