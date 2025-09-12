// Ink action for inking a card

import { ICardState } from '../entities/card-state/ICardState.js'
import { ICardAction } from './ICardAction.js'

export class InkAction extends ICardAction {
  constructor(playerId, cardId, cost = 0) {
    super('ink', 'Ink Card')
    this.playerId = playerId
    this.cardId = cardId
    this.cost = cost
  }

  perform(actionState) {
    const { gameState, playerId, cardId } = actionState
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) {
      return false
    }

    // Find the card in hand
    const card = playerState.hand.find((card) => card.id === cardId)
    if (!card) {
      return false
    }

    // Check if card is inkable and player hasn't inked this turn
    if (!card.inkable || playerState.hasInkedThisTurn) {
      return false
    }

    // Remove card from hand
    playerState.removeFromHand(cardId)

    // Create card state for inkwell
    const cardState = new ICardState(card, true, false) // dry, not exerted
    playerState.addToInkwell(cardState)

    // Mark that player has inked this turn
    playerState.hasInkedThisTurn = true

    return true
  }
}
