import { PrismaClient } from '@prisma/client'
import { rubriquesDiponibles } from '../src/components/parametres/rubriquesData'

const prisma = new PrismaClient()

async function seedRubriques() {
  console.log('🌱 Seed des rubriques...')

  // Récupérer tous les tenants
  const tenants = await prisma.tenant.findMany()

  if (tenants.length === 0) {
    console.log('❌ Aucun tenant trouvé. Créez d\'abord un tenant.')
    return
  }

  let totalCreated = 0

  for (const tenant of tenants) {
    console.log(`\n📊 Import des rubriques pour le tenant: ${tenant.companyName} (${tenant.id})`)

    for (const [index, rubrique] of rubriquesDiponibles.entries()) {
      try {
        // Vérifier si la rubrique existe déjà
        const existing = await prisma.rubrique.findUnique({
          where: {
            tenantId_code: {
              tenantId: tenant.id,
              code: rubrique.code
            }
          }
        })

        if (existing) {
          console.log(`  ⏭️  ${rubrique.code} - ${rubrique.libelle} (existe déjà)`)
          continue
        }

        // Créer la rubrique
        await prisma.rubrique.create({
          data: {
            tenantId: tenant.id,
            code: rubrique.code,
            libelle: rubrique.libelle,
            type: rubrique.type,
            base: rubrique.base,
            taux: rubrique.taux !== null ? rubrique.taux : null,
            formule: rubrique.formule,
            imposable: rubrique.imposable,
            isActive: rubrique.isActive,
            ordre: index + 1
          }
        })

        console.log(`  ✅ ${rubrique.code} - ${rubrique.libelle}`)
        totalCreated++
      } catch (error) {
        console.error(`  ❌ Erreur pour ${rubrique.code}:`, error)
      }
    }
  }

  console.log(`\n✨ ${totalCreated} rubriques importées avec succès!`)
}

seedRubriques()
  .catch((error) => {
    console.error('❌ Erreur lors du seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
