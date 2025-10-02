import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Paramètres fiscaux Congo 2024
const PARAMETRES_FISCAUX = [
  { code: 'CNSS_EMPLOYE', libelle: 'CNSS - Part salariale', type: 'TAUX', value: 4.0, unit: '%', description: 'Cotisation CNSS salarié (assurance vieillesse)' },
  { code: 'CNSS_EMPLOYEUR', libelle: 'CNSS - Part patronale', type: 'TAUX', value: 8.0, unit: '%', description: 'Cotisation CNSS employeur (assurance vieillesse)' },
  { code: 'CNSS_PLAFOND', libelle: 'CNSS - Plafond mensuel', type: 'PLAFOND', value: 1200000, unit: 'FCFA', description: 'Plafond mensuel CNSS' },
  { code: 'CAMU_CONTRIBUTION', libelle: 'CAMU - Contribution solidarité', type: 'TAUX', value: 0.5, unit: '%', description: 'Contribution CAMU (loi 2022)' },
  { code: 'CAMU_SEUIL', libelle: 'CAMU - Seuil exonération', type: 'SEUIL', value: 500000, unit: 'FCFA', description: 'Seuil exonération CAMU' },
  { code: 'AF_TAUX', libelle: 'Allocations familiales', type: 'TAUX', value: 10.03, unit: '%', description: 'Allocations familiales (patronal)' },
  { code: 'AF_PLAFOND', libelle: 'AF - Plafond', type: 'PLAFOND', value: 600000, unit: 'FCFA', description: 'Plafond mensuel AF' },
  { code: 'AT_TAUX', libelle: 'Accidents du travail', type: 'TAUX', value: 2.25, unit: '%', description: 'Accidents du travail (patronal)' },
  { code: 'AT_PLAFOND', libelle: 'AT - Plafond', type: 'PLAFOND', value: 600000, unit: 'FCFA', description: 'Plafond mensuel AT' },
  { code: 'TUS_SS_TAUX', libelle: 'TUS - Part Santé/Social', type: 'TAUX', value: 3.375, unit: '%', description: 'TUS Santé/Social (Article 6)' },
  { code: 'TUS_TAUX', libelle: 'TUS - Part principale', type: 'TAUX', value: 4.125, unit: '%', description: 'TUS principale (Article 6)' },
  { code: 'TUS_TOTAL', libelle: 'TUS - Total', type: 'TAUX', value: 7.5, unit: '%', description: 'TUS total = 3.375% + 4.125%' },
  { code: 'IRPP_ABATTEMENT', libelle: 'IRPP - Abattement', type: 'TAUX', value: 20, unit: '%', description: 'Abattement forfaitaire IRPP' },
  { code: 'EXONERATION_FRAIS', libelle: 'Exonération frais emploi', type: 'TAUX', value: 15, unit: '%', description: 'Exonération allocations (Article 38)' },
  { code: 'HEURES_LEGALES_MOIS', libelle: 'Heures légales mensuelles', type: 'MONTANT', value: 173.33, unit: 'heures', description: 'Base légale: 40h/semaine = 173.33h/mois' },
  { code: 'HS_JOUR_PREMIERES', libelle: 'HS Jour - 1ères heures', type: 'TAUX', value: 10, unit: '%', description: 'Majoration heures sup jour - 1ères heures' },
  { code: 'HS_JOUR_SUIVANTES', libelle: 'HS Jour - Heures suivantes', type: 'TAUX', value: 25, unit: '%', description: 'Majoration heures sup jour - heures suivantes' },
  { code: 'HS_NUIT_OUVRABLE', libelle: 'HS Nuit ouvrables', type: 'TAUX', value: 50, unit: '%', description: 'Majoration heures sup nuit jours ouvrables' },
  { code: 'HS_JOUR_REPOS', libelle: 'HS Jour repos/férié', type: 'TAUX', value: 50, unit: '%', description: 'Majoration heures sup jour repos/férié' },
  { code: 'HS_NUIT_REPOS', libelle: 'HS Nuit repos/férié', type: 'TAUX', value: 100, unit: '%', description: 'Majoration heures sup nuit repos/férié' }
]

// Barème IRPP CGI Article 95
const BAREME_IRPP = [
  { ordre: 1, seuil_min: 0, seuil_max: 464000, taux: 1, description: "Jusqu'à 464.000 FCFA" },
  { ordre: 2, seuil_min: 464001, seuil_max: 1000000, taux: 10, description: "464.001 à 1.000.000 FCFA" },
  { ordre: 3, seuil_min: 1000001, seuil_max: 3000000, taux: 25, description: "1.000.001 à 3.000.000 FCFA" },
  { ordre: 4, seuil_min: 3000001, seuil_max: null, taux: 40, description: "Au-dessus de 3.000.000 FCFA" }
]

async function seedForTenant(tenant: any, dateEffet: Date) {
  console.log(`\n📊 ${tenant.companyName}`)

  let statsParams = { created: 0, existing: 0 }
  let statsIrpp = { created: 0, existing: 0 }

  // Paramètres fiscaux
  for (const param of PARAMETRES_FISCAUX) {
    const exists = await prisma.fiscalParameter.findFirst({
      where: { tenantId: tenant.id, code: param.code, dateEffet }
    })

    if (exists) {
      statsParams.existing++
    } else {
      await prisma.fiscalParameter.create({
        data: { ...param, tenantId: tenant.id, isActive: true, dateEffet, dateFin: null, type: param.type as any }
      })
      console.log(`  ✅ ${param.code} (${param.value}${param.unit})`)
      statsParams.created++
    }
  }

  // Barème IRPP
  for (const tranche of BAREME_IRPP) {
    const exists = await prisma.irppTranche.findFirst({
      where: { tenantId: tenant.id, ordre: tranche.ordre, dateEffet }
    })

    if (exists) {
      statsIrpp.existing++
    } else {
      await prisma.irppTranche.create({
        data: { ...tranche, tenantId: tenant.id, isActive: true, dateEffet, dateFin: null }
      })
      console.log(`  ✅ IRPP Tranche ${tranche.ordre}: ${tranche.taux}%`)
      statsIrpp.created++
    }
  }

  console.log(`  📈 Params: ${statsParams.created} créés, ${statsParams.existing} existants`)
  console.log(`  📈 IRPP: ${statsIrpp.created} créés, ${statsIrpp.existing} existants`)
}

async function main() {
  console.log('🌱 Seed des paramètres fiscaux et barème IRPP...')

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
