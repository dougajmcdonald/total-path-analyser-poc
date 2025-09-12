// Sing action for singing a song with a character

import { ICardState } from '../entities/card-state/ICardState.js'
import { ICardAction } from './ICardAction.js'

export class SingAction extends ICardAction {
  constructor(id = 'sing', name = 'Sing Song') {
    super(id, name)
  }

  perform(actionState) {
    const { gameState, playerId, singerId, songId } = actionState
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) {
      return gameState
    }

    // Find the singer on the board
    const singer = playerState.board.find((cs) => cs.card.id === singerId)
    if (!singer) {
      return gameState
    }

    // Find the song in hand
    const song = playerState.hand.find((card) => card.id === songId)
    if (!song) {
      return gameState
    }

    // Exert the singer
    singer.exert()

    // Remove song from hand and play it
    const songIndex = playerState.hand.indexOf(song)
    playerState.hand.splice(songIndex, 1)

    // Create card state for the song on board
    const songState = new ICardState(song, false, false) // wet, not exerted
    playerState.addToBoard(songState)

    return gameState
  }
}
