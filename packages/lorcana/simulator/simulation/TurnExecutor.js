// Turn executor for executing recommended action sequences

import { ActionExecutor } from '../actions/ActionExecutor.js'
import { TurnEvaluator } from './TurnEvaluator.js'

export class TurnExecutor {
  constructor(gameState) {
    this.gameState = gameState
    this.executor = new ActionExecutor()
    this.evaluator = new TurnEvaluator(gameState)
  }

  // Execute a complete turn for a player
  executeTurn(playerId, strategy = 'best') {
    const playerState = this.gameState.getPlayerState(playerId)
    if (!playerState) {
      return this.gameState
    }

    // Ready phase: prepare player for their turn
    this.readyPlayer(playerId)
    this.gameState.setPhase('ready')

    // Draw phase: draw a card (unless it's the first turn and player is on the play)
    this.handleDrawPhase(playerId)

    // Main phase: execute actions based on strategy
    this.handleMainPhase(playerId, strategy)

    // Pass phase: end turn
    this.gameState.setPhase('pass')

    return this.gameState
  }

  // Ready a player for their turn
  readyPlayer(playerId) {
    const playerState = this.gameState.getPlayerState(playerId)
    if (!playerState) return

    // Ready all exerted ink
    playerState.inkwell.forEach((ink) => {
      ink.exerted = false
    })

    // Ready exerted board cards and transition drying cards to dry
    playerState.board.forEach((card) => {
      if (card.exerted) {
        card.ready()
      }
      if (!card.isReady()) {
        card.dry()
      }
    })

    // Reset inking flag for new turn
    playerState.hasInkedThisTurn = false
  }

  // Handle draw phase
  handleDrawPhase(playerId) {
    const isFirstTurn = this.gameState.getTurn() === 1
    const isOnThePlay = this.gameState.getActivePlayer().id === playerId

    // Don't draw on first turn if on the play
    if (isFirstTurn && isOnThePlay) {
      return
    }

    // Draw a card
    const drawAction = { type: 'draw', playerId }
    this.executor.executeAction(this.gameState, drawAction)
    this.gameState.setPhase('draw')
  }

  // Handle main phase with strategy
  handleMainPhase(playerId, strategy) {
    this.gameState.setPhase('main')

    switch (strategy) {
      case 'best':
        this.executeBestSequence(playerId)
        break
      case 'random':
        this.executeRandomSequence(playerId)
        break
      case 'aggressive':
        this.executeAggressiveSequence(playerId)
        break
      case 'defensive':
        this.executeDefensiveSequence(playerId)
        break
      default:
        this.executeBestSequence(playerId)
    }
  }

  // Execute the best action sequence
  executeBestSequence(playerId) {
    const bestSequence = this.evaluator.getBestSequence(playerId)
    this.executeActionSequence(bestSequence)
  }

  // Execute a random action sequence
  executeRandomSequence(playerId) {
    const sequences = this.evaluator.evaluateTurn(playerId)
    if (sequences.length === 0) return

    // Pick a random sequence from the top 5
    const topSequences = sequences.slice(0, 5)
    const randomIndex = Math.floor(Math.random() * topSequences.length)
    const randomSequence = topSequences[randomIndex].actions

    this.executeActionSequence(randomSequence)
  }

  // Execute an aggressive sequence (prioritize damage/challenges)
  executeAggressiveSequence(playerId) {
    const sequences = this.evaluator.evaluateTurn(playerId)
    if (sequences.length === 0) return

    // Find sequences with challenge actions
    const aggressiveSequences = sequences.filter((seq) =>
      seq.actions.some((action) => action.type === 'challenge')
    )

    if (aggressiveSequences.length > 0) {
      this.executeActionSequence(aggressiveSequences[0].actions)
    } else {
      this.executeBestSequence(playerId)
    }
  }

  // Execute a defensive sequence (prioritize questing/lore)
  executeDefensiveSequence(playerId) {
    const sequences = this.evaluator.evaluateTurn(playerId)
    if (sequences.length === 0) return

    // Find sequences with quest actions
    const defensiveSequences = sequences.filter((seq) =>
      seq.actions.some((action) => action.type === 'quest')
    )

    if (defensiveSequences.length > 0) {
      this.executeActionSequence(defensiveSequences[0].actions)
    } else {
      this.executeBestSequence(playerId)
    }
  }

  // Execute a sequence of actions
  executeActionSequence(actions) {
    for (const action of actions) {
      this.executor.executeAction(this.gameState, action)
    }
  }

  // Execute a single action
  executeAction(action) {
    return this.executor.executeAction(this.gameState, action)
  }

  // Get all valid actions for a player
  getValidActions(playerId) {
    return this.executor.getValidActions(this.gameState, playerId)
  }

  // Get turn evaluation for a player
  getTurnEvaluation(playerId) {
    return this.evaluator.evaluateTurn(playerId)
  }

  // Set evaluator parameters
  setMaxDepth(depth) {
    this.evaluator.setMaxDepth(depth)
  }

  setMaxSequences(max) {
    this.evaluator.setMaxSequences(max)
  }

  // Update game state reference
  updateGameState(gameState) {
    this.gameState = gameState
    this.evaluator.gameState = gameState
  }
}
