'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { User, Lock } from 'lucide-react'

export interface LoginData {
  email: string
  password: string
}

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-indigo-700">
          <User className="w-4 h-4 inline mr-2" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="votre.email@entreprise.com"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="border-indigo-200 focus:border-indigo-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-indigo-700">
          <Lock className="w-4 h-4 inline mr-2" />
          Mot de passe
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Votre mot de passe"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="border-indigo-200 focus:border-indigo-500"
          required
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        disabled={loading}
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </Button>
    </form>
  )
}