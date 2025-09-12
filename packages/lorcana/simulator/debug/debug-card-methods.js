// Debug script to check card entity methods and fix missing methods

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { CardFactory } from '../utils/CardFactory.js'
import { TestDataLoader } from '../utils/TestDataLoader.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('=== Card Methods Debug ===\n')

// Load test decks and create a sample card
const testDecks = TestDataLoader.loadTestDecks()
const cardDatabase = TestDataLoader.loadCardDatabase()

// Create a sample card
const sampleCardData = cardDatabase.find(
  (card) => card.Name === 'Tinker Bell - Giant Fairy'
)
const transformedCard = TestDataLoader.transformCardData(sampleCardData)
const card = CardFactory.createCard(transformedCard)

console.log('1. Sample card created:')
console.log(`   Name: ${card.name}`)
console.log(`   Type: ${card.constructor.name}`)
console.log(`   ID: ${card.id}`)

console.log('\n2. Available properties:')
console.log(`   ${Object.keys(card).join(', ')}`)

console.log('\n3. Available methods:')
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(card))
console.log(`   ${methods.join(', ')}`)

console.log('\n4. Checking for specific methods:')
const requiredMethods = ['dry', 'exert', 'ready', 'isReady']
requiredMethods.forEach((method) => {
  const hasMethod = typeof card[method] === 'function'
  console.log(`   ${method}: ${hasMethod ? '✅' : '❌'}`)
})

console.log('\n5. Card entity structure:')
console.log(`   Constructor: ${card.constructor.name}`)
console.log(`   Prototype chain:`)
let proto = Object.getPrototypeOf(card)
let level = 0
while (proto && level < 3) {
  console.log(`     Level ${level}: ${proto.constructor.name}`)
  console.log(
    `       Methods: ${Object.getOwnPropertyNames(proto)
      .filter((name) => name !== 'constructor')
      .join(', ')}`
  )
  proto = Object.getPrototypeOf(proto)
  level++
}

console.log('\n=== Analysis Complete ===')
console.log(
  '\nThe issue is that the card entities (ICard, ICharacter, etc.) are missing the required methods like dry(), exert(), ready(), isReady().'
)
console.log('These methods need to be added to the card entity classes.')
