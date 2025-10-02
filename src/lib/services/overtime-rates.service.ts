import { ParametresFiscauxService } from './parametres-fiscaux.service'

/**
 * Taux de majoration pour heures supplémentaires
 */
export interface OvertimeRates {
  jourPremieres: number      // Majoration jour - 1ères heures (ex: 10%)
  jourSuivantes: number       // Majoration jour - suivantes (ex: 25%)
  nuitOuvrable: number        // Majoration nuit ouvrables (ex: 50%)
  jourRepos: number           // Majoration jour repos/férié (ex: 50%)
  nuitRepos: number           // Majoration nuit repos/férié (ex: 100%)
  heuresLegalesMois: number   // Base légale mensuelle (ex: 173.33)
}

/**
 * Service d'accès aux taux d'heures supplémentaires depuis la base de données
 */
export class OvertimeRatesService {
  /**
   * Récupère tous les taux d'heures supplémentaires pour une période donnée
   */
  static async getRates(
    tenantId: string,
    periode: Date = new Date()
  ): Promise<OvertimeRates> {
    const params = await ParametresFiscauxService.getParametres(
      tenantId,
      [
        'HEURES_LEGALES_MOIS',
        'HS_JOUR_PREMIERES',
        'HS_JOUR_SUIVANTES',
        'HS_NUIT_OUVRABLE',
        'HS_JOUR_REPOS',
        'HS_NUIT_REPOS'
      ],
      periode
    )

    return {
      heuresLegalesMois: params.HEURES_LEGALES_MOIS,
      jourPremieres: params.HS_JOUR_PREMIERES,
      jourSuivantes: params.HS_JOUR_SUIVANTES,
      nuitOuvrable: params.HS_NUIT_OUVRABLE,
      jourRepos: params.HS_JOUR_REPOS,
      nuitRepos: params.HS_NUIT_REPOS
    }
  }

  /**
   * Calcule le coefficient multiplicateur à partir du taux de majoration
   * Ex: 10% -> 1.10, 50% -> 1.50, 100% -> 2.00
   */
  static toCoefficient(tauxMajoration: number): number {
    return 1 + (tauxMajoration / 100)
  }
}
