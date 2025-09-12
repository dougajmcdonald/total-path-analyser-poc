// Test quest actions after turn progression

import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { executeTurn, getAvailableActions, initGame } from '../index.js'

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

console.log(chalk.bold(`=== Quest Turn Test ===`))

// Initialize game
const gameState = initGame(deck1, deck2)

// Manually set up a scenario where we have a dry character
let currentState = JSON.parse(JSON.stringify(gameState))
const player1 = currentState.players[0]

console.log(chalk.cyan(`\n=== Setting up quest scenario ===`))

// Turn 1: Ink and play
console.log(chalk.cyan(`\nTurn 1: Ink and play`))
const turn1Actions = []
const inkActions = getAvailableActions(currentState, player1.id).filter(a => a.type === 'ink')
if (inkActions.length > 0) {
  turn1Actions.push(inkActions[0])
  console.log(chalk.gray(`  Adding ink action: ${formatAction(inkActions[0], currentState, player1.id)}`))
}

console.log(chalk.bold(`\nExecuting turn 1 (ink only):`))
console.log(displayActions(turn1Actions, currentState, player1.id))
executeTurn(currentState, player1.id, turn1Actions)

console.log(chalk.cyan(`\nAfter inking:`))
console.log(chalk.cyan(`  Available ink: ${player1.inkwell.filter(ink => !ink.isExerted).length}`))

// Now check for play actions
const playActions = getAvailableActions(currentState, player1.id).filter(a => a.type === 'play')
console.log(chalk.cyan(`Available play actions: ${playActions.length}`))

if (playActions.length > 0) {
  console.log(chalk.gray(`  Adding play action: ${formatAction(playActions[0], currentState, player1.id)}`))
  executeTurn(currentState, player1.id, [playActions[0]])
  
  console.log(chalk.cyan(`\nAfter playing:`))
  console.log(chalk.cyan(`  Board size: ${player1.board.length}`))
  console.log(chalk.cyan(`  Available ink: ${player1.inkwell.filter(ink => !ink.isExerted).length}`))
  if (player1.board.length > 0) {
    player1.board.forEach(card => {
      console.log(chalk.white(`    - ${card.name} (Action: ${card.actionState}, Play: ${card.playState})`))
    })
  }
}

// Simulate turn transition to dry the card
console.log(chalk.cyan(`\nSimulating turn transition to dry the card...`))
// Manually call the ready phase to dry the card
player1.board.forEach(card => {
  if (card.playState === 'drying') {
    card.playState = 'dry'
    console.log(chalk.gray(`  Dried card: ${card.name}`))
  }
})

// Turn 2: Check for quest actions
console.log(chalk.cyan(`\nTurn 2: Check for quest actions`))
const turn2Actions = []
const questActions = getAvailableActions(currentState, player1.id).filter(a => a.type === 'quest')
console.log(chalk.cyan(`Available quest actions: ${questActions.length}`))

if (questActions.length > 0) {
  turn2Actions.push(questActions[0])
  console.log(chalk.gray(`  Adding quest action: ${formatAction(questActions[0], currentState, player1.id)}`))
} else {
  console.log(chalk.red(`  No quest actions available!`))
  
  // Debug why no quest actions
  console.log(chalk.cyan(`  Debugging board cards:`))
  player1.board.forEach((card, index) => {
    console.log(chalk.white(`    Card ${index}: ${card.name}`))
    console.log(chalk.white(`      Action State: ${card.actionState}`))
    console.log(chalk.white(`      Play State: ${card.playState}`))
    console.log(chalk.white(`      Type: ${card.type}`))
    console.log(chalk.white(`      Lore: ${card.lore}`))
  })
}

// Also check for other actions
const allActions = getAvailableActions(currentState, player1.id)
console.log(chalk.cyan(`\nAll available actions: ${allActions.length}`))
allActions.forEach(action => {
  console.log(chalk.white(`  ${action.type}: ${action.cardId || 'N/A'}`))
})

if (turn2Actions.length > 0) {
  console.log(chalk.bold(`\nExecuting turn 2:`))
  console.log(displayActions(turn2Actions, currentState, player1.id))
  executeTurn(currentState, player1.id, turn2Actions)
  
  console.log(chalk.cyan(`\nAfter turn 2:`))
  console.log(chalk.cyan(`  Lore: ${player1.lore}`))
  if (player1.board.length > 0) {
    player1.board.forEach(card => {
      console.log(chalk.white(`    - ${card.name} (Action: ${card.actionState}, Play: ${card.playState})`))
    })
  }
}
