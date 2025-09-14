// Deck entity for card collections

export class Deck {
  constructor(cards = []) {
    this.cards = [...cards] // Create a copy to avoid mutation
  }

  // Add a card to the deck
  addCard(card) {
    this.cards.push(card)
  }

  // Remove a card from the deck
  removeCard(cardId) {
    const index = this.cards.findIndex((card) => card.id === cardId)
    if (index !== -1) {
      return this.cards.splice(index, 1)[0]
    }
    return null
  }

  // Draw a random card from the deck
  drawRandomCard() {
    if (this.cards.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * this.cards.length)
    return this.cards.splice(randomIndex, 1)[0]
  }

  // Draw a specific card by ID
  drawCard(cardId) {
    return this.removeCard(cardId)
  }

  // Shuffle the deck
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
    }
  }

  // Get deck size
  size() {
    return this.cards.length
  }

  // Check if deck is empty
  isEmpty() {
    return this.cards.length === 0
  }

  // Get all cards (for inspection)
  getCards() {
    return [...this.cards]
  }
}
