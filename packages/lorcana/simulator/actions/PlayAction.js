// Play action for playing a card from hand

import { ICardState } from '../entities/card-state/ICardState.js'
import { ICardAction } from './ICardAction.js'

export class PlayAction extends ICardAction {
  constructor(playerId, cardId, cost = 0) {
    super('play', 'Play Card')
    this.playerId = playerId
    this.cardId = cardId
    this.cost = cost
  }

  perform(actionState) {
    const { gameState, playerId, cardId, cost } = actionState
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) {
      return false
    }

    // Find the card in hand
    const card = playerState.hand.find((card) => card.id === cardId)
    if (!card) {
      return false
    }

    // Check if player has enough ink
    const availableInk = playerState.getAvailableInk()
    if (card.cost > availableInk) {
      return false
    }

    // Remove card from hand
    playerState.removeFromHand(cardId)

    // Exert ink equal to card cost
    let inkToExert = card.cost
    for (const ink of playerState.inkwell) {
      if (!ink.exerted && inkToExert > 0) {
        ink.exerted = true
        inkToExert--
      }
    }

    // Create card state for board
    const cardState = new ICardState(card, false, false) // wet, not exerted
    playerState.addToBoard(cardState)

    return true
  }
}
