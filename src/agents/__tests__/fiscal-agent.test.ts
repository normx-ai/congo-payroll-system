/**
 * Tests Agent Fiscal
 */

// Charger .env AVANT tout
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(__dirname, '../../../.env') })

import { FiscalAgent } from '../fiscal-agent'
import type { IRPPCalculationParams } from '../types'

// Tenant ID de test (à remplacer par un vrai si besoin)
const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000000'

async function runTests() {
  console.log('🧪 TESTS AGENT FISCAL\n')
  console.log('=' .repeat(60))

  const agent = new FiscalAgent()
  let passedTests = 0
  let totalTests = 0

  // Test 1: Question simple
  console.log('\n📝 Test 1: Question fiscale simple')
  console.log('-'.repeat(60))
  totalTests++

  try {
    const result = await agent.process({
      question: 'Quel est le barème IRPP en République du Congo ?',
      context: {
        tenantId: TEST_TENANT_ID,
        periode: new Date(),
      },
    })

    if (result.success && result.data) {
      console.log('✅ Test 1 RÉUSSI')
      console.log(`Réponse: ${String(result.data.answer).substring(0, 200)}...`)
      console.log(`Durée: ${result.metadata?.duration}ms`)
      console.log(`Coût estimé: $${result.metadata?.cost?.toFixed(4)}`)
      passedTests++
    } else {
      console.log('❌ Test 1 ÉCHOUÉ')
      console.log(`Erreur: ${result.error}`)
    }
  } catch (error) {
    console.log('❌ Test 1 ÉCHOUÉ (Exception)')
    console.error(error)
  }

  // Test 2: Calcul IRPP - Salaire moyen
  console.log('\n📝 Test 2: Calcul IRPP - Salaire 500,000 FCFA (0 enfant)')
  console.log('-'.repeat(60))
  totalTests++

  try {
    const params: IRPPCalculationParams = {
      salaireBrut: 500000,
      nombreEnfants: 0,
      situationFamiliale: 'celibataire',
      tenantId: TEST_TENANT_ID,
      periode: new Date(),
    }

    const result = await agent.calculateIRPP(params)

    if (result.success && result.data) {
      console.log('✅ Test 2 RÉUSSI')
      console.log(`Salaire brut: ${result.data.details.salaireBrut} FCFA`)
      console.log(`Abattement 20%: ${result.data.details.abattementForfaitaire} FCFA`)
      console.log(`Déduction enfants: ${result.data.details.deductionEnfants} FCFA`)
      console.log(`Revenu imposable: ${result.data.revenuImposable} FCFA`)
      console.log(`IRPP total: ${result.data.irppTotal} FCFA`)
      console.log(`Taux moyen: ${result.data.tauxMoyen}%`)
      console.log(`\nExplication: ${result.data.explication}`)
      console.log(`\nDurée: ${result.metadata?.duration}ms`)
      passedTests++
    } else {
      console.log('❌ Test 2 ÉCHOUÉ')
      console.log(`Erreur: ${result.error}`)
    }
  } catch (error) {
    console.log('❌ Test 2 ÉCHOUÉ (Exception)')
    console.error(error)
  }

  // Test 3: Calcul IRPP - Salaire élevé avec enfants
  console.log('\n📝 Test 3: Calcul IRPP - Salaire 1,500,000 FCFA (3 enfants)')
  console.log('-'.repeat(60))
  totalTests++

  try {
    const params: IRPPCalculationParams = {
      salaireBrut: 1500000,
      nombreEnfants: 3,
      situationFamiliale: 'marie',
      tenantId: TEST_TENANT_ID,
      periode: new Date(),
    }

    const result = await agent.calculateIRPP(params)

    if (result.success && result.data) {
      console.log('✅ Test 3 RÉUSSI')
      console.log(`Salaire brut: ${result.data.details.salaireBrut} FCFA`)
      console.log(`Abattement 20%: ${result.data.details.abattementForfaitaire} FCFA`)
      console.log(`Déduction 3 enfants: ${result.data.details.deductionEnfants} FCFA`)
      console.log(`Revenu imposable: ${result.data.revenuImposable} FCFA`)
      console.log(`IRPP total: ${result.data.irppTotal} FCFA`)
      console.log(`Taux moyen: ${result.data.tauxMoyen}%`)

      console.log('\nDétail par tranches:')
      result.data.details.tranches.forEach((t, i) => {
        if (t.montantTranche > 0) {
          console.log(
            `  Tranche ${i + 1}: ${t.montantTranche} FCFA × ${t.taux}% = ${t.irppTranche} FCFA`
          )
        }
      })

      console.log(`\nExplication: ${result.data.explication}`)
      console.log(`\nDurée: ${result.metadata?.duration}ms`)
      passedTests++
    } else {
      console.log('❌ Test 3 ÉCHOUÉ')
      console.log(`Erreur: ${result.error}`)
    }
  } catch (error) {
    console.log('❌ Test 3 ÉCHOUÉ (Exception)')
    console.error(error)
  }

  // Test 4: Calcul IRPP - Bas salaire
  console.log('\n📝 Test 4: Calcul IRPP - Salaire 300,000 FCFA (2 enfants)')
  console.log('-'.repeat(60))
  totalTests++

  try {
    const params: IRPPCalculationParams = {
      salaireBrut: 300000,
      nombreEnfants: 2,
      situationFamiliale: 'marie',
      tenantId: TEST_TENANT_ID,
      periode: new Date(),
    }

    const result = await agent.calculateIRPP(params)

    if (result.success && result.data) {
      console.log('✅ Test 4 RÉUSSI')
      console.log(`Salaire brut: ${result.data.details.salaireBrut} FCFA`)
      console.log(`Revenu imposable: ${result.data.revenuImposable} FCFA`)
      console.log(`IRPP total: ${result.data.irppTotal} FCFA`)
      console.log(`Taux moyen: ${result.data.tauxMoyen}%`)
      console.log(`\nDurée: ${result.metadata?.duration}ms`)
      passedTests++
    } else {
      console.log('❌ Test 4 ÉCHOUÉ')
      console.log(`Erreur: ${result.error}`)
    }
  } catch (error) {
    console.log('❌ Test 4 ÉCHOUÉ (Exception)')
    console.error(error)
  }

  // Résumé final
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ DES TESTS')
  console.log('='.repeat(60))
  console.log(`Tests réussis: ${passedTests}/${totalTests}`)
  console.log(`Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%`)

  if (passedTests === totalTests) {
    console.log('\n🎉 ✅ TOUS LES TESTS SONT PASSÉS !')
    console.log('\n✨ L\'Agent Fiscal est opérationnel !')
    console.log('\n📋 Prochaine étape: Créer l\'interface UI (Phase 4)')
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} test(s) échoué(s)`)
    console.log('Vérifiez les erreurs ci-dessus.')
  }

  return passedTests === totalTests
}

// Exécuter les tests
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale lors des tests:', error)
    process.exit(1)
  })
