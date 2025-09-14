// Debug script to check card types in different game states

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { GameStateFactory } from '../utils/GameStateFactory.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('=== Card Types Debug ===\n')

// Create a game state
const gameState = await GameStateFactory.createTestGame()

console.log('1. Game state created successfully')
console.log(`   Players: ${gameState.players.length}`)
console.log(`   Player states: ${gameState.playerStates.length}`)

const player1State = gameState.getPlayerState('player1')
console.log(`\n2. Player 1 state:`)
console.log(`   Hand: ${player1State.hand.length} cards`)
console.log(`   Board: ${player1State.board.length} cards`)
console.log(`   Inkwell: ${player1State.inkwell.length} cards`)

if (player1State.hand.length > 0) {
  console.log(`\n3. Sample card from hand:`)
  const handCard = player1State.hand[0]
  console.log(`   Name: ${handCard.name}`)
  console.log(`   Type: ${handCard.constructor.name}`)
  console.log(`   ID: ${handCard.id}`)
  console.log(
    `   Methods: ${Object.getOwnPropertyNames(Object.getPrototypeOf(handCard)).join(', ')}`
  )
  console.log(`   Has dry method: ${typeof handCard.dry === 'function'}`)
}

if (player1State.board.length > 0) {
  console.log(`\n4. Sample card from board:`)
  const boardCard = player1State.board[0]
  console.log(`   Name: ${boardCard.name}`)
  console.log(`   Type: ${boardCard.constructor.name}`)
  console.log(`   ID: ${boardCard.id}`)
  console.log(
    `   Methods: ${Object.getOwnPropertyNames(Object.getPrototypeOf(boardCard)).join(', ')}`
  )
  console.log(`   Has dry method: ${typeof boardCard.dry === 'function'}`)
} else {
  console.log(`\n4. No cards on board yet`)
}

console.log(`\n5. All hand cards:`)
player1State.hand.forEach((card, index) => {
  console.log(
    `   ${index + 1}. ${card.name} (${card.constructor.name}) - dry: ${typeof card.dry === 'function'}`
  )
})

console.log(`\n6. All board cards:`)
player1State.board.forEach((card, index) => {
  console.log(
    `   ${index + 1}. ${card.name} (${card.constructor.name}) - dry: ${typeof card.dry === 'function'}`
  )
})

console.log(`\n=== Debug Complete ===`)
