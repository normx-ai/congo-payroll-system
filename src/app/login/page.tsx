'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/LoginForm'
import { useToast } from '@/components/ui/toast'

export default function LoginPage() {
  const { ToastContainer } = useToast()

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
              Connexion
            </CardTitle>
            <CardDescription className="text-indigo-600">
              Accédez à votre système de paie pour le Congo Brazzaville
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-4 text-center text-sm text-indigo-600">
              Pas encore de compte ?{' '}
              <Link href="/register" className="font-medium hover:text-indigo-800 underline">
                S&apos;inscrire
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