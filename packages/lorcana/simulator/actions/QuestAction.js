// Quest action for questing with a character

import { ICardAction } from './ICardAction.js'

export class QuestAction extends ICardAction {
  constructor(id = 'quest', name = 'Quest') {
    super(id, name)
  }

  perform(actionState) {
    const { gameState, playerId, cardId } = actionState
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) {
      return gameState
    }

    // Find the card on the board
    const cardState = playerState.board.find((cs) => cs.card.id === cardId)
    if (!cardState) {
      return gameState
    }

    // Exert the card and gain lore
    cardState.exert()
    const loreGained = cardState.card.lore || 0
    playerState.gainLore(loreGained)

    return gameState
  }
}
