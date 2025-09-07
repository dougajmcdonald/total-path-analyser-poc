// Test script to verify "one ink per turn" rule

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { executeTurn, getAvailableActions, initGame } from './index.js'

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load test deck data
const testDecks = JSON.parse(readFileSync(join(__dirname, 'test-decks.json'), 'utf8'))

// Load real card data from data-import
const cardData = JSON.parse(readFileSync(join(__dirname, '../data-import/data/cards-transformed-2025-09-07T13-03-38-221Z.json'), 'utf8'))

// Convert deck format to actual card objects
function createDeckFromFormat (deckFormat) {
  const deck = []
  
  for (const cardEntry of deckFormat) {
    // Find the card in our data
    const card = cardData.find(c => c.name === cardEntry.name)
    
    if (!card) {
      console.warn(`Card not found: ${cardEntry.name}`)
      continue
    }
    
    // Add the specified quantity to the deck
    for (let i = 0; i < cardEntry.quantity; i++) {
      deck.push({ ...card })
    }
  }
  
  return deck
}

// Helper function to display hand
function displayHand (hand) {
  return hand.map(card => `  - ${card.name} (Cost: ${card.cost}, Inkable: ${card.inkable})`).join('\n')
}

// Create test decks
const deck1 = createDeckFromFormat(testDecks.deck1)
const deck2 = createDeckFromFormat(testDecks.deck2)

console.log(`=== Testing "One Ink Per Turn" Rule ===`)

// Initialize game
const gameState = initGame(deck1, deck2)

console.log(`First player: ${gameState.onThePlay}`)
console.log(`Second player: ${gameState.onTheDraw}`)

// Show initial state
console.log(`\n=== Initial State ===`)
gameState.players.forEach((player, index) => {
  console.log(`\nPlayer ${index + 1} (${player.id}):`)
  console.log(`  Hand size: ${player.hand.length}`)
  console.log(`  Inkwell size: ${player.inkwell.length}`)
  console.log(`  Has inked this turn: ${player.hasInkedThisTurn}`)
  console.log(`  Hand cards:`)
  console.log(displayHand(player.hand))
})

// Test inking multiple times in one turn
console.log(`\n=== Testing Multiple Ink Attempts ===`)

let currentState = JSON.parse(JSON.stringify(gameState))
const currentPlayer = currentState.players[0]

console.log(`\n--- Player 1 Turn ---`)
console.log(`Has inked this turn: ${currentPlayer.hasInkedThisTurn}`)

// Get available actions
const actions = getAvailableActions(currentState, currentPlayer.id)
const inkActions = actions.filter(a => a.type === 'ink')
console.log(`Available ink actions: ${inkActions.length}`)

if (inkActions.length > 0) {
  // Try to ink first card
  console.log(`\nInking first card: ${inkActions[0].cardId}`)
  const turn1Actions = [inkActions[0]]
  executeTurn(currentState, currentPlayer.id, turn1Actions)
  
  console.log(`After first ink:`)
  console.log(`  Hand size: ${currentPlayer.hand.length}`)
  console.log(`  Inkwell size: ${currentPlayer.inkwell.length}`)
  console.log(`  Has inked this turn: ${currentPlayer.hasInkedThisTurn}`)
  
  // Check available actions after inking
  const actionsAfterInk = getAvailableActions(currentState, currentPlayer.id)
  const inkActionsAfter = actionsAfterInk.filter(a => a.type === 'ink')
  console.log(`\nAvailable ink actions after inking: ${inkActionsAfter.length}`)
  
  if (inkActionsAfter.length === 0) {
    console.log(`✅ SUCCESS: No more ink actions available after inking once!`)
  } else {
    console.log(`❌ ERROR: Still have ink actions available after inking once!`)
  }
  
  // Show other available actions
  const otherActions = actionsAfterInk.filter(a => a.type !== 'ink')
  console.log(`Other available actions: ${otherActions.length}`)
  otherActions.forEach(action => {
    console.log(`  - ${action.type}`)
  })
}

// Test next turn - should be able to ink again
console.log(`\n=== Testing Next Turn ===`)

// Switch to next player and back to simulate next turn
currentState.currentPlayer = 1
currentState.turn = 2
currentState.currentPlayer = 0

// Ready all exerted cards (this resets hasInkedThisTurn)
const player = currentState.players[0]
player.inkwell.forEach(ink => {
  ink.isExerted = false
})
player.hasInkedThisTurn = false

console.log(`\n--- Player 1 Next Turn ---`)
console.log(`Has inked this turn: ${player.hasInkedThisTurn}`)

const nextTurnActions = getAvailableActions(currentState, player.id)
const nextTurnInkActions = nextTurnActions.filter(a => a.type === 'ink')
console.log(`Available ink actions on next turn: ${nextTurnInkActions.length}`)

if (nextTurnInkActions.length > 0) {
  console.log(`✅ SUCCESS: Can ink again on next turn!`)
} else {
  console.log(`❌ ERROR: Cannot ink on next turn!`)
}

console.log(`\n=== Final State ===`)
currentState.players.forEach((player, index) => {
  console.log(`\nPlayer ${index + 1} (${player.id}):`)
  console.log(`  Hand size: ${player.hand.length}`)
  console.log(`  Inkwell size: ${player.inkwell.length}`)
  console.log(`  Has inked this turn: ${player.hasInkedThisTurn}`)
})
