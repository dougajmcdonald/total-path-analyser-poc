// Simulation engine for turn-by-turn analysis

import {
    canChallengeCard,
    canInkCard,
    canPlayCard,
    canQuestCard,
    canSingCard,
    executeAction
} from './actions.js'
import { ACTION_TYPES, getAvailableInk } from './game-state.js'

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
  
  // Pass action (only available when no other meaningful actions)
  // Only add pass if no other actions are available
  if (actions.length === 0) {
    actions.push({
      type: ACTION_TYPES.PASS,
      playerId,
      cost: 0
    })
  }
  
  return actions
}


// Evaluate a simulation state
export function evaluateSimulation (gameState, playerId, turnNumber = 1) {
  const player = gameState.players.find(p => p.id === playerId)
  const opponent = gameState.players.find(p => p.id !== playerId)
  
  let score = 0
  
  // 1. Lore gained (highest priority - only way to win)
  score += player.lore * SCORING_WEIGHTS.LORE_GAINED
  
  // 2. Ink efficiency - playing on curve
  score += calculateInkEfficiency(gameState, player, turnNumber)
  
  // 3. Board state evaluation
  score += calculateBoardStateScore(player)
  
  // 4. Ink progression - inking vs not inking
  score += calculateInkProgressionScore(gameState, player)
  
  // 5. Hand size (lower priority)
  score += player.hand.length * SCORING_WEIGHTS.HAND_SIZE
  
  // Legacy: Opponent damage (reduced board presence)
  score += (7 - opponent.board.length) * SCORING_WEIGHTS.OPPONENT_DAMAGE
  
  return score
}

// Calculate ink efficiency score (playing on curve)
function calculateInkEfficiency (gameState, player, turnNumber) {
  const availableInk = getAvailableInk(gameState, player.id)
  const totalInk = player.inkwell.length
  
  // Ideal curve: turn 1 = 1 ink, turn 2 = 2 ink, etc.
  const idealInk = turnNumber
  const inkEfficiency = Math.min(availableInk / idealInk, 1) // Cap at 1.0
  
  // Bonus for using all available ink efficiently
  const inkUsageBonus = availableInk > 0 ? 0.5 : 0
  
  return (inkEfficiency + inkUsageBonus) * SCORING_WEIGHTS.INK_EFFICIENCY
}

// Calculate board state score
function calculateBoardStateScore (player) {
  let score = 0
  
  // a) Number of cards on board
  score += player.board.length * SCORING_WEIGHTS.BOARD_CARD_COUNT
  
  // b) Cumulative strength
  const totalStrength = player.board.reduce((sum, card) => sum + (card.strength || 0), 0)
  score += totalStrength * SCORING_WEIGHTS.BOARD_STRENGTH
  
  // c) Cumulative willpower
  const totalWillpower = player.board.reduce((sum, card) => sum + (card.willpower || 0), 0)
  score += totalWillpower * SCORING_WEIGHTS.BOARD_WILLPOWER
  
  // d) Cumulative lore potential (characters that can quest)
  const lorePotential = player.board.reduce((sum, card) => {
    if (card.type === 'character' && card.lore > 0) {
      return sum + card.lore
    }
    return sum
  }, 0)
  score += lorePotential * SCORING_WEIGHTS.BOARD_LORE_POTENTIAL
  
  return score
}

// Calculate ink progression score
function calculateInkProgressionScore (gameState, player) {
  const hasInkableCards = player.hand.some(card => card.inkable)
  const availableInk = getAvailableInk(gameState, player.id)
  
  let score = 0
  
  if (hasInkableCards && availableInk === 0) {
    // Good: have inkable cards and no ink (should ink)
    score += 1.0
  } else if (hasInkableCards && availableInk > 0) {
    // Neutral: have inkable cards and some ink (could ink or not)
    score += 0.5
  } else if (!hasInkableCards) {
    // Neutral: no inkable cards to ink
    score += 0.2
  }
  
  return score * SCORING_WEIGHTS.INK_PROGRESSION
}

// Simulate a single turn with all possible action sequences
export function simulateTurn (gameState, playerId, turnNumber = 1, maxDepth = 3) {
  const simulations = []
  
  function simulateActionSequence (currentState, actions, depth) {
    // If we've reached max depth or the last action was a pass, evaluate this sequence
    if (depth >= maxDepth || (actions.length > 0 && actions[actions.length - 1].type === ACTION_TYPES.PASS)) {
      const score = evaluateSimulation(currentState, playerId, turnNumber)
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

