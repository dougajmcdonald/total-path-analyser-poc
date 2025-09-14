// Player entity for game simulation

import { IPlayerState } from './IPlayerState.js'

export class Player {
  constructor(id, activeDeck) {
    this.id = id
    this.activeDeck = activeDeck
    this.playerState = null // Will be set when game starts
  }

  // Initialize player state for a game
  initializeForGame(gameId) {
    this.playerState = new IPlayerState(gameId, this.id)
    return this.playerState
  }

  // Get current player state
  getState() {
    return this.playerState
  }

  // Check if player has won
  hasWon() {
    return this.playerState && this.playerState.lore >= 20
  }
}
