'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { TopBar } from '@/components/layout/TopBar'
import { ChatInterface } from '@/components/agents/ChatInterface'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function AssistantPage() {
  const { tenant, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <TopBar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </main>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <TopBar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-red-600">Non authentifié</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <TopBar />

        <main className="flex-1 overflow-hidden">
          <ChatInterface tenantId={tenant.id} />
        </main>
      </div>
    </div>
  )
}
