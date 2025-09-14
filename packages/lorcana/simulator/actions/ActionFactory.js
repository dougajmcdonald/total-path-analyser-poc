// Action factory for creating and managing card actions

import { ChallengeAction } from './ChallengeAction.js'
import { DrawAction } from './DrawAction.js'
import { InkAction } from './InkAction.js'
import { PlayAction } from './PlayAction.js'
import { QuestAction } from './QuestAction.js'
import { SingAction } from './SingAction.js'

export class ActionFactory {
  constructor() {
    this.actionTypes = new Map()
    this.setupActionTypes()
  }

  setupActionTypes() {
    this.actionTypes.set('draw', DrawAction)
    this.actionTypes.set('ink', InkAction)
    this.actionTypes.set('play', PlayAction)
    this.actionTypes.set('quest', QuestAction)
    this.actionTypes.set('challenge', ChallengeAction)
    this.actionTypes.set('sing', SingAction)
  }

  // Create an action instance from action data
  createAction(actionData) {
    const { type, playerId, cardId, targetId, singerId, songId } = actionData
    const ActionClass = this.actionTypes.get(type)

    if (!ActionClass) {
      throw new Error(`Unknown action type: ${type}`)
    }

    return new ActionClass()
  }

  // Create action state for execution
  createActionState(gameState, actionData) {
    const { playerId, cardId, targetId, singerId, songId } = actionData
    const additionalData = {}

    if (targetId) additionalData.targetId = targetId
    if (singerId) additionalData.singerId = singerId
    if (songId) additionalData.songId = songId

    return {
      gameState,
      playerId,
      cardId,
      additionalData,
    }
  }

  // Execute an action
  executeAction(gameState, actionData) {
    const action = this.createAction(actionData)
    const actionState = this.createActionState(gameState, actionData)

    return action.perform(actionState)
  }

  // Get all available action types
  getAvailableActionTypes() {
    return Array.from(this.actionTypes.keys())
  }

  // Check if action type is supported
  isActionTypeSupported(type) {
    return this.actionTypes.has(type)
  }
}
