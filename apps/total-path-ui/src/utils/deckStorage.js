// Shared deck storage utilities for managing user-imported decks
// This allows both DecksPage and SimulatorPage to access the same deck data

const STORAGE_KEY = "savedDecks"

/**
 * Load saved decks from localStorage
 * @returns {Array} Array of saved deck objects
 */
export function loadSavedDecks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error("Error loading saved decks:", error)
    return []
  }
}

/**
 * Save decks to localStorage
 * @param {Array} decks - Array of deck objects to save
 */
export function saveDecksToStorage(decks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
  } catch (error) {
    console.error("Error saving decks:", error)
  }
}

/**
 * Add a new deck to storage
 * @param {Object} deck - Deck object to add
 * @returns {Array} Updated array of decks
 */
export function addDeck(deck) {
  const decks = loadSavedDecks()
  const updatedDecks = [...decks, deck]
  saveDecksToStorage(updatedDecks)
  return updatedDecks
}

/**
 * Update an existing deck in storage
 * @param {string} deckId - ID of deck to update
 * @param {Object} updatedDeck - Updated deck object
 * @returns {Array} Updated array of decks
 */
export function updateDeck(deckId, updatedDeck) {
  const decks = loadSavedDecks()
  const updatedDecks = decks.map(deck => 
    deck.id === deckId ? { ...updatedDeck, id: deckId } : deck
  )
  saveDecksToStorage(updatedDecks)
  return updatedDecks
}

/**
 * Delete a deck from storage
 * @param {string} deckId - ID of deck to delete
 * @returns {Array} Updated array of decks
 */
export function deleteDeck(deckId) {
  const decks = loadSavedDecks()
  const updatedDecks = decks.filter(deck => deck.id !== deckId)
  saveDecksToStorage(updatedDecks)
  return updatedDecks
}

/**
 * Get a specific deck by ID
 * @param {string} deckId - ID of deck to retrieve
 * @returns {Object|null} Deck object or null if not found
 */
export function getDeckById(deckId) {
  const decks = loadSavedDecks()
  return decks.find(deck => deck.id === deckId) || null
}

/**
 * Convert a user deck to simulator format
 * @param {Object} userDeck - User deck object from DecksPage
 * @returns {Object} Deck object compatible with simulator
 */
export function convertUserDeckToSimulatorFormat(userDeck) {
  // Convert cards to simulator format (name + quantity only)
  const simulatorCards = userDeck.cards.map(card => ({
    name: card.name,
    quantity: card.quantity
  }))

  return {
    id: userDeck.id,
    name: userDeck.name,
    description: `${userDeck.cards.length} cards • ${userDeck.ruleConfig}`,
    cardCount: userDeck.cards.length,
    cards: simulatorCards,
    ruleConfig: userDeck.ruleConfig,
    createdAt: userDeck.createdAt,
    type: "user" // Distinguish from test decks
  }
}

/**
 * Get all user decks in simulator format
 * @returns {Array} Array of user decks formatted for simulator
 */
export function getUserDecksForSimulator() {
  const userDecks = loadSavedDecks()
  return userDecks.map(convertUserDeckToSimulatorFormat)
}
