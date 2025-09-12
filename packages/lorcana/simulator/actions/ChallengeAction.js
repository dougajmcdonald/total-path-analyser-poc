// Challenge action for challenging an opponent's character

import { ICardAction } from './ICardAction.js'

export class ChallengeAction extends ICardAction {
  constructor(id = 'challenge', name = 'Challenge') {
    super(id, name)
  }

  perform(actionState) {
    const { gameState, playerId, cardId, targetId } = actionState
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) {
      return gameState
    }

    // Find the attacking card
    const attacker = playerState.board.find((cs) => cs.card.id === cardId)
    if (!attacker) {
      return gameState
    }

    // Find the target card on opponent's board
    const opponent = gameState.players.find((p) => p.id !== playerId)
    const opponentState = gameState.getPlayerState(opponent.id)
    const target = opponentState.board.find((cs) => cs.card.id === targetId)

    if (!target) {
      return gameState
    }

    // Exert the attacker
    attacker.exert()

    // Calculate damage
    const attackerStrength = attacker.card.strength || 0
    const targetWillpower = target.card.willpower || 0

    if (attackerStrength >= targetWillpower) {
      // Target is defeated, remove from board
      const targetIndex = opponentState.board.indexOf(target)
      opponentState.board.splice(targetIndex, 1)
    }

    return gameState
  }
}
