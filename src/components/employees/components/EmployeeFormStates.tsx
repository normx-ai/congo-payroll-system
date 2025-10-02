'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = "Chargement des données de l'employé..." }: LoadingStateProps) {
  return (
    <Card className="max-w-4xl border-l-4 border-l-indigo-500">
      <CardContent className="py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          {message}
        </div>
      </CardContent>
    </Card>
  )
}

export function NotFoundState() {
  return (
    <Card className="max-w-4xl border-l-4 border-l-red-500">
      <CardContent className="py-8">
        <div className="text-center text-red-600">
          Employé non trouvé
        </div>
      </CardContent>
    </Card>
  )
}