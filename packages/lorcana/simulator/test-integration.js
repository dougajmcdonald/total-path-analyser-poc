// Integration test for new entity system

import { Simulator } from './simulation/Simulator.js'
import { CardFactory } from './utils/CardFactory.js'
import { GameStateFactory } from './utils/GameStateFactory.js'

// Test card data (similar to what's loaded from API)
const testCardData = [
  {
    uniqueId: 'mickey-1',
    name: 'Mickey Mouse',
    type: 'character',
    cost: 2,
    inkable: true,
    strength: 2,
    willpower: 1,
    lore: 1,
    color: 'amber',
  },
  {
    uniqueId: 'goofy-1',
    name: 'Goofy',
    type: 'character',
    cost: 3,
    inkable: true,
    strength: 3,
    willpower: 2,
    lore: 2,
    color: 'amber',
  },
  {
    uniqueId: 'heal-1',
    name: 'Heal',
    type: 'action',
    cost: 1,
    inkable: true,
    color: 'sapphire',
  },
  {
    uniqueId: 'donald-1',
    name: 'Donald Duck',
    type: 'character',
    cost: 4,
    inkable: true,
    strength: 4,
    willpower: 3,
    lore: 3,
    color: 'amber',
  },
]

// Test deck format
const testDeckFormat = [
  { name: 'Mickey Mouse', quantity: 4 },
  { name: 'Goofy', quantity: 4 },
  { name: 'Heal', quantity: 4 },
  { name: 'Donald Duck', quantity: 4 },
]

console.log('=== Integration Test ===')

// Test 1: Card Factory
console.log('\n1. Testing Card Factory...')
const cards = CardFactory.createCards(testCardData)
console.log(`Created ${cards.length} card entities:`)
cards.forEach((card) => {
  console.log(`  - ${card.name} (${card.constructor.name})`)
})

// Test 2: Deck Creation
console.log('\n2. Testing Deck Creation...')
const deck = CardFactory.createDeckFromFormat(testDeckFormat, testCardData)
console.log(`Created deck with ${deck.size()} cards`)

// Test 3: Game State Factory
console.log('\n3. Testing Game State Factory...')
const gameState = GameStateFactory.createTestGame()
console.log(`Created game state with ${gameState.players.length} players`)
console.log(`Active player: ${gameState.getActivePlayer().id}`)

// Test 4: Action System Integration
console.log('\n4. Testing Action System...')
const simulator = new Simulator(gameState)
const validActions = simulator.turnExecutor.getValidActions(
  gameState,
  'player1'
)
console.log(`Found ${validActions.length} valid actions for player1:`)
validActions.slice(0, 5).forEach((action, index) => {
  console.log(`  ${index + 1}. ${action.type} - ${action.cardId || 'N/A'}`)
})

// Test 5: Simulation Integration
console.log('\n5. Testing Simulation Integration...')
const turnResult = simulator.simulateTurn('player1', 'best')
console.log(
  `Turn simulation completed with score: ${turnResult.finalScore.toFixed(2)}`
)

// Test 6: Path Analysis
console.log('\n6. Testing Path Analysis...')
const actionSequences = simulator.getActionSequences('player1')
console.log(`Found ${actionSequences.length} possible action sequences`)
if (actionSequences.length > 0) {
  console.log(`Best sequence score: ${actionSequences[0].score.toFixed(2)}`)
  console.log(`Best sequence actions: ${actionSequences[0].actions.length}`)
}

console.log('\n=== Integration Test Complete ===')
console.log('✅ All systems working together!')
