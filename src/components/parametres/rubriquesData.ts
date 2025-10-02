export interface Rubrique {
  code: string
  libelle: string
  type: 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE' | 'ELEMENT_NON_IMPOSABLE'
  base: string
  taux: number | null
  formule: string
  imposable: boolean
  isActive: boolean
}

export const rubriquesDiponibles: Rubrique[] = [
  // === GAINS DU BRUT (001-099) - Éléments soumis aux cotisations ===
  { code: '0100', libelle: 'Salaire catégoriel', type: 'GAIN_BRUT', base: 'Convention + Jours travaillés', taux: null, formule: 'calculerSalaireBase(categorieProfessionnelle, echelon, joursTravailles)', imposable: true, isActive: true },
  { code: '0110', libelle: 'Sursalaire', type: 'GAIN_BRUT', base: 'Fixe négocié + Jours travaillés', taux: null, formule: 'montantSursalaire * (joursTravailles/26)', imposable: true, isActive: false },
  { code: '0120', libelle: 'Jours absents', type: 'GAIN_BRUT', base: 'Salaire base + Sursalaire', taux: null, formule: '-((salaireBase + sursalaire) / 26) * joursAbsents', imposable: true, isActive: false },
  { code: '1010', libelle: 'Prime ancienneté', type: 'GAIN_BRUT', base: 'Salaire base', taux: null, formule: 'calculerPrimeAnciennete(salaireBase, anneesAnciennete)', imposable: true, isActive: false },
  { code: '1110', libelle: 'Forfait heures supplémentaires', type: 'GAIN_BRUT', base: 'Fixe', taux: null, formule: '', imposable: true, isActive: false },
  { code: '1020', libelle: 'Prime de logement', type: 'GAIN_BRUT', base: 'Fixe', taux: null, formule: '', imposable: true, isActive: false },
  { code: '1170', libelle: 'Indemnité de caisse', type: 'GAIN_BRUT', base: 'Fixe', taux: null, formule: '', imposable: true, isActive: false },
  { code: '1030', libelle: 'Prime de rendement', type: 'GAIN_BRUT', base: 'Variable', taux: null, formule: '', imposable: true, isActive: false },
  { code: '1070', libelle: 'Allocation congés', type: 'GAIN_BRUT', base: 'Salaire moyen', taux: null, formule: 'calculerAllocationConge(salaireMoyen12Mois, joursConges)', imposable: true, isActive: false },
  { code: '1040', libelle: 'Congés maternité', type: 'GAIN_BRUT', base: 'Salaire mensuel', taux: 50, formule: 'salaireMensuel * 0.50 * (semainesMaternite / 4.33)', imposable: true, isActive: false },
  { code: '1060', libelle: 'Indemnité de départ à la retraite', type: 'GAIN_BRUT', base: 'Salaire mensuel', taux: null, formule: 'calculerIndemniteRetraite(salaireMensuel, anneesAnciennete)', imposable: true, isActive: false },
  { code: '5110', libelle: 'Indemnité licenciement compression', type: 'GAIN_NON_SOUMIS', base: 'Salaire moyen 12 mois', taux: 15, formule: 'calculerIndemniteLicenciementCompression(salaireMoyen12Mois, anneesAnciennete)', imposable: false, isActive: false },
  { code: '5040', libelle: 'Indemnité de licenciement', type: 'GAIN_NON_SOUMIS', base: 'Salaire moyen 12 mois', taux: null, formule: 'calculerIndemniteLicenciement(salaireMoyen12Mois, moisAnciennete)', imposable: false, isActive: false },
  { code: '1050', libelle: 'Prime de fin d\'année', type: 'GAIN_BRUT', base: 'Salaire de base', taux: null, formule: 'calculerPrimeFinAnnee(salaireBase, moisAnciennete, dateEmbauche, sanctions)', imposable: true, isActive: false },
  { code: '1090', libelle: 'Commission de vente', type: 'GAIN_BRUT', base: 'Chiffre affaires', taux: null, formule: '', imposable: true, isActive: false },
  { code: '1120', libelle: 'Heures supplémentaires (10%)', type: 'GAIN_BRUT', base: 'Taux horaire', taux: 10, formule: 'tauxHoraire * heuresSup10 * 1.10', imposable: true, isActive: false },
  { code: '1130', libelle: 'Heures supplémentaires (25%)', type: 'GAIN_BRUT', base: 'Taux horaire', taux: 25, formule: 'tauxHoraire * heuresSup25 * 1.25', imposable: true, isActive: false },
  { code: '1210', libelle: 'Prime de diplôme', type: 'GAIN_BRUT', base: 'Fixe mensuel', taux: null, formule: '', imposable: true, isActive: false },
  { code: '1220', libelle: 'Prime de langue', type: 'GAIN_BRUT', base: 'Par langue', taux: null, formule: 'montantBase * nombreLangues', imposable: true, isActive: false },

  // AVANTAGES EN NATURE IMPOSABLES (13xx) - Gains du brut
  { code: '1310', libelle: 'Avantage en nature logement', type: 'GAIN_BRUT', base: 'Salaire plafonné', taux: 20, formule: 'MIN(salaireBrut, 1200000) * 0.20', imposable: true, isActive: false },
  { code: '1340', libelle: 'Avantage en nature domesticité', type: 'GAIN_BRUT', base: 'Salaire brut', taux: 7, formule: 'salaireBrut * 0.07', imposable: true, isActive: false },
  { code: '1330', libelle: 'Avantage en nature eau/éclaire/gaz', type: 'GAIN_BRUT', base: 'Salaire brut', taux: 5, formule: 'salaireBrut * 0.05', imposable: true, isActive: false },
  { code: '1320', libelle: 'Avantage en nature téléphone', type: 'GAIN_BRUT', base: 'Salaire brut', taux: 2, formule: 'salaireBrut * 0.02', imposable: true, isActive: false },
  { code: '1350', libelle: 'Avantage en nature voiture', type: 'GAIN_BRUT', base: 'Salaire brut', taux: 3, formule: 'salaireBrut * 0.03', imposable: true, isActive: false },
  { code: '1360', libelle: 'Avantage en nature nourriture', type: 'GAIN_BRUT', base: 'Salaire brut', taux: 20, formule: 'salaireBrut * 0.20', imposable: true, isActive: false },

  // GAINS NON SOUMIS (050-099)
  { code: '1190', libelle: 'Indemnité de stage', type: 'GAIN_BRUT', base: 'Fixe', taux: null, formule: '', imposable: true, isActive: false },
  { code: '1180', libelle: 'Indemnité de fonction', type: 'GAIN_BRUT', base: 'Fixe', taux: null, formule: '', imposable: true, isActive: false },
  { code: '1160', libelle: 'Gratification', type: 'GAIN_BRUT', base: 'Fixe', taux: null, formule: '', imposable: true, isActive: false },
  { code: '1080', libelle: 'Jours congés supplémentaires', type: 'GAIN_BRUT', base: 'Ancienneté', taux: null, formule: 'calculerCongesSupplementaires(anneesAnciennete)', imposable: true, isActive: false },

// COTISATIONS (101-199)
  // CNSS (101-104)
  { code: '3100', libelle: 'Retenue CNSS', type: 'COTISATION', base: 'Salaire brut plafonné', taux: null, formule: 'MIN(salaireBrut, 1200000) * 0.12', imposable: false, isActive: true },
  { code: '3110', libelle: 'SS - Allocations familiales', type: 'COTISATION', base: 'Salaire brut plafonné', taux: 10.03, formule: 'MIN(salaireBrut, 600000) * 0.1003', imposable: false, isActive: true },
  { code: '3120', libelle: 'SS - Accident de travail', type: 'COTISATION', base: 'Salaire brut plafonné', taux: 2.25, formule: 'MIN(salaireBrut, 600000) * 0.0225', imposable: false, isActive: true },

  // IRPP et taxes diverses (35xx)
  { code: '3510', libelle: 'Retenue IRPP du mois', type: 'COTISATION', base: 'Salaire imposable', taux: null, formule: 'calculerIRPPMensuel(salaireBrut, avantagesNature, situationFamiliale, nbEnfants)', imposable: false, isActive: true },
  { code: '3520', libelle: 'Régularisation IRPP', type: 'COTISATION', base: 'Fixe', taux: null, formule: '', imposable: false, isActive: false },
  { code: '3530', libelle: 'Taxe unique sur salaire', type: 'COTISATION', base: 'Salaire brut', taux: 4.125, formule: 'salaireBrut * 0.04125', imposable: false, isActive: true },
  { code: '3130', libelle: 'SS - Taxe unique sur salaire', type: 'COTISATION', base: 'Salaire brut', taux: 3.375, formule: 'salaireBrut * 0.03375', imposable: false, isActive: true },
  { code: '3540', libelle: 'Retenue CAMU', type: 'COTISATION', base: 'Excédent > 500 000 FCFA', taux: 0.5, formule: 'MAX(0, (salaireBrut - cotisationsSociales - 500000) * 0.005)', imposable: false, isActive: true },
  { code: '3550', libelle: 'Taxe sur les locaux (local)', type: 'COTISATION', base: 'Fixe mensuel', taux: null, formule: '1000', imposable: false, isActive: true },
  { code: '3560', libelle: 'Taxe sur les locaux (Expat)', type: 'COTISATION', base: 'Fixe mensuel', taux: null, formule: '5000', imposable: false, isActive: false },
  { code: '3570', libelle: 'Taxe régionale', type: 'COTISATION', base: 'Fixe mensuel', taux: null, formule: '2400', imposable: false, isActive: false },

  // GAINS NON SOUMIS - Article 38 CGI (50xx)
  { code: '5010', libelle: 'Indemnité de transport', type: 'GAIN_NON_SOUMIS', base: 'Fixe mensuel', taux: null, formule: '', imposable: false, isActive: true },
  { code: '5020', libelle: 'Prime de salissure', type: 'GAIN_NON_SOUMIS', base: 'Fixe mensuel', taux: null, formule: '', imposable: false, isActive: false },
  { code: '5030', libelle: 'Prime de panier', type: 'GAIN_NON_SOUMIS', base: 'Fixe', taux: null, formule: 'montantBasePanier * nombreJoursProlongation', imposable: false, isActive: false },

  // RETENUES NON SOUMISES (61xx)
  { code: '6110', libelle: 'Retenue pharmacie', type: 'RETENUE_NON_SOUMISE', base: 'Fixe', taux: null, formule: '', imposable: false, isActive: false },
  { code: '6120', libelle: 'Retenue avance sur salaire', type: 'RETENUE_NON_SOUMISE', base: 'Fixe', taux: null, formule: '', imposable: false, isActive: false },
  { code: '5050', libelle: 'Remboursement FRAIS', type: 'GAIN_NON_SOUMIS', base: 'Fixe', taux: null, formule: '', imposable: false, isActive: false },
  { code: '6140', libelle: 'Retenue PRET', type: 'RETENUE_NON_SOUMISE', base: 'Fixe', taux: null, formule: '', imposable: false, isActive: false },

  // CALCULS AUTOMATIQUES (91xx)
  { code: '9110', libelle: 'Arrondi net à payer', type: 'ELEMENT_NON_IMPOSABLE', base: 'Net à payer', taux: null, formule: 'arrondirNetAPayer(netAPayer)', imposable: false, isActive: false },
]