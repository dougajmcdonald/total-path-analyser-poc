// Demo script to show different action types with color coding

import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { executeAction, getAvailableActions, initGame } from '../index.js'

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

console.log(chalk.bold(`=== Action Type Demo ===`))

// Initialize game
const gameState = initGame(deck1, deck2)

console.log(chalk.green(`First player: ${gameState.onThePlay}`))
console.log(chalk.green(`Second player: ${gameState.onTheDraw}`))

// Show initial state
console.log(chalk.bold(`\n=== Initial State ===`))
gameState.players.forEach((player, index) => {
  console.log(chalk.bold(`\nPlayer ${index + 1} (${player.id}):`))
  console.log(chalk.cyan(`  Hand size: ${player.hand.length}`))
  console.log(chalk.cyan(`  Hand cards:`))
  player.hand.forEach(card => {
    console.log(chalk.white(`    - ${card.name} (Cost: ${card.cost}, Inkable: ${card.inkable})`))
  })
})

// Show available actions for each player
console.log(chalk.bold(`\n=== Available Actions ===`))

gameState.players.forEach((player, index) => {
  console.log(chalk.bold(`\nPlayer ${index + 1} (${player.id}):`))
  const actions = getAvailableActions(gameState, player.id)
  
  // Group actions by type
  const actionGroups = {
    ink: actions.filter(a => a.type === 'ink'),
    play: actions.filter(a => a.type === 'play'),
    quest: actions.filter(a => a.type === 'quest'),
    challenge: actions.filter(a => a.type === 'challenge'),
    sing: actions.filter(a => a.type === 'sing'),
    pass: actions.filter(a => a.type === 'pass')
  }
  
  Object.entries(actionGroups).forEach(([type, typeActions]) => {
    if (typeActions.length > 0) {
      console.log(chalk.cyan(`\n  ${type.toUpperCase()} actions (${typeActions.length}):`))
      console.log(displayActions(typeActions, gameState, player.id))
    }
  })
})

// Demo a simple turn sequence
console.log(chalk.bold(`\n=== Demo Turn Sequence ===`))

let currentState = JSON.parse(JSON.stringify(gameState))
const currentPlayer = currentState.players[0]

console.log(chalk.bold(`\n--- ${currentPlayer.id} Turn ---`))

// Get available actions
const actions = getAvailableActions(currentState, currentPlayer.id)
const inkActions = actions.filter(a => a.type === 'ink')
const playActions = actions.filter(a => a.type === 'play')

console.log(chalk.cyan(`Available actions: ${actions.length}`))

// Show what we could do
const possibleActions = []

if (inkActions.length > 0) {
  possibleActions.push(inkActions[0])
}

if (playActions.length > 0) {
  possibleActions.push(playActions[0])
}

console.log(chalk.bold(`\nPossible actions this turn:`))
console.log(displayActions(possibleActions, currentState, currentPlayer.id))

// Execute the actions
console.log(chalk.bold(`\nExecuting actions...`))

for (const action of possibleActions) {
  console.log(chalk.gray(`  Executing: ${formatAction(action, currentState, currentPlayer.id)}`))
  executeAction(currentState, action)
}

// Show final state
console.log(chalk.bold(`\n=== Final State ===`))
currentState.players.forEach((player, index) => {
  console.log(chalk.bold(`\nPlayer ${index + 1} (${player.id}):`))
  console.log(chalk.cyan(`  Hand size: ${player.hand.length}`))
  console.log(chalk.cyan(`  Board size: ${player.board.length}`))
  console.log(chalk.cyan(`  Inkwell size: ${player.inkwell.length}`))
  console.log(chalk.cyan(`  Available ink: ${player.inkwell.filter(ink => !ink.isExerted).length}`))
  
  if (player.board.length > 0) {
    console.log(chalk.cyan(`  Board cards:`))
    player.board.forEach(card => {
      console.log(chalk.white(`    - ${card.name} (${card.actionState})`))
    })
  }
})
