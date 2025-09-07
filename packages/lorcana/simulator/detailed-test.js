// Detailed test script for Lorcana simulator

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { executeAction, getAvailableActions, initGame, runSimulation } from './index.js'

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

// Helper function to display hand
function displayHand (hand) {
  return hand.map(card => `  - ${displayCard(card)}`).join('\n')
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

console.log(`=== Lorcana Simulator Test ===`)
console.log(`Deck 1: ${deck1.length} cards`)
console.log(`Deck 2: ${deck2.length} cards`)

// Test basic game initialization
console.log('\n=== Game Initialization ===')
const gameState = initGame(deck1, deck2)

console.log(`Player 1:`)
console.log(`  Hand size: ${gameState.players[0].hand.length}`)
console.log(`  Deck size: ${gameState.players[0].deck.length}`)
console.log(`  Hand cards:`)
console.log(displayHand(gameState.players[0].hand))

console.log(`\nPlayer 2:`)
console.log(`  Hand size: ${gameState.players[1].hand.length}`)
console.log(`  Deck size: ${gameState.players[1].deck.length}`)
console.log(`  Hand cards:`)
console.log(displayHand(gameState.players[1].hand))

// Test available actions for player 1
console.log('\n=== Available Actions Analysis ===')
const actions = getAvailableActions(gameState, 'player1')
console.log(`Available actions for player 1: ${actions.length}`)

const actionTypes = [...new Set(actions.map(a => a.type))]
console.log(`Action types: ${actionTypes.join(', ')}`)

// Show ink actions
const inkActions = actions.filter(a => a.type === 'ink')
console.log(`\nInk actions (${inkActions.length}):`)
inkActions.forEach((action, index) => {
  const card = gameState.players[0].hand.find(c => c.uniqueId === action.cardId)
  console.log(`  ${index + 1}. ${displayCard(card)}`)
})

// Test a simple action sequence
console.log('\n=== Action Sequence Test ===')
let currentState = JSON.parse(JSON.stringify(gameState))

// Ink a card
if (inkActions.length > 0) {
  const inkAction = inkActions[0]
  console.log(`Inking: ${displayCard(gameState.players[0].hand.find(c => c.uniqueId === inkAction.cardId))}`)
  currentState = executeAction(currentState, inkAction)
  
  console.log(`After inking:`)
  console.log(`  Hand size: ${currentState.players[0].hand.length}`)
  console.log(`  Inkwell size: ${currentState.players[0].inkwell.length}`)
  console.log(`  Available ink: ${currentState.players[0].inkwell.filter(ink => !ink.isExerted).length}`)
  console.log(`  Inkwell:`)
  console.log(displayInkwell(currentState.players[0].inkwell))
}

// Try to play a card
const playActions = getAvailableActions(currentState, 'player1').filter(a => a.type === 'play')
if (playActions.length > 0) {
  const playAction = playActions[0]
  const card = currentState.players[0].hand.find(c => c.uniqueId === playAction.cardId)
  console.log(`\nPlaying: ${displayCard(card)}`)
  currentState = executeAction(currentState, playAction)
  
  console.log(`After playing:`)
  console.log(`  Hand size: ${currentState.players[0].hand.length}`)
  console.log(`  Board size: ${currentState.players[0].board.length}`)
  console.log(`  Available ink: ${currentState.players[0].inkwell.filter(ink => !ink.isExerted).length}`)
  console.log(`  Board:`)
  console.log(displayBoard(currentState.players[0].board))
}

// Run full simulation (limited to 2 turns for detailed output)
console.log('\n=== Full Simulation (2 turns) ===')
const simulationResult = runSimulation(deck1, deck2, 2)

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
