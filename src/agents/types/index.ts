/**
 * Types pour le système multi-agents
 */

/**
 * Configuration d'un agent
 */
export interface AgentConfig {
  name: string
  description: string
  modelName?: string
  temperature?: number
  maxTokens?: number
}

/**
 * Contexte partagé entre agents
 */
export interface AgentContext {
  tenantId: string
  userId?: string
  periode: Date
  locale?: string
}

/**
 * Résultat d'un agent
 * T peut être n'importe quel type de données structurées
 */
export interface AgentResult<T = object> {
  success: boolean
  data?: T
  error?: string
  sources?: string[]
  metadata?: {
    duration: number
    tokensUsed?: number
    cost?: number
  }
}

/**
 * Question utilisateur
 */
export interface UserQuery {
  question: string
  context: AgentContext
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  options?: {
    includeExplanations?: boolean
    includeSources?: boolean
    maxTokens?: number
  }
}

/**
 * Paramètres pour calcul IRPP
 */
export interface IRPPCalculationParams {
  salaireBrut: number
  nombreEnfants: number
  situationFamiliale: 'célibataire' | 'marié' | 'divorcé' | 'veuf'
  periode: Date
  tenantId: string
}

/**
 * Résultat calcul IRPP
 */
export interface IRPPCalculationResult {
  revenuImposable: number
  irppTotal: number
  tauxMoyen: number
  explication: string
  details: {
    salaireBrut: number
    abattementForfaitaire: number
    deductionEnfants: number
    baseImposable: number
    tranches: Array<{
      min: number
      max: number | null
      taux: number
      montantTranche: number
      irppTranche: number
    }>
  }
}

/**
 * Tranche IRPP
 */
export interface IrppTranche {
  seuilInferieur: number
  seuilSuperieur: number | null
  taux: number
}

/**
 * Paramètres fiscaux
 */
export interface ParametresFiscaux {
  // IRPP
  abattementForfaitairePourcentage: number
  deductionParEnfant: number

  // CNSS
  cnssTauxEmploye: number
  cnssTauxEmployeur: number
  cnssPlafond: number

  // Autres cotisations
  camuTaux: number
  camuSeuil: number
  tusTaux: number
  tusSSTaux: number

  // Allocations familiales
  afTaux: number
  afPlafond: number

  // Accidents de travail
  atTaux: number
  atPlafond: number
}
