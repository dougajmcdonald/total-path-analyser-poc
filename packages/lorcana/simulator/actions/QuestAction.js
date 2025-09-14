// Quest action for questing with a character

import { ICardAction } from './ICardAction.js'

export class QuestAction extends ICardAction {
  constructor(playerId, cardId) {
    super('quest', 'Quest')
    this.playerId = playerId
    this.cardId = cardId
  }

  perform(actionState) {
    const { gameState, playerId, cardId } = actionState
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) {
      return false
    }

    // Find the card on the board
    const cardState = playerState.board.find((cs) => cs.card.id === cardId)
    if (!cardState) {
      return false
    }

    // Check if card is ready and dry and is a character
    if (
      !cardState.isReady() ||
      !cardState.dry ||
      cardState.card.type !== 'character'
    ) {
      return false
    }

    // Exert the card and gain lore
    cardState.exert()
    const loreGained = cardState.card.lore || 0
    playerState.gainLore(loreGained)

    return true
  }
}
