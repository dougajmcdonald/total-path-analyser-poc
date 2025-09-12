// Sing action for singing a song with a character

import { ICardAction } from './ICardAction.js'

export class SingAction extends ICardAction {
  constructor(playerId, singerId, songId) {
    super('sing', 'Sing Song')
    this.playerId = playerId
    this.singerId = singerId
    this.songId = songId
  }

  perform(actionState) {
    const { gameState, playerId, singerId, songId } = actionState
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) {
      return false
    }

    // Find the singer on the board
    const singer = playerState.board.find((cs) => cs.card.id === singerId)
    if (!singer) {
      return false
    }

    // Find the song in hand
    const song = playerState.hand.find((card) => card.id === songId)
    if (!song) {
      return false
    }

    // Check if singer is ready and dry and is a character
    if (!singer.isReady() || !singer.dry || singer.card.type !== 'character') {
      return false
    }

    // Check if song is a song and singer can afford it
    if (song.type !== 'action - song' || song.cost > singer.card.cost) {
      return false
    }

    // Exert the singer
    singer.exert()

    // Remove song from hand (song is discarded, not played to board)
    const songIndex = playerState.hand.indexOf(song)
    playerState.hand.splice(songIndex, 1)

    // TODO: Resolve song effects here

    return true
  }
}
