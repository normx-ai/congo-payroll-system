'use client'

/**
 * Composant MessageBubble - Affiche un message du chat
 */

import { Bot, User } from 'lucide-react'

interface MessageBubbleProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    metadata?: {
      duration?: number
      cost?: number
    }
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap">
            {message.content}
          </div>
        </div>

        {/* Metadata */}
        {!isUser && message.metadata && (
          <div className="mt-1 flex gap-3 text-xs text-gray-500 dark:text-gray-400">
            {message.metadata.duration && (
              <span>⏱️ {(message.metadata.duration / 1000).toFixed(1)}s</span>
            )}
            {message.metadata.cost && (
              <span>💰 ${message.metadata.cost.toFixed(4)}</span>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {message.timestamp.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )
}
