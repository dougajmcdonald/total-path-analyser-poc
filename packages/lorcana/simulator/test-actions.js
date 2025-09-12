// Test script for the new action system

import { ActionExecutor } from './actions/ActionExecutor.js'
import { IAction } from './entities/card/IAction.js'
import { ICharacter } from './entities/card/ICharacter.js'
import { Deck } from './entities/deck/Deck.js'
import { IGameState } from './entities/game/IGameState.js'
import { Player } from './entities/player/Player.js'

// Create test cards
const testCards = [
  new ICharacter('card1', 'Mickey Mouse', true, null, 2, 2, 1),
  new ICharacter('card2', 'Goofy', true, null, 3, 3, 2),
  new IAction('card3', 'Heal', true, null, 1),
  new ICharacter('card4', 'Donald Duck', true, null, 4, 4, 3),
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

// Create action executor
const executor = new ActionExecutor()

console.log('=== Action System Test ===')
console.log('Initial game state:')
console.log(
  `Player 1 hand: ${gameState.getPlayerState('player1').hand.length} cards`
)
console.log(
  `Player 1 inkwell: ${gameState.getPlayerState('player1').inkwell.length} cards`
)
console.log(
  `Player 1 board: ${gameState.getPlayerState('player1').board.length} cards`
)

// Draw initial hands
for (let i = 0; i < 7; i++) {
  const drawAction = { type: 'draw', playerId: 'player1' }
  executor.executeAction(gameState, drawAction)
}

console.log('\nAfter drawing 7 cards:')
console.log(
  `Player 1 hand: ${gameState.getPlayerState('player1').hand.length} cards`
)

// Get all valid actions
const validActions = executor.getValidActions(gameState, 'player1')
console.log('\nValid actions for player 1:')
validActions.forEach((action, index) => {
  console.log(`${index + 1}. ${action.type} - ${action.cardId || 'N/A'}`)
})

// Try to ink a card
if (validActions.some((action) => action.type === 'ink')) {
  const inkAction = validActions.find((action) => action.type === 'ink')
  console.log(`\nExecuting ink action: ${inkAction.cardId}`)
  executor.executeAction(gameState, inkAction)

  console.log('After inking:')
  console.log(
    `Player 1 hand: ${gameState.getPlayerState('player1').hand.length} cards`
  )
  console.log(
    `Player 1 inkwell: ${gameState.getPlayerState('player1').inkwell.length} cards`
  )
}

// Try to play a card
const playActions = validActions.filter((action) => action.type === 'play')
if (playActions.length > 0) {
  const playAction = playActions[0]
  console.log(`\nExecuting play action: ${playAction.cardId}`)
  executor.executeAction(gameState, playAction)

  console.log('After playing:')
  console.log(
    `Player 1 hand: ${gameState.getPlayerState('player1').hand.length} cards`
  )
  console.log(
    `Player 1 board: ${gameState.getPlayerState('player1').board.length} cards`
  )
}

console.log('\n=== Test Complete ===')
