// Comprehensive test showing full simulation with scoring

import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { runSimulation } from '../index.js'

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

console.log(chalk.bold(`=== Full Simulation with Scoring ===`))

// Run simulation
const simulation = runSimulation(deck1, deck2, 5)

console.log(chalk.green(`First player: ${simulation.finalState.onThePlay}`))
console.log(chalk.green(`Second player: ${simulation.finalState.onTheDraw}`))

// Show turn results
console.log(chalk.bold(`\n=== Turn Results ===`))

simulation.turnResults.forEach((turnResult, index) => {
  const { turn, player, isOnThePlay, simulations } = turnResult
  
  console.log(chalk.bold(`\n--- Turn ${turn} - ${player} ${isOnThePlay ? '(ON THE PLAY)' : '(ON THE DRAW)'} ---`))
  
  if (simulations.length > 0) {
    console.log(chalk.cyan(`Top ${simulations.length} simulation(s):`))
    
    simulations.forEach((sim, simIndex) => {
      console.log(chalk.white(`\n  Simulation ${simIndex + 1} (Score: ${sim.score.toFixed(2)}):`))
      console.log(displayActions(sim.actions, sim.state, player))
      
      // Show state after this simulation
      const playerState = sim.state.players.find(p => p.id === player)
      console.log(chalk.cyan(`    Hand: ${playerState.hand.length} cards`))
      console.log(chalk.cyan(`    Board: ${playerState.board.length} cards`))
      console.log(chalk.cyan(`    Lore: ${playerState.lore}`))
      console.log(chalk.cyan(`    Available ink: ${playerState.inkwell.filter(ink => !ink.isExerted).length}`))
      
      if (playerState.board.length > 0) {
        console.log(chalk.cyan(`    Board cards:`))
        playerState.board.forEach(card => {
          console.log(chalk.white(`      - ${card.name} (Lore: ${card.lore || 'N/A'}, Str: ${card.strength || 'N/A'}, Will: ${card.willpower || 'N/A'}, State: ${card.actionState}/${card.playState})`))
        })
      }
    })
  } else {
    console.log(chalk.red(`  No simulations available`))
  }
})

// Show final state
console.log(chalk.bold(`\n=== Final Game State ===`))
simulation.finalState.players.forEach((player, index) => {
  const isOnThePlay = simulation.finalState.onThePlay === player.id
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

if (simulation.winner) {
  console.log(chalk.bold(`\n🏆 Winner: ${simulation.winner}`))
} else {
  console.log(chalk.bold(`\n⏰ Game ended without winner (reached max turns)`))
}
