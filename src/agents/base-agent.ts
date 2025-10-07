/**
 * Agent de base pour tous les agents spécialisés
 */

import { ChatOpenAI } from '@langchain/openai'
import type { AgentConfig, AgentResult, UserQuery } from './types'

export abstract class BaseAgent {
  protected llm: ChatOpenAI
  protected config: AgentConfig

  constructor(config: AgentConfig) {
    this.config = config

    // Initialiser le LLM
    this.llm = new ChatOpenAI({
      modelName: config.modelName || 'gpt-3.5-turbo',
      temperature: config.temperature ?? 0.1,
      maxTokens: config.maxTokens || 1000,
    })
  }

  /**
   * Méthode abstraite à implémenter par chaque agent
   */
  abstract process(query: UserQuery): Promise<AgentResult>

  /**
   * Obtenir le prompt système de l'agent
   */
  protected abstract getSystemPrompt(): string

  /**
   * Formater une erreur en AgentResult
   */
  protected formatError<T = object>(error: unknown): AgentResult<T> {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'

    return {
      success: false,
      error: errorMessage,
      metadata: {
        duration: 0,
      },
    }
  }

  /**
   * Formater un succès en AgentResult
   */
  protected formatSuccess<T>(
    data: T,
    metadata?: {
      duration: number
      tokensUsed?: number
      cost?: number
    },
    sources?: string[]
  ): AgentResult<T> {
    return {
      success: true,
      data,
      sources,
      metadata,
    }
  }

  /**
   * Calculer le coût estimé d'une requête
   */
  protected calculateCost(tokensUsed: number, modelName: string): number {
    // Tarifs GPT-3.5-turbo (approximatif)
    // Input: $0.0005/1K tokens, Output: $0.0015/1K tokens
    // On estime 50/50 input/output
    if (modelName.includes('gpt-3.5')) {
      return (tokensUsed / 1000) * 0.001 // moyenne
    }

    // Tarifs GPT-4-turbo (approximatif)
    // Input: $0.01/1K tokens, Output: $0.03/1K tokens
    if (modelName.includes('gpt-4')) {
      return (tokensUsed / 1000) * 0.02 // moyenne
    }

    return 0
  }

  /**
   * Logger une action
   */
  protected log(level: 'info' | 'error' | 'warn', message: string, data?: { [key: string]: string | number | boolean }) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${this.config.name}] ${message}`

    if (level === 'error') {
      console.error(logMessage, data || '')
    } else if (level === 'warn') {
      console.warn(logMessage, data || '')
    } else {
      console.log(logMessage, data || '')
    }
  }
}
