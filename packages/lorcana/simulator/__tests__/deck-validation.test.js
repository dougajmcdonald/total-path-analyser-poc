// Tests for deck validation and initialization rules
import { describe, expect, jest, test } from '@jest/globals'
import {
  createInvalidDeck,
  createMinimalDeck,
  createValidDeck,
  getTestDecks
} from './test-utils.js'

describe('Deck Validation', () => {
  describe('Deck Size Requirements', () => {
    test('should create valid decks with exactly 60 cards', () => {
      const deck = createValidDeck(['Tinker Bell - Giant Fairy', 'Hades - Infernal Schemer'])
      
      expect(deck).toHaveLength(60)
    })

    test('should create invalid decks with less than 60 cards', () => {
      const deck = createInvalidDeck(['Tinker Bell - Giant Fairy'])
      
      expect(deck.length).toBeLessThan(60)
      expect(deck.length).toBeGreaterThan(0)
    })

    test('should validate test decks have at least 60 cards', () => {
      const { deck1, deck2 } = getTestDecks()
      
      expect(deck1.length).toBeGreaterThanOrEqual(60)
      expect(deck2.length).toBeGreaterThanOrEqual(60)
    })
  })

  describe('Card Distribution', () => {
    test('should distribute cards evenly when creating valid deck', () => {
      const cardNames = ['Roger Radcliff - Dog Lover', 'Elsa - The Fifth Spirit', 'Hades - Infernal Schemer']
      const deck = createValidDeck(cardNames)
      
      // Each card should appear roughly the same number of times
      const cardACount = deck.filter(card => card.name === 'Roger Radcliff - Dog Lover').length
      const cardBCount = deck.filter(card => card.name === 'Elsa - The Fifth Spirit').length
      const cardCCount = deck.filter(card => card.name === 'Hades - Infernal Schemer').length
      
      expect(cardACount).toBeGreaterThan(0)
      expect(cardBCount).toBeGreaterThan(0)
      expect(cardCCount).toBeGreaterThan(0)
      
      // All counts should be within 1 of each other
      const counts = [cardACount, cardBCount, cardCCount]
      const maxCount = Math.max(...counts)
      const minCount = Math.min(...counts)
      expect(maxCount - minCount).toBeLessThanOrEqual(1)
    })

    test('should create minimal decks with specified quantities', () => {
      const cardNames = ['Roger Radcliff - Dog Lover', 'Elsa - The Fifth Spirit']
      const deck = createMinimalDeck(cardNames, 3)
      
      expect(deck).toHaveLength(6) // 2 cards × 3 quantity
      
      const cardACount = deck.filter(card => card.name === 'Roger Radcliff - Dog Lover').length
      const cardBCount = deck.filter(card => card.name === 'Elsa - The Fifth Spirit').length
      
      expect(cardACount).toBe(3)
      expect(cardBCount).toBe(3)
    })
  })

  describe('Card Properties', () => {
    test('should preserve card properties when creating decks', () => {
      const deck = createMinimalDeck(['Roger Radcliff - Dog Lover'])
      
      expect(deck).toHaveLength(1)
      expect(deck[0].name).toBe('Roger Radcliff - Dog Lover')
      expect(deck[0].cost).toBeDefined()
      expect(deck[0].inkable).toBeDefined()
      expect(deck[0].type).toBeDefined()
      expect(deck[0].uniqueId).toBeDefined()
    })

    test('should assign unique IDs to cards', () => {
      const deck = createMinimalDeck(['Roger Radcliff - Dog Lover'], 3)
      
      const uniqueIds = deck.map(card => card.uniqueId)
      const uniqueSet = new Set(uniqueIds)
      
      expect(uniqueIds).toHaveLength(3)
      expect(uniqueSet.size).toBe(3) // All IDs should be unique
    })
  })

  describe('Real Card Data Integration', () => {
    test('should use real card data from data-import', () => {
      const deck = createMinimalDeck(['Roger Radcliff - Dog Lover'])
      
      expect(deck[0].name).toBe('Roger Radcliff - Dog Lover')
      expect(deck[0].cost).toBe(1) // Roger Radcliff - Dog Lover costs 1
      expect(deck[0].inkable).toBe(true) // Roger Radcliff - Dog Lover is inkable
      expect(deck[0].type).toBe('character') // Roger Radcliff - Dog Lover is a character
    })

    test('should handle missing cards gracefully', () => {
      // This should not throw an error, but should log a warning
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      
      const deck = createMinimalDeck(['Nonexistent Card'])
      
      expect(deck).toHaveLength(0)
      expect(consoleSpy).toHaveBeenCalledWith('Card not found: Nonexistent Card')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Deck Composition Validation', () => {
    test('should validate deck has sufficient cards for 7-card starting hand', () => {
      const deck = createValidDeck(['Tinker Bell - Giant Fairy'])
      
      // After drawing 7 cards, should still have cards left
      expect(deck.length).toBeGreaterThan(7)
    })

    test('should validate deck has cards with different costs', () => {
      const deck = createValidDeck([
        'Roger Radcliff - Dog Lover', // Cost 1
        'Hades - Infernal Schemer',   // Cost 7
        'Elsa - The Fifth Spirit'     // Cost 5
      ])
      
      const costs = deck.map(card => card.cost)
      const uniqueCosts = new Set(costs)
      
      expect(uniqueCosts.size).toBeGreaterThan(1) // Should have multiple different costs
    })

    test('should validate deck has both inkable and non-inkable cards', () => {
      const deck = createValidDeck([
        'Roger Radcliff - Dog Lover', // Inkable
        'Hades - Infernal Schemer',   // Inkable
        'Develop Your Brain'          // Non-inkable action
      ])
      
      const inkableCards = deck.filter(card => card.inkable === true)
      const nonInkableCards = deck.filter(card => card.inkable === false)
      
      expect(inkableCards.length).toBeGreaterThan(0)
      expect(nonInkableCards.length).toBeGreaterThan(0)
    })
  })
})
