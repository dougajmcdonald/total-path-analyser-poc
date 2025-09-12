// Draw action for drawing a card from deck

import { ICardAction } from './ICardAction.js'

export class DrawAction extends ICardAction {
  constructor(id = 'draw', name = 'Draw Card') {
    super(id, name)
  }

  perform(actionState) {
    const { gameState, playerId } = actionState
    const player = gameState.getPlayer(playerId)
    const playerState = gameState.getPlayerState(playerId)

    if (!player || !playerState) {
      return gameState
    }

    // Draw a card from the deck
    const drawnCard = player.activeDeck.drawRandomCard()
    if (drawnCard) {
      playerState.addToHand(drawnCard)
    }

    return gameState
  }
}
