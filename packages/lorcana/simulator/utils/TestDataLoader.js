// Test data loader for consistent deck and card data across tests and simulation

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class TestDataLoader {
  static _testDecks = null
  static _cardDatabase = null

  // Load test decks from test-decks.json
  static loadTestDecks() {
    if (!this._testDecks) {
      const testDecksPath = join(__dirname, '../test-data/test-decks.json')
      this._testDecks = JSON.parse(readFileSync(testDecksPath, 'utf8'))
    }
    return this._testDecks
  }

  // Load card database from latest.json
  static loadCardDatabase() {
    if (!this._cardDatabase) {
      const cardDatabasePath = join(
        __dirname,
        '../../data-import/data/latest.json'
      )
      this._cardDatabase = JSON.parse(readFileSync(cardDatabasePath, 'utf8'))
    }
    return this._cardDatabase
  }

  // Get deck1 format from test-decks.json
  static getDeck1Format() {
    const testDecks = this.loadTestDecks()
    return testDecks.deck1
  }

  // Get deck2 format from test-decks.json
  static getDeck2Format() {
    const testDecks = this.loadTestDecks()
    return testDecks.deck2
  }

  // Get both deck formats
  static getDeckFormats() {
    const testDecks = this.loadTestDecks()
    return {
      deck1: testDecks.deck1,
      deck2: testDecks.deck2,
    }
  }

  // Create a game using the test decks
  static async createTestGame() {
    const { GameStateFactory } = await import('./GameStateFactory.js')
    const deckFormats = this.getDeckFormats()
    const cardDatabase = this.loadCardDatabase()

    return GameStateFactory.createGameFromTestFormat(
      deckFormats.deck1,
      deckFormats.deck2,
      cardDatabase
    )
  }

  // Get card data by name from the database
  static getCardByName(cardName) {
    const cardDatabase = this.loadCardDatabase()
    return cardDatabase.find((card) => card.Name === cardName)
  }

  // Transform card data from database format to our format
  static transformCardData(cardData) {
    return {
      id: cardData.Unique_ID,
      name: cardData.Name,
      type: cardData.Type?.toLowerCase(),
      cost: cardData.Cost || 0,
      inkable: cardData.Inkable || false,
      color: cardData.Color?.split(', ')[0]?.toLowerCase(), // Take first color
      strength: cardData.Strength || 0,
      willpower: cardData.Willpower || 0,
      lore: cardData.Lore || 0,
      classifications: cardData.Classifications?.split(', ') || [],
      rarity: cardData.Rarity,
      set: cardData.Set_Name,
      franchise: cardData.Franchise,
    }
  }

  // Get all cards from database in our format
  static getAllCards() {
    const cardDatabase = this.loadCardDatabase()
    return cardDatabase.map((card) => this.transformCardData(card))
  }

  // Get deck size from format
  static getDeckSize(deckFormat) {
    return deckFormat.reduce((total, card) => total + card.quantity, 0)
  }

  // Validate that all cards in deck format exist in database
  static validateDeckFormat(deckFormat) {
    const cardDatabase = this.loadCardDatabase()
    const missingCards = []

    for (const cardEntry of deckFormat) {
      const cardData = cardDatabase.find((card) => card.Name === cardEntry.name)
      if (!cardData) {
        missingCards.push(cardEntry.name)
      }
    }

    return {
      isValid: missingCards.length === 0,
      missingCards,
    }
  }

  // Get validation for both test decks
  static validateTestDecks() {
    const deckFormats = this.getDeckFormats()
    const deck1Validation = this.validateDeckFormat(deckFormats.deck1)
    const deck2Validation = this.validateDeckFormat(deckFormats.deck2)

    return {
      deck1: deck1Validation,
      deck2: deck2Validation,
      bothValid: deck1Validation.isValid && deck2Validation.isValid,
    }
  }
}
