/**
 * Calcul des heures supplémentaires - Convention Commerce Congo
 */

import { OvertimeRatesService } from '@/lib/services/overtime-rates.service'

export interface HeuresSupDetails {
  jourPremieresHeures?: number   // Jour - 1ères heures
  jourSuivantes?: number         // Jour - heures suivantes
  nuitOuvrable?: number         // Nuit jours ouvrables
  jourRepos?: number            // Jour repos/férié
  nuitRepos?: number            // Nuit repos/férié
}

/**
 * Calcule le montant total des heures supplémentaires - Version DB
 */
export async function calculateHeuresSupplementaires(
  tenantId: string,
  salaireHoraire: number,
  heuresSupDetails: HeuresSupDetails,
  periode: Date = new Date()
): Promise<{
  details: Array<{ type: string; heures: number; taux: number; montant: number }>
  total: number
}> {
  const rates = await OvertimeRatesService.getRates(tenantId, periode)
  const details: Array<{ type: string; heures: number; taux: number; montant: number }> = []
  let montantTotal = 0

  // Jour - 1ères heures
  if (heuresSupDetails.jourPremieresHeures) {
    const coeff = OvertimeRatesService.toCoefficient(rates.jourPremieres)
    const montant = salaireHoraire * heuresSupDetails.jourPremieresHeures * coeff
    details.push({
      type: 'Jour - 1ères heures',
      heures: heuresSupDetails.jourPremieresHeures,
      taux: coeff,
      montant
    })
    montantTotal += montant
  }

  // Jour - heures suivantes
  if (heuresSupDetails.jourSuivantes) {
    const coeff = OvertimeRatesService.toCoefficient(rates.jourSuivantes)
    const montant = salaireHoraire * heuresSupDetails.jourSuivantes * coeff
    details.push({
      type: 'Jour - heures suivantes',
      heures: heuresSupDetails.jourSuivantes,
      taux: coeff,
      montant
    })
    montantTotal += montant
  }

  // Nuit jours ouvrables
  if (heuresSupDetails.nuitOuvrable) {
    const coeff = OvertimeRatesService.toCoefficient(rates.nuitOuvrable)
    const montant = salaireHoraire * heuresSupDetails.nuitOuvrable * coeff
    details.push({
      type: 'Nuit ouvrables',
      heures: heuresSupDetails.nuitOuvrable,
      taux: coeff,
      montant
    })
    montantTotal += montant
  }

  // Jour repos/férié
  if (heuresSupDetails.jourRepos) {
    const coeff = OvertimeRatesService.toCoefficient(rates.jourRepos)
    const montant = salaireHoraire * heuresSupDetails.jourRepos * coeff
    details.push({
      type: 'Jour repos/férié',
      heures: heuresSupDetails.jourRepos,
      taux: coeff,
      montant
    })
    montantTotal += montant
  }

  // Nuit repos/férié
  if (heuresSupDetails.nuitRepos) {
    const coeff = OvertimeRatesService.toCoefficient(rates.nuitRepos)
    const montant = salaireHoraire * heuresSupDetails.nuitRepos * coeff
    details.push({
      type: 'Nuit repos/férié',
      heures: heuresSupDetails.nuitRepos,
      taux: coeff,
      montant
    })
    montantTotal += montant
  }

  return {
    details,
    total: Math.round(montantTotal)
  }
}

/**
 * Calcule le salaire horaire depuis le salaire mensuel - Version DB
 */
export async function calculateSalaireHoraire(
  tenantId: string,
  salaireMensuel: number,
  periode: Date = new Date()
): Promise<number> {
  const rates = await OvertimeRatesService.getRates(tenantId, periode)
  return salaireMensuel / rates.heuresLegalesMois
}