import { PrismaClient, SituationFamiliale } from '@prisma/client'

const prisma = new PrismaClient()

// Barème du quotient familial - Article 91 CGI Congo
// Basé sur TABLE_PARTS_FISCALES de src/lib/fiscal/quotient-familial.ts
const BAREME_QUOTIENT_FAMILIAL = [
  // Célibataire
  {
    situationFamiliale: SituationFamiliale.CELIBATAIRE,
    nbEnfantsMin: 0,
    nbEnfantsMax: 0,
    parts: 1,
    description: 'Célibataire sans enfant à charge',
    ordre: 1
  },
  {
    situationFamiliale: SituationFamiliale.CELIBATAIRE,
    nbEnfantsMin: 1,
    nbEnfantsMax: 1,
    parts: 2,
    description: 'Célibataire avec un enfant à charge',
    ordre: 2
  },
  {
    situationFamiliale: SituationFamiliale.CELIBATAIRE,
    nbEnfantsMin: 2,
    nbEnfantsMax: 2,
    parts: 2.5,
    description: 'Célibataire avec deux enfants à charge',
    ordre: 3
  },
  {
    situationFamiliale: SituationFamiliale.CELIBATAIRE,
    nbEnfantsMin: 3,
    nbEnfantsMax: 3,
    parts: 3,
    description: 'Célibataire avec trois enfants à charge',
    ordre: 4
  },
  {
    situationFamiliale: SituationFamiliale.CELIBATAIRE,
    nbEnfantsMin: 4,
    nbEnfantsMax: 4,
    parts: 3.5,
    description: 'Célibataire avec quatre enfants à charge',
    ordre: 5
  },
  {
    situationFamiliale: SituationFamiliale.CELIBATAIRE,
    nbEnfantsMin: 5,
    nbEnfantsMax: null, // illimité
    parts: 4,
    description: 'Célibataire avec cinq enfants ou plus à charge (plafond: 6.5 parts)',
    ordre: 6
  },

  // Divorcé (même règle que célibataire)
  {
    situationFamiliale: SituationFamiliale.DIVORCE,
    nbEnfantsMin: 0,
    nbEnfantsMax: 0,
    parts: 1,
    description: 'Divorcé sans enfant à charge',
    ordre: 7
  },
  {
    situationFamiliale: SituationFamiliale.DIVORCE,
    nbEnfantsMin: 1,
    nbEnfantsMax: 1,
    parts: 2,
    description: 'Divorcé avec un enfant à charge',
    ordre: 8
  },
  {
    situationFamiliale: SituationFamiliale.DIVORCE,
    nbEnfantsMin: 2,
    nbEnfantsMax: 2,
    parts: 2.5,
    description: 'Divorcé avec deux enfants à charge',
    ordre: 9
  },
  {
    situationFamiliale: SituationFamiliale.DIVORCE,
    nbEnfantsMin: 3,
    nbEnfantsMax: 3,
    parts: 3,
    description: 'Divorcé avec trois enfants à charge',
    ordre: 10
  },
  {
    situationFamiliale: SituationFamiliale.DIVORCE,
    nbEnfantsMin: 4,
    nbEnfantsMax: 4,
    parts: 3.5,
    description: 'Divorcé avec quatre enfants à charge',
    ordre: 11
  },
  {
    situationFamiliale: SituationFamiliale.DIVORCE,
    nbEnfantsMin: 5,
    nbEnfantsMax: null,
    parts: 4,
    description: 'Divorcé avec cinq enfants ou plus à charge (plafond: 6.5 parts)',
    ordre: 12
  },

  // Marié
  {
    situationFamiliale: SituationFamiliale.MARIE,
    nbEnfantsMin: 0,
    nbEnfantsMax: 0,
    parts: 2,
    description: 'Marié sans enfants à charge',
    ordre: 13
  },
  {
    situationFamiliale: SituationFamiliale.MARIE,
    nbEnfantsMin: 1,
    nbEnfantsMax: 1,
    parts: 2.5,
    description: 'Marié avec un enfant à charge',
    ordre: 14
  },
  {
    situationFamiliale: SituationFamiliale.MARIE,
    nbEnfantsMin: 2,
    nbEnfantsMax: 2,
    parts: 3,
    description: 'Marié avec deux enfants à charge',
    ordre: 15
  },
  {
    situationFamiliale: SituationFamiliale.MARIE,
    nbEnfantsMin: 3,
    nbEnfantsMax: 3,
    parts: 3.5,
    description: 'Marié avec trois enfants à charge',
    ordre: 16
  },
  {
    situationFamiliale: SituationFamiliale.MARIE,
    nbEnfantsMin: 4,
    nbEnfantsMax: 4,
    parts: 4,
    description: 'Marié avec quatre enfants à charge',
    ordre: 17
  },
  {
    situationFamiliale: SituationFamiliale.MARIE,
    nbEnfantsMin: 5,
    nbEnfantsMax: null,
    parts: 4.5,
    description: 'Marié avec cinq enfants ou plus à charge (plafond: 6.5 parts)',
    ordre: 18
  },

  // Veuf (même règle que marié)
  {
    situationFamiliale: SituationFamiliale.VEUF,
    nbEnfantsMin: 0,
    nbEnfantsMax: 0,
    parts: 2,
    description: 'Veuf sans enfant à charge',
    ordre: 19
  },
  {
    situationFamiliale: SituationFamiliale.VEUF,
    nbEnfantsMin: 1,
    nbEnfantsMax: 1,
    parts: 2.5,
    description: 'Veuf avec un enfant à charge',
    ordre: 20
  },
  {
    situationFamiliale: SituationFamiliale.VEUF,
    nbEnfantsMin: 2,
    nbEnfantsMax: 2,
    parts: 3,
    description: 'Veuf avec deux enfants à charge',
    ordre: 21
  },
  {
    situationFamiliale: SituationFamiliale.VEUF,
    nbEnfantsMin: 3,
    nbEnfantsMax: 3,
    parts: 3.5,
    description: 'Veuf avec trois enfants à charge',
    ordre: 22
  },
  {
    situationFamiliale: SituationFamiliale.VEUF,
    nbEnfantsMin: 4,
    nbEnfantsMax: 4,
    parts: 4,
    description: 'Veuf avec quatre enfants à charge',
    ordre: 23
  },
  {
    situationFamiliale: SituationFamiliale.VEUF,
    nbEnfantsMin: 5,
    nbEnfantsMax: null,
    parts: 4.5,
    description: 'Veuf avec cinq enfants ou plus à charge (plafond: 6.5 parts)',
    ordre: 24
  }
]

async function seedForTenant(tenant: { id: string; companyName: string }, dateEffet: Date) {
  console.log(`\n👨‍👩‍👧‍👦 ${tenant.companyName}`)

  const stats = { created: 0, existing: 0 }

  for (const bareme of BAREME_QUOTIENT_FAMILIAL) {
    const exists = await prisma.baremeQuotientFamilial.findFirst({
      where: {
        tenantId: tenant.id,
        situationFamiliale: bareme.situationFamiliale,
        nbEnfantsMin: bareme.nbEnfantsMin,
        nbEnfantsMax: bareme.nbEnfantsMax,
        dateEffet
      }
    })

    if (exists) {
      stats.existing++
    } else {
      await prisma.baremeQuotientFamilial.create({
        data: {
          ...bareme,
          tenantId: tenant.id,
          isActive: true,
          dateEffet,
          dateFin: null
        }
      })
      console.log(`  ✅ ${bareme.description}`)
      stats.created++
    }
  }

  console.log(`  📊 ${stats.created} créés, ${stats.existing} existants`)
}

async function main() {
  console.log('🌱 Seed du barème quotient familial...')

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
