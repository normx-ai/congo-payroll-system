/**
 * Agent Fiscal - Expert IRPP Congo
 */

import { BaseAgent } from './base-agent'
import { calculerIRPPComplet } from '@/lib/fiscal/calculs-irpp'
import { calculerPartsFiscales } from '@/lib/fiscal/quotient-familial'
import { FISCAL_SYSTEM_PROMPT } from './prompts/fiscal-prompts'
import type {
  AgentResult,
  UserQuery,
  IRPPCalculationParams,
  IRPPCalculationResult,
} from './types'

export class FiscalAgent extends BaseAgent {
  constructor() {
    super({
      name: 'FiscalAgent',
      description: 'Expert en fiscalité congolaise (IRPP)',
      modelName: 'gpt-3.5-turbo',
      temperature: 0.1,
      maxTokens: 1500,
    })
  }

  protected getSystemPrompt(): string {
    return FISCAL_SYSTEM_PROMPT
  }

  /**
   * Traiter une question fiscale générale
   */
  async process(query: UserQuery): Promise<AgentResult> {
    const startTime = Date.now()

    try {
      this.log('info', `Processing question: ${query.question}`)

      // Vérifier si c'est une réponse à une demande de clarification
      const lastMessage = query.conversationHistory?.[query.conversationHistory.length - 1]
      const isFollowUp = lastMessage &&
        /situation par défaut est célibataire.*confirmer.*statut/i.test(lastMessage.content)

      // Si c'est une réponse de suivi (marié, célibataire, etc.)
      if (isFollowUp && /^(marié|marie|célibataire|celibataire|divorcé|divorce|veuf)$/i.test(query.question.trim())) {
        // Rechercher la question originale dans l'historique
        const originalQuestion = query.conversationHistory?.slice(0, -1)
          .reverse()
          .find(msg => msg.role === 'user' && /différence|entre.*enfants/i.test(msg.content))

        if (originalQuestion) {
          const reponse = query.question.trim().toLowerCase()

          // Normaliser la situation
          let situationNormalized: string
          if (reponse === 'marie' || reponse === 'marié') {
            situationNormalized = 'marié'
          } else if (reponse === 'celibataire' || reponse === 'célibataire') {
            situationNormalized = 'célibataire'
          } else if (reponse === 'divorce' || reponse === 'divorcé') {
            situationNormalized = 'divorcé'
          } else if (reponse === 'veuf') {
            situationNormalized = 'veuf'
          } else {
            situationNormalized = reponse
          }

          // Combiner la question originale avec la situation précisée
          const combinedQuestion = `${originalQuestion.content} pour ${situationNormalized}`

          this.log('info', `Combined question: ${combinedQuestion}`)

          const comparisonMatch = await this.detectComparisonRequest(combinedQuestion)
          if (comparisonMatch) {
            return await this.handleComparison(comparisonMatch)
          }
        }
      }

      // Détecter si c'est une demande de comparaison avec calculs
      const comparisonMatch = await this.detectComparisonRequest(query.question)
      if (comparisonMatch) {
        return await this.handleComparison(comparisonMatch)
      }

      // Détecter si c'est une question de calcul IRPP
      const calcMatch = await this.detectIRPPCalculation(query.question)

      if (calcMatch) {
        // Utiliser la fonction de calcul fiable
        return await this.calculateIRPP(calcMatch)
      }

      // Sinon, question générale
      // Construire les messages avec l'historique
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: this.getSystemPrompt() }
      ]

      // Ajouter l'historique de conversation si disponible
      if (query.conversationHistory && query.conversationHistory.length > 0) {
        query.conversationHistory.forEach(msg => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })
        })
      }

      // Ajouter la question actuelle
      messages.push({
        role: 'user',
        content: `Question: ${query.question}\n\nRéponds de manière claire et pédagogique. Les montants sont implicitement en FCFA, ne le répète pas à chaque fois.`,
      })

      const response = await this.llm.invoke(messages)

      const duration = Date.now() - startTime

      return this.formatSuccess(
        { answer: response.content },
        {
          duration,
          tokensUsed: response.response_metadata?.tokenUsage?.totalTokens,
          cost: this.calculateCost(
            response.response_metadata?.tokenUsage?.totalTokens || 0,
            this.config.modelName || 'gpt-3.5-turbo'
          ),
        },
        ['Code Général des Impôts du Congo']
      )
    } catch (error) {
      // Logger l'erreur avec conversion en objet simple pour le logger
      const errorData: { [key: string]: string } = error instanceof Error
        ? { message: error.message, name: error.name }
        : { error: 'Unknown error' }
      this.log('error', 'Error processing query', errorData)
      return this.formatError(error)
    }
  }

  /**
   * Détecter une demande de comparaison nécessitant plusieurs calculs
   */
  private async detectComparisonRequest(question: string): Promise<{
    salaire: number;
    comparaisons: Array<{ situation: string; enfants: number }>
  } | null> {
    // Chercher des mots-clés de comparaison
    const isComparison = /différence|diff|compare|comparaison|comparer|entre.*et|vs|versus|deux cas|sans détail|sans detail/i.test(question)

    if (!isComparison) {
      return null
    }

    // Extraire le salaire (regex plus robuste)
    const salaryMatch = question.match(/\d[\d\s,.'_]*\d{3,}/g)
    if (!salaryMatch) {
      return null
    }

    // Nettoyer et parser le salaire
    const salaire = parseInt(salaryMatch[0].replace(/[\s,.'_]/g, ''))

    // Vérification de validité
    if (isNaN(salaire) || salaire < 100000 || salaire > 10000000) {
      return null
    }

    // Cas 1: Comparaison d'enfants (ex: "entre 2 et 4 enfants")
    const enfantsMatch = question.match(/(\d+)\s*(?:et|enfants?).*?(\d+)\s*enfants?/i)
    if (enfantsMatch) {
      const enfants1 = parseInt(enfantsMatch[1])
      const enfants2 = parseInt(enfantsMatch[2])

      // Détecter la situation familiale - chercher tous les statuts possibles
      let situation: string | null = null
      if (/marié|marie/i.test(question)) {
        situation = 'marié'
      } else if (/célibataire|celibataire/i.test(question)) {
        situation = 'célibataire'
      } else if (/divorcé|divorce/i.test(question)) {
        situation = 'divorcé'
      } else if (/veuf/i.test(question)) {
        situation = 'veuf'
      }

      // Si situation non précisée, demander clarification directement
      if (!situation) {
        // Retourner une structure spéciale pour demander clarification
        return {
          salaire,
          comparaisons: [] // vide = demande de clarification
        }
      }

      return {
        salaire,
        comparaisons: [
          { situation, enfants: enfants1 },
          { situation, enfants: enfants2 }
        ]
      }
    }

    // Cas 2: Comparaison de situations (célibataire vs marié)
    const situations: string[] = []
    if (/célibataire|celibataire/i.test(question)) {
      situations.push('célibataire')
    }
    if (/marié|marie/i.test(question)) {
      situations.push('marié')
    }

    // Si aucune situation explicite, proposer célibataire vs marié par défaut
    if (situations.length === 0) {
      situations.push('célibataire')
      situations.push('marié')
    }

    return {
      salaire,
      comparaisons: situations.map(s => ({ situation: s, enfants: 0 }))
    }
  }

  /**
   * Gérer une demande de comparaison en faisant de vrais calculs
   */
  private async handleComparison(params: {
    salaire: number;
    comparaisons: Array<{ situation: string; enfants: number }>
  }): Promise<AgentResult> {
    const startTime = Date.now()

    try {
      this.log('info', `Handling comparison for salary: ${params.salaire}`)

      // Si comparaisons vide = demande de clarification
      if (params.comparaisons.length === 0) {
        const reponse = `La situation par défaut est célibataire. Pouvez-vous confirmer ce statut ou préciser un autre statut (marié, divorcé, veuf) ?`

        return this.formatSuccess(
          { answer: reponse },
          { duration: Date.now() - startTime, cost: 0 }
        )
      }

      const results: Array<{ situation: string; enfants: number; irpp: number; parts: number }> = []

      // Calculer pour chaque configuration
      for (const config of params.comparaisons) {
        // Mapper divorcé/veuf vers célibataire (1 part selon CGI Congo)
        const situationFiscale = (config.situation === 'divorcé' || config.situation === 'veuf')
          ? 'célibataire'
          : config.situation as 'célibataire' | 'marié'

        const calc = calculerIRPPComplet(
          params.salaire * 12,
          0,
          situationFiscale,
          config.enfants
        )
        const irppMensuel = Math.round(calc.irppTotal / 12)
        results.push({
          situation: config.situation,
          enfants: config.enfants,
          irpp: irppMensuel,
          parts: calc.partsFiscales
        })
      }

      // Formater la réponse de manière concise
      let reponse = `Pour un salaire brut mensuel de ${params.salaire.toLocaleString()} :\n`

      results.forEach(r => {
        const situationLabel = r.situation.charAt(0).toUpperCase() + r.situation.slice(1)
        const enfantsLabel = r.enfants > 0 ? ` avec ${r.enfants} enfant${r.enfants > 1 ? 's' : ''}` : ''
        reponse += `- ${situationLabel}${enfantsLabel} (${r.parts} part${r.parts > 1 ? 's' : ''}) : ${r.irpp.toLocaleString()}\n`
      })

      // Ajouter une explication selon le type de comparaison
      if (results.length === 2) {
        // Comparaison célibataire vs marié
        // On compare si les situations familiales diffèrent mais le nombre d'enfants est identique
        if (results[0].situation !== results[1].situation && results[0].enfants === results[1].enfants) {
          const irppCel = results.find(r => r.situation === 'célibataire')!.irpp
          const irppMar = results.find(r => r.situation === 'marié')!.irpp

          reponse += `\nLe marié paie moins car il bénéficie de 2 parts fiscales (contre 1 pour le célibataire), ce qui divise son revenu imposable par 2 avant application du barème progressif.\n`
          reponse += `Économie mensuelle avec le mariage : ${(irppCel - irppMar).toLocaleString()}\n`
        }
        // Comparaison nombre d'enfants
        // On compare si la situation familiale est identique mais le nombre d'enfants diffère
        else if (results[0].situation === results[1].situation && results[0].enfants !== results[1].enfants) {
          // config1 = configuration avec moins d'enfants
          // config2 = configuration avec plus d'enfants
          const config1 = results[0].enfants > results[1].enfants ? results[1] : results[0]
          const config2 = results[0].enfants > results[1].enfants ? results[0] : results[1]
          // Différence de parts fiscales entre les deux configurations
          const diffParts = config2.parts - config1.parts

          reponse += `\nChaque enfant ajoute 0.5 part fiscale (max 5 parts au total), ce qui réduit le revenu imposable par part et donc l'impôt.\n`
          reponse += `Différence de parts : ${diffParts} (${config2.parts} - ${config1.parts})\n`
          reponse += `Économie mensuelle avec ${config2.enfants - config1.enfants} enfant${config2.enfants - config1.enfants > 1 ? 's' : ''} supplémentaire${config2.enfants - config1.enfants > 1 ? 's' : ''} : ${(config1.irpp - config2.irpp).toLocaleString()}\n`
        }
      }

      reponse += `\nPour des calculs détaillés, demandez séparément pour chaque situation.`

      const duration = Date.now() - startTime

      return this.formatSuccess(
        { answer: reponse },
        { duration, cost: 0 }
      )
    } catch (error) {
      const errorData: { [key: string]: string } = error instanceof Error
        ? { message: error.message, name: error.name }
        : { error: 'Unknown error' }
      this.log('error', 'Error handling comparison', errorData)
      return this.formatError(error)
    }
  }

  /**
   * Détecter et extraire les paramètres d'une question de calcul IRPP
   */
  private async detectIRPPCalculation(question: string): Promise<IRPPCalculationParams | null> {
    // Si c'est une question de comparaison, ne pas traiter comme un calcul simple
    const isComparison = /compare|comparaison|différence|diff|entre.*et|versus|vs/i.test(question)
    if (isComparison) {
      return null // Laisser le LLM gérer les comparaisons
    }

    // Si pas de nombre dans la question, ce n'est pas un calcul concret
    if (!/\d{3,}/.test(question)) {
      return null
    }

    // Détecter des mots-clés de calcul (élargi)
    // Accepte toute question avec un montant + situation familiale ou enfants
    const hasAmount = /\d{3,}/.test(question)
    const hasSituation = /celibataire|célibataire|marié|marie|veuf|divorcé|divorce|enfant/i.test(question)
    const hasCalculKeyword = /calcul|calculer|quel est l'irpp|combien|impôt|irpp|revenu|salaire|brut/i.test(question)

    // Si on a un montant + situation OU montant + mot-clé calcul, c'est probablement un calcul
    if (!hasAmount || (!hasSituation && !hasCalculKeyword)) {
      return null
    }

    // Extraire les paramètres avec le LLM
    const extractionPrompt = `Extrait les paramètres de calcul IRPP de cette question:
"${question}"

Retourne un JSON avec:
- salaireBrut: nombre (montant MENSUEL en FCFA)
- situationFamiliale: "célibataire" | "marié" | "divorcé" | "veuf"
- nombreEnfants: nombre (nombre d'enfants à charge)

Règles d'extraction:
- "revenu", "salaire", "brut" = salaireBrut (montant MENSUEL)
- "célibataire", "celibataire", "seul" = situationFamiliale: "célibataire"
- "marié", "marie", "couple" = situationFamiliale: "marié"
- "avec X enfants", "X enfants" = nombreEnfants: X
- "sans enfant" = nombreEnfants: 0

Si pas assez d'infos:
- situationFamiliale: "célibataire"
- nombreEnfants: 0

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide, sans texte avant ou après.

Exemple:
Question: "salarié celibataire avec 2 enfants et un revenu de 1 201 564"
Réponse: {"salaireBrut": 1201564, "situationFamiliale": "célibataire", "nombreEnfants": 2}`

    try {
      const response = await this.llm.invoke([
        { role: 'system', content: 'Tu es un extracteur de paramètres fiscal. Réponds UNIQUEMENT avec du JSON valide.' },
        { role: 'user', content: extractionPrompt },
      ])

      const content = String(response.content).trim()
      // Nettoyer le JSON (enlever les ```json si présent)
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const params = JSON.parse(jsonStr)

      if (params.salaireBrut && typeof params.salaireBrut === 'number') {
        // Normaliser la situation familiale (enlever accents, mettre en minuscules)
        let situation = (params.situationFamiliale || 'célibataire').toLowerCase()
        situation = situation.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Enlever accents

        // Mapper vers les valeurs attendues par le système (avec accents)
        const situationMap: { [key: string]: 'célibataire' | 'marié' | 'veuf' | 'divorcé' } = {
          'celibataire': 'célibataire',
          'marie': 'marié',
          'veuf': 'veuf',
          'divorce': 'divorcé'
        }

        const situationFinale = situationMap[situation] || 'célibataire'

        return {
          salaireBrut: params.salaireBrut,
          situationFamiliale: situationFinale,
          nombreEnfants: params.nombreEnfants || 0,
          periode: new Date(),
          tenantId: '00000000-0000-0000-0000-000000000000',
        }
      }

      return null
    } catch (error) {
      const errorData: { [key: string]: string } = error instanceof Error
        ? { message: error.message }
        : { error: 'Failed to extract params' }
      this.log('warn', 'Failed to extract IRPP params', errorData)
      return null
    }
  }

  /**
   * Calculer l'IRPP d'un salarié (utilise le système existant de norm_paie)
   */
  async calculateIRPP(params: IRPPCalculationParams): Promise<AgentResult<IRPPCalculationResult>> {
    const startTime = Date.now()

    try {
      this.log('info', `Calculating IRPP for: ${params.salaireBrut} FCFA, ${params.situationFamiliale}, ${params.nombreEnfants} enfant(s)`)

      // Utiliser le système de calcul existant (fiable et testé)
      const calculComplet = calculerIRPPComplet(
        params.salaireBrut * 12, // Annualiser
        0, // Pas d'avantages pour l'instant
        params.situationFamiliale,
        params.nombreEnfants
      )

      // IRPP mensuel
      const irppMensuel = Math.round(calculComplet.irppTotal / 12)

      // Calculer parts fiscales pour logging et métadonnées
      const partsFiscales = calculerPartsFiscales(
        params.situationFamiliale,
        params.nombreEnfants
      )

      this.log('info', `IRPP details: annuel=${calculComplet.irppTotal}, mensuel=${irppMensuel}, parts=${partsFiscales}`)

      // Taux moyen
      const tauxMoyen =
        params.salaireBrut > 0 ? (irppMensuel / params.salaireBrut) * 100 : 0

      // Générer explication avec LLM
      const explication = await this.generateExplicationFromCalc(params, calculComplet, irppMensuel)

      const result: IRPPCalculationResult = {
        revenuImposable: Math.round(calculComplet.revenuNetImposable / 12),
        irppTotal: irppMensuel,
        tauxMoyen: Math.round(tauxMoyen * 100) / 100,
        explication,
        details: {
          salaireBrut: params.salaireBrut,
          abattementForfaitaire: Math.round(calculComplet.deductionFraisProfessionnels / 12),
          deductionEnfants: 0, // Pas de déduction fixe, système de parts
          baseImposable: Math.round(calculComplet.revenuNetImposable / 12),
          tranches: calculComplet.detailTranches.map((t) => ({
            min: t.tranche.min,
            max: t.tranche.max,
            taux: t.tranche.taux,
            montantTranche: Math.round(t.baseImposable / 12),
            irppTranche: Math.round(t.impot / 12),
          })),
        },
      }

      const duration = Date.now() - startTime
      this.log('info', `IRPP calculated: ${irppMensuel} FCFA (${duration}ms)`)

      return this.formatSuccess(result, {
        duration,
        cost: this.calculateCost(300, 'gpt-3.5-turbo'),
      })
    } catch (error) {
      const errorData: { [key: string]: string } = error instanceof Error
        ? { message: error.message, name: error.name }
        : { error: 'Unknown error' }
      this.log('error', 'Error calculating IRPP', errorData)
      return this.formatError<IRPPCalculationResult>(error)
    }
  }

  /**
   * Générer une explication pédagogique avec le LLM (basée sur le calcul réel)
   */
  private async generateExplicationFromCalc(
    params: IRPPCalculationParams,
    calculComplet: {
      salaireBrutAnnuel: number;
      revenuBrutImposable: number;
      cotisationCNSSSalarie: number;
      revenuApresCNSS: number;
      deductionFraisProfessionnels: number;
      revenuNetImposable: number;
      revenuNetImposableParPart: number;
      detailTranches: Array<{
        baseImposable: number;
        impot: number;
        tranche: { min: number; max: number; taux: number };
      }>;
      irppParPart: number;
      irppTotal: number;
      partsFiscales: number;
    },
    irppMensuel: number
  ): Promise<string> {
    const partsFiscales = calculerPartsFiscales(
      params.situationFamiliale,
      params.nombreEnfants
    )

    // Générer l'explication structurée directement (sans LLM pour éviter les erreurs)
    const revenuParPart = Math.round(calculComplet.revenuNetImposableParPart)

    // Construire la phrase d'introduction
    const situationDesc = params.situationFamiliale === 'célibataire'
      ? `un contribuable célibataire${params.nombreEnfants > 0 ? ` avec ${params.nombreEnfants} enfant${params.nombreEnfants > 1 ? 's' : ''}` : ' sans enfant'}`
      : `un contribuable ${params.situationFamiliale} avec ${params.nombreEnfants} enfant${params.nombreEnfants > 1 ? 's' : ''}`

    let explication = `Pour ${situationDesc} ayant un salaire brut mensuel de ${params.salaireBrut.toLocaleString()}, l'IRPP mensuel à retenir est de ${irppMensuel.toLocaleString()}.\n\n`

    explication += `Calcul détaillé selon le Code Général des Impôts du Congo:\n\n`

    // Étape 1: Annualisation
    explication += `1. Salaire brut annuel\n`
    explication += `   - Salaire mensuel : ${params.salaireBrut.toLocaleString()}\n`
    explication += `   - Salaire annuel : ${params.salaireBrut.toLocaleString()} × 12 = ${calculComplet.salaireBrutAnnuel.toLocaleString()}\n\n`

    // Étape 2: CNSS
    const assietteCNSS = Math.min(calculComplet.revenuBrutImposable, 14400000)
    explication += `2. Déduction CNSS (4% du salaire plafonné à 1 200 000/mois)\n`
    explication += `   - Base de calcul CNSS : ${assietteCNSS.toLocaleString()}\n`
    explication += `   - Cotisation CNSS (4%) : ${calculComplet.cotisationCNSSSalarie.toLocaleString()}\n`
    explication += `   - Revenu après CNSS : ${calculComplet.revenuApresCNSS.toLocaleString()}\n\n`

    // Étape 3: Frais professionnels
    explication += `3. Déduction forfaitaire pour frais professionnels (20%)\n`
    explication += `   - Frais professionnels : ${calculComplet.deductionFraisProfessionnels.toLocaleString()}\n`
    explication += `   - Revenu net imposable : ${calculComplet.revenuNetImposable.toLocaleString()}\n\n`

    // Étape 4: Quotient familial
    explication += `4. Application du quotient familial\n`
    explication += `   - Nombre de parts fiscales : ${partsFiscales}\n`
    explication += `   - Revenu par part : ${calculComplet.revenuNetImposable.toLocaleString()} ÷ ${partsFiscales} = ${revenuParPart.toLocaleString()}\n\n`

    // Étape 5: Barème progressif
    explication += `5. Application du barème progressif par part\n`
    calculComplet.detailTranches.forEach((detail) => {
      const base = Math.round(detail.baseImposable)
      const impot = Math.round(detail.impot)
      const trancheMin = detail.tranche.min.toLocaleString()
      const trancheMax = detail.tranche.max === Infinity ? '∞' : detail.tranche.max.toLocaleString()
      const taux = detail.tranche.taux

      explication += `   - Tranche ${trancheMin} à ${trancheMax} (${taux}%) : ${base.toLocaleString()} × ${taux}% = ${impot.toLocaleString()}\n`
    })
    explication += `   - IRPP par part : ${Math.round(calculComplet.irppParPart).toLocaleString()}\n\n`

    // Étape 6: Multiplication par les parts
    explication += `6. IRPP total annuel\n`
    explication += `   - IRPP par part : ${Math.round(calculComplet.irppParPart).toLocaleString()}\n`
    explication += `   - Nombre de parts : ${partsFiscales}\n`
    explication += `   - IRPP annuel : ${Math.round(calculComplet.irppParPart).toLocaleString()} × ${partsFiscales} = ${calculComplet.irppTotal.toLocaleString()}\n\n`

    // Étape 7: Mensualisation
    explication += `7. IRPP mensuel\n`
    explication += `   - IRPP annuel : ${calculComplet.irppTotal.toLocaleString()}\n`
    explication += `   - IRPP mensuel : ${calculComplet.irppTotal.toLocaleString()} ÷ 12 = ${irppMensuel.toLocaleString()}\n\n`

    // Conclusion
    explication += `\n─────────────────────────\n`
    explication += `IRPP à retenir : ${irppMensuel.toLocaleString()}\n`
    explication += `─────────────────────────\n\n`

    // Références
    explication += `Références légales : Articles 39, 40, 41, 91 et 95 du Code Général des Impôts du Congo.`

    return explication
  }
}
