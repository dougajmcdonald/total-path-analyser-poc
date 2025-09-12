// Challenge action for challenging an opponent's character

import { ICardAction } from './ICardAction.js'

export class ChallengeAction extends ICardAction {
  constructor(playerId, cardId, targetId) {
    super('challenge', 'Challenge')
    this.playerId = playerId
    this.cardId = cardId
    this.targetId = targetId
  }

  perform(actionState) {
    const { gameState, playerId, cardId, targetId } = actionState
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) {
      return false
    }

    // Find the attacking card
    const attacker = playerState.board.find((cs) => cs.card.id === cardId)
    if (!attacker) {
      return false
    }

    // Find the target card on opponent's board
    const opponent = gameState.players.find((p) => p.id !== playerId)
    const opponentState = gameState.getPlayerState(opponent.id)
    const target = opponentState.board.find((cs) => cs.card.id === targetId)

    if (!target) {
      return false
    }

    // Check if attacker is ready and dry and is a character
    if (
      !attacker.isReady() ||
      !attacker.dry ||
      attacker.card.type !== 'character'
    ) {
      return false
    }

    // Check if target is exerted and is a character
    if (!target.exerted || target.card.type !== 'character') {
      return false
    }

    // Exert the attacker
    attacker.exert()

    // TODO: Implement challenge resolution (damage calculation, etc.)

    return true
  }
}
