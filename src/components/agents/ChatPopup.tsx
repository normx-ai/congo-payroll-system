'use client'

import { useEffect } from 'react'
import { ChatInterface } from './ChatInterface'
import { X } from 'lucide-react'

interface ChatPopupProps {
  tenantId: string
  isOpen: boolean
  onClose: () => void
}

export function ChatPopup({ tenantId, isOpen, onClose }: ChatPopupProps) {
  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed right-4 bottom-4 top-20 w-[450px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Chat Interface avec bouton fermer intégré */}
      <div className="relative h-full">
        {/* Bouton fermer en overlay */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          title="Fermer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <ChatInterface tenantId={tenantId} />
      </div>
    </div>
  )
}
