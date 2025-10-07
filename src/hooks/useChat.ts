'use client'

/**
 * Hook useChat - Gestion de l'état du chat et appels API
 */

import { useState, useCallback } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    duration?: number
    cost?: number
    type?: string
  }
}

interface UseChatOptions {
  tenantId: string
  onError?: (error: Error) => void
}

export function useChat({ tenantId, onError }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(
    async (content: string) => {
      // Ajouter le message utilisateur
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      try {
        // Envoyer aussi l'historique des 5 derniers messages pour le contexte
        const conversationHistory = messages.slice(-5).map(m => ({
          role: m.role,
          content: m.content
        }))

        // Appel API
        const response = await fetch('/api/agents/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: content,
            tenantId,
            periode: new Date().toISOString(),
            conversationHistory,
          }),
        })

        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`)
        }

        const data = await response.json()

        // Ajouter la réponse de l'assistant
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.data?.answer || data.data?.explication || 'Réponse reçue',
          timestamp: new Date(),
          metadata: {
            duration: data.metadata?.duration,
            cost: data.metadata?.cost,
            type: data.type,
          },
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error)

        // Message d'erreur
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `Désolé, une erreur est survenue: ${
            error instanceof Error ? error.message : 'Erreur inconnue'
          }`,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, errorMessage])

        if (onError && error instanceof Error) {
          onError(error)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [tenantId, onError, messages]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  }
}
