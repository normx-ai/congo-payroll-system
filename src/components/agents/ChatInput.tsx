'use client'

/**
 * Composant ChatInput - Zone de saisie des messages
 */

import { useState, FormEvent, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Posez une question sur la paie au Congo...',
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Envoyer avec Enter (simple)
    // Shift+Enter pour retour à la ligne
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Appeler directement la logique de soumission sans passer par handleSubmit
      if (message.trim() && !disabled) {
        onSendMessage(message.trim())
        setMessage('')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            minHeight: '48px',
            maxHeight: '200px',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = `${Math.min(target.scrollHeight, 200)}px`
          }}
        />

        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Appuyez sur <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Entrée</kbd> pour envoyer • <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Shift+Entrée</kbd> pour retour à la ligne
      </div>
    </form>
  )
}
