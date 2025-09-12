// DEPRECATED: Action execution and validation for Lorcana simulation
// Use actions/ActionExecutor.js and validation/CardActionValidator.js instead

import { CARD_STATES, PLAY_STATES } from '../card/card.js'

// Action validation functions
export function canInkCard(card, gameState, playerId) {
  const player = gameState.players.find((p) => p.id === playerId)
  return card.inkable === true && !player.hasInkedThisTurn
}

export function canPlayCard(card, availableInk) {
  return card.cost <= availableInk
}

export function canQuestCard(card) {
  return (
    card.actionState === CARD_STATES.READY &&
    card.playState === PLAY_STATES.DRY &&
    card.type === 'character'
  )
}

export function canChallengeCard(attacker, target) {
  return (
    attacker.actionState === CARD_STATES.READY &&
    attacker.playState === PLAY_STATES.DRY &&
    attacker.type === 'character' &&
    target.actionState === CARD_STATES.EXERTED &&
    target.type === 'character'
  )
}

export function canSingCard(singer, song) {
  return (
    singer.actionState === CARD_STATES.READY &&
    singer.playState === PLAY_STATES.DRY &&
    singer.type === 'character' &&
    song.type === 'action - song' &&
    song.cost <= singer.cost
  )
}

// Action execution functions
export function inkCard(gameState, playerId, cardId) {
  const player = gameState.players.find((p) => p.id === playerId)
  const cardIndex = player.hand.findIndex((card) => card.uniqueId === cardId)

  if (
    cardIndex === -1 ||
    !canInkCard(player.hand[cardIndex], gameState, playerId)
  ) {
    return gameState
  }

  const card = player.hand.splice(cardIndex, 1)[0]
  const inkCard = {
    ...card,
    isExerted: false,
    controller: playerId,
  }

  player.inkwell.push(inkCard)
  player.hasInkedThisTurn = true
  return gameState
}

// Execute a single action
export function executeAction(gameState, action) {
  const { type, playerId, cardId, attackerId, targetId, singerId, songId } =
    action

  switch (type) {
    case 'ink':
      return inkCard(gameState, playerId, cardId)
    case 'play':
      return playCard(gameState, playerId, cardId)
    case 'quest':
      return quest(gameState, playerId, cardId)
    case 'challenge':
      return challenge(gameState, playerId, attackerId, targetId)
    case 'sing':
      return sing(gameState, playerId, singerId, songId)
    case 'pass':
      return gameState
    default:
      return gameState
  }
}

// Helper function to get available ink (imported from game-state)
function getAvailableInk(gameState, playerId) {
  const player = gameState.players.find((p) => p.id === playerId)
  return player.inkwell.filter((ink) => !ink.isExerted).length
}
