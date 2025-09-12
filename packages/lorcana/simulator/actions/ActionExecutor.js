// Action executor for managing action execution and validation

import { CardActionValidator } from '../validation/CardActionValidator.js'
import { ActionFactory } from './ActionFactory.js'

export class ActionExecutor {
  constructor() {
    this.factory = new ActionFactory()
    this.validator = new CardActionValidator()
  }

  // Execute a single action with validation
  executeAction(gameState, actionData) {
    // Validate the action first
    if (!this.validator.isActionValid(gameState, actionData)) {
      console.warn(`Invalid action: ${actionData.type}`, actionData)
      return gameState
    }

    // Execute the action
    return this.factory.executeAction(gameState, actionData)
  }

  // Execute multiple actions in sequence
  executeActions(gameState, actions) {
    let currentState = gameState

    for (const action of actions) {
      currentState = this.executeAction(currentState, action)
    }

    return currentState
  }

  // Get all valid actions for a player
  getValidActions(gameState, playerId) {
    return this.validator.getValidActions(gameState, playerId)
  }

  // Validate a single action
  validateAction(gameState, actionData) {
    return this.validator.isActionValid(gameState, actionData)
  }

  // Get action factory for advanced usage
  getFactory() {
    return this.factory
  }

  // Get validator for advanced usage
  getValidator() {
    return this.validator
  }
}
