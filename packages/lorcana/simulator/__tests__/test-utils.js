// Test utilities for Lorcana simulator tests
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load test deck data
const testDecks = JSON.parse(readFileSync(join(__dirname, '../test-decks.json'), 'utf8'))

// Load real card data from data-import
const cardData = JSON.parse(readFileSync(join(__dirname, '../../data-import/data/cards-transformed-2025-09-07T13-03-38-221Z.json'), 'utf8'))

/**
 * Create a deck from the test deck format
 * @param {Array} deckFormat - Array of {name, quantity} objects
 * @returns {Array} Array of card objects
 */
export function createDeckFromFormat (deckFormat) {
  const deck = []
  
  for (const cardEntry of deckFormat) {
    // Find the card in our data
    const card = cardData.find(c => c.name === cardEntry.name)
    
    if (!card) {
      console.warn(`Card not found: ${cardEntry.name}`)
      continue
    }
    
    // Add the specified quantity to the deck
    for (let i = 0; i < cardEntry.quantity; i++) {
      deck.push({ 
        ...card, 
        uniqueId: `${card.name}-${i}` // Add unique ID for testing
      })
    }
  }
  
  return deck
}

/**
 * Create a minimal test deck with specific cards
 * @param {Array} cardNames - Array of card names to include
 * @param {number} quantity - Quantity of each card (default: 1)
 * @returns {Array} Array of card objects
 */
export function createMinimalDeck (cardNames, quantity = 1) {
  const deck = []
  
  for (const cardName of cardNames) {
    const card = cardData.find(c => c.name === cardName)
    if (!card) {
      throw new Error(`Card not found: ${cardName}`)
    }
    
    for (let i = 0; i < quantity; i++) {
      deck.push({ 
        ...card, 
        uniqueId: `${card.name}-${i}`
      })
    }
  }
  
  return deck
}

/**
 * Create a deck with exactly 60 cards for testing deck size validation
 * @param {Array} cardNames - Array of card names to include
 * @returns {Array} Array of card objects with exactly 60 cards
 */
export function createValidDeck (cardNames) {
  const deck = []
  const cardsPerName = Math.ceil(60 / cardNames.length)
  
  for (const cardName of cardNames) {
    const card = cardData.find(c => c.name === cardName)
    if (!card) {
      throw new Error(`Card not found: ${cardName}`)
    }
    
    for (let i = 0; i < cardsPerName && deck.length < 60; i++) {
      deck.push({ 
        ...card, 
        uniqueId: `${card.name}-${i}`
      })
    }
  }
  
  // Ensure we have exactly 60 cards
  while (deck.length < 60) {
    const lastCard = deck[deck.length - 1]
    deck.push({ 
      ...lastCard, 
      uniqueId: `${lastCard.name}-${deck.length}`
    })
  }
  
  return deck.slice(0, 60) // Ensure exactly 60
}

/**
 * Create a deck with less than 60 cards for testing validation
 * @param {Array} cardNames - Array of card names to include
 * @returns {Array} Array of card objects with less than 60 cards
 */
export function createInvalidDeck (cardNames) {
  const deck = []
  
  for (const cardName of cardNames) {
    const card = cardData.find(c => c.name === cardName)
    if (!card) {
      throw new Error(`Card not found: ${cardName}`)
    }
    
    deck.push({ 
      ...card, 
      uniqueId: `${card.name}-0`
    })
  }
  
  return deck
}

/**
 * Get test decks from the test-decks.json file
 * @returns {Object} Object with deck1 and deck2 arrays
 */
export function getTestDecks () {
  return {
    deck1: createDeckFromFormat(testDecks.deck1),
    deck2: createDeckFromFormat(testDecks.deck2)
  }
}

/**
 * Create a mock card for testing
 * @param {Object} overrides - Properties to override on the card
 * @returns {Object} Mock card object
 */
export function createMockCard (overrides = {}) {
  return {
    name: 'Test Card',
    cost: 2,
    inkable: true,
    type: 'character',
    strength: 2,
    willpower: 2,
    lore: 1,
    uniqueId: 'test-card-0',
    ...overrides
  }
}

/**
 * Create a mock game state for testing
 * @param {Object} overrides - Properties to override on the game state
 * @returns {Object} Mock game state object
 */
export function createMockGameState (overrides = {}) {
  const defaultState = {
    players: [
      {
        id: 'player1',
        deck: [],
        hand: [],
        board: [],
        inkwell: [],
        lore: 0,
        isActive: true,
        hasInkedThisTurn: false
      },
      {
        id: 'player2',
        deck: [],
        hand: [],
        board: [],
        inkwell: [],
        lore: 0,
        isActive: true,
        hasInkedThisTurn: false
      }
    ],
    currentPlayer: 0,
    turn: 1,
    phase: 'ready',
    winner: null,
    discardPile: []
  }
  
  return { ...defaultState, ...overrides }
}

/**
 * Helper to find a card by name in a player's hand
 * @param {Object} gameState - The game state
 * @param {string} playerId - The player ID
 * @param {string} cardName - The card name to find
 * @returns {Object|null} The card or null if not found
 */
export function findCardInHand (gameState, playerId, cardName) {
  const player = gameState.players.find(p => p.id === playerId)
  if (!player) return null
  return player.hand.find(card => card.name === cardName)
}

/**
 * Helper to find a card by name in a player's board
 * @param {Object} gameState - The game state
 * @param {string} playerId - The player ID
 * @param {string} cardName - The card name to find
 * @returns {Object|null} The card or null if not found
 */
export function findCardInBoard (gameState, playerId, cardName) {
  const player = gameState.players.find(p => p.id === playerId)
  if (!player) return null
  return player.board.find(card => card.name === cardName)
}

/**
 * Helper to get player by ID
 * @param {Object} gameState - The game state
 * @param {string} playerId - The player ID
 * @returns {Object|null} The player or null if not found
 */
export function getPlayer (gameState, playerId) {
  return gameState.players.find(p => p.id === playerId)
}

/**
 * Helper to count cards in hand by name
 * @param {Object} gameState - The game state
 * @param {string} playerId - The player ID
 * @param {string} cardName - The card name to count
 * @returns {number} Number of cards with that name in hand
 */
export function countCardsInHand (gameState, playerId, cardName) {
  const player = getPlayer(gameState, playerId)
  if (!player) return 0
  return player.hand.filter(card => card.name === cardName).length
}

/**
 * Helper to count cards in deck by name
 * @param {Object} gameState - The game state
 * @param {string} playerId - The player ID
 * @param {string} cardName - The card name to count
 * @returns {number} Number of cards with that name in deck
 */
export function countCardsInDeck (gameState, playerId, cardName) {
  const player = getPlayer(gameState, playerId)
  if (!player) return 0
  return player.deck.filter(card => card.name === cardName).length
}

