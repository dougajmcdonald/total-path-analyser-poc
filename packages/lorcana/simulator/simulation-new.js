// Simulation engine using new entity structure

import { ActionExecutor } from './actions/ActionExecutor.js'
import { Simulator } from './simulation/Simulator.js'
import { TurnEvaluator } from './simulation/TurnEvaluator.js'
import { GameStateFactory } from './utils/GameStateFactory.js'

// Scoring weights for simulation evaluation
export const SCORING_WEIGHTS = {
  // 1. Lore gain - highest priority (only way to win)
  LORE_GAINED: 20,

  // 2. Ink efficiency - playing on curve
  INK_EFFICIENCY: 15,

  // 3. Board state - multiple factors
  BOARD_CARD_COUNT: 8,
  BOARD_STRENGTH: 6,
  BOARD_WILLPOWER: 6,
  BOARD_LORE_POTENTIAL: 10,

  // 4. Ink progression - inking vs not inking
  INK_PROGRESSION: 12,

  // 5. Hand size - lower priority
  HAND_SIZE: 3,

  // Legacy weights (can be removed if not needed)
  OPPONENT_DAMAGE: 8,
}

// Get all available actions for a player using new system
export function getAvailableActions(gameState, playerId) {
  const executor = new ActionExecutor()
  return executor.getValidActions(gameState, playerId)
}

// Evaluate a simulation state using new system
export function evaluateSimulation(gameState, playerId, turnNumber = 1) {
  const evaluator = new TurnEvaluator(gameState)
  return evaluator.scoreGameState(gameState, playerId)
}

// Simulate a single turn with all possible action sequences using new system
export function simulateTurn(
  gameState,
  playerId,
  turnNumber = 1,
  maxDepth = 3
) {
  const simulator = new Simulator(gameState)
  simulator.setMaxDepth(maxDepth)

  const sequences = simulator.getActionSequences(playerId)

  // Convert to old format for compatibility
  return sequences.map((sequence) => ({
    state: gameState, // Use current state
    actions: sequence.actions,
    score: sequence.score,
  }))
}

// Create a new simulator instance
export function createSimulator(gameState) {
  return new Simulator(gameState)
}

// Create a new turn evaluator instance
export function createTurnEvaluator(gameState) {
  return new TurnEvaluator(gameState)
}

// Create a new action executor instance
export function createActionExecutor() {
  return new ActionExecutor()
}

// Create a test game for simulation
export function createTestGame() {
  return GameStateFactory.createTestGame()
}
