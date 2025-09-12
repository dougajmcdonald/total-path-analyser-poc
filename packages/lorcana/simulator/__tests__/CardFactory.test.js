// CardFactory tests for all card types

import { IAction } from '../entities/card/IAction.js'
import { ICard } from '../entities/card/ICard.js'
import { ICharacter } from '../entities/card/ICharacter.js'
import { ILocation } from '../entities/card/ILocation.js'
import { ISong } from '../entities/card/ISong.js'
import { Deck } from '../entities/deck/Deck.js'
import { CardFactory } from '../utils/CardFactory.js'

describe('CardFactory', () => {
  // Static test data for each card type
  const testData = {
    character: {
      id: 'mickey-1',
      name: 'Mickey Mouse',
      type: 'character',
      inkable: true,
      color: 'amber',
      cost: 2,
      strength: 2,
      willpower: 2,
    },
    action: {
      id: 'heal-1',
      name: 'Heal',
      type: 'action',
      inkable: true,
      color: 'sapphire',
      cost: 1,
    },
    song: {
      id: 'friends-on-the-other-side-1',
      name: 'Friends on the Other Side',
      type: 'action',
      inkable: true,
      color: 'amethyst',
      cost: 3,
      classifications: ['song'],
    },
    songByName: {
      id: 'be-prepared-1',
      name: 'Be Prepared Song',
      type: 'action',
      inkable: true,
      color: 'emerald',
      cost: 4,
    },
    location: {
      id: 'mickey-mouse-house-1',
      name: 'Mickey Mouse House',
      type: 'location',
      inkable: true,
      color: 'amber',
      cost: 3,
      willpower: 3,
    },
    unknownType: {
      id: 'mystery-1',
      name: 'Mystery Card',
      type: 'unknown',
      inkable: false,
      cost: 5,
    },
    minimalData: {
      id: 'minimal-1',
      name: 'Minimal Card',
    },
  }

  describe('createCard', () => {
    describe('Character cards', () => {
      test('should create ICharacter with all properties', () => {
        const card = CardFactory.createCard(testData.character)

        expect(card).toBeInstanceOf(ICharacter)
        expect(card.id).toBe('mickey-1')
        expect(card.name).toBe('Mickey Mouse')
        expect(card.inkable).toBe(true)
        expect(card.ink).toEqual({ color: 'amber' })
        expect(card.cost).toBe(2)
        expect(card.type).toBe('character')
        expect(card.strength).toBe(2)
        expect(card.willpower).toBe(2)
      })

      test('should handle missing strength and willpower', () => {
        const data = { ...testData.character }
        delete data.strength
        delete data.willpower

        const card = CardFactory.createCard(data)

        expect(card).toBeInstanceOf(ICharacter)
        expect(card.strength).toBe(0)
        expect(card.willpower).toBe(0)
      })

      test('should handle different case for type', () => {
        const data = { ...testData.character, type: 'CHARACTER' }
        const card = CardFactory.createCard(data)

        expect(card).toBeInstanceOf(ICharacter)
        expect(card.type).toBe('character')
      })
    })

    describe('Action cards', () => {
      test('should create IAction with all properties', () => {
        const card = CardFactory.createCard(testData.action)

        expect(card).toBeInstanceOf(IAction)
        expect(card.id).toBe('heal-1')
        expect(card.name).toBe('Heal')
        expect(card.inkable).toBe(true)
        expect(card.ink).toEqual({ color: 'sapphire' })
        expect(card.cost).toBe(1)
        expect(card.type).toBe('action')
      })

      test('should handle missing cost', () => {
        const data = { ...testData.action }
        delete data.cost

        const card = CardFactory.createCard(data)

        expect(card).toBeInstanceOf(IAction)
        expect(card.cost).toBe(0)
      })

      test('should handle missing color', () => {
        const data = { ...testData.action }
        delete data.color

        const card = CardFactory.createCard(data)

        expect(card).toBeInstanceOf(IAction)
        expect(card.ink).toBeNull()
      })
    })

    describe('Song cards', () => {
      test('should create ISong when classifications includes song', () => {
        const card = CardFactory.createCard(testData.song)

        expect(card).toBeInstanceOf(ISong)
        expect(card.id).toBe('friends-on-the-other-side-1')
        expect(card.name).toBe('Friends on the Other Side')
        expect(card.inkable).toBe(true)
        expect(card.ink).toEqual({ color: 'amethyst' })
        expect(card.cost).toBe(3)
        expect(card.type).toBe('action - song')
      })

      test('should create ISong when name includes Song', () => {
        const card = CardFactory.createCard(testData.songByName)

        expect(card).toBeInstanceOf(ISong)
        expect(card.id).toBe('be-prepared-1')
        expect(card.name).toBe('Be Prepared Song')
        expect(card.type).toBe('action - song')
      })

      test('should create IAction when no song indicators', () => {
        const data = { ...testData.action }
        const card = CardFactory.createCard(data)

        expect(card).toBeInstanceOf(IAction)
        expect(card.type).toBe('action')
      })
    })

    describe('Location cards', () => {
      test('should create ILocation with all properties', () => {
        const card = CardFactory.createCard(testData.location)

        expect(card).toBeInstanceOf(ILocation)
        expect(card.id).toBe('mickey-mouse-house-1')
        expect(card.name).toBe('Mickey Mouse House')
        expect(card.inkable).toBe(true)
        expect(card.ink).toEqual({ color: 'amber' })
        expect(card.cost).toBe(3)
        expect(card.type).toBe('location')
        expect(card.willpower).toBe(3)
      })

      test('should handle missing willpower', () => {
        const data = { ...testData.location }
        delete data.willpower

        const card = CardFactory.createCard(data)

        expect(card).toBeInstanceOf(ILocation)
        expect(card.willpower).toBe(0)
      })
    })

    describe('Edge cases', () => {
      test('should default to IAction for unknown types', () => {
        const card = CardFactory.createCard(testData.unknownType)

        expect(card).toBeInstanceOf(IAction)
        expect(card.id).toBe('mystery-1')
        expect(card.name).toBe('Mystery Card')
        expect(card.type).toBe('action')
      })

      test('should handle minimal data', () => {
        const card = CardFactory.createCard(testData.minimalData)

        expect(card).toBeInstanceOf(IAction)
        expect(card.id).toBe('minimal-1')
        expect(card.name).toBe('Minimal Card')
        expect(card.inkable).toBeUndefined()
        expect(card.ink).toBeNull()
        expect(card.cost).toBe(0)
      })

      test('should use uniqueId if provided', () => {
        const data = { ...testData.character, uniqueId: 'unique-mickey-1' }
        const card = CardFactory.createCard(data)

        expect(card.id).toBe('unique-mickey-1')
      })

      test('should fallback to id if uniqueId not provided', () => {
        const card = CardFactory.createCard(testData.character)

        expect(card.id).toBe('mickey-1')
      })
    })
  })

  describe('createCards', () => {
    test('should create array of cards from data array', () => {
      const cardsData = [testData.character, testData.action, testData.location]
      const cards = CardFactory.createCards(cardsData)

      expect(cards).toHaveLength(3)
      expect(cards[0]).toBeInstanceOf(ICharacter)
      expect(cards[1]).toBeInstanceOf(IAction)
      expect(cards[2]).toBeInstanceOf(ILocation)
    })

    test('should handle empty array', () => {
      const cards = CardFactory.createCards([])

      expect(cards).toEqual([])
    })
  })

  describe('createDeck', () => {
    test('should create deck from card data', () => {
      const cardsData = [testData.character, testData.action]
      const deck = CardFactory.createDeck(cardsData)

      expect(deck).toBeInstanceOf(Deck)
      expect(deck.cards).toHaveLength(2)
      expect(deck.cards[0]).toBeInstanceOf(ICharacter)
      expect(deck.cards[1]).toBeInstanceOf(IAction)
    })
  })

  describe('createDeckFromFormat', () => {
    const cardDatabase = [
      testData.character,
      testData.action,
      testData.location,
    ]

    const deckFormat = [
      { name: 'Mickey Mouse', quantity: 2 },
      { name: 'Heal', quantity: 3 },
      { name: 'Mickey Mouse House', quantity: 1 },
    ]

    test('should create deck from format with quantities', () => {
      const deck = CardFactory.createDeckFromFormat(deckFormat, cardDatabase)

      expect(deck).toBeInstanceOf(Deck)
      expect(deck.cards).toHaveLength(6) // 2 + 3 + 1

      // Check Mickey Mouse cards
      const mickeyCards = deck.cards.filter(
        (card) => card.name === 'Mickey Mouse'
      )
      expect(mickeyCards).toHaveLength(2)
      expect(mickeyCards[0].id).toBe('Mickey Mouse-0')
      expect(mickeyCards[1].id).toBe('Mickey Mouse-1')

      // Check Heal cards
      const healCards = deck.cards.filter((card) => card.name === 'Heal')
      expect(healCards).toHaveLength(3)

      // Check Location cards
      const locationCards = deck.cards.filter(
        (card) => card.name === 'Mickey Mouse House'
      )
      expect(locationCards).toHaveLength(1)
    })

    test('should handle missing cards gracefully', () => {
      const deckFormat = [
        { name: 'Non-existent Card', quantity: 1 },
        { name: 'Mickey Mouse', quantity: 1 },
      ]

      const deck = CardFactory.createDeckFromFormat(deckFormat, cardDatabase)

      expect(deck).toBeInstanceOf(Deck)
      expect(deck.cards).toHaveLength(1) // Only Mickey Mouse
      // Note: Console warning is expected but not tested due to Jest setup
    })

    test('should handle empty format', () => {
      const deck = CardFactory.createDeckFromFormat([], cardDatabase)

      expect(deck).toBeInstanceOf(Deck)
      expect(deck.cards).toHaveLength(0)
    })
  })

  describe('Inheritance validation', () => {
    test('ICharacter should extend ICard', () => {
      const card = CardFactory.createCard(testData.character)

      expect(card).toBeInstanceOf(ICard)
      expect(card).toBeInstanceOf(ICharacter)
    })

    test('IAction should extend ICard', () => {
      const card = CardFactory.createCard(testData.action)

      expect(card).toBeInstanceOf(ICard)
      expect(card).toBeInstanceOf(IAction)
    })

    test('ISong should extend IAction and ICard', () => {
      const card = CardFactory.createCard(testData.song)

      expect(card).toBeInstanceOf(ICard)
      expect(card).toBeInstanceOf(IAction)
      expect(card).toBeInstanceOf(ISong)
    })

    test('ILocation should extend ICard', () => {
      const card = CardFactory.createCard(testData.location)

      expect(card).toBeInstanceOf(ICard)
      expect(card).toBeInstanceOf(ILocation)
    })
  })
})
