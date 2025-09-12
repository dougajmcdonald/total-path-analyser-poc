// Ink action for inking a card

import { ICardState } from '../entities/card-state/ICardState.js'
import { ICardAction } from './ICardAction.js'

export class InkAction extends ICardAction {
  constructor(id = 'ink', name = 'Ink Card') {
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

    // Create card state for inkwell
    const cardState = new ICardState(card, true, false) // dry, not exerted
    playerState.addToInkwell(cardState)

    return gameState
  }
}
