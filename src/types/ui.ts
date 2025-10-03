// Types TypeScript pour les interfaces utilisateur

export interface Bulletin {
  id: string
  employee: {
    id: string
    matricule: string
    nom: string
    prenom: string
    poste: string
    department: string
  }
  periode: {
    year: number
    month: number
    libelle: string
  }
  montants: {
    salaireBase: number
    brut: number
    cotisations: number
    retenues: number
    net: number
  }
  status: {
    genere: boolean
    envoye: boolean
    dateCreation: string
  }
  notes?: string
}

export interface PayslipStats {
  totalBulletins: number
  totalSalaireBase: number
  totalBrut: number
  totalCotisations: number
  totalNet: number
  employesDistincts: number
}

export interface Rubrique {
  code: string
  libelle: string
  type: "GAIN_BRUT" | "COTISATION" | "GAIN_NON_SOUMIS" | "RETENUE_NON_SOUMISE" | "ELEMENT_NON_IMPOSABLE"
  isActive: boolean
  montant?: number
  valeurSaisie?: number | null
  utilisationFormule?: boolean
  base: string
  taux: number | null
  formule: string
  imposable: boolean
}