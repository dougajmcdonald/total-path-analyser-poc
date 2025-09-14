// Turn evaluator for analyzing possible action sequences

import { ActionExecutor } from '../actions/ActionExecutor.js'
import { CardActionValidator } from '../validation/CardActionValidator.js'

export class TurnEvaluator {
  constructor(gameState) {
    this.gameState = gameState
    this.executor = new ActionExecutor()
    this.validator = new CardActionValidator()
    this.maxDepth = 3 // Maximum actions per turn
    this.maxSequences = 50 // Maximum sequences to evaluate
  }

  // Main method to evaluate turn and return best action sequences
  evaluateTurn(playerId) {
    const playerState = this.gameState.getPlayerState(playerId)
    if (!playerState) {
      return []
    }

    // Generate all possible action sequences
    const sequences = this.generateActionSequences(playerId)

    // Score each sequence
    const scoredSequences = sequences.map((sequence) => ({
      actions: sequence,
      score: this.scoreActionSequence(sequence, playerId),
    }))

    // Sort by score (highest first) and return top sequences
    return scoredSequences.sort((a, b) => b.score - a.score).slice(0, 10) // Return top 10 sequences
  }

  // Generate all possible action sequences for a player
  generateActionSequences(playerId) {
    const sequences = []
    const currentState = this.deepCopyGameState(this.gameState)

    this.exploreActionPaths(currentState, playerId, [], sequences, 0)

    return sequences
  }

  // Recursively explore action paths
  exploreActionPaths(
    gameState,
    playerId,
    currentSequence,
    allSequences,
    depth
  ) {
    // Stop if we've reached max depth or have enough sequences
    if (depth >= this.maxDepth || allSequences.length >= this.maxSequences) {
      if (currentSequence.length > 0) {
        allSequences.push([...currentSequence])
      }
      return
    }

    // Get valid actions for current state
    const validActions = this.validator.getValidActions(gameState, playerId)

    // If no valid actions, add current sequence and return
    if (validActions.length === 0) {
      if (currentSequence.length > 0) {
        allSequences.push([...currentSequence])
      }
      return
    }

    // Try each valid action
    for (const action of validActions) {
      // Skip pass actions unless it's the only option
      if (action.type === 'pass' && validActions.length > 1) {
        continue
      }

      // Create new sequence with this action
      const newSequence = [...currentSequence, action]

      // If this is a pass action, add sequence and continue
      if (action.type === 'pass') {
        allSequences.push(newSequence)
        continue
      }

      // Dry run the action on a copy of game state
      const newGameState = this.dryRunAction(gameState, action)

      // Continue exploring from this new state
      this.exploreActionPaths(
        newGameState,
        playerId,
        newSequence,
        allSequences,
        depth + 1
      )
    }
  }

  // Dry run an action on a copy of game state
  dryRunAction(gameState, action) {
    const gameStateCopy = this.deepCopyGameState(gameState)
    return this.executor.executeAction(gameStateCopy, action)
  }

  // Score an action sequence
  scoreActionSequence(sequence, playerId) {
    if (sequence.length === 0) return 0

    // Dry run the entire sequence
    let currentState = this.deepCopyGameState(this.gameState)

    for (const action of sequence) {
      currentState = this.dryRunAction(currentState, action)
    }

    // Score the final state
    return this.scoreGameState(currentState, playerId)
  }

  // Score a game state for a player
  scoreGameState(gameState, playerId) {
    const playerState = gameState.getPlayerState(playerId)
    const opponent = gameState.players.find((p) => p.id !== playerId)
    const opponentState = gameState.getPlayerState(opponent.id)

    let score = 0

    // 1. Lore gained (highest priority)
    score += playerState.lore * 20

    // 2. Ink efficiency
    score += this.calculateInkEfficiency(gameState, playerState)

    // 3. Board state
    score += this.calculateBoardStateScore(playerState)

    // 4. Hand size
    score += playerState.hand.length * 3

    // 5. Opponent board reduction
    score += (7 - opponentState.board.length) * 8

    return score
  }

  // Calculate ink efficiency score
  calculateInkEfficiency(gameState, playerState) {
    const availableInk = playerState.getAvailableInk()
    const totalInk = playerState.inkwell.length
    const turn = gameState.getTurn()

    // Ideal curve: turn 1 = 1 ink, turn 2 = 2 ink, etc.
    const idealInk = turn
    const inkEfficiency = Math.min(availableInk / idealInk, 1)

    // Bonus for using all available ink efficiently
    const inkUsageBonus = availableInk > 0 ? 0.5 : 0

    // Bonus for inking higher cost cards
    const inkValueBonus = this.calculateInkValueBonus(playerState)

    return (inkEfficiency + inkUsageBonus + inkValueBonus) * 15
  }

  // Calculate ink value bonus
  calculateInkValueBonus(playerState) {
    const inkedCards = playerState.inkwell
    if (inkedCards.length === 0) return 0

    const totalCost = inkedCards.reduce(
      (sum, card) => sum + (card.card.cost || 0),
      0
    )
    const averageCost = totalCost / inkedCards.length

    return Math.min(averageCost * 0.1, 1.0)
  }

  // Calculate board state score
  calculateBoardStateScore(playerState) {
    let score = 0

    // Number of cards on board
    score += playerState.board.length * 8

    // Cumulative strength
    const totalStrength = playerState.board.reduce(
      (sum, card) => sum + (card.card.strength || 0),
      0
    )
    score += totalStrength * 6

    // Cumulative willpower
    const totalWillpower = playerState.board.reduce(
      (sum, card) => sum + (card.card.willpower || 0),
      0
    )
    score += totalWillpower * 6

    // Lore potential
    const lorePotential = playerState.board.reduce((sum, card) => {
      if (card.card.type === 'character' && card.card.lore > 0) {
        return sum + card.card.lore
      }
      return sum
    }, 0)
    score += lorePotential * 10

    return score
  }

  // Deep copy game state for dry runs
  deepCopyGameState(gameState) {
    // For now, just return the original game state
    // TODO: Implement proper deep copy that preserves class methods
    return gameState
  }

  // Get the best single action for immediate execution
  getBestAction(playerId) {
    const sequences = this.evaluateTurn(playerId)
    if (sequences.length === 0) return null

    return sequences[0].actions[0] || null
  }

  // Get the best action sequence
  getBestSequence(playerId) {
    const sequences = this.evaluateTurn(playerId)
    if (sequences.length === 0) return []

    return sequences[0].actions
  }

  // Set maximum depth for exploration
  setMaxDepth(depth) {
    this.maxDepth = depth
  }

  // Set maximum sequences to evaluate
  setMaxSequences(max) {
    this.maxSequences = max
  }
}
