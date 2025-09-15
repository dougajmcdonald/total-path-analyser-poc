// Main simulator export - New Entity-Based Structure

// Core entities
export * from './entities/index.js'

// Actions and validation
export * from './actions/index.js'
export * from './validation/CardActionValidator.js'

// Simulation components
export * from './simulation/index.js'

// Strategies
export * from './strategies/index.js'

// Utilities
export { CardFactory } from './utils/CardFactory.js'
export { GameStateFactory } from './utils/GameStateFactory.js'
export { TestDataLoader } from './utils/TestDataLoader.js'

// Types
export * from './types/IInk.js'

// Main API - Use these for new code
export { ActionExecutor } from './actions/ActionExecutor.js'
export { Simulator } from './simulation/Simulator.js'
export { TurnEvaluator } from './simulation/TurnEvaluator.js'
export { TurnExecutor } from './simulation/TurnExecutor.js'
export {
  GameStateFactory as createGameState,
  GameStateFactory as initGame,
} from './utils/GameStateFactory.js'

// New game state and simulation functions
export * from './game-state-new.js'
export * from './simulation-new.js'
