'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useExerciceContext } from '@/contexts/ExerciceContext'
import {
  Home,
  Users,
  Settings,
  Calculator,
  TrendingUp,
  DollarSign,
  Lock
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: Home, color: 'text-blue-400', requiresExercice: false },
  { href: '/employes', label: 'Employés', icon: Users, color: 'text-green-400', requiresExercice: true },
  { href: '/paie', label: 'Traitement Paie', icon: Calculator, color: 'text-purple-400', requiresExercice: true },
  { href: '/rapports', label: 'Rapports & Analytics', icon: TrendingUp, color: 'text-pink-400', requiresExercice: true },
  { href: '/finance', label: 'Finance', icon: DollarSign, color: 'text-emerald-400', requiresExercice: true },
  { href: '/parametres', label: 'Paramètres', icon: Settings, color: 'text-gray-400', requiresExercice: false },
]

export function Sidebar() {
  const pathname = usePathname()
  const { hasActiveExercice, loading } = useExerciceContext()

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 text-white p-4 shadow-2xl">
      <div className="flex flex-col items-center mb-8 pb-6 border-b border-indigo-700">
        <div className="mb-4 p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
          <Image
            src="/logo-blanc.png"
            alt="Norm Paie"
            width={60}
            height={60}
            className="object-contain filter brightness-110"
          />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            NormX Paie
          </h1>
          <p className="text-xs text-indigo-300 font-medium">
            Gestion Professionnelle
          </p>
        </div>
      </div>

      {/* Alerte si pas d'exercice */}
      {!loading && !hasActiveExercice && (
        <div className="mb-4 p-3 bg-amber-600/20 border border-amber-500/30 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2 text-amber-300">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-medium">Exercice requis</span>
          </div>
          <p className="text-xs text-amber-200 mt-1">
            Créez un exercice comptable dans les paramètres pour activer toutes les fonctionnalités.
          </p>
        </div>
      )}

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isDisabled = !loading && item.requiresExercice && !hasActiveExercice

          // Si l'élément est désactivé, on rend un div au lieu d'un Link
          if (isDisabled) {
            return (
              <div
                key={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden cursor-not-allowed",
                  "bg-indigo-900/50 text-indigo-400 opacity-50"
                )}
                title="Exercice comptable requis"
              >
                <Lock className="w-5 h-5 text-indigo-500" />
                <span className="font-medium">{item.label}</span>
                <div className="ml-auto">
                  <Lock className="w-3 h-3 text-indigo-500" />
                </div>
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                  : "text-indigo-200 hover:bg-white/10 hover:text-white hover:shadow-md"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-white" : item.color
              )} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full"></div>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}