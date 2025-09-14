// Test showing both players' action paths across 5 turns each (10 total game turns)

import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { executeTurn, initGame, simulateTurn } from '../index.js'

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

console.log(chalk.bold(`=== Both Players Action Paths (5 Turns Each) ===`))

// Initialize game
const gameState = initGame(deck1, deck2)

console.log(chalk.green(`First player: ${gameState.onThePlay}`))
console.log(chalk.green(`Second player: ${gameState.onTheDraw}`))

// Show initial state
console.log(chalk.cyan(`\n=== Initial State ===`))
gameState.players.forEach((player, index) => {
  console.log(chalk.cyan(`\nPlayer ${index + 1} (${player.id}):`))
  console.log(chalk.cyan(`  Hand size: ${player.hand.length}`))
  console.log(chalk.cyan(`  Board size: ${player.board.length}`))
  console.log(chalk.cyan(`  Lore: ${player.lore}`))
  console.log(chalk.cyan(`  Available ink: ${player.inkwell.filter(ink => !ink.isExerted).length}`))
})

// Simulate 10 game turns (5 per player)
let currentState = JSON.parse(JSON.stringify(gameState))
let gameTurn = 1
let player1Turns = 0
let player2Turns = 0

console.log(chalk.bold(`\n=== Turn-by-Turn Action Paths ===`))

for (let i = 0; i < 10; i++) {
  const currentPlayer = currentState.players[currentState.currentPlayer]
  const isOnThePlay = currentState.onThePlay === currentPlayer.id
  const isFirstTurn = gameTurn === 1
  
  // Track turns per player
  if (currentPlayer.id === 'player1') {
    player1Turns++
  } else {
    player2Turns++
  }
  
  console.log(chalk.bold(`\n--- Game Turn ${gameTurn} - ${currentPlayer.id} (Player Turn ${currentPlayer.id === 'player1' ? player1Turns : player2Turns}) ${isOnThePlay ? '(ON THE PLAY)' : '(ON THE DRAW)'} ---`))
  
  // Show state before turn
  console.log(chalk.cyan(`\nState before turn:`))
  console.log(chalk.cyan(`  Hand size: ${currentPlayer.hand.length}`))
  console.log(chalk.cyan(`  Board size: ${currentPlayer.board.length}`))
  console.log(chalk.cyan(`  Lore: ${currentPlayer.lore}`))
  console.log(chalk.cyan(`  Available ink: ${currentPlayer.inkwell.filter(ink => !ink.isExerted).length}`))
  
  if (currentPlayer.hand.length > 0) {
    console.log(chalk.cyan(`  Hand cards:`))
    currentPlayer.hand.forEach((card, index) => {
      console.log(chalk.white(`    ${index + 1}. ${card.name} (Cost: ${card.cost}, Inkable: ${card.inkable}, Lore: ${card.lore || 'N/A'})`))
    })
  }
  
  if (currentPlayer.board.length > 0) {
    console.log(chalk.cyan(`  Board cards:`))
    currentPlayer.board.forEach(card => {
      console.log(chalk.white(`    - ${card.name} (Lore: ${card.lore || 'N/A'}, Str: ${card.strength || 'N/A'}, Will: ${card.willpower || 'N/A'}, State: ${card.actionState}/${card.playState})`))
    })
  }
  
  // Get all possible action paths for this turn
  const simulations = simulateTurn(currentState, currentPlayer.id, gameTurn, 5)
  
  console.log(chalk.cyan(`\nExplored action paths: ${simulations.length}`))
  
  simulations.forEach((sim, index) => {
    console.log(chalk.white(`\n  Path ${index + 1} (Score: ${sim.score.toFixed(2)}):`))
    console.log(displayActions(sim.actions, sim.state, currentPlayer.id))
    
    // Show final state for this path
    const finalPlayer = sim.state.players.find(p => p.id === currentPlayer.id)
    console.log(chalk.cyan(`    Final state: Hand: ${finalPlayer.hand.length}, Board: ${finalPlayer.board.length}, Lore: ${finalPlayer.lore}, Ink: ${finalPlayer.inkwell.filter(ink => !ink.isExerted).length}`))
  })
  
  // Execute the best path
  if (simulations.length > 0) {
    const bestPath = simulations[0]
    console.log(chalk.green(`\n  → Executing best path: ${bestPath.actions.length} actions`))
    
    // Execute the turn
    executeTurn(currentState, currentPlayer.id, bestPath.actions)
    
    // Show state after turn
    const playerAfter = currentState.players.find(p => p.id === currentPlayer.id)
    console.log(chalk.cyan(`\nState after turn:`))
    console.log(chalk.cyan(`  Hand size: ${playerAfter.hand.length}`))
    console.log(chalk.cyan(`  Board size: ${playerAfter.board.length}`))
    console.log(chalk.cyan(`  Lore: ${playerAfter.lore}`))
    console.log(chalk.cyan(`  Available ink: ${playerAfter.inkwell.filter(ink => !ink.isExerted).length}`))
    
    if (playerAfter.board.length > 0) {
      console.log(chalk.cyan(`  Board cards:`))
      playerAfter.board.forEach(card => {
        console.log(chalk.white(`    - ${card.name} (Lore: ${card.lore || 'N/A'}, Str: ${card.strength || 'N/A'}, Will: ${card.willpower || 'N/A'}, State: ${card.actionState}/${card.playState})`))
      })
    }
  }
  
  // Switch to next player
  currentState.currentPlayer = (currentState.currentPlayer + 1) % currentState.players.length
  if (currentState.currentPlayer === 0) {
    gameTurn++
  }
}

console.log(chalk.bold(`\n=== Final Game State ===`))
currentState.players.forEach((player, index) => {
  const isOnThePlay = currentState.onThePlay === player.id
  console.log(chalk.bold(`\nPlayer ${index + 1} (${player.id}) ${isOnThePlay ? '(was on the play)' : '(was on the draw)'}:`))
  console.log(chalk.cyan(`  Hand size: ${player.hand.length}`))
  console.log(chalk.cyan(`  Board size: ${player.board.length}`))
  console.log(chalk.cyan(`  Inkwell size: ${player.inkwell.length}`))
  console.log(chalk.cyan(`  Lore: ${player.lore}`))
  console.log(chalk.cyan(`  Available ink: ${player.inkwell.filter(ink => !ink.isExerted).length}`))
  
  if (player.board.length > 0) {
    console.log(chalk.cyan(`  Board cards:`))
    player.board.forEach(card => {
      console.log(chalk.white(`    - ${card.name} (Lore: ${card.lore || 'N/A'}, Str: ${card.strength || 'N/A'}, Will: ${card.willpower || 'N/A'})`))
    })
  }
})

if (currentState.winner) {
  console.log(chalk.bold(`\n🏆 Winner: ${currentState.winner}`))
} else {
  console.log(chalk.bold(`\n⏰ Game ended without winner (reached max turns)`))
}
