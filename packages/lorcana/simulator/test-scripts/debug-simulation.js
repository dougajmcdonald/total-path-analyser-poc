// Debug the simulation logic step by step

import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { getAvailableInk } from '../game-state.js'
import { executeAction, getAvailableActions, initGame, simulateTurn } from '../index.js'

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

// Helper function to get card name by ID
function getCardName (cardId, gameState, playerId) {
  const player = gameState.players.find(p => p.id === playerId)
  const allCards = [...player.hand, ...player.board, ...player.inkwell]
  const card = allCards.find(c => c.uniqueId === cardId)
  return card ? card.name : `Unknown (${cardId})`
}

// Helper function to format action with color
function formatAction (action, gameState, playerId) {
  const { type, cardId, attackerId, targetId, singerId, songId } = action
  
  switch (type) {
    case 'ink':
      return chalk.blue(`{ ink: "${getCardName(cardId, gameState, playerId)}" }`)
    case 'play':
      return chalk.green(`{ play: "${getCardName(cardId, gameState, playerId)}" }`)
    case 'quest':
      return chalk.yellow(`{ quest: "${getCardName(cardId, gameState, playerId)}" }`)
    case 'challenge':
      return chalk.red(`{ challenge: "${getCardName(attackerId, gameState, playerId)}" → "${getCardName(targetId, gameState, playerId)}" }`)
    case 'sing':
      return chalk.magenta(`{ sing: "${getCardName(singerId, gameState, playerId)}" → "${getCardName(songId, gameState, playerId)}" }`)
    case 'pass':
      return chalk.gray(`{ pass }`)
    default:
      return chalk.white(`{ ${type} }`)
  }
}

// Create test decks
const deck1 = createDeckFromFormat(testDecks.deck1)
const deck2 = createDeckFromFormat(testDecks.deck2)

console.log(chalk.bold(`=== Debug Simulation Logic ===`))

// Initialize game
const gameState = initGame(deck1, deck2)
const player1 = gameState.players[0]

console.log(chalk.green(`First player: ${gameState.onThePlay}`))

// Manual simulation step by step
console.log(chalk.cyan(`\n=== Manual Step-by-Step Simulation ===`))

let currentState = JSON.parse(JSON.stringify(gameState))
const player = currentState.players[0]

// Step 1: Initial state
console.log(chalk.cyan(`\nStep 1: Initial state`))
console.log(chalk.cyan(`  Hand size: ${player.hand.length}`))
console.log(chalk.cyan(`  Available ink: ${getAvailableInk(currentState, player.id)}`))

const initialActions = getAvailableActions(currentState, player.id)
console.log(chalk.cyan(`  Available actions: ${initialActions.length}`))
initialActions.forEach(action => {
  console.log(chalk.white(`    ${action.type}: ${action.cardId || 'N/A'}`))
})

// Step 2: Ink action
console.log(chalk.cyan(`\nStep 2: Execute ink action`))
const inkAction = initialActions.find(a => a.type === 'ink')
if (inkAction) {
  console.log(chalk.gray(`  Executing: ${formatAction(inkAction, currentState, player.id)}`))
  executeAction(currentState, inkAction)
  
  console.log(chalk.cyan(`  After inking:`))
  console.log(chalk.cyan(`    Hand size: ${player.hand.length}`))
  console.log(chalk.cyan(`    Available ink: ${getAvailableInk(currentState, player.id)}`))
  
  // Check actions after inking
  const actionsAfterInk = getAvailableActions(currentState, player.id)
  console.log(chalk.cyan(`    Available actions: ${actionsAfterInk.length}`))
  actionsAfterInk.forEach(action => {
    console.log(chalk.white(`      ${action.type}: ${action.cardId || 'N/A'}`))
  })
  
  // Step 3: Play action
  console.log(chalk.cyan(`\nStep 3: Execute play action`))
  const playAction = actionsAfterInk.find(a => a.type === 'play')
  if (playAction) {
    console.log(chalk.gray(`  Executing: ${formatAction(playAction, currentState, player.id)}`))
    executeAction(currentState, playAction)
    
    console.log(chalk.cyan(`  After playing:`))
    console.log(chalk.cyan(`    Hand size: ${player.hand.length}`))
    console.log(chalk.cyan(`    Board size: ${player.board.length}`))
    console.log(chalk.cyan(`    Available ink: ${getAvailableInk(currentState, player.id)}`))
    
    // Check actions after playing
    const actionsAfterPlay = getAvailableActions(currentState, player.id)
    console.log(chalk.cyan(`    Available actions: ${actionsAfterPlay.length}`))
    actionsAfterPlay.forEach(action => {
      console.log(chalk.white(`      ${action.type}: ${action.cardId || 'N/A'}`))
    })
  } else {
    console.log(chalk.red(`  No play actions available!`))
  }
}

// Now test the actual simulation
console.log(chalk.cyan(`\n=== Actual Simulation Test ===`))
const simulations = simulateTurn(gameState, player1.id, 1, 3)
console.log(chalk.cyan(`\nSimulations found: ${simulations.length}`))

simulations.forEach((sim, index) => {
  console.log(chalk.white(`\nSimulation ${index + 1} (Score: ${sim.score.toFixed(2)}):`))
  console.log(chalk.white(`  Actions: ${sim.actions.length}`))
  sim.actions.forEach((action, actionIndex) => {
    console.log(chalk.white(`    ${actionIndex + 1}. ${formatAction(action, sim.state, player1.id)}`))
  })
  
  // Show final state
  const finalPlayer = sim.state.players.find(p => p.id === player1.id)
  console.log(chalk.cyan(`  Final state:`))
  console.log(chalk.cyan(`    Hand: ${finalPlayer.hand.length} cards`))
  console.log(chalk.cyan(`    Board: ${finalPlayer.board.length} cards`))
  console.log(chalk.cyan(`    Lore: ${finalPlayer.lore}`))
  console.log(chalk.cyan(`    Available ink: ${getAvailableInk(sim.state, player1.id)}`))
})
