import { PrismaClient, TypeConstante } from '@prisma/client'

const prisma = new PrismaClient()

// Constantes légales - Droit du travail Congo
const CONSTANTES_LEGALES = [
  // ===== TEMPS DE TRAVAIL =====
  {
    type: TypeConstante.TEMPS_TRAVAIL,
    code: 'HEURES_SEMAINE',
    libelle: 'Durée légale hebdomadaire du travail',
    valeur: 40,
    unite: 'heures',
    description: 'Durée légale du travail : 40 heures par semaine (Code du travail congolais)'
  },
  {
    type: TypeConstante.TEMPS_TRAVAIL,
    code: 'HEURES_JOUR',
    libelle: 'Durée maximale quotidienne du travail',
    valeur: 8,
    unite: 'heures',
    description: 'Durée maximale journalière : 8 heures par jour (Code du travail congolais)'
  },
  {
    type: TypeConstante.TEMPS_TRAVAIL,
    code: 'HEURES_MOIS',
    libelle: 'Nombre d\'heures légales par mois',
    valeur: 173.33,
    unite: 'heures',
    description: 'Calcul : 40h/semaine × 52 semaines / 12 mois = 173.33 heures/mois'
  },
  {
    type: TypeConstante.TEMPS_TRAVAIL,
    code: 'JOURS_SEMAINE',
    libelle: 'Nombre de jours travaillés par semaine',
    valeur: 5,
    unite: 'jours',
    description: 'Semaine de travail standard : 5 jours ouvrables (lundi à vendredi)'
  },

  // ===== CONGÉS =====
  {
    type: TypeConstante.CONGES,
    code: 'CONGES_ANNUELS_BASE',
    libelle: 'Congés payés annuels de base',
    valeur: 26,
    unite: 'jours',
    description: 'Congés payés de base : 26 jours ouvrables par an (Code du travail congolais)'
  },
  {
    type: TypeConstante.CONGES,
    code: 'JOURS_OUVRABLE_MOIS',
    libelle: 'Nombre de jours ouvrables par mois',
    valeur: 26,
    unite: 'jours',
    description: 'Base de calcul des allocations de congé : 26 jours ouvrables par mois'
  },
  {
    type: TypeConstante.CONGES,
    code: 'CONGES_ACQUIS_PAR_MOIS',
    libelle: 'Jours de congés acquis par mois travaillé',
    valeur: 2.16,
    unite: 'jours',
    description: 'Calcul : 26 jours / 12 mois = 2.16 jours de congés acquis par mois'
  },
  {
    type: TypeConstante.CONGES,
    code: 'ANCIENNETE_MIN_CONGES',
    libelle: 'Ancienneté minimale pour prendre des congés',
    valeur: 12,
    unite: 'mois',
    description: 'L\'employé doit avoir au moins 12 mois d\'ancienneté pour prendre ses congés'
  },

  // ===== CONVERSIONS =====
  {
    type: TypeConstante.CONVERSION,
    code: 'SEMAINES_ANNEE',
    libelle: 'Nombre de semaines par an',
    valeur: 52,
    unite: 'semaines',
    description: 'Année standard : 52 semaines'
  },
  {
    type: TypeConstante.CONVERSION,
    code: 'SEMAINES_MOIS',
    libelle: 'Nombre de semaines par mois (moyenne)',
    valeur: 4.33,
    unite: 'semaines',
    description: 'Calcul : 52 semaines / 12 mois = 4.33 semaines/mois (utilisé pour indemnités maternité)'
  },
  {
    type: TypeConstante.CONVERSION,
    code: 'MOIS_ANNEE',
    libelle: 'Nombre de mois par an',
    valeur: 12,
    unite: 'mois',
    description: 'Année standard : 12 mois'
  },
  {
    type: TypeConstante.CONVERSION,
    code: 'JOURS_ANNEE',
    libelle: 'Nombre de jours par an (moyenne)',
    valeur: 365,
    unite: 'jours',
    description: 'Année standard : 365 jours (hors année bissextile)'
  },

  // ===== SEUILS LÉGAUX =====
  {
    type: TypeConstante.SEUIL_LEGAL,
    code: 'PRIME_ANCIENNETE_MIN',
    libelle: 'Ancienneté minimale pour prime d\'ancienneté',
    valeur: 2,
    unite: 'ans',
    description: 'Article 41 Convention Collective Commerce : prime d\'ancienneté dès 2 ans'
  },
  {
    type: TypeConstante.SEUIL_LEGAL,
    code: 'PRIME_ANCIENNETE_MAX_TAUX',
    libelle: 'Taux maximum de la prime d\'ancienneté',
    valeur: 30,
    unite: 'pourcent',
    description: 'Article 41 : plafond de 30% à partir de 30 ans d\'ancienneté'
  },
  {
    type: TypeConstante.SEUIL_LEGAL,
    code: 'INDEMNITE_LICENCIEMENT_MIN',
    libelle: 'Ancienneté minimale pour indemnité de licenciement',
    valeur: 18,
    unite: 'mois',
    description: 'Article 21 : indemnité de licenciement après 18 mois d\'ancienneté'
  },
  {
    type: TypeConstante.SEUIL_LEGAL,
    code: 'PARTS_FISCALES_MAX',
    libelle: 'Nombre maximum de parts fiscales (IRPP)',
    valeur: 6.5,
    unite: 'parts',
    description: 'Article 91 CGI : plafond du quotient familial à 6.5 parts'
  }
]

async function seedForTenant(tenant: { id: string; companyName: string }, dateEffet: Date) {
  console.log(`\n⚖️  ${tenant.companyName}`)

  const stats = { created: 0, existing: 0 }

  for (const constante of CONSTANTES_LEGALES) {
    const exists = await prisma.constanteLegale.findFirst({
      where: {
        tenantId: tenant.id,
        code: constante.code,
        dateEffet
      }
    })

    if (exists) {
      stats.existing++
    } else {
      await prisma.constanteLegale.create({
        data: {
          ...constante,
          tenantId: tenant.id,
          isActive: true,
          dateEffet,
          dateFin: null
        }
      })
      console.log(`  ✅ ${constante.code}: ${constante.valeur} ${constante.unite || ''}`)
      stats.created++
    }
  }

  console.log(`  📊 ${stats.created} créées, ${stats.existing} existantes`)
}

async function main() {
  console.log('🌱 Seed des constantes légales...')

  const tenants = await prisma.tenant.findMany()

  if (tenants.length === 0) {
    console.log('❌ Aucun tenant trouvé')
    return
  }

  const dateEffet = new Date('2024-01-01')

  for (const tenant of tenants) {
    await seedForTenant(tenant, dateEffet)
  }

  console.log(`\n✨ Import terminé!`)
}

main()
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
