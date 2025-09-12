// Play action for playing a card from hand

import { ICardState } from '../entities/card-state/ICardState.js'
import { ICardAction } from './ICardAction.js'

export class PlayAction extends ICardAction {
  constructor(id = 'play', name = 'Play Card') {
    super(id, name)
  }

  perform(actionState) {
    const { gameState, playerId, cardId } = actionState
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) {
      return gameState
    }

    // Remove card from hand
    const card = playerState.removeFromHand(cardId)
    if (!card) {
      return gameState
    }

    // Create card state for board
    const cardState = new ICardState(card, false, false) // wet, not exerted
    playerState.addToBoard(cardState)

    return gameState
  }
}
