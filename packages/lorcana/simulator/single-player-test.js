// Test showing one player's action paths across multiple turns

import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { executeTurn, initGame, simulateTurn } from './index.js'

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

console.log(chalk.bold(`=== Single Player Action Paths (5 Turns) ===`))

// Initialize game
const gameState = initGame(deck1, deck2)
const player1 = gameState.players[0]

console.log(chalk.green(`Player: ${player1.id}`))
console.log(chalk.green(`First player: ${gameState.onThePlay}`))

// Show initial state
console.log(chalk.cyan(`\n=== Initial State ===`))
console.log(chalk.cyan(`  Hand size: ${player1.hand.length}`))
console.log(chalk.cyan(`  Board size: ${player1.board.length}`))
console.log(chalk.cyan(`  Lore: ${player1.lore}`))
console.log(chalk.cyan(`  Available ink: ${player1.inkwell.filter(ink => !ink.isExerted).length}`))

// Simulate 5 turns for this player
let currentState = JSON.parse(JSON.stringify(gameState))
let turn = 1

console.log(chalk.bold(`\n=== Turn-by-Turn Action Paths ===`))

for (let i = 0; i < 5; i++) {
  const isOnThePlay = currentState.onThePlay === player1.id
  const isFirstTurn = turn === 1
  
  console.log(chalk.bold(`\n--- Turn ${turn} - ${player1.id} ${isOnThePlay ? '(ON THE PLAY)' : '(ON THE DRAW)'} ---`))
  
  // Show state before turn
  const player = currentState.players.find(p => p.id === player1.id)
  console.log(chalk.cyan(`\nState before turn:`))
  console.log(chalk.cyan(`  Hand size: ${player.hand.length}`))
  console.log(chalk.cyan(`  Board size: ${player.board.length}`))
  console.log(chalk.cyan(`  Lore: ${player.lore}`))
  console.log(chalk.cyan(`  Available ink: ${player.inkwell.filter(ink => !ink.isExerted).length}`))
  
  if (player.board.length > 0) {
    console.log(chalk.cyan(`  Board cards:`))
    player.board.forEach(card => {
      console.log(chalk.white(`    - ${card.name} (Lore: ${card.lore || 'N/A'}, Str: ${card.strength || 'N/A'}, Will: ${card.willpower || 'N/A'}, State: ${card.actionState}/${card.playState})`))
    })
  }
  
  // Get all possible action paths for this turn
  const simulations = simulateTurn(currentState, player1.id, turn, 5)
  
  console.log(chalk.cyan(`\nExplored action paths: ${simulations.length}`))
  
  simulations.forEach((sim, index) => {
    console.log(chalk.white(`\n  Path ${index + 1} (Score: ${sim.score.toFixed(2)}):`))
    console.log(displayActions(sim.actions, sim.state, player1.id))
    
    // Show final state for this path
    const finalPlayer = sim.state.players.find(p => p.id === player1.id)
    console.log(chalk.cyan(`    Final state: Hand: ${finalPlayer.hand.length}, Board: ${finalPlayer.board.length}, Lore: ${finalPlayer.lore}, Ink: ${finalPlayer.inkwell.filter(ink => !ink.isExerted).length}`))
  })
  
  // Execute the best path
  if (simulations.length > 0) {
    const bestPath = simulations[0]
    console.log(chalk.green(`\n  → Executing best path: ${bestPath.actions.length} actions`))
    
    // Execute the turn
    executeTurn(currentState, player1.id, bestPath.actions)
    
    // Show state after turn
    const playerAfter = currentState.players.find(p => p.id === player1.id)
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
  
  // Switch to next player and back to simulate turn progression
  currentState.currentPlayer = 1
  currentState.turn = turn + 1
  currentState.currentPlayer = 0
  turn++
}

console.log(chalk.bold(`\n=== Final State ===`))
const finalPlayer = currentState.players.find(p => p.id === player1.id)
console.log(chalk.cyan(`  Hand size: ${finalPlayer.hand.length}`))
console.log(chalk.cyan(`  Board size: ${finalPlayer.board.length}`))
console.log(chalk.cyan(`  Inkwell size: ${finalPlayer.inkwell.length}`))
console.log(chalk.cyan(`  Lore: ${finalPlayer.lore}`))
console.log(chalk.cyan(`  Available ink: ${finalPlayer.inkwell.filter(ink => !ink.isExerted).length}`))
