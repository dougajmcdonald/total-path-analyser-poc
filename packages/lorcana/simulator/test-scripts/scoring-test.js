// Test the new scoring system with different action sequences

import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { evaluateSimulation, executeAction, getAvailableActions, initGame } from '../index.js'
import { SCORING_WEIGHTS } from '../simulation.js'

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

// Helper function to display actions as an array
function displayActions (actions, gameState, playerId) {
  if (actions.length === 0) {
    return chalk.gray('[]')
  }
  
  const formattedActions = actions.map(action => formatAction(action, gameState, playerId))
  return `[\n  ${formattedActions.join(',\n  ')}\n]`
}

// Create test decks
const deck1 = createDeckFromFormat(testDecks.deck1)
const deck2 = createDeckFromFormat(testDecks.deck2)

console.log(chalk.bold(`=== Scoring System Test ===`))

// Initialize game
const gameState = initGame(deck1, deck2)
const player1 = gameState.players[0]

console.log(chalk.green(`First player: ${gameState.onThePlay}`))
console.log(chalk.cyan(`\nInitial state:`))
console.log(chalk.cyan(`  Hand size: ${player1.hand.length}`))
console.log(chalk.cyan(`  Board size: ${player1.board.length}`))
console.log(chalk.cyan(`  Lore: ${player1.lore}`))
console.log(chalk.cyan(`  Available ink: ${player1.inkwell.filter(ink => !ink.isExerted).length}`))

// Show scoring weights
console.log(chalk.bold(`\n=== Scoring Weights ===`))
Object.entries(SCORING_WEIGHTS).forEach(([key, weight]) => {
  console.log(chalk.white(`  ${key}: ${weight}`))
})

// Test different action sequences
console.log(chalk.bold(`\n=== Testing Action Sequences ===`))

let currentState = JSON.parse(JSON.stringify(gameState))
const player = currentState.players[0]

// Test 1: Just inking
console.log(chalk.cyan(`\nTest 1: Just inking`))
const inkActions = getAvailableActions(currentState, player.id).filter(a => a.type === 'ink')
if (inkActions.length > 0) {
  const action = inkActions[0]
  console.log(chalk.gray(`  Action: ${formatAction(action, currentState, player.id)}`))
  executeAction(currentState, action)
  
  const score = evaluateSimulation(currentState, player.id, 1)
  console.log(chalk.cyan(`  Score: ${score.toFixed(2)}`))
  console.log(chalk.cyan(`  Hand size: ${player.hand.length}`))
  console.log(chalk.cyan(`  Available ink: ${player.inkwell.filter(ink => !ink.isExerted).length}`))
}

// Test 2: Ink and play
console.log(chalk.cyan(`\nTest 2: Ink and play`))
const playActions = getAvailableActions(currentState, player.id).filter(a => a.type === 'play')
if (playActions.length > 0) {
  const action = playActions[0]
  console.log(chalk.gray(`  Action: ${formatAction(action, currentState, player.id)}`))
  executeAction(currentState, action)
  
  const score = evaluateSimulation(currentState, player.id, 1)
  console.log(chalk.cyan(`  Score: ${score.toFixed(2)}`))
  console.log(chalk.cyan(`  Board size: ${player.board.length}`))
  console.log(chalk.cyan(`  Available ink: ${player.inkwell.filter(ink => !ink.isExerted).length}`))
  
  if (player.board.length > 0) {
    const boardCard = player.board[0]
    console.log(chalk.white(`  Board card: ${boardCard.name} (Lore: ${boardCard.lore}, Str: ${boardCard.strength}, Will: ${boardCard.willpower})`))
  }
}

// Test 3: Quest (if possible)
console.log(chalk.cyan(`\nTest 3: Quest (if possible)`))
// Manually dry the card if it exists
if (player.board.length > 0) {
  player.board[0].playState = 'dry'
  console.log(chalk.gray(`  Dried card for questing`))
}

const questActions = getAvailableActions(currentState, player.id).filter(a => a.type === 'quest')
if (questActions.length > 0) {
  const action = questActions[0]
  console.log(chalk.gray(`  Action: ${formatAction(action, currentState, player.id)}`))
  executeAction(currentState, action)
  
  const score = evaluateSimulation(currentState, player.id, 1)
  console.log(chalk.cyan(`  Score: ${score.toFixed(2)}`))
  console.log(chalk.cyan(`  Lore: ${player.lore}`))
  console.log(chalk.cyan(`  Board card state: ${player.board[0].actionState}`))
}

// Test 4: Compare different strategies
console.log(chalk.bold(`\n=== Strategy Comparison ===`))

// Reset for comparison
currentState = JSON.parse(JSON.stringify(gameState))
const playerA = currentState.players[0]

// Strategy A: Ink only
const stateA = JSON.parse(JSON.stringify(currentState))
const inkActionA = getAvailableActions(stateA, playerA.id).filter(a => a.type === 'ink')[0]
if (inkActionA) {
  executeAction(stateA, inkActionA)
  const scoreA = evaluateSimulation(stateA, playerA.id, 1)
  console.log(chalk.cyan(`Strategy A (ink only): ${scoreA.toFixed(2)}`))
}

// Strategy B: Ink and play
const stateB = JSON.parse(JSON.stringify(currentState))
const inkActionB = getAvailableActions(stateB, playerA.id).filter(a => a.type === 'ink')[0]
const playActionB = getAvailableActions(stateB, playerA.id).filter(a => a.type === 'play')[0]
if (inkActionB && playActionB) {
  executeAction(stateB, inkActionB)
  executeAction(stateB, playActionB)
  const scoreB = evaluateSimulation(stateB, playerA.id, 1)
  console.log(chalk.cyan(`Strategy B (ink + play): ${scoreB.toFixed(2)}`))
}

// Strategy C: Ink, play, and quest
const stateC = JSON.parse(JSON.stringify(currentState))
const inkActionC = getAvailableActions(stateC, playerA.id).filter(a => a.type === 'ink')[0]
const playActionC = getAvailableActions(stateC, playerA.id).filter(a => a.type === 'play')[0]
if (inkActionC && playActionC) {
  executeAction(stateC, inkActionC)
  executeAction(stateC, playActionC)
  
  // Dry the card for questing
  if (stateC.players[0].board.length > 0) {
    stateC.players[0].board[0].playState = 'dry'
  }
  
  const questActionC = getAvailableActions(stateC, playerA.id).filter(a => a.type === 'quest')[0]
  if (questActionC) {
    executeAction(stateC, questActionC)
  }
  
  const scoreC = evaluateSimulation(stateC, playerA.id, 1)
  console.log(chalk.cyan(`Strategy C (ink + play + quest): ${scoreC.toFixed(2)}`))
}

console.log(chalk.bold(`\n=== Final State ===`))
console.log(chalk.cyan(`  Hand size: ${player.hand.length}`))
console.log(chalk.cyan(`  Board size: ${player.board.length}`))
console.log(chalk.cyan(`  Lore: ${player.lore}`))
console.log(chalk.cyan(`  Available ink: ${player.inkwell.filter(ink => !ink.isExerted).length}`))
