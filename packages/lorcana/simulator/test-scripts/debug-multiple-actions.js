// Debug why players aren't taking multiple actions per turn

import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
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

console.log(chalk.bold(`=== Debug Multiple Actions ===`))

// Initialize game
const gameState = initGame(deck1, deck2)
const player1 = gameState.players[0]

console.log(chalk.green(`First player: ${gameState.onThePlay}`))

// Test 1: Check available actions after inking
console.log(chalk.cyan(`\n=== Test 1: Available actions after inking ===`))
let currentState = JSON.parse(JSON.stringify(gameState))

console.log(chalk.cyan(`Initial state:`))
console.log(chalk.cyan(`  Hand size: ${player1.hand.length}`))
console.log(chalk.cyan(`  Available ink: ${player1.inkwell.filter(ink => !ink.isExerted).length}`))

// Get initial actions
const initialActions = getAvailableActions(currentState, player1.id)
console.log(chalk.cyan(`\nInitial available actions: ${initialActions.length}`))
initialActions.forEach(action => {
  console.log(chalk.white(`  ${action.type}: ${action.cardId || 'N/A'}`))
})

// Ink a card
const inkActions = initialActions.filter(a => a.type === 'ink')
if (inkActions.length > 0) {
  const inkAction = inkActions[0]
  console.log(chalk.gray(`\nExecuting: ${formatAction(inkAction, currentState, player1.id)}`))
  executeAction(currentState, inkAction)
  
  console.log(chalk.cyan(`\nAfter inking:`))
  console.log(chalk.cyan(`  Hand size: ${currentState.players[0].hand.length}`))
  console.log(chalk.cyan(`  Available ink: ${currentState.players[0].inkwell.filter(ink => !ink.isExerted).length}`))
  
  // Check actions after inking
  const actionsAfterInk = getAvailableActions(currentState, player1.id)
  console.log(chalk.cyan(`\nActions after inking: ${actionsAfterInk.length}`))
  actionsAfterInk.forEach(action => {
    console.log(chalk.white(`  ${action.type}: ${action.cardId || 'N/A'}`))
  })
  
  // Try to play a card
  const playActions = actionsAfterInk.filter(a => a.type === 'play')
  if (playActions.length > 0) {
    const playAction = playActions[0]
    console.log(chalk.gray(`\nExecuting: ${formatAction(playAction, currentState, player1.id)}`))
    executeAction(currentState, playAction)
    
    console.log(chalk.cyan(`\nAfter playing:`))
    console.log(chalk.cyan(`  Hand size: ${currentState.players[0].hand.length}`))
    console.log(chalk.cyan(`  Board size: ${currentState.players[0].board.length}`))
    console.log(chalk.cyan(`  Available ink: ${currentState.players[0].inkwell.filter(ink => !ink.isExerted).length}`))
    
    // Check actions after playing
    const actionsAfterPlay = getAvailableActions(currentState, player1.id)
    console.log(chalk.cyan(`\nActions after playing: ${actionsAfterPlay.length}`))
    actionsAfterPlay.forEach(action => {
      console.log(chalk.white(`  ${action.type}: ${action.cardId || 'N/A'}`))
    })
  }
}

// Test 2: Check simulation depth
console.log(chalk.cyan(`\n=== Test 2: Simulation depth analysis ===`))
const simulations = simulateTurn(currentState, player1.id, 1, 5) // Increase maxDepth to 5
console.log(chalk.cyan(`\nSimulations found: ${simulations.length}`))

simulations.forEach((sim, index) => {
  console.log(chalk.white(`\nSimulation ${index + 1} (Score: ${sim.score.toFixed(2)}):`))
  console.log(chalk.white(`  Actions: ${sim.actions.length}`))
  sim.actions.forEach((action, actionIndex) => {
    console.log(chalk.white(`    ${actionIndex + 1}. ${formatAction(action, sim.state, player1.id)}`))
  })
})

// Test 3: Manual action sequence
console.log(chalk.cyan(`\n=== Test 3: Manual action sequence ===`))
let manualState = JSON.parse(JSON.stringify(gameState))
const manualPlayer = manualState.players[0]

console.log(chalk.cyan(`\nStep 1: Ink`))
const manualInkActions = getAvailableActions(manualState, manualPlayer.id).filter(a => a.type === 'ink')
if (manualInkActions.length > 0) {
  executeAction(manualState, manualInkActions[0])
  console.log(chalk.gray(`  Inked: ${formatAction(manualInkActions[0], manualState, manualPlayer.id)}`))
}

console.log(chalk.cyan(`\nStep 2: Play`))
const manualPlayActions = getAvailableActions(manualState, manualPlayer.id).filter(a => a.type === 'play')
if (manualPlayActions.length > 0) {
  executeAction(manualState, manualPlayActions[0])
  console.log(chalk.gray(`  Played: ${formatAction(manualPlayActions[0], manualState, manualPlayer.id)}`))
}

console.log(chalk.cyan(`\nStep 3: Check for more actions`))
const manualMoreActions = getAvailableActions(manualState, manualPlayer.id)
console.log(chalk.cyan(`  Available actions: ${manualMoreActions.length}`))
manualMoreActions.forEach(action => {
  console.log(chalk.white(`    ${action.type}: ${action.cardId || 'N/A'}`))
})
