/**
 * Test de validation OpenAI
 * Vérifie que la connexion à l'API OpenAI fonctionne correctement
 */

import { ChatOpenAI } from '@langchain/openai'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

async function testOpenAIConnection() {
  console.log('🔍 Test de validation OpenAI...\n')

  try {
    // Vérifier que la clé API existe
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('❌ OPENAI_API_KEY non trouvée dans .env')
    }

    console.log('✅ Clé API trouvée')
    console.log(`   Format: ${process.env.OPENAI_API_KEY.substring(0, 10)}...`)

    // Créer une instance du modèle
    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.1,
      maxTokens: 100,
    })

    console.log('\n📡 Envoi d\'une requête test à OpenAI...')

    // Test simple
    const startTime = Date.now()
    const response = await llm.invoke('Dis bonjour en français en une phrase courte.')
    const duration = Date.now() - startTime

    console.log(`\n✅ Réponse reçue en ${duration}ms`)
    console.log(`📝 Réponse: ${response.content}`)

    // Test spécifique Congo
    console.log('\n🇨🇬 Test contexte Congo (calcul paie)...')
    const congResponse = await llm.invoke(
      'Quel est le taux de cotisation CNSS employé en République du Congo ? Réponds en une phrase.'
    )

    console.log(`📝 Réponse: ${congResponse.content}`)

    console.log('\n✅ ✅ ✅ Tous les tests passés avec succès!')
    console.log('\n📊 Résumé:')
    console.log(`   - Connexion OpenAI: OK`)
    console.log(`   - Modèle utilisé: gpt-3.5-turbo`)
    console.log(`   - Latence: ${duration}ms`)
    console.log(`   - Coût estimé: ~$0.001`)

    return true
  } catch (error) {
    console.error('\n❌ Erreur lors du test:')
    if (error instanceof Error) {
      console.error(`   ${error.message}`)

      // Erreurs courantes
      if (error.message.includes('401')) {
        console.error('\n💡 Solution: Vérifiez que votre clé API est valide')
        console.error('   https://platform.openai.com/api-keys')
      } else if (error.message.includes('429')) {
        console.error('\n💡 Solution: Limite de taux atteinte. Attendez 1 minute.')
      } else if (error.message.includes('insufficient_quota')) {
        console.error('\n💡 Solution: Ajoutez du crédit sur votre compte OpenAI')
        console.error('   https://platform.openai.com/account/billing')
      }
    }

    return false
  }
}

// Exécuter le test
testOpenAIConnection()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
