'use client'

import { Bot, X } from 'lucide-react'
import { useChatContext } from '@/contexts/ChatContext'
import { useState } from 'react'

export function FloatingChatButton() {
  const { isOpen, toggleChat } = useChatContext()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={toggleChat}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-30 group"
      title={isOpen ? "Fermer l'assistant" : "Ouvrir l'assistant IA"}
    >
      {/* Bouton principal */}
      <div
        className={`
          w-16 h-16 rounded-full
          bg-gradient-to-r from-purple-500 to-indigo-600
          hover:from-purple-600 hover:to-indigo-700
          shadow-lg hover:shadow-xl
          flex items-center justify-center
          transition-all duration-300
          ${isOpen ? 'rotate-0' : 'rotate-0'}
        `}
      >
        {isOpen ? (
          <X className="w-7 h-7 text-white transition-transform duration-300" />
        ) : (
          <Bot className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" />
        )}
      </div>

      {/* Badge de notification (optionnel) */}
      {!isOpen && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      )}

      {/* Texte au survol */}
      {!isOpen && isHovered && (
        <div className="absolute right-20 bottom-4 bg-gray-900 text-white px-4 py-2 rounded-lg whitespace-nowrap shadow-lg">
          <span className="text-sm font-medium">Assistant Fiscal IA</span>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
            <div className="border-8 border-transparent border-l-gray-900"></div>
          </div>
        </div>
      )}

      {/* Animation de pulse */}
      {!isOpen && (
        <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20"></div>
      )}
    </button>
  )
}
