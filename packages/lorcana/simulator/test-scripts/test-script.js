// Test script for Lorcana simulator

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { executeAction, getAvailableActions, initGame, runSimulation } from '../index.js'

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

// Create test decks
const deck1 = createDeckFromFormat(testDecks.deck1)
const deck2 = createDeckFromFormat(testDecks.deck2)

console.log(`Deck 1: ${deck1.length} cards`)
console.log(`Deck 2: ${deck2.length} cards`)

// Test basic game initialization
console.log('\n=== Testing Game Initialization ===')
const gameState = initGame(deck1, deck2)

console.log(`Player 1 hand size: ${gameState.players[0].hand.length}`)
console.log(`Player 2 hand size: ${gameState.players[1].hand.length}`)
console.log(`Player 1 deck size: ${gameState.players[0].deck.length}`)
console.log(`Player 2 deck size: ${gameState.players[1].deck.length}`)

// Test available actions for player 1
console.log('\n=== Testing Available Actions ===')
const actions = getAvailableActions(gameState, 'player1')
console.log(`Available actions for player 1: ${actions.length}`)
console.log('Action types:', [...new Set(actions.map(a => a.type))])

// Test a simple action (ink a card if possible)
const inkActions = actions.filter(a => a.type === 'ink')
if (inkActions.length > 0) {
  console.log(`\n=== Testing Ink Action ===`)
  console.log(`Inking card: ${inkActions[0].cardId}`)
  const newState = executeAction(gameState, inkActions[0])
  console.log(`Player 1 inkwell size after inking: ${newState.players[0].inkwell.length}`)
  console.log(`Player 1 hand size after inking: ${newState.players[0].hand.length}`)
}

// Test full simulation (limited to 3 turns for testing)
console.log('\n=== Running Full Simulation (3 turns) ===')
const simulationResult = runSimulation(deck1, deck2, 3)

console.log(`Simulation completed after ${simulationResult.turnResults.length} turns`)
console.log(`Winner: ${simulationResult.winner || 'No winner yet'}`)

// Display turn-by-turn results
simulationResult.turnResults.forEach(turn => {
  console.log(`\nTurn ${turn.turn} - ${turn.player}:`)
  console.log(`  Top simulation score: ${turn.simulations[0]?.score || 'N/A'}`)
  console.log(`  Actions taken: ${turn.simulations[0]?.actions?.length || 0}`)
  
  if (turn.simulations[0]?.actions) {
    turn.simulations[0].actions.forEach((action, index) => {
      console.log(`    ${index + 1}. ${action.type}${action.cardId ? ` (${action.cardId})` : ''}`)
    })
  }
})

// Display final game state
console.log('\n=== Final Game State ===')
simulationResult.finalState.players.forEach((player, index) => {
  console.log(`Player ${index + 1}:`)
  console.log(`  Lore: ${player.lore}`)
  console.log(`  Hand size: ${player.hand.length}`)
  console.log(`  Board size: ${player.board.length}`)
  console.log(`  Inkwell size: ${player.inkwell.length}`)
  console.log(`  Deck size: ${player.deck.length}`)
})
