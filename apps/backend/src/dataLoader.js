import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

// Custom data loader that uses local data directory
export class LocalDataLoader {
  static _cardDatabase = null
  static _testDecks = null

  // Load card database from local data directory
  static loadCardDatabase() {
    if (!this._cardDatabase) {
      const cardDatabasePath = join(__dirname, '../data/latest.json')
      this._cardDatabase = JSON.parse(readFileSync(cardDatabasePath, 'utf8'))
    }
    return this._cardDatabase
  }

  // Load test decks from local data directory
  static loadTestDecks() {
    if (!this._testDecks) {
      const testDecksPath = join(__dirname, '../data/test-decks.json')
      this._testDecks = JSON.parse(readFileSync(testDecksPath, 'utf8'))
    }
    return this._testDecks
  }

  // Get deck formats
  static getDeckFormats() {
    return this.loadTestDecks()
  }

  // Get deck1 format
  static getDeck1Format() {
    const testDecks = this.loadTestDecks()
    return testDecks.deck1
  }

  // Get deck2 format
  static getDeck2Format() {
    const testDecks = this.loadTestDecks()
    return testDecks.deck2
  }
}
