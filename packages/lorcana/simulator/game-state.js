// Game state management for Lorcana simulation

import { executeAction } from './actions.js'

// Card states - two independent systems
export const CARD_STATES = {
  // Action availability states
  READY: 'ready',
  EXERTED: 'exerted',
  
  // Play timing states  
  DRYING: 'drying',
  DRY: 'dry'
}

// Turn phases
export const TURN_PHASES = {
  READY: 'ready',
  DRAW: 'draw', 
  MAIN: 'main',
  PASS: 'pass'
}

// Action types
export const ACTION_TYPES = {
  INK: 'ink',
  PLAY: 'play',
  QUEST: 'quest',
  CHALLENGE: 'challenge',
  SING: 'sing',
  PASS: 'pass'
}

// Create a new game state
export function createGameState (deck1, deck2) {
  return {
    players: [
      {
        id: 'player1',
        deck: [...deck1],
        hand: [],
        board: [],
        inkwell: [],
        lore: 0,
        isActive: true,
        hasInkedThisTurn: false
      },
      {
        id: 'player2', 
        deck: [...deck2],
        hand: [],
        board: [],
        inkwell: [],
        lore: 0,
        isActive: true,
        hasInkedThisTurn: false
      }
    ],
    currentPlayer: 0,
    turn: 1,
    phase: TURN_PHASES.READY,
    winner: null,
    discardPile: []
  }
}

// Initialize a new game
export function initGame (deck1, deck2) {
  const gameState = createGameState(deck1, deck2)
  
  // Randomly determine who goes first (50/50)
  const firstPlayer = Math.random() < 0.5 ? 0 : 1
  gameState.currentPlayer = firstPlayer
  gameState.onThePlay = firstPlayer === 0 ? 'player1' : 'player2'
  gameState.onTheDraw = firstPlayer === 0 ? 'player2' : 'player1'
  
  // Draw initial hands
  for (let i = 0; i < 7; i++) {
    drawCard(gameState, 'player1')
    drawCard(gameState, 'player2')
  }
  
  return gameState
}

// Draw a random card from deck to hand
export function drawCard (gameState, playerId) {
  const player = gameState.players.find(p => p.id === playerId)
  if (!player || player.deck.length === 0) {
    return gameState
  }
  
  const randomIndex = Math.floor(Math.random() * player.deck.length)
  const drawnCard = player.deck.splice(randomIndex, 1)[0]
  player.hand.push(drawnCard)
  
  // Log the card draw
  console.log(`  📥 ${playerId} drew: ${drawnCard.name} (Cost: ${drawnCard.cost}, Inkable: ${drawnCard.inkable})`)
  
  return gameState
}

// Get available ink for a player
export function getAvailableInk (gameState, playerId) {
  const player = gameState.players.find(p => p.id === playerId)
  return player.inkwell.filter(ink => !ink.isExerted).length
}

// Single ready function to prepare a player for their turn
export function ready (gameState, playerId) {
  const player = gameState.players.find(p => p.id === playerId)
  
  // Ready all exerted ink
  player.inkwell.forEach(ink => {
    ink.isExerted = false
  })
  
  // Ready exerted board cards and transition drying cards to dry
  player.board.forEach(card => {
    if (card.actionState === CARD_STATES.EXERTED) {
      card.actionState = CARD_STATES.READY
    }
    if (card.playState === CARD_STATES.DRYING) {
      card.playState = CARD_STATES.DRY
    }
  })
  
  // Reset inking flag for new turn
  player.hasInkedThisTurn = false
  
  return gameState
}

// Check if game is over
export function checkGameOver (gameState) {
  for (const player of gameState.players) {
    if (player.lore >= 20) {
      gameState.winner = player.id
      return true
    }
  }
  return false
}

// Get current player
export function getCurrentPlayer (gameState) {
  return gameState.players[gameState.currentPlayer]
}

// Switch to next player
export function switchPlayer (gameState) {
  gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length
  if (gameState.currentPlayer === 0) {
    gameState.turn++
  }
  gameState.phase = TURN_PHASES.READY
  
  // Ready the new current player for their turn
  const currentPlayer = gameState.players[gameState.currentPlayer]
  ready(gameState, currentPlayer.id)
  
  return gameState
}

// Execute a complete turn for a player
export function executeTurn (gameState, playerId, actions) {
  const player = gameState.players.find(p => p.id === playerId)
  if (!player) return gameState
  
  // Ready phase: prepare player for their turn
  ready(gameState, playerId)
  gameState.phase = TURN_PHASES.READY
  
  // Draw phase: draw a card (unless it's the first turn and player is on the play)
  const isFirstTurn = gameState.turn === 1
  const isOnThePlay = gameState.onThePlay === playerId
  
  if (!(isFirstTurn && isOnThePlay)) {
    drawCard(gameState, playerId)
  }
  gameState.phase = TURN_PHASES.DRAW
  
  // Main phase: execute actions
  gameState.phase = TURN_PHASES.MAIN
  for (const action of actions) {
    executeAction(gameState, action)
  }
  
  // Pass phase: end turn
  gameState.phase = TURN_PHASES.PASS
  
  return gameState
}
