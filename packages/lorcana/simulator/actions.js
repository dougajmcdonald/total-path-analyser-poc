// Action execution and validation for Lorcana simulation

import { CARD_STATES } from './game-state.js'

// Action validation functions
export function canInkCard (card, gameState, playerId) {
  const player = gameState.players.find(p => p.id === playerId)
  return card.inkable === true && !player.hasInkedThisTurn
}

export function canPlayCard (card, availableInk) {
  return card.cost <= availableInk
}

export function canQuestCard (card) {
  return card.actionState === CARD_STATES.READY && 
         card.playState === CARD_STATES.DRY &&
         card.type === 'character'
}

export function canChallengeCard (attacker, target) {
  return attacker.actionState === CARD_STATES.READY &&
         attacker.playState === CARD_STATES.DRY &&
         attacker.type === 'character' &&
         target.actionState === CARD_STATES.EXERTED &&
         target.type === 'character'
}

export function canSingCard (singer, song) {
  return singer.actionState === CARD_STATES.READY &&
         singer.playState === CARD_STATES.DRY &&
         singer.type === 'character' &&
         song.type === 'action - song' &&
         song.cost <= singer.cost
}

// Action execution functions
export function inkCard (gameState, playerId, cardId) {
  const player = gameState.players.find(p => p.id === playerId)
  const cardIndex = player.hand.findIndex(card => card.uniqueId === cardId)
  
  if (cardIndex === -1 || !canInkCard(player.hand[cardIndex], gameState, playerId)) {
    return gameState
  }
  
  const card = player.hand.splice(cardIndex, 1)[0]
  const inkCard = {
    ...card,
    isExerted: false,
    controller: playerId
  }
  
  player.inkwell.push(inkCard)
  player.hasInkedThisTurn = true
  return gameState
}

export function playCard (gameState, playerId, cardId) {
  const player = gameState.players.find(p => p.id === playerId)
  const cardIndex = player.hand.findIndex(card => card.uniqueId === cardId)
  
  if (cardIndex === -1) {
    return gameState
  }
  
  const card = player.hand[cardIndex]
  const availableInk = getAvailableInk(gameState, playerId)
  
  if (!canPlayCard(card, availableInk)) {
    return gameState
  }
  
  // Remove card from hand
  const playedCard = player.hand.splice(cardIndex, 1)[0]
  
  // Create board card
  const boardCard = {
    ...playedCard,
    actionState: CARD_STATES.READY,
    playState: CARD_STATES.DRYING,
    controller: playerId,
    position: player.board.length
  }
  
  player.board.push(boardCard)
  
  // Exert ink equal to cost
  let inkToExert = card.cost
  for (const ink of player.inkwell) {
    if (!ink.isExerted && inkToExert > 0) {
      ink.isExerted = true
      inkToExert--
    }
  }
  
  return gameState
}

export function questCard (gameState, playerId, cardId) {
  const player = gameState.players.find(p => p.id === playerId)
  const card = player.board.find(card => card.uniqueId === cardId)
  
  if (!card || !canQuestCard(card)) {
    return gameState
  }
  
  // Exert the character
  card.actionState = CARD_STATES.EXERTED
  
  // Gain lore
  player.lore += card.lore || 0
  
  return gameState
}

export function challengeCard (gameState, playerId, attackerId, targetId) {
  const player = gameState.players.find(p => p.id === playerId)
  const attacker = player.board.find(card => card.uniqueId === attackerId)
  const target = gameState.players
    .find(p => p.id !== playerId)
    ?.board.find(card => card.uniqueId === targetId)
  
  if (!attacker || !target || !canChallengeCard(attacker, target)) {
    return gameState
  }
  
  // Exert the attacker
  attacker.actionState = CARD_STATES.EXERTED
  
  // Handle combat damage
  const attackerDamage = attacker.strength || 0
  const targetDamage = target.strength || 0
  
  // Apply damage to target
  target.willpower = (target.willpower || 0) - attackerDamage
  
  // Apply damage to attacker
  attacker.willpower = (attacker.willpower || 0) - targetDamage
  
  // Remove defeated characters
  if (target.willpower <= 0) {
    const targetPlayer = gameState.players.find(p => p.id !== playerId)
    const targetIndex = targetPlayer.board.findIndex(card => card.uniqueId === targetId)
    if (targetIndex !== -1) {
      targetPlayer.board.splice(targetIndex, 1)
    }
  }
  
  if (attacker.willpower <= 0) {
    const attackerIndex = player.board.findIndex(card => card.uniqueId === attackerId)
    if (attackerIndex !== -1) {
      player.board.splice(attackerIndex, 1)
    }
  }
  
  return gameState
}

export function singCard (gameState, playerId, singerId, songId) {
  const player = gameState.players.find(p => p.id === playerId)
  const singer = player.board.find(card => card.uniqueId === singerId)
  const songIndex = player.hand.findIndex(card => card.uniqueId === songId)
  
  if (songIndex === -1 || !singer || !canSingCard(singer, player.hand[songIndex])) {
    return gameState
  }
  
  const song = player.hand.splice(songIndex, 1)[0]
  
  // Exert the singer
  singer.actionState = CARD_STATES.EXERTED
  
  // Add song to discard pile
  gameState.discardPile.push(song)
  
  // TODO: Execute song effect based on song's bodyText
  // This would require parsing the song's effect text
  
  return gameState
}

// Execute a single action
export function executeAction (gameState, action) {
  const { type, playerId, cardId, attackerId, targetId, singerId, songId } = action
  
  switch (type) {
    case 'ink':
      return inkCard(gameState, playerId, cardId)
    case 'play':
      return playCard(gameState, playerId, cardId)
    case 'quest':
      return questCard(gameState, playerId, cardId)
    case 'challenge':
      return challengeCard(gameState, playerId, attackerId, targetId)
    case 'sing':
      return singCard(gameState, playerId, singerId, songId)
    case 'pass':
      return gameState
    default:
      return gameState
  }
}

// Helper function to get available ink (imported from game-state)
function getAvailableInk (gameState, playerId) {
  const player = gameState.players.find(p => p.id === playerId)
  return player.inkwell.filter(ink => !ink.isExerted).length
}
