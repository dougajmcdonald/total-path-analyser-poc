// Long simulation test for Lorcana simulator

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { runSimulation } from '../index.js'

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

// Helper function to display card info
function displayCard (card) {
  return `${card.name} (Cost: ${card.cost}, Type: ${card.type})`
}

// Helper function to display board
function displayBoard (board) {
  if (board.length === 0) return '  (empty)'
  return board.map(card => `  - ${displayCard(card)} (${card.actionState}/${card.playState})`).join('\n')
}

// Helper function to display inkwell
function displayInkwell (inkwell) {
  if (inkwell.length === 0) return '  (empty)'
  return inkwell.map(ink => `  - ${ink.name} (${ink.isExerted ? 'exerted' : 'ready'})`).join('\n')
}

// Create test decks
const deck1 = createDeckFromFormat(testDecks.deck1)
const deck2 = createDeckFromFormat(testDecks.deck2)

console.log(`=== Lorcana Simulator - Long Test ===`)
console.log(`Deck 1: ${deck1.length} cards (Character-focused)`)
console.log(`Deck 2: ${deck2.length} cards (Mixed strategy)`)

// Run a longer simulation (5 turns)
console.log('\n=== Running 5-Turn Simulation ===')
const simulationResult = runSimulation(deck1, deck2, 5)

console.log(`Simulation completed after ${simulationResult.turnResults.length} turns`)
console.log(`Winner: ${simulationResult.winner || 'No winner yet'}`)

// Display detailed turn-by-turn results
simulationResult.turnResults.forEach(turn => {
  console.log(`\n--- Turn ${turn.turn} - ${turn.player} ---`)
  
  if (turn.simulations.length > 0) {
    const bestSim = turn.simulations[0]
    console.log(`Best simulation score: ${bestSim.score}`)
    console.log(`Actions taken: ${bestSim.actions.length}`)
    
    if (bestSim.actions.length > 0) {
      console.log(`Action sequence:`)
      bestSim.actions.forEach((action, index) => {
        let actionDesc = `${index + 1}. ${action.type}`
        if (action.cardId) {
          // Find the card name
          const player = simulationResult.finalState.players.find(p => p.id === action.playerId)
          const card = player?.hand.find(c => c.uniqueId === action.cardId) || 
                      player?.board.find(c => c.uniqueId === action.cardId) ||
                      player?.inkwell.find(c => c.uniqueId === action.cardId)
          if (card) {
            actionDesc += ` (${card.name})`
          }
        }
        console.log(`  ${actionDesc}`)
      })
    }
  }
})

// Display final game state
console.log('\n=== Final Game State ===')
simulationResult.finalState.players.forEach((player, index) => {
  console.log(`\nPlayer ${index + 1} (${player.id}):`)
  console.log(`  Lore: ${player.lore}`)
  console.log(`  Hand size: ${player.hand.length}`)
  console.log(`  Board size: ${player.board.length}`)
  console.log(`  Inkwell size: ${player.inkwell.length}`)
  console.log(`  Deck size: ${player.deck.length}`)
  console.log(`  Available ink: ${player.inkwell.filter(ink => !ink.isExerted).length}`)
  
  if (player.board.length > 0) {
    console.log(`  Board:`)
    console.log(displayBoard(player.board))
  }
  
  if (player.inkwell.length > 0) {
    console.log(`  Inkwell:`)
    console.log(displayInkwell(player.inkwell))
  }
})

// Analyze deck strategies
console.log('\n=== Deck Strategy Analysis ===')
const player1 = simulationResult.finalState.players[0]
const player2 = simulationResult.finalState.players[1]

console.log(`Player 1 (Character-focused):`)
console.log(`  - Lore gained: ${player1.lore}`)
console.log(`  - Characters on board: ${player1.board.filter(c => c.type === 'character').length}`)
console.log(`  - Actions played: ${player1.board.filter(c => c.type === 'action').length}`)

console.log(`\nPlayer 2 (Mixed strategy):`)
console.log(`  - Lore gained: ${player2.lore}`)
console.log(`  - Characters on board: ${player2.board.filter(c => c.type === 'character').length}`)
console.log(`  - Actions played: ${player2.board.filter(c => c.type === 'action').length}`)

// Show top simulations for each turn
console.log('\n=== Top Simulations Analysis ===')
simulationResult.turnResults.forEach(turn => {
  console.log(`\nTurn ${turn.turn} - ${turn.player}:`)
  turn.simulations.slice(0, 3).forEach((sim, index) => {
    console.log(`  ${index + 1}. Score: ${sim.score}, Actions: ${sim.actions.length}`)
  })
})
