import chalk from 'chalk'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { drawCard, executeAction, executeTurn, getCurrentPlayer, initGame, ready, simulateTurn, switchPlayer } from './index.js'

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load the deck data
const deckDataPath = join(__dirname, '../data-import/data/cards-transformed-2025-09-07T13-03-38-221Z.json')
const deckData = JSON.parse(readFileSync(deckDataPath, 'utf8'))

// Create the specific test deck for player 1
const createTestDeck = () => {
  const deck = []
  
  // Define the exact deck list
  const deckList = [
    { name: "Tinker Bell - Giant Fairy", count: 4 },
    { name: "Tipo - Growing Son", count: 4 },
    { name: "Happy - Lively Knight", count: 4 },
    { name: "Doc - Bold Knight", count: 4 },
    { name: "Pleakley - Scientific Expert", count: 4 },
    { name: "Alice - Savvy Sailor", count: 4 },
    { name: "Mr. Arrow - Legacy's First Mate", count: 2 },
    { name: "Pluto - Guard Dog", count: 4 },
    { name: "Jasmine - Resourceful Infiltrator", count: 4 },
    { name: "Jasmine - Steady Strategist", count: 4 },
    { name: "Vincenzo Santorini - The Explosives Expert", count: 4 },
    { name: "Namaari - Single-Minded Rival", count: 2 },
    { name: "Strength of a Raging Fire", count: 4 },
    { name: "Hades - Infernal Schemer", count: 2 },
    { name: "Nala - Undaunted Lioness", count: 2 },
    { name: "Lilo - Best Explorer Ever", count: 4 },
    { name: "Scar - Finally King", count: 4 }
  ]
  
  // Find and add each card
  for (const cardSpec of deckList) {
    const foundCards = deckData.filter(card => card.name === cardSpec.name)
    if (foundCards.length === 0) {
      console.log(`Card not found: ${cardSpec.name}`)
      continue
    }
    
    for (let i = 0; i < cardSpec.count; i++) {
      deck.push({
        ...foundCards[0],
        uniqueId: `${cardSpec.name}-${i}`
      })
    }
  }
  
  return deck
}

// Create decks
const deck1 = createTestDeck() // Specific test deck
const deck2 = createTestDeck() // Same deck for player 2 (will pass anyway)

// Fixed test hand for consistent analysis
const testHand = [
  "Tinker Bell - Giant Fairy",
  "Tipo - Growing Son", 
  "Happy - Lively Knight",
  "Doc - Bold Knight",
  "Pleakley - Scientific Expert",
  "Alice - Savvy Sailor",
  "Mr. Arrow - Legacy's First Mate"
]

console.log(chalk.bold('=== Single Player Analysis (Player 2 Passes) ==='))
console.log(chalk.gray('Player 1: All possible paths evaluated each turn'))
console.log(chalk.gray('Player 2: Passes each turn for simplicity'))
console.log(chalk.gray('Fixed test hand for consistent analysis:'))
console.log(chalk.gray('  Tinker Bell - Giant Fairy, Tipo - Growing Son, Happy - Lively Knight'))
console.log(chalk.gray('  Doc - Bold Knight, Pleakley - Scientific Expert, Alice - Savvy Sailor'))
console.log(chalk.gray('  Mr. Arrow - Legacy\'s First Mate\n'))

// Function to set up fixed test hand
const setupTestHand = (gameState, playerId) => {
  const player = gameState.players.find(p => p.id === playerId)
  
  // Clear the random hand
  player.hand = []
  
  // Add the fixed test hand
  for (const cardName of testHand) {
    const card = deck1.find(c => c.name === cardName)
    if (card) {
      player.hand.push({
        ...card,
        uniqueId: `${cardName}-test-${player.hand.length}`
      })
    }
  }
  
  // Remove the test hand cards from the deck
  for (const cardName of testHand) {
    const deckIndex = player.deck.findIndex(c => c.name === cardName)
    if (deckIndex !== -1) {
      player.deck.splice(deckIndex, 1)
    }
  }
  
  return gameState
}


// Initialize game
let gameState = initGame(deck1, deck2)

// Set up the fixed test hand for player 1
gameState = setupTestHand(gameState, 'player1')

// Show initial state
console.log(chalk.bold('=== Initial State ==='))
console.log(chalk.cyan(`Player 1 hand size: ${gameState.players[0].hand.length}`))
console.log(chalk.cyan(`Player 2 hand size: ${gameState.players[1].hand.length}`))
console.log(chalk.cyan(`First player: ${gameState.onThePlay}\n`))

// Track turns
let turnNumber = 1
const maxTurns = 10

for (let gameTurn = 1; gameTurn <= maxTurns; gameTurn++) {
  const currentPlayer = getCurrentPlayer(gameState)
  const isPlayer1 = currentPlayer.id === 'player1'
  
  console.log(chalk.bold(`\n--- Game Turn ${gameTurn} - ${currentPlayer.id} (Turn ${turnNumber}) ---`))
  
  if (isPlayer1) {
    // Player 1: Evaluate all possible paths
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
    
    // Check if a card will be drawn this turn
    const isFirstTurn = gameState.turn === 1
    const isOnThePlay = gameState.onThePlay === currentPlayer.id
    const shouldDraw = !(isFirstTurn && isOnThePlay)
    
    if (shouldDraw) {
      console.log(chalk.green(`  📥 Card will be drawn this turn (not first turn or not on the play)`))
    } else {
      console.log(chalk.yellow(`  ⏭️  No card drawn (first turn on the play)`))
    }
    
    // Ready the player for their turn (reset ink, card states, inking flag)
    ready(gameState, currentPlayer.id)
    
    // Execute the draw phase first
    if (shouldDraw) {
      console.log(chalk.cyan(`\n📥 Draw Phase:`))
      drawCard(gameState, currentPlayer.id)
    } else {
      console.log(chalk.yellow(`\n⏭️  Draw Phase: No draw (first turn on the play)`))
    }
    
    // Now simulate all possible paths with the drawn card included
    const simulations = simulateTurn(gameState, currentPlayer.id, turnNumber)
    
    console.log(chalk.yellow(`\n📊 All Possible Paths (${simulations.length} found):`))
    
    simulations.forEach((sim, index) => {
      const isOptimal = index === 0
      const scoreColor = isOptimal ? chalk.green : chalk.white
      const pathColor = isOptimal ? chalk.green.bold : chalk.white
      
      console.log(scoreColor(`\n  Path ${index + 1} (Score: ${sim.score.toFixed(2)})${isOptimal ? ' ⭐ OPTIMAL' : ''}:`))
      console.log(pathColor(`    Actions: ${JSON.stringify(sim.actions, null, 2)}`))
      console.log(scoreColor(`    Final state: Hand: ${sim.state.players[0].hand.length}, Board: ${sim.state.players[0].board.length}, Lore: ${sim.state.players[0].lore}, Ink: ${sim.state.players[0].inkwell.filter(ink => !ink.isExerted).length}`))
    })
    
    // Execute the optimal path
    if (simulations.length > 0) {
      const optimalSimulation = simulations[0]
      console.log(chalk.green.bold(`\n✅ Executing optimal path: ${JSON.stringify(optimalSimulation.actions)}`))
      
      console.log(chalk.cyan(`\n🎮 Main Phase: Actions executed`))
      
      // Execute only the main phase actions (draw already happened)
      for (const action of optimalSimulation.actions) {
        executeAction(gameState, action)
      }
    }
    
    turnNumber++
  } else {
    // Player 2: Just pass
    console.log(chalk.gray(`Player 2 passes (simplified analysis)`))
    executeTurn(gameState, currentPlayer.id, [{ type: 'pass', playerId: currentPlayer.id, cost: 0 }])
  }
  
  // Switch to next player
  switchPlayer(gameState)
  
  // Check for game over
  if (gameState.winner) {
    console.log(chalk.bold(`\n🎉 Game Over! Winner: ${gameState.winner}`))
    break
  }
}

// Show final state
console.log(chalk.bold('\n=== Final Game State ==='))
console.log(chalk.cyan(`Player 1:`))
console.log(chalk.cyan(`  Hand size: ${gameState.players[0].hand.length}`))
console.log(chalk.cyan(`  Board size: ${gameState.players[0].board.length}`))
console.log(chalk.cyan(`  Lore: ${gameState.players[0].lore}`))
console.log(chalk.cyan(`  Inkwell size: ${gameState.players[0].inkwell.length}`))

if (gameState.players[0].board.length > 0) {
  console.log(chalk.cyan(`  Board cards:`))
  gameState.players[0].board.forEach(card => {
    console.log(chalk.white(`    - ${card.name} (Lore: ${card.lore || 'N/A'}, Str: ${card.strength || 'N/A'}, Will: ${card.willpower || 'N/A'})`))
  })
}

console.log(chalk.cyan(`\nPlayer 2:`))
console.log(chalk.cyan(`  Hand size: ${gameState.players[1].hand.length}`))
console.log(chalk.cyan(`  Board size: ${gameState.players[1].board.length}`))
console.log(chalk.cyan(`  Lore: ${gameState.players[1].lore}`))
console.log(chalk.cyan(`  Inkwell size: ${gameState.players[1].inkwell.length}`))

if (gameState.players[1].board.length > 0) {
  console.log(chalk.cyan(`  Board cards:`))
  gameState.players[1].board.forEach(card => {
    console.log(chalk.white(`    - ${card.name} (Lore: ${card.lore || 'N/A'}, Str: ${card.strength || 'N/A'}, Will: ${card.willpower || 'N/A'})`))
  })
}

if (!gameState.winner) {
  console.log(chalk.bold(`\n⏰ Game ended without winner (reached max turns)`))
}
