// Main simulator for Lorcana game simulation

import { TurnEvaluator } from './TurnEvaluator.js'
import { TurnExecutor } from './TurnExecutor.js'

export class Simulator {
  constructor(gameState) {
    this.gameState = gameState
    this.turnExecutor = new TurnExecutor(gameState)
    this.turnEvaluator = new TurnEvaluator(gameState)
    this.maxTurns = 50 // Maximum turns per game
    this.strategies = {
      player1: 'best',
      player2: 'best',
    }
  }

  // Simulate a complete game
  simulate(strategy1 = 'best', strategy2 = 'best') {
    this.strategies.player1 = strategy1
    this.strategies.player2 = strategy2

    const gameLog = []
    let turnCount = 0

    while (!this.gameState.isGameOver() && turnCount < this.maxTurns) {
      const currentPlayer = this.gameState.getActivePlayer()
      const playerId = currentPlayer.id
      const strategy = this.strategies[playerId]

      // Log turn start
      gameLog.push({
        turn: this.gameState.getTurn(),
        player: playerId,
        strategy: strategy,
        phase: 'start',
      })

      // Execute turn
      this.turnExecutor.executeTurn(playerId, strategy)

      // Log turn end
      const playerState = this.gameState.getPlayerState(playerId)
      gameLog.push({
        turn: this.gameState.getTurn(),
        player: playerId,
        phase: 'end',
        lore: playerState.lore,
        handSize: playerState.hand.length,
        boardSize: playerState.board.length,
        inkwellSize: playerState.inkwell.length,
      })

      // Switch to next player
      this.gameState.switchPlayer()
      turnCount++
    }

    return {
      gameState: this.gameState,
      winner: this.gameState.getWinner(),
      turns: turnCount,
      log: gameLog,
    }
  }

  // Simulate a single turn
  simulateTurn(playerId, strategy = 'best') {
    const turnLog = {
      player: playerId,
      strategy: strategy,
      actions: [],
      finalScore: 0,
    }

    // Get turn evaluation
    const evaluation = this.turnEvaluator.evaluateTurn(playerId)
    turnLog.evaluation = evaluation

    // Execute turn
    this.turnExecutor.executeTurn(playerId, strategy)

    // Calculate final score
    const playerState = this.gameState.getPlayerState(playerId)
    turnLog.finalScore = this.turnEvaluator.scoreGameState(
      this.gameState,
      playerId
    )

    return turnLog
  }

  // Get all possible action sequences for a player
  getActionSequences(playerId) {
    return this.turnEvaluator.evaluateTurn(playerId)
  }

  // Get the best action for a player
  getBestAction(playerId) {
    return this.turnEvaluator.getBestAction(playerId)
  }

  // Get the best action sequence for a player
  getBestSequence(playerId) {
    return this.turnEvaluator.getBestSequence(playerId)
  }

  // Set strategy for a player
  setStrategy(playerId, strategy) {
    this.strategies[playerId] = strategy
  }

  // Set maximum turns
  setMaxTurns(maxTurns) {
    this.maxTurns = maxTurns
  }

  // Set evaluator parameters
  setMaxDepth(depth) {
    this.turnEvaluator.setMaxDepth(depth)
    this.turnExecutor.setMaxDepth(depth)
  }

  setMaxSequences(max) {
    this.turnEvaluator.setMaxSequences(max)
    this.turnExecutor.setMaxSequences(max)
  }

  // Get current game state
  getGameState() {
    return this.gameState
  }

  // Update game state
  updateGameState(gameState) {
    this.gameState = gameState
    this.turnExecutor.updateGameState(gameState)
    this.turnEvaluator.gameState = gameState
  }

  // Reset simulator with new game state
  reset(gameState) {
    this.gameState = gameState
    this.turnExecutor = new TurnExecutor(gameState)
    this.turnEvaluator = new TurnEvaluator(gameState)
  }

  // Get simulation statistics
  getStats() {
    const player1State = this.gameState.getPlayerState('player1')
    const player2State = this.gameState.getPlayerState('player2')

    return {
      turn: this.gameState.getTurn(),
      player1: {
        lore: player1State.lore,
        handSize: player1State.hand.length,
        boardSize: player1State.board.length,
        inkwellSize: player1State.inkwell.length,
      },
      player2: {
        lore: player2State.lore,
        handSize: player2State.hand.length,
        boardSize: player2State.board.length,
        inkwellSize: player2State.inkwell.length,
      },
      winner: this.gameState.getWinner(),
    }
  }
}
