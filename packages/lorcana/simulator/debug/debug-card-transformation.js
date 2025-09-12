// Debug script to investigate card transformation issues
// This script will check how cards are being transformed from database to entities

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { CardFactory } from '../utils/CardFactory.js'
import { TestDataLoader } from '../utils/TestDataLoader.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('=== Card Transformation Debug ===\n')

// Load test decks and card database
const testDecks = TestDataLoader.loadTestDecks()
const cardDatabase = TestDataLoader.loadCardDatabase()

console.log('1. Testing card transformation...')

// Test with a few cards from the database
const sampleCards = cardDatabase.slice(0, 3)
console.log('Sample cards from database:')
sampleCards.forEach((card) => {
  console.log(`  - ${card.Name} (${card.Type}, Cost: ${card.Cost})`)
})

console.log('\n2. Testing TestDataLoader.transformCardData...')
const transformedCards = sampleCards.map((card) =>
  TestDataLoader.transformCardData(card)
)
console.log('Transformed cards:')
transformedCards.forEach((card) => {
  console.log(
    `  - ${card.name} (${card.type}, Cost: ${card.cost}, ID: ${card.id})`
  )
})

console.log('\n3. Testing CardFactory.createCard...')
const createdCards = transformedCards.map((card) =>
  CardFactory.createCard(card)
)
console.log('Created card entities:')
createdCards.forEach((card) => {
  console.log(`  - ${card.name} (${card.constructor.name}, ID: ${card.id})`)
  console.log(
    `    Methods: ${Object.getOwnPropertyNames(Object.getPrototypeOf(card))}`
  )
})

console.log('\n4. Testing deck creation from test-decks.json...')
const deck1 = CardFactory.createDeckFromFormat(
  testDecks.deck1.slice(0, 3),
  cardDatabase
)
console.log(`Created deck with ${deck1.cards.length} cards:`)
deck1.cards.forEach((card, index) => {
  console.log(
    `  ${index + 1}. ${card.name} (${card.constructor.name}, ID: ${card.id})`
  )
  console.log(
    `     Methods: ${Object.getOwnPropertyNames(Object.getPrototypeOf(card))}`
  )
})

console.log('\n5. Testing specific card from test-decks.json...')
const testCardName = testDecks.deck1[0].name
console.log(`Looking for: "${testCardName}"`)

const foundCard = cardDatabase.find(
  (card) =>
    card.Name === testCardName ||
    card.Name.toLowerCase() === testCardName.toLowerCase()
)

if (foundCard) {
  console.log(`Found in database: "${foundCard.Name}"`)
  console.log(`Database properties: ${Object.keys(foundCard).join(', ')}`)

  const transformed = TestDataLoader.transformCardData(foundCard)
  console.log(`Transformed: ${JSON.stringify(transformed, null, 2)}`)

  const created = CardFactory.createCard(transformed)
  console.log(`Created entity: ${created.constructor.name}`)
  console.log(`Entity properties: ${Object.keys(created).join(', ')}`)
  console.log(
    `Entity methods: ${Object.getOwnPropertyNames(Object.getPrototypeOf(created))}`
  )
} else {
  console.log('❌ Card not found in database')
}

console.log('\n=== Debug Complete ===')
