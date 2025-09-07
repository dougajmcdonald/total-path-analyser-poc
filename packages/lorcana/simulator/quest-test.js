// Test script to verify questing works properly

import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { executeAction, getAvailableActions, initGame } from './index.js'

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

console.log(chalk.bold(`=== Quest Action Test ===`))

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
    console.log(chalk.white(`    - ${card.name} (Cost: ${card.cost}, Inkable: ${card.inkable}, Lore: ${card.lore || 'N/A'})`))
  })
})

// Let's manually set up a scenario where we can quest
console.log(chalk.bold(`\n=== Setting Up Quest Scenario ===`))

let currentState = JSON.parse(JSON.stringify(gameState))
const player1 = currentState.players[0]

// First, let's ink a card to get some ink
console.log(chalk.cyan(`\nStep 1: Ink a card to get resources`))
const inkActions = getAvailableActions(currentState, player1.id).filter(a => a.type === 'ink')
if (inkActions.length > 0) {
  console.log(chalk.gray(`  Executing: ${formatAction(inkActions[0], currentState, player1.id)}`))
  executeAction(currentState, inkActions[0])
  console.log(chalk.cyan(`  Available ink: ${player1.inkwell.filter(ink => !ink.isExerted).length}`))
}

// Now try to play a character card
console.log(chalk.cyan(`\nStep 2: Play a character card`))
const playActions = getAvailableActions(currentState, player1.id).filter(a => a.type === 'play')
if (playActions.length > 0) {
  console.log(chalk.gray(`  Executing: ${formatAction(playActions[0], currentState, player1.id)}`))
  executeAction(currentState, playActions[0])
  console.log(chalk.cyan(`  Board size: ${player1.board.length}`))
  console.log(chalk.cyan(`  Available ink: ${player1.inkwell.filter(ink => !ink.isExerted).length}`))
}

// Show board cards
if (player1.board.length > 0) {
  console.log(chalk.cyan(`\nBoard cards:`))
  player1.board.forEach(card => {
    console.log(chalk.white(`  - ${card.name} (Lore: ${card.lore || 'N/A'}, Action State: ${card.actionState})`))
  })
}

// Now check for quest actions
console.log(chalk.cyan(`\nStep 3: Check for quest actions`))
const questActions = getAvailableActions(currentState, player1.id).filter(a => a.type === 'quest')
console.log(chalk.cyan(`Available quest actions: ${questActions.length}`))

if (questActions.length > 0) {
  console.log(chalk.bold(`\nQuest actions available:`))
  console.log(displayActions(questActions, currentState, player1.id))
  
  // Execute a quest action
  console.log(chalk.cyan(`\nStep 4: Execute quest action`))
  console.log(chalk.gray(`  Executing: ${formatAction(questActions[0], currentState, player1.id)}`))
  executeAction(currentState, questActions[0])
  
  console.log(chalk.cyan(`\nAfter questing:`))
  console.log(chalk.cyan(`  Player lore: ${player1.lore}`))
  console.log(chalk.cyan(`  Board cards:`))
  player1.board.forEach(card => {
    console.log(chalk.white(`    - ${card.name} (Lore: ${card.lore || 'N/A'}, Action State: ${card.actionState})`))
  })
} else {
  console.log(chalk.red(`No quest actions available!`))
  
  // Let's see what actions are available
  const allActions = getAvailableActions(currentState, player1.id)
  console.log(chalk.cyan(`\nAll available actions:`))
  console.log(displayActions(allActions, currentState, player1.id))
}

// Show final state
console.log(chalk.bold(`\n=== Final State ===`))
currentState.players.forEach((player, index) => {
  console.log(chalk.bold(`\nPlayer ${index + 1} (${player.id}):`))
  console.log(chalk.cyan(`  Hand size: ${player.hand.length}`))
  console.log(chalk.cyan(`  Board size: ${player.board.length}`))
  console.log(chalk.cyan(`  Inkwell size: ${player.inkwell.length}`))
  console.log(chalk.cyan(`  Lore: ${player.lore}`))
  console.log(chalk.cyan(`  Available ink: ${player.inkwell.filter(ink => !ink.isExerted).length}`))
})
