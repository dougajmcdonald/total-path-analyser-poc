// Game state factory for creating games with new entity structure

import { IGameState } from '../entities/game/IGameState.js'
import { Player } from '../entities/player/Player.js'
import { CardFactory } from './CardFactory.js'

export class GameStateFactory {
  // Create a new game state with entity structure
  static createGameState(deck1, deck2) {
    const player1 = new Player('player1', deck1)
    const player2 = new Player('player2', deck2)

    const gameState = new IGameState('game-' + Date.now(), [player1, player2])
    return gameState
  }

  // Initialize a new game (equivalent to old initGame)
  static initGame(deck1, deck2) {
    const gameState = this.createGameState(deck1, deck2)
    gameState.initializeGame()

    // Draw initial hands (7 cards each)
    for (let i = 0; i < 7; i++) {
      this.drawCard(gameState, 'player1')
      this.drawCard(gameState, 'player2')
    }

    return gameState
  }

  // Draw a random card from deck to hand
  static drawCard(gameState, playerId) {
    const player = gameState.getPlayer(playerId)
    if (!player) return gameState

    const drawnCard = player.activeDeck.drawRandomCard()
    if (drawnCard) {
      const playerState = gameState.getPlayerState(playerId)
      playerState.addToHand(drawnCard)
    }

    return gameState
  }

  // Create game from card data arrays
  static createGameFromCardData(cards1, cards2) {
    const deck1 = CardFactory.createDeck(cards1)
    const deck2 = CardFactory.createDeck(cards2)
    return this.initGame(deck1, deck2)
  }

  // Create game from test deck format
  static createGameFromTestFormat(deckFormat1, deckFormat2, cardDatabase) {
    const deck1 = CardFactory.createDeckFromFormat(deckFormat1, cardDatabase)
    const deck2 = CardFactory.createDeckFromFormat(deckFormat2, cardDatabase)
    return this.initGame(deck1, deck2)
  }

  // Create game from existing test decks
  static async createTestGame() {
    const { TestDataLoader } = await import('./TestDataLoader.js')
    return TestDataLoader.createTestGame()
  }
}
