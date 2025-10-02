import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanTestData() {
  try {
    // Supprimer toutes les charges fixes de test
    const deletedCharges = await prisma.employeeChargeFixe.deleteMany({
      where: {
        OR: [
          { rubriqueCode: '113' }, // TOL Périphérie
          { rubriqueCode: '200' }  // Indemnité de transport
        ]
      }
    })

    console.log(`${deletedCharges.count} charges fixes supprimées`)

    // Lister les employés existants pour information
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true
      },
      take: 5
    })

    console.log('\nEmployés disponibles dans la base:')
    employees.forEach(emp => {
      console.log(`- ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) - ID: ${emp.id}`)
    })

    console.log('\nDonnées de test supprimées. Vous pouvez maintenant configurer les charges fixes via l\'interface.')
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanTestData()