'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  Settings,
  Calculator,
  TrendingUp,
  DollarSign
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: Home, color: 'text-blue-400', shortLabel: 'Dashboard' },
  { href: '/employes', label: 'Employés', icon: Users, color: 'text-green-400', shortLabel: 'Employés' },
  { href: '/paie', label: 'Traitement Paie', icon: Calculator, color: 'text-purple-400', shortLabel: 'Paie' },
  { href: '/rapports', label: 'Rapports & Analytics', icon: TrendingUp, color: 'text-pink-400', shortLabel: 'Rapports' },
  { href: '/finance', label: 'Finance', icon: DollarSign, color: 'text-emerald-400', shortLabel: 'Finance' },
  { href: '/parametres', label: 'Paramètres', icon: Settings, color: 'text-gray-400', shortLabel: 'Config' },
]

export function TopBar() {
  const pathname = usePathname()

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-center px-4 py-2">
        {/* Navigation rapide centrée */}
        <div className="flex items-center space-x-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-gray-50",
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:text-gray-800"
                )}
                title={item.label}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 mb-1 transition-colors",
                    isActive ? item.color : "text-gray-500 group-hover:text-gray-700"
                  )}
                />
                <span className="truncate max-w-[60px]">{item.shortLabel}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}