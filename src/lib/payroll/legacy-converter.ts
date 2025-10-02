/**
 * Convertisseur de BulletinPaie vers format legacy
 */

import { BulletinPaie } from './index'
import { LegacyEmployeeInput, PayrollCalculation } from './legacy-types'

/**
 * Convertit BulletinPaie vers PayrollCalculation
 */
export function convertToLegacy(employee: LegacyEmployeeInput, bulletin: BulletinPaie, referenceDate?: Date): PayrollCalculation {
  // Calculer l'ancienneté en années si disponible
  let ancienneteAnnees = 0
  if ('hireDate' in employee && employee.hireDate) {
    const hire = employee.hireDate instanceof Date ? employee.hireDate : new Date(employee.hireDate)
    const refDate = referenceDate || new Date()
    const diffMs = refDate.getTime() - hire.getTime()
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))
    ancienneteAnnees = Math.floor(diffMonths / 12)
  }

  // Extraction de TOUS les gains avec leurs propriétés complètes
  const gains = bulletin.gains.rubriques.map(r => {
    // Enrichir la prime d'ancienneté (1010) avec le nombre d'années et le taux
    if (r.code === '1010') {
      // Calculer le taux selon la règle de la convention collective
      let tauxPourcent = 0
      if (ancienneteAnnees === 2) {
        tauxPourcent = 2
      } else if (ancienneteAnnees >= 3 && ancienneteAnnees <= 29) {
        tauxPourcent = ancienneteAnnees // 1% par année
      } else if (ancienneteAnnees >= 30) {
        tauxPourcent = 30
      }

      return {
        code: r.code,
        libelle: r.libelle,
        montant: r.montant,
        type: r.type || determineGainType(r.code),
        base: 'baseSalary' in employee ? Number(employee.baseSalary) : undefined,
        taux: tauxPourcent > 0 ? `${tauxPourcent}%` : undefined,
        quantite: ancienneteAnnees || undefined
      }
    }

    return {
      code: r.code,
      libelle: r.libelle,
      montant: r.montant,
      type: r.type || determineGainType(r.code),
      base: extractBase(r),
      taux: extractTaux(r),
      quantite: r.nbHeures || undefined
    }
  })

  // Extraction de TOUTES les retenues (cotisations + autres retenues)
  const retenues = [
    // 1. Cotisations depuis bulletin.cotisations.rubriques
    ...bulletin.cotisations.rubriques.map(r => ({
      code: r.code,
      libelle: r.libelle,
      montant: r.montant,
      type: r.type || determineRetenueType(r.code),
      base: extractBase(r),
      taux: extractTaux(r)
    })),
    // 2. Autres retenues depuis bulletin.retenues.autresRetenues.rubriques
    ...bulletin.retenues.autresRetenues.rubriques.map(r => ({
      code: r.code,
      libelle: r.libelle,
      montant: r.montant,
      type: r.type || determineRetenueType(r.code),
      base: extractBase(r),
      taux: extractTaux(r)
    }))
  ]

  // Calculer l'ancienneté si hireDate disponible
  let anciennete: string | undefined
  if ('hireDate' in employee && employee.hireDate) {
    const hire = employee.hireDate instanceof Date ? employee.hireDate : new Date(employee.hireDate)
    const refDate = referenceDate || new Date()
    const diffMs = refDate.getTime() - hire.getTime()
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))
    const years = Math.floor(diffMonths / 12)
    const months = diffMonths % 12
    anciennete = `${years} an(s) ${months} mois`
  }

  return {
    employeeId: employee.id || '',
    employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`,
    firstName: employee.firstName || '',
    lastName: employee.lastName || '',
    employeeCode: 'employeeCode' in employee ? employee.employeeCode : '',
    position: 'position' in employee ? employee.position : '',
    salaireBase: getSalaireBase(bulletin),
    totalGains: bulletin.gains.totalGains,
    totalRetenues: bulletin.retenues.totalRetenues,
    totalAvantages: 0, // Les avantages sont inclus dans gains
    salaireNet: bulletin.netAPayer,
    cotisationsEmployeur: bulletin.chargesEmployeur?.total || 0,
    employeeData: {
      dateEmbauche: ('hireDate' in employee && employee.hireDate)
        ? formatDate(employee.hireDate)
        : undefined,
      departement: 'department' in employee && employee.department
        ? (employee.department as any).name
        : undefined,
      service: undefined, // À enrichir si disponible
      qualification: undefined, // À enrichir si disponible
      categorie: 'salaryCategory' in employee ? (employee.salaryCategory as string) : undefined,
      situationFamiliale: 'maritalStatus' in employee ? (employee.maritalStatus as string) : 'Célibataire',
      nombreEnfants: 'childrenCount' in employee ? Number(employee.childrenCount) : 0,
      nombreParts: calculateNombreParts(
        'maritalStatus' in employee ? (employee.maritalStatus as string) : undefined,
        'childrenCount' in employee ? Number(employee.childrenCount) : 0
      ),
      indice: undefined, // À enrichir si disponible
      niveau: undefined, // À enrichir si disponible
      niu: 'niu' in employee ? (employee.niu as string) : undefined,
      numeroCNSS: 'cnssNumber' in employee ? (employee.cnssNumber as string) : undefined,
      anciennete
    },
    rubriques: {
      gains: gains.map(g => ({
        code: g.code,
        designation: g.libelle,
        montant: g.montant,
        type: g.type,
        base: g.base,
        taux: g.taux,
        quantite: g.quantite
      })),
      retenues: retenues.map(r => ({
        code: r.code,
        designation: r.libelle,
        montant: r.montant,
        type: r.type,
        base: r.base,
        taux: r.taux
      }))
    },
    details: {
      gains,
      retenues,
      avantages: [] // Conservé pour compatibilité
    }
  }
}

/**
 * Formate une date en DD/MM/YYYY
 */
function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Calcule le nombre de parts fiscales
 */
function calculateNombreParts(maritalStatus?: string, childrenCount: number = 0): number {
  let parts = 1 // Célibataire par défaut

  if (maritalStatus === 'Marié' || maritalStatus === 'marie' || maritalStatus === 'married') {
    parts = 2
  }

  // Ajouter 0.5 part par enfant (simplifié)
  parts += childrenCount * 0.5

  return parts
}

/**
 * NOTE: Cette fonction n'est plus utilisée car on récupère maintenant
 * toutes les cotisations depuis bulletin.cotisations.rubriques
 */

/**
 * Extrait le salaire de base
 */
function getSalaireBase(bulletin: BulletinPaie): number {
  const salaireBase = bulletin.gains.rubriques.find(r =>
    r.code === '0100' ||
    r.libelle.toLowerCase().includes('salaire catégoriel') ||
    r.libelle.toLowerCase().includes('salaire de base')
  )
  return salaireBase?.montant || 0
}

/**
 * Détermine le type de gain selon le code
 */
function determineGainType(code: string): 'GAIN_BRUT' | 'GAIN_NON_SOUMIS' {
  // Codes 5xxx = Gains non soumis
  if (code.startsWith('5')) {
    return 'GAIN_NON_SOUMIS'
  }
  // Tous les autres gains sont des gains bruts soumis
  return 'GAIN_BRUT'
}

/**
 * Détermine le type de retenue selon le code
 */
function determineRetenueType(code: string): 'COTISATION' | 'RETENUE_NON_SOUMISE' | 'ELEMENT_NON_IMPOSABLE' {
  // Codes 3xxx = Cotisations
  if (code.startsWith('3')) {
    return 'COTISATION'
  }
  // Codes 6xxx = Retenues non soumises
  if (code.startsWith('6')) {
    return 'RETENUE_NON_SOUMISE'
  }
  // Codes 9xxx = Éléments non imposables
  if (code.startsWith('9')) {
    return 'ELEMENT_NON_IMPOSABLE'
  }
  // Par défaut, retenue non soumise
  return 'RETENUE_NON_SOUMISE'
}

/**
 * Extrait la base de calcul d'une rubrique
 */
function extractBase(rubrique: any): number | undefined {
  // Si la rubrique a un mode de calcul avec une base, l'utiliser
  if (rubrique.modeCalcul?.type === 'TAUX' && typeof rubrique.montant === 'number') {
    // Calculer la base à partir du montant et du taux si disponible
    const taux = rubrique.modeCalcul.valeur
    if (taux && taux > 0) {
      return Math.round(rubrique.montant / (taux / 100))
    }
  }
  return undefined
}

/**
 * Extrait le taux d'une rubrique
 */
function extractTaux(rubrique: any): string | undefined {
  if (rubrique.modeCalcul?.type === 'TAUX') {
    const valeur = rubrique.modeCalcul.valeur
    if (typeof valeur === 'number') {
      return `${valeur}%`
    }
  }
  return undefined
}