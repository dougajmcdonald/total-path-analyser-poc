// Test script to verify "on the play" rule implementation

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { initGame, runSimulation } from './index.js'

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

console.log(`=== Testing "On the Play" Rule ===`)

// Test multiple games to see the random first player selection
for (let game = 1; game <= 5; game++) {
  console.log(`\n--- Game ${game} ---`)
  
  const gameState = initGame(deck1, deck2)
  
  console.log(`First player: ${gameState.onThePlay}`)
  console.log(`Second player: ${gameState.onTheDraw}`)
  console.log(`Player 1 hand size: ${gameState.players[0].hand.length}`)
  console.log(`Player 2 hand size: ${gameState.players[1].hand.length}`)
  console.log(`Player 1 deck size: ${gameState.players[0].deck.length}`)
  console.log(`Player 2 deck size: ${gameState.players[1].deck.length}`)
}

// Run a simulation to see the turn progression
console.log(`\n=== Simulation with Turn Progression ===`)
const simulationResult = runSimulation(deck1, deck2, 3)

console.log(`First player: ${simulationResult.finalState.onThePlay}`)
console.log(`Second player: ${simulationResult.finalState.onTheDraw}`)

// Display turn-by-turn results showing who is on the play
simulationResult.turnResults.forEach(turn => {
  console.log(`\nTurn ${turn.turn} - ${turn.player} ${turn.isOnThePlay ? '(ON THE PLAY)' : '(ON THE DRAW)'}`)
  
  if (turn.simulations.length > 0) {
    const bestSim = turn.simulations[0]
    console.log(`  Score: ${bestSim.score}`)
    console.log(`  Actions: ${bestSim.actions.length}`)
    
    // Show if this was a draw turn or not
    const player = simulationResult.finalState.players.find(p => p.id === turn.player)
    if (turn.turn === 1 && turn.isOnThePlay) {
      console.log(`  Note: First player doesn't draw on turn 1`)
    } else {
      console.log(`  Note: Player drew a card this turn`)
    }
  }
})

// Show final hand sizes to verify draw rule
console.log(`\n=== Final Hand Sizes ===`)
simulationResult.finalState.players.forEach((player, index) => {
  const playerNum = index + 1
  const isOnThePlay = simulationResult.finalState.onThePlay === player.id
  console.log(`Player ${playerNum} (${player.id}): ${player.hand.length} cards in hand ${isOnThePlay ? '(was on the play)' : '(was on the draw)'}`)
})
