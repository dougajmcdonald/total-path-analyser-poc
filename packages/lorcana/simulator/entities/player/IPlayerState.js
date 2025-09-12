// Player state interface for game simulation

export class IPlayerState {
  constructor(gameId, playerId) {
    this.gameId = gameId
    this.playerId = playerId
    this.hand = [] // ICard[]
    this.inkwell = [] // ICardState[]
    this.board = [] // ICardState[]
    this.lore = 0
  }

  // Helper methods for state management
  addToHand(card) {
    this.hand.push(card)
  }

  removeFromHand(cardId) {
    const index = this.hand.findIndex((card) => card.id === cardId)
    if (index !== -1) {
      return this.hand.splice(index, 1)[0]
    }
    return null
  }

  addToInkwell(cardState) {
    this.inkwell.push(cardState)
  }

  addToBoard(cardState) {
    this.board.push(cardState)
  }

  getAvailableInk() {
    return this.inkwell.filter((ink) => !ink.exerted).length
  }

  getReadyCards() {
    return this.board.filter((card) => card.isReady())
  }

  gainLore(amount) {
    this.lore += amount
  }
}
