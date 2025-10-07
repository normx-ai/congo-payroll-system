import { useState } from 'react'

interface BulletinGenerationState {
  generating: boolean
  success: boolean
  error: string | null
  bulletinId: string | null
  downloadUrl: string | null
}

interface RubriqueSaisie {
  code: string
  montant: number
}

interface GenerateBulletinParams {
  employeeId: string
  periode: string
  joursTravailles?: number
  rubriquesSaisies?: RubriqueSaisie[]
  chargesDeductibles?: number
  skipPdfGeneration?: boolean // V1: Option pour sauter la génération PDF
}

export function useBulletinGeneration() {
  const [state, setState] = useState<BulletinGenerationState>({
    generating: false,
    success: false,
    error: null,
    bulletinId: null,
    downloadUrl: null
  })

  const generateAndSaveBulletin = async (params: GenerateBulletinParams) => {
    setState(prev => ({ ...prev, generating: true, error: null, success: false }))

    try {
      const response = await fetch('/api/bulletins/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params),
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération')
      }

      setState(prev => ({
        ...prev,
        generating: false,
        success: true,
        bulletinId: data.bulletin.id,
        downloadUrl: `/api/bulletins/${data.bulletin.id}/download`
      }))

      return data.bulletin

    } catch (error) {
      setState(prev => ({
        ...prev,
        generating: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }))
      throw error
    }
  }

  const reset = () => {
    setState({
      generating: false,
      success: false,
      error: null,
      bulletinId: null,
      downloadUrl: null
    })
  }

  return {
    ...state,
    generateAndSaveBulletin,
    reset
  }
}