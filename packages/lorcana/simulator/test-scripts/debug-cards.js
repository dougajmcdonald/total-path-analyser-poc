// Debug card costs and available actions

import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { getAvailableInk } from '../game-state.js'
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

// Create test decks
const deck1 = createDeckFromFormat(testDecks.deck1)
const deck2 = createDeckFromFormat(testDecks.deck2)

console.log(chalk.bold(`=== Debug Card Costs ===`))

// Initialize game
const gameState = initGame(deck1, deck2)
const player1 = gameState.players[0]

console.log(chalk.green(`First player: ${gameState.onThePlay}`))

// Show initial hand
console.log(chalk.cyan(`\nInitial hand:`))
player1.hand.forEach((card, index) => {
  console.log(chalk.white(`  ${index + 1}. ${card.name} (Cost: ${card.cost}, Inkable: ${card.inkable})`))
})

console.log(chalk.cyan(`\nAvailable ink: ${getAvailableInk(gameState, player1.id)}`))

// Ink a card and check again
let currentState = JSON.parse(JSON.stringify(gameState))
const inkActions = getAvailableActions(currentState, player1.id).filter(a => a.type === 'ink')
if (inkActions.length > 0) {
  console.log(chalk.gray(`\nInking: ${inkActions[0].cardId}`))
  executeAction(currentState, inkActions[0])
  
  console.log(chalk.cyan(`\nAfter inking:`))
  console.log(chalk.cyan(`  Available ink: ${getAvailableInk(currentState, player1.id)}`))
  
  // Show hand after inking
  console.log(chalk.cyan(`\nHand after inking:`))
  currentState.players[0].hand.forEach((card, index) => {
    console.log(chalk.white(`  ${index + 1}. ${card.name} (Cost: ${card.cost}, Inkable: ${card.inkable})`))
  })
  
  // Check play actions
  const playActions = getAvailableActions(currentState, player1.id).filter(a => a.type === 'play')
  console.log(chalk.cyan(`\nPlay actions available: ${playActions.length}`))
  
  if (playActions.length === 0) {
    console.log(chalk.red(`No play actions available!`))
    
    // Debug why no play actions
    console.log(chalk.cyan(`\nDebugging play action validation:`))
    currentState.players[0].hand.forEach(card => {
      const canPlay = card.cost <= getAvailableInk(currentState, player1.id)
      console.log(chalk.white(`  ${card.name}: Cost ${card.cost} <= Available Ink ${getAvailableInk(currentState, player1.id)} = ${canPlay}`))
    })
  } else {
    playActions.forEach(action => {
      const card = currentState.players[0].hand.find(c => c.uniqueId === action.cardId)
      console.log(chalk.green(`  Can play: ${card.name} (Cost: ${card.cost})`))
    })
  }
}
