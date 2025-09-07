// Simulation engine for turn-by-turn analysis

import {
    canChallengeCard,
    canInkCard,
    canPlayCard,
    canQuestCard,
    canSingCard,
    executeAction
} from './actions.js'
import { ACTION_TYPES } from './game-state.js'

// Scoring weights for simulation evaluation
export const SCORING_WEIGHTS = {
  LORE_GAINED: 10,
  BOARD_PRESENCE: 5,
  HAND_SIZE: 1,
  INK_AVAILABLE: 2,
  OPPONENT_DAMAGE: 8
}

// Get all available actions for a player in current game state
export function getAvailableActions (gameState, playerId) {
  const player = gameState.players.find(p => p.id === playerId)
  const availableInk = getAvailableInk(gameState, playerId)
  const actions = []
  
  // Ink actions
  for (const card of player.hand) {
    if (canInkCard(card, gameState, playerId)) {
      actions.push({
        type: ACTION_TYPES.INK,
        playerId,
        cardId: card.uniqueId,
        cost: 0
      })
    }
  }
  
  // Play card actions
  for (const card of player.hand) {
    if (canPlayCard(card, availableInk)) {
      actions.push({
        type: ACTION_TYPES.PLAY,
        playerId,
        cardId: card.uniqueId,
        cost: card.cost
      })
    }
  }
  
  // Quest actions
  for (const card of player.board) {
    if (canQuestCard(card)) {
      actions.push({
        type: ACTION_TYPES.QUEST,
        playerId,
        cardId: card.uniqueId,
        cost: 0
      })
    }
  }
  
  // Challenge actions
  for (const attacker of player.board) {
    for (const opponent of gameState.players) {
      if (opponent.id !== playerId) {
        for (const target of opponent.board) {
          if (canChallengeCard(attacker, target)) {
            actions.push({
              type: ACTION_TYPES.CHALLENGE,
              playerId,
              attackerId: attacker.uniqueId,
              targetId: target.uniqueId,
              cost: 0
            })
          }
        }
      }
    }
  }
  
  // Sing actions
  for (const singer of player.board) {
    for (const song of player.hand) {
      if (canSingCard(singer, song)) {
        actions.push({
          type: ACTION_TYPES.SING,
          playerId,
          singerId: singer.uniqueId,
          songId: song.uniqueId,
          cost: 0
        })
      }
    }
  }
  
  // Pass action (always available)
  actions.push({
    type: ACTION_TYPES.PASS,
    playerId,
    cost: 0
  })
  
  return actions
}


// Evaluate a simulation state
export function evaluateSimulation (gameState, playerId) {
  const player = gameState.players.find(p => p.id === playerId)
  const opponent = gameState.players.find(p => p.id !== playerId)
  
  let score = 0
  
  // Lore gained
  score += player.lore * SCORING_WEIGHTS.LORE_GAINED
  
  // Board presence
  score += player.board.length * SCORING_WEIGHTS.BOARD_PRESENCE
  
  // Hand size
  score += player.hand.length * SCORING_WEIGHTS.HAND_SIZE
  
  // Available ink
  score += getAvailableInk(gameState, playerId) * SCORING_WEIGHTS.INK_AVAILABLE
  
  // Opponent damage (reduced board presence)
  score += (7 - opponent.board.length) * SCORING_WEIGHTS.OPPONENT_DAMAGE
  
  return score
}

// Simulate a single turn with all possible action sequences
export function simulateTurn (gameState, playerId, maxDepth = 3) {
  const simulations = []
  
  function simulateActionSequence (currentState, actions, depth) {
    if (depth >= maxDepth) {
      const score = evaluateSimulation(currentState, playerId)
      simulations.push({
        state: JSON.parse(JSON.stringify(currentState)), // Deep copy
        actions: [...actions],
        score
      })
      return
    }
    
    const availableActions = getAvailableActions(currentState, playerId)
    
    for (const action of availableActions) {
      const newState = executeAction(JSON.parse(JSON.stringify(currentState)), action)
      const newActions = [...actions, action]
      simulateActionSequence(newState, newActions, depth + 1)
    }
  }
  
  simulateActionSequence(gameState, [], 0)
  
  // Sort by score and return top simulations
  return simulations
    .sort((a, b) => b.score - a.score)
    .slice(0, 4) // Top 4 simulations
}

// Helper function to get available ink
function getAvailableInk (gameState, playerId) {
  const player = gameState.players.find(p => p.id === playerId)
  return player.inkwell.filter(ink => !ink.isExerted).length
}
