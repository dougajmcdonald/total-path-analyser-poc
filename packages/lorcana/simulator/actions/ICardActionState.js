// Action state interface for card action execution

export class ICardActionState {
  constructor(gameState, playerId, cardId, additionalData = {}) {
    this.gameState = gameState
    this.playerId = playerId
    this.cardId = cardId
    this.additionalData = additionalData
  }

  // Get the game state
  getGameState() {
    return this.gameState
  }

  // Get the player ID
  getPlayerId() {
    return this.playerId
  }

  // Get the card ID
  getCardId() {
    return this.cardId
  }

  // Get additional data (targetId, singerId, etc.)
  getAdditionalData() {
    return this.additionalData
  }

  // Get specific additional data by key
  getData(key) {
    return this.additionalData[key]
  }

  // Get the player performing the action
  getPlayer() {
    return this.gameState.getPlayer(this.playerId)
  }

  // Get the player state
  getPlayerState() {
    return this.gameState.getPlayerState(this.playerId)
  }

  // Get the card being acted upon
  getCard() {
    const playerState = this.getPlayerState()
    const handCard = playerState.hand.find((card) => card.id === this.cardId)
    if (handCard) return handCard

    const boardCard = playerState.board.find(
      (cardState) => cardState.card.id === this.cardId
    )
    if (boardCard) return boardCard.card

    return null
  }
}
