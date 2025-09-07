// Main simulator package exports

export * from './actions.js'
export * from './game-state.js'
export * from './simulation.js'

// Import functions needed for main simulation runner
import {
    checkGameOver,
    executeTurn,
    getCurrentPlayer,
    initGame,
    switchPlayer
} from './game-state.js'
import { simulateTurn } from './simulation.js'

// Main simulation runner
export function runSimulation (deck1, deck2, maxTurns = 7) {
  const gameState = initGame(deck1, deck2)
  const results = []
  
  for (let turn = 1; turn <= maxTurns; turn++) {
    const currentPlayer = getCurrentPlayer(gameState)
    const simulations = simulateTurn(gameState, currentPlayer.id)
    
    results.push({
      turn,
      player: currentPlayer.id,
      isOnThePlay: gameState.onThePlay === currentPlayer.id,
      simulations: simulations.slice(0, 4) // Top 4
    })
    
    // Execute the best simulation for this turn
    if (simulations.length > 0) {
      const bestSimulation = simulations[0]
      executeTurn(gameState, currentPlayer.id, bestSimulation.actions)
    }
    
    // Switch to next player
    switchPlayer(gameState)
    
    // Check for game over
    if (checkGameOver(gameState)) {
      break
    }
  }
  
  return {
    finalState: gameState,
    turnResults: results,
    winner: gameState.winner
  }
}
