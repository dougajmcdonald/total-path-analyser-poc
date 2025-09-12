// Test script for the complete path analysis system

import { IAction } from './entities/card/IAction.js'
import { ICharacter } from './entities/card/ICharacter.js'
import { ILocation } from './entities/card/ILocation.js'
import { Deck } from './entities/deck/Deck.js'
import { IGameState } from './entities/game/IGameState.js'
import { Player } from './entities/player/Player.js'
import { Simulator } from './simulation/Simulator.js'

// Create test cards
const testCards = [
  new ICharacter('card1', 'Mickey Mouse', true, null, 2, 2, 1),
  new ICharacter('card2', 'Goofy', true, null, 3, 3, 2),
  new IAction('card3', 'Heal', true, null, 1),
  new ICharacter('card4', 'Donald Duck', true, null, 4, 4, 3),
  new ILocation('card5', 'Castle', true, null, 2, 2),
  new ICharacter('card6', 'Pluto', true, null, 1, 1, 1),
  new IAction('card7', 'Fireball', true, null, 2),
  new ICharacter('card8', 'Minnie Mouse', true, null, 3, 2, 2),
]

// Create test decks
const deck1 = new Deck([...testCards])
const deck2 = new Deck([...testCards])

// Create players
const player1 = new Player('player1', deck1)
const player2 = new Player('player2', deck2)

// Create game state
const gameState = new IGameState('test-game', [player1, player2])
gameState.initializeGame()

// Create simulator
const simulator = new Simulator(gameState)

console.log('=== Path Analysis System Test ===')
console.log('Initial game state:')
console.log(`Turn: ${gameState.getTurn()}`)
console.log(`Active Player: ${gameState.getActivePlayer().id}`)

// Draw initial hands
for (let i = 0; i < 7; i++) {
  const drawAction = { type: 'draw', playerId: 'player1' }
  simulator.turnExecutor.executeAction(drawAction)
}

console.log('\nAfter drawing 7 cards:')
const player1State = gameState.getPlayerState('player1')
console.log(`Player 1 hand: ${player1State.hand.length} cards`)
console.log(`Player 1 inkwell: ${player1State.inkwell.length} cards`)
console.log(`Player 1 board: ${player1State.board.length} cards`)

// Test path analysis
console.log('\n=== Path Analysis ===')
const actionSequences = simulator.getActionSequences('player1')
console.log(`Found ${actionSequences.length} possible action sequences:`)

actionSequences.slice(0, 5).forEach((sequence, index) => {
  console.log(`\n${index + 1}. Score: ${sequence.score.toFixed(2)}`)
  sequence.actions.forEach((action, actionIndex) => {
    console.log(
      `   ${actionIndex + 1}. ${action.type} - ${action.cardId || 'N/A'}`
    )
  })
})

// Test best action
console.log('\n=== Best Action ===')
const bestAction = simulator.getBestAction('player1')
if (bestAction) {
  console.log(`Best action: ${bestAction.type} - ${bestAction.cardId || 'N/A'}`)
} else {
  console.log('No valid actions available')
}

// Test best sequence
console.log('\n=== Best Sequence ===')
const bestSequence = simulator.getBestSequence('player1')
console.log(`Best sequence (${bestSequence.length} actions):`)
bestSequence.forEach((action, index) => {
  console.log(`  ${index + 1}. ${action.type} - ${action.cardId || 'N/A'}`)
})

// Test turn simulation
console.log('\n=== Turn Simulation ===')
const turnLog = simulator.simulateTurn('player1', 'best')
console.log(`Turn executed with strategy: ${turnLog.strategy}`)
console.log(`Final score: ${turnLog.finalScore.toFixed(2)}`)

// Show final state
console.log('\nAfter turn execution:')
const finalState = simulator.getGameState()
const finalPlayer1State = finalState.getPlayerState('player1')
console.log(`Player 1 hand: ${finalPlayer1State.hand.length} cards`)
console.log(`Player 1 inkwell: ${finalPlayer1State.inkwell.length} cards`)
console.log(`Player 1 board: ${finalPlayer1State.board.length} cards`)
console.log(`Player 1 lore: ${finalPlayer1State.lore}`)

// Test different strategies
console.log('\n=== Strategy Comparison ===')
const strategies = ['best', 'aggressive', 'defensive', 'random']
strategies.forEach((strategy) => {
  // Reset game state
  const newGameState = new IGameState('test-game', [player1, player2])
  newGameState.initializeGame()
  simulator.reset(newGameState)

  // Draw initial hands
  for (let i = 0; i < 7; i++) {
    const drawAction = { type: 'draw', playerId: 'player1' }
    simulator.turnExecutor.executeAction(drawAction)
  }

  // Simulate turn
  const turnResult = simulator.simulateTurn('player1', strategy)
  console.log(`${strategy}: Score ${turnResult.finalScore.toFixed(2)}`)
})

console.log('\n=== Test Complete ===')
