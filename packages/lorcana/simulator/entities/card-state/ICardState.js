// Card state interface for cards in play

export class ICardState {
  constructor(card, dry = false, exerted = false) {
    this.card = card
    this.dry = dry
    this.exerted = exerted
  }

  // Helper methods for state management
  isReady() {
    return !this.exerted && this.dry
  }

  exert() {
    this.exerted = true
  }

  ready() {
    this.exerted = false
  }

  dry() {
    this.dry = true
  }

  wet() {
    this.dry = false
  }
}
