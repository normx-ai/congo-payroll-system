// Types basés sur le Code général des impôts Congo Brazzaville
export interface FiscalRegime {
  type: 'forfait' | 'reel'
  turnoverThreshold: number
  description: string
  requirements: string[]
}

export const FISCAL_REGIMES: Record<string, FiscalRegime> = {
  forfait: {
    type: 'forfait',
    turnoverThreshold: 100_000_000, // 100M FCFA
    description: 'Régime du forfait (CA < 100M FCFA)',
    requirements: [
      'Registre de recettes et dépenses',
      'Système minimal de trésorerie (SMT)',
      'Déclaration trimestrielle des fournisseurs'
    ]
  },
  reel: {
    type: 'reel',
    turnoverThreshold: 100_000_000, // 100M FCFA et +
    description: 'Régime du réel (CA ≥ 100M FCFA)',
    requirements: [
      'Comptabilité complète OHADA',
      'États financiers certifiés',
      'Télé-déclaration obligatoire',
      'Livre-journal et grand-livre'
    ]
  }
}

export const EXCLUDED_FROM_FORFAIT = [
  'Sociétés (toute forme juridique)',
  'Professions réglementées',
  'Boulangers',
  'Entrepreneurs de travaux',
  'Exploitants de quincailleries',
  'Grossistes',
  'Importateurs'
]

export interface EntityType {
  id: 'company' | 'cabinet'
  label: string
  description: string
  fiscalConstraints: string[]
}

export const ENTITY_TYPES: EntityType[] = [
  {
    id: 'company',
    label: 'Entreprise',
    description: 'Entreprise individuelle ou société',
    fiscalConstraints: ['Peut choisir forfait ou réel selon CA']
  },
  {
    id: 'cabinet',
    label: 'Cabinet',
    description: 'Cabinet comptable multi-entreprises',
    fiscalConstraints: ['Gestion de plusieurs entreprises clientes']
  }
]