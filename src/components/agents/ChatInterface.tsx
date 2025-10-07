'use client'

/**
 * Composant ChatInterface - Interface principale du chat agent
 */

import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { useChat } from '@/hooks/useChat'
import { Bot, Trash2 } from 'lucide-react'

interface ChatInterfaceProps {
  tenantId: string
}

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content: `Bonjour ! Je suis votre assistant fiscal expert en paie congolaise.`,
  timestamp: new Date(),
}

export function ChatInterface({ tenantId }: ChatInterfaceProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useChat({
    tenantId,
    onError: (error) => {
      console.error('Erreur chat:', error)
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Messages à afficher (welcome + messages)
  const displayMessages = messages.length === 0 ? [WELCOME_MESSAGE] : messages

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Assistant Fiscal Congo</h2>
            <p className="text-sm text-white/80">
              Expert en IRPP et paie congolaise
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Effacer la conversation"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {displayMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 inline-block">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={sendMessage}
        disabled={isLoading}
        placeholder={
          isLoading
            ? 'L\'assistant réfléchit...'
            : 'Posez une question sur la paie au Congo...'
        }
      />
    </div>
  )
}
