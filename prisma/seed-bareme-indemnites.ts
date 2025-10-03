import { PrismaClient, TypeIndemnite } from '@prisma/client'

const prisma = new PrismaClient()

// Barèmes d'indemnités Congo - Convention Collective Commerce
const BAREMES_INDEMNITES = [
  // Indemnité de départ à la retraite (Article 23)
  {
    type: TypeIndemnite.RETRAITE,
    libelle: 'Indemnité retraite - Moins de 10 ans',
    description: 'Moins de 10 ans d\'ancienneté : 5 mois de salaire',
    seuilMin: 0,
    seuilMax: 9,
    montantMois: 5,
    taux: null,
    ancienneteMinMois: 0,
    ordre: 1
  },
  {
    type: TypeIndemnite.RETRAITE,
    libelle: 'Indemnité retraite - 10 ans et plus',
    description: '10 ans et plus d\'ancienneté : 7 mois de salaire',
    seuilMin: 10,
    seuilMax: null,
    montantMois: 7,
    taux: null,
    ancienneteMinMois: 0,
    ordre: 2
  },

  // Indemnité de licenciement standard (Article 21) - Barème progressif
  {
    type: TypeIndemnite.LICENCIEMENT,
    libelle: 'Licenciement - 1 à 6 ans',
    description: '30% de la moyenne des 12 derniers mois × années d\'ancienneté',
    seuilMin: 1,
    seuilMax: 6,
    montantMois: null,
    taux: 30,
    ancienneteMinMois: 18,
    ordre: 3
  },
  {
    type: TypeIndemnite.LICENCIEMENT,
    libelle: 'Licenciement - 7 à 12 ans',
    description: '38% de la moyenne des 12 derniers mois × années d\'ancienneté',
    seuilMin: 7,
    seuilMax: 12,
    montantMois: null,
    taux: 38,
    ancienneteMinMois: 18,
    ordre: 4
  },
  {
    type: TypeIndemnite.LICENCIEMENT,
    libelle: 'Licenciement - 13 à 20 ans',
    description: '44% de la moyenne des 12 derniers mois × années d\'ancienneté',
    seuilMin: 13,
    seuilMax: 20,
    montantMois: null,
    taux: 44,
    ancienneteMinMois: 18,
    ordre: 5
  },
  {
    type: TypeIndemnite.LICENCIEMENT,
    libelle: 'Licenciement - 21 ans et plus',
    description: '50% de la moyenne des 12 derniers mois × années d\'ancienneté',
    seuilMin: 21,
    seuilMax: null,
    montantMois: null,
    taux: 50,
    ancienneteMinMois: 18,
    ordre: 6
  },

  // Indemnité de licenciement pour compression de personnel (Article 22)
  {
    type: TypeIndemnite.COMPRESSION,
    libelle: 'Compression de personnel',
    description: '15% de la moyenne des 12 derniers mois × années d\'ancienneté',
    seuilMin: 1,
    seuilMax: null,
    montantMois: null,
    taux: 15,
    ancienneteMinMois: 12,
    ordre: 7
  },

  // Indemnité de congé maternité (Article 27)
  {
    type: TypeIndemnite.MATERNITE,
    libelle: 'Congé maternité - Part employeur',
    description: '50% du salaire (l\'autre 50% est pris en charge par la CNSS)',
    seuilMin: null,
    seuilMax: null,
    montantMois: null,
    taux: 50,
    ancienneteMinMois: 0,
    ordre: 8
  },

  // Prime de fin d'année (Article 45)
  {
    type: TypeIndemnite.FIN_ANNEE,
    libelle: 'Prime de fin d\'année',
    description: '1 mois de salaire de base (prorata si embauche au 1er trimestre)',
    seuilMin: null,
    seuilMax: null,
    montantMois: 1,
    taux: null,
    ancienneteMinMois: 12,
    ordre: 9
  }
]

async function seedForTenant(tenant: { id: string; companyName: string }, dateEffet: Date) {
  console.log(`\n💰 ${tenant.companyName}`)

  const stats = { created: 0, existing: 0 }

  for (const bareme of BAREMES_INDEMNITES) {
    const exists = await prisma.baremeIndemnite.findFirst({
      where: {
        tenantId: tenant.id,
        type: bareme.type,
        ordre: bareme.ordre,
        dateEffet
      }
    })

    if (exists) {
      stats.existing++
    } else {
      await prisma.baremeIndemnite.create({
        data: {
          ...bareme,
          tenantId: tenant.id,
          isActive: true,
          dateEffet,
          dateFin: null
        }
      })
      console.log(`  ✅ ${bareme.libelle}`)
      stats.created++
    }
  }

  console.log(`  📊 ${stats.created} créés, ${stats.existing} existants`)
}

async function main() {
  console.log('🌱 Seed des barèmes d\'indemnités...')

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
