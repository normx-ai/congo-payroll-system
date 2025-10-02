'use client'

import { Bell, User, LogOut, ChevronDown, Loader2 } from 'lucide-react'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useTenant } from '@/hooks/useTenant'
import { useNotifications } from '@/hooks/useNotifications'

const UserInfo = ({ companyName, loading }: { companyName: string, loading: boolean }) => (
  <div>
    {loading ? (
      <div className="flex items-center space-x-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
        <span className="text-indigo-700">Chargement...</span>
      </div>
    ) : (
      <>
        <h2 className="text-xl font-bold text-indigo-900">
          {companyName || 'Entreprise'}
        </h2>
        <p className="text-sm text-indigo-600 font-medium">
          🇨🇬 Entreprise - Congo Brazzaville
        </p>
      </>
    )}
  </div>
)

const NotificationButton = ({ unreadCount, loading }: { unreadCount: number, loading: boolean }) => (
  <Button variant="ghost" size="icon" className="text-indigo-600 hover:bg-indigo-50 relative">
    <Bell className="w-5 h-5" />
    {loading ? (
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full animate-pulse"></span>
    ) : (
      unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </span>
      )
    )}
  </Button>
)

export function Header() {
  const { user, loading: authLoading } = useAuth()
  const { tenant, loading: tenantLoading } = useTenant()
  const { unreadCount, loading: notificationsLoading } = useNotifications()
  // const router = useRouter() // Unused for now

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('tenantData')
    setTimeout(() => {
      window.location.href = '/login'
    }, 100)
  }
  return (
    <header className="h-18 bg-white border-b border-indigo-100 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <Image
          src="/logo-blanc.png"
          alt="Logo"
          width={48}
          height={48}
          className="h-12 w-auto"
        />
        <UserInfo companyName={tenant?.companyName || ''} loading={tenantLoading} />
      </div>

      <div className="flex items-center space-x-4">
        <NotificationButton unreadCount={unreadCount} loading={notificationsLoading} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 hover:bg-indigo-50">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                {authLoading ? (
                  <div className="space-y-1">
                    <div className="w-16 h-3 bg-indigo-200 rounded animate-pulse"></div>
                    <div className="w-12 h-2 bg-indigo-100 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <span className="text-indigo-900 font-semibold block">
                      {user?.firstName || 'Utilisateur'}
                    </span>
                    <span className="text-indigo-600 text-xs">{user?.role || 'Utilisateur'}</span>
                  </>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-indigo-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-lg border-indigo-100">
            <DropdownMenuLabel className="text-indigo-900">Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-gray-700 hover:bg-indigo-50">
              <User className="w-4 h-4 mr-2 text-indigo-500" />
              Profil utilisateur
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-gray-700 hover:bg-indigo-50 cursor-pointer"
              onSelect={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2 text-red-500" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}