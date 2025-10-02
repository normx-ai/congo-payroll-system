'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useToast } from '@/components/ui/toast'
import type { RegisterData } from '@/types'

export default function RegisterPage() {
  const { ToastContainer, showToast } = useToast()
  const router = useRouter()

  const handleRegister = async (formData: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          tenantName: formData.companyName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        showToast(result.error || 'Erreur lors de l\'inscription', 'error')
        return
      }

      showToast('✅ Compte créé avec succès ! Redirection vers la connexion...', 'success')

      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error) {
      console.error('Registration error:', error)
      showToast('❌ Erreur de connexion', 'error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-transparent.png"
              alt="Norm Paie Logo"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">
            Norm Paie
          </h1>
          <p className="text-sm text-indigo-600">
            Système de Gestion de Paie - Congo Brazzaville
          </p>
        </div>

        <Card className="border border-indigo-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-indigo-800">
              Inscription
            </CardTitle>
            <CardDescription className="text-indigo-600">
              Créez votre compte pour accéder au système de paie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm onSubmit={handleRegister} />
            <div className="mt-4 text-center text-sm text-indigo-600">
              Déjà un compte ?{' '}
              <Link href="/login" className="font-medium hover:text-indigo-800 underline">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-indigo-500">
          <p>© 2025 Norm Paie. Conforme à la législation du Congo Brazzaville.</p>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}