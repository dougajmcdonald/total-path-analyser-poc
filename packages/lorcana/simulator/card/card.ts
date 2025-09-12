export function quest(gameState, playerId, cardId) {
  const player = gameState.players.find((p) => p.id === playerId)
  const card = player.board.find((card) => card.uniqueId === cardId)

  if (!card || !canQuestCard(card)) {
    return gameState
  }

  // Exert the character
  card.actionState = CARD_STATES.EXERTED

  // Gain lore
  player.lore += card.lore || 0

  return gameState
}

export function challenge(gameState, playerId, attackerId, targetId) {
  const player = gameState.players.find((p) => p.id === playerId)
  const attacker = player.board.find((card) => card.uniqueId === attackerId)
  const target = gameState.players
    .find((p) => p.id !== playerId)
    ?.board.find((card) => card.uniqueId === targetId)

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
    const targetPlayer = gameState.players.find((p) => p.id !== playerId)
    const targetIndex = targetPlayer.board.findIndex(
      (card) => card.uniqueId === targetId
    )
    if (targetIndex !== -1) {
      targetPlayer.board.splice(targetIndex, 1)
    }
  }

  if (attacker.willpower <= 0) {
    const attackerIndex = player.board.findIndex(
      (card) => card.uniqueId === attackerId
    )
    if (attackerIndex !== -1) {
      player.board.splice(attackerIndex, 1)
    }
  }

  return gameState
}

export function sing(gameState, playerId, singerId, songId) {
  const player = gameState.players.find((p) => p.id === playerId)
  const singer = player.board.find((card) => card.uniqueId === singerId)
  const songIndex = player.hand.findIndex((card) => card.uniqueId === songId)

  if (
    songIndex === -1 ||
    !singer ||
    !canSingCard(singer, player.hand[songIndex])
  ) {
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

export class Card implements ICard {

  private card: ICard

  constructor(card) {
    this.card = card
  }

  play(gameState): void {
    
      //const player = gameState.players.find((p) => p.id === playerId)
      //const cardIndex = player.hand.findIndex((card) => card.uniqueId === cardId)
    
      //if (cardIndex === -1) {
      //  return gameState
      //}
    
      //const card = player.hand[cardIndex]
      //const availableInk = getAvailableInk(gameState, playerId)
    
      //if (!canPlayCard(card, availableInk)) {
       // return gameState
      //}


      // let's define the logic here:
      // 1. card can be assumed to be in hand, upstream will ensure this
      // 2. whether we can play the card can be checked upstream
      // 3. we need to remove the card from hand
      // 4. we need to create a board card
      // 5. we need to return the game state

    
      // Remove card from hand
      const playedCard = player.hand.splice(cardIndex, 1)[0]
    
      // Create board card
      const boardCard = {
        ...playedCard,
        actionState: CARD_STATES.READY,
        playState: PLAY_STATES.DRYING,
        controller: playerId,
        position: player.board.length,
      }
    
      player.board.push(boardCard)
    
      // Exert ink equal to cost
      let inkToExert = playedCard.cost
      for (const ink of player.inkwell) {
        if (!ink.isExerted && inkToExert > 0) {
          ink.isExerted = true
          inkToExert--
        }
      }
    
      return gameState
    
  }  
}
