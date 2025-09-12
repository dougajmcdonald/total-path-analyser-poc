// Game state management using new entity structure

import { IGameState } from './entities/game/IGameState.js'
import { Player } from './entities/player/Player.js'
import { CardFactory } from './utils/CardFactory.js'

// Turn phases
export const TURN_PHASES = {
  READY: 'ready',
  DRAW: 'draw',
  MAIN: 'main',
  PASS: 'pass',
}

// Action types
export const ACTION_TYPES = {
  INK: 'ink',
  PLAY: 'play',
  QUEST: 'quest',
  CHALLENGE: 'challenge',
  SING: 'sing',
  PASS: 'pass',
}

// Create a new game state with entity structure
export function createGameState(deck1, deck2) {
  const player1 = new Player('player1', deck1)
  const player2 = new Player('player2', deck2)

  const gameState = new IGameState('game-' + Date.now(), [player1, player2])
  return gameState
}

// Initialize a new game
export function initGame(deck1, deck2) {
  const gameState = createGameState(deck1, deck2)
  gameState.initializeGame()

  // Draw initial hands (7 cards each)
  for (let i = 0; i < 7; i++) {
    drawCard(gameState, 'player1')
    drawCard(gameState, 'player2')
  }

  return gameState
}

// Draw a random card from deck to hand
export function drawCard(gameState, playerId) {
  const player = gameState.getPlayer(playerId)
  if (!player) return gameState

  const drawnCard = player.activeDeck.drawRandomCard()
  if (drawnCard) {
    const playerState = gameState.getPlayerState(playerId)
    playerState.addToHand(drawnCard)
  }

  return gameState
}

// Get available ink for a player
export function getAvailableInk(gameState, playerId) {
  const playerState = gameState.getPlayerState(playerId)
  return playerState ? playerState.getAvailableInk() : 0
}

// Ready a player for their turn
export function ready(gameState, playerId) {
  const playerState = gameState.getPlayerState(playerId)
  if (!playerState) return gameState

  // Ready all exerted ink
  playerState.inkwell.forEach((ink) => {
    ink.exerted = false
  })

  // Ready exerted board cards and transition drying cards to dry
  playerState.board.forEach((card) => {
    if (card.exerted) {
      card.ready()
    }
    if (!card.dry) {
      card.dry()
    }
  })

  // Reset inking flag for new turn
  playerState.hasInkedThisTurn = false

  return gameState
}

// Check if game is over
export function checkGameOver(gameState) {
  return gameState.isGameOver()
}

// Get current player
export function getCurrentPlayer(gameState) {
  return gameState.getActivePlayer()
}

// Switch to next player
export function switchPlayer(gameState) {
  gameState.switchPlayer()
  return gameState
}

// Create game from card data arrays
export function createGameFromCardData(cards1, cards2) {
  const deck1 = CardFactory.createDeck(cards1)
  const deck2 = CardFactory.createDeck(cards2)
  return initGame(deck1, deck2)
}

// Create game from test deck format
export function createGameFromTestFormat(
  deckFormat1,
  deckFormat2,
  cardDatabase
) {
  const deck1 = CardFactory.createDeckFromFormat(deckFormat1, cardDatabase)
  const deck2 = CardFactory.createDeckFromFormat(deckFormat2, cardDatabase)
  return initGame(deck1, deck2)
}
