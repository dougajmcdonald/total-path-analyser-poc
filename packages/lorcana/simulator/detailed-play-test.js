// Detailed test to show turn progression with "on the play" rule

import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { executeTurn, getAvailableActions, initGame } from './index.js'

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

// Helper function to display hand
function displayHand (hand) {
  return hand.map(card => `  - ${card.name} (Cost: ${card.cost})`).join('\n')
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

console.log(chalk.bold(`=== Detailed "On the Play" Test ===`))

// Initialize game
const gameState = initGame(deck1, deck2)

console.log(chalk.green(`First player: ${gameState.onThePlay}`))
console.log(chalk.green(`Second player: ${gameState.onTheDraw}`))

// Show initial state
console.log(chalk.bold(`\n=== Initial State ===`))
gameState.players.forEach((player, index) => {
  console.log(chalk.bold(`\nPlayer ${index + 1} (${player.id}):`))
  console.log(chalk.cyan(`  Hand size: ${player.hand.length}`))
  console.log(chalk.cyan(`  Deck size: ${player.deck.length}`))
  console.log(chalk.cyan(`  Hand cards:`))
  console.log(displayHand(player.hand))
})

// Simulate first few turns manually to show the progression
console.log(chalk.bold(`\n=== Turn Progression ===`))

let currentState = JSON.parse(JSON.stringify(gameState))
let turn = 1

for (let i = 0; i < 4; i++) { // 4 half-turns (2 full turns)
  const currentPlayer = currentState.players[currentState.currentPlayer]
  const isOnThePlay = currentState.onThePlay === currentPlayer.id
  const isFirstTurn = turn === 1
  
  console.log(chalk.bold(`\n--- Turn ${turn} - ${currentPlayer.id} ${isOnThePlay ? '(ON THE PLAY)' : '(ON THE DRAW)'} ---`))
  
  // Show hand before turn
  console.log(chalk.cyan(`Hand before turn: ${currentPlayer.hand.length} cards`))
  
  // Get available actions
  const actions = getAvailableActions(currentState, currentPlayer.id)
  console.log(chalk.cyan(`Available actions: ${actions.length}`))
  
  // Show ink actions
  const inkActions = actions.filter(a => a.type === 'ink')
  console.log(chalk.cyan(`Ink actions: ${inkActions.length}`))
  
  // Execute a simple turn (ink 1 card, play 1 if possible)
  const turnActions = []
  
  // Ink 1 card (due to "one ink per turn" rule)
  if (inkActions.length > 0) {
    turnActions.push(inkActions[0])
  }
  
  // Try to play a card
  const playActions = actions.filter(a => a.type === 'play')
  if (playActions.length > 0) {
    turnActions.push(playActions[0])
  }
  
  // Show actions taken
  console.log(chalk.bold(`\nActions taken:`))
  console.log(displayActions(turnActions, currentState, currentPlayer.id))
  
  // Execute the turn
  executeTurn(currentState, currentPlayer.id, turnActions)
  
  // Show hand after turn
  const playerAfter = currentState.players.find(p => p.id === currentPlayer.id)
  console.log(chalk.cyan(`\nHand after turn: ${playerAfter.hand.length} cards`))
  console.log(chalk.cyan(`Board size: ${playerAfter.board.length}`))
  console.log(chalk.cyan(`Inkwell size: ${playerAfter.inkwell.length}`))
  console.log(chalk.cyan(`Available ink: ${playerAfter.inkwell.filter(ink => !ink.isExerted).length}`))
  
  // Show if this player drew a card
  if (isFirstTurn && isOnThePlay) {
    console.log(chalk.yellow(`Note: First player doesn't draw on turn 1`))
  } else {
    console.log(chalk.yellow(`Note: Player drew a card this turn`))
  }
  
  // Switch to next player
  currentState.currentPlayer = (currentState.currentPlayer + 1) % currentState.players.length
  if (currentState.currentPlayer === 0) {
    turn++
  }
}

console.log(chalk.bold(`\n=== Final State ===`))
currentState.players.forEach((player, index) => {
  const isOnThePlay = currentState.onThePlay === player.id
  console.log(chalk.bold(`\nPlayer ${index + 1} (${player.id}) ${isOnThePlay ? '(was on the play)' : '(was on the draw)'}:`))
  console.log(chalk.cyan(`  Hand size: ${player.hand.length}`))
  console.log(chalk.cyan(`  Board size: ${player.board.length}`))
  console.log(chalk.cyan(`  Inkwell size: ${player.inkwell.length}`))
  console.log(chalk.cyan(`  Deck size: ${player.deck.length}`))
})
