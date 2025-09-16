// Base card interface for Lorcana simulation

export class ICard {
  constructor(id, name, inkable, ink, cost, image = null) {
    this.id = id
    this.name = name
    this.inkable = inkable
    this.ink = ink
    this.cost = cost
    this.image = image
    this.type = 'card'
  }

  // Card state methods
  dry() {
    // Cards are dry (ready) by default
    return this
  }

  exert() {
    // Cards are exerted (tapped) when used
    return this
  }

  ready() {
    // Cards are ready (untapped) at the start of turn
    return this
  }

  isReady() {
    // Check if card is ready (not exerted)
    return true
  }

  isExerted() {
    // Check if card is exerted (tapped)
    return false
  }
}
