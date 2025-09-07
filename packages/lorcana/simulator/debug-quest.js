// Debug quest action generation

import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { CARD_STATES } from './game-state.js'
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

// Create test decks
const deck1 = createDeckFromFormat(testDecks.deck1)
const deck2 = createDeckFromFormat(testDecks.deck2)

console.log(chalk.bold(`=== Debug Quest Actions ===`))

// Initialize game
const gameState = initGame(deck1, deck2)

// Manually set up a scenario with a dry character on board
let currentState = JSON.parse(JSON.stringify(gameState))
const player1 = currentState.players[0]

// Ink a card
const inkActions = getAvailableActions(currentState, player1.id).filter(a => a.type === 'ink')
if (inkActions.length > 0) {
  console.log(chalk.cyan(`Inking: ${inkActions[0].cardId}`))
  executeAction(currentState, inkActions[0])
}

// Play a character
const playActions = getAvailableActions(currentState, player1.id).filter(a => a.type === 'play')
if (playActions.length > 0) {
  console.log(chalk.cyan(`Playing: ${playActions[0].cardId}`))
  executeAction(currentState, playActions[0])
}

// Manually set the card to dry state
if (player1.board.length > 0) {
  const boardCard = player1.board[0]
  console.log(chalk.cyan(`\nBefore manual drying:`))
  console.log(chalk.white(`  Card: ${boardCard.name}`))
  console.log(chalk.white(`  Action State: ${boardCard.actionState}`))
  console.log(chalk.white(`  Play State: ${boardCard.playState}`))
  console.log(chalk.white(`  Type: ${boardCard.type}`))
  console.log(chalk.white(`  Lore: ${boardCard.lore}`))
  
  // Manually set to dry
  boardCard.playState = CARD_STATES.DRY
  
  console.log(chalk.cyan(`\nAfter manual drying:`))
  console.log(chalk.white(`  Action State: ${boardCard.actionState}`))
  console.log(chalk.white(`  Play State: ${boardCard.playState}`))
}

// Check quest actions
console.log(chalk.cyan(`\nChecking quest actions...`))
const questActions = getAvailableActions(currentState, player1.id).filter(a => a.type === 'quest')
console.log(chalk.cyan(`Quest actions found: ${questActions.length}`))

if (questActions.length > 0) {
  questActions.forEach(action => {
    console.log(chalk.yellow(`  Quest action: ${action.cardId}`))
  })
} else {
  console.log(chalk.red(`No quest actions found!`))
  
  // Debug the quest validation
  console.log(chalk.cyan(`\nDebugging quest validation:`))
  player1.board.forEach((card, index) => {
    console.log(chalk.white(`  Board card ${index}:`))
    console.log(chalk.white(`    Name: ${card.name}`))
    console.log(chalk.white(`    Action State: ${card.actionState} (should be ${CARD_STATES.READY})`))
    console.log(chalk.white(`    Play State: ${card.playState} (should be ${CARD_STATES.DRY})`))
    console.log(chalk.white(`    Type: ${card.type} (should be 'character')`))
    console.log(chalk.white(`    Lore: ${card.lore}`))
    
    const canQuest = card.actionState === CARD_STATES.READY && 
                     card.playState === CARD_STATES.DRY &&
                     card.type === 'character'
    console.log(chalk.white(`    Can quest: ${canQuest}`))
  })
}

// Show all available actions
const allActions = getAvailableActions(currentState, player1.id)
console.log(chalk.cyan(`\nAll available actions: ${allActions.length}`))
allActions.forEach(action => {
  console.log(chalk.white(`  ${action.type}: ${action.cardId || 'N/A'}`))
})
