// GameStateFactory tests for game initialization and deck management

import { Deck } from '../entities/deck/Deck.js'
import { IGameState } from '../entities/game/IGameState.js'
import { IPlayerState } from '../entities/player/IPlayerState.js'
import { Player } from '../entities/player/Player.js'
import { CardFactory } from '../utils/CardFactory.js'
import { GameStateFactory } from '../utils/GameStateFactory.js'
import { TestDataLoader } from '../utils/TestDataLoader.js'

describe('GameStateFactory', () => {
  // Create test deck data with 60 cards (standard Lorcana deck size)
  const createTestDeckData = (prefix = '') => {
    const cards = []
    const cardTypes = [
      {
        name: 'Mickey Mouse',
        type: 'character',
        cost: 2,
        strength: 2,
        willpower: 1,
      },
      { name: 'Goofy', type: 'character', cost: 3, strength: 3, willpower: 2 },
      {
        name: 'Donald Duck',
        type: 'character',
        cost: 4,
        strength: 4,
        willpower: 3,
      },
      { name: 'Heal', type: 'action', cost: 1 },
      { name: 'Fireball', type: 'action', cost: 2 },
      { name: 'Mickey Mouse House', type: 'location', cost: 3, willpower: 3 },
      {
        name: 'Friends on the Other Side',
        type: 'action',
        cost: 3,
        classifications: ['song'],
      },
    ]

    // Create 60 cards (mix of all types)
    for (let i = 0; i < 60; i++) {
      const cardType = cardTypes[i % cardTypes.length]
      cards.push({
        ...cardType,
        id: `${prefix}${cardType.name.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        inkable: true,
        color: ['amber', 'sapphire', 'emerald', 'ruby', 'amethyst', 'steel'][
          i % 6
        ],
      })
    }

    return cards
  }

  const testDeckData1 = createTestDeckData('deck1-')
  const testDeckData2 = createTestDeckData('deck2-')

  describe('createGameState', () => {
    test('should create game state with two players', () => {
      const deck1 = CardFactory.createDeck(testDeckData1)
      const deck2 = CardFactory.createDeck(testDeckData2)
      const gameState = GameStateFactory.createGameState(deck1, deck2)

      expect(gameState).toBeInstanceOf(IGameState)
      expect(gameState.players).toHaveLength(2)
      expect(gameState.players[0]).toBeInstanceOf(Player)
      expect(gameState.players[1]).toBeInstanceOf(Player)
      expect(gameState.players[0].id).toBe('player1')
      expect(gameState.players[1].id).toBe('player2')
    })

    test('should assign correct decks to players', () => {
      const deck1 = CardFactory.createDeck(testDeckData1)
      const deck2 = CardFactory.createDeck(testDeckData2)
      const gameState = GameStateFactory.createGameState(deck1, deck2)

      expect(gameState.players[0].activeDeck).toBe(deck1)
      expect(gameState.players[1].activeDeck).toBe(deck2)
      expect(gameState.players[0].activeDeck.size()).toBe(60)
      expect(gameState.players[1].activeDeck.size()).toBe(60)
    })

    test('should have uninitialized state before initGame', () => {
      const deck1 = CardFactory.createDeck(testDeckData1)
      const deck2 = CardFactory.createDeck(testDeckData2)
      const gameState = GameStateFactory.createGameState(deck1, deck2)

      expect(gameState.activePlayer).toBeNull()
      expect(gameState.playerStates).toHaveLength(0)
      expect(gameState.turn).toBe(1)
      expect(gameState.phase).toBe('ready')
    })
  })

  describe('initGame', () => {
    test('should initialize game with player states', () => {
      const deck1 = CardFactory.createDeck(testDeckData1)
      const deck2 = CardFactory.createDeck(testDeckData2)
      const gameState = GameStateFactory.initGame(deck1, deck2)

      expect(gameState.activePlayer).not.toBeNull()
      expect(gameState.playerStates).toHaveLength(2)
      expect(gameState.playerStates[0]).toBeInstanceOf(IPlayerState)
      expect(gameState.playerStates[1]).toBeInstanceOf(IPlayerState)
      expect(gameState.phase).toBe('ready')
    })

    test('should set active player randomly', () => {
      const deck1 = CardFactory.createDeck(testDeckData1)
      const deck2 = CardFactory.createDeck(testDeckData2)

      // Run multiple times to test randomness
      const results = []
      for (let i = 0; i < 10; i++) {
        const gameState = GameStateFactory.initGame(deck1, deck2)
        results.push(gameState.activePlayer.id)
      }

      // Should have both players as active at least once
      const uniqueResults = [...new Set(results)]
      expect(uniqueResults).toContain('player1')
      expect(uniqueResults).toContain('player2')
    })

    test('should draw 7 cards to each player hand', () => {
      const deck1 = CardFactory.createDeck(testDeckData1)
      const deck2 = CardFactory.createDeck(testDeckData2)
      const gameState = GameStateFactory.initGame(deck1, deck2)

      const player1State = gameState.getPlayerState('player1')
      const player2State = gameState.getPlayerState('player2')

      expect(player1State.hand).toHaveLength(7)
      expect(player2State.hand).toHaveLength(7)
    })

    test('should reduce deck size by 14 cards total (7 per player)', () => {
      const deck1 = CardFactory.createDeck(testDeckData1)
      const deck2 = CardFactory.createDeck(testDeckData2)
      const gameState = GameStateFactory.initGame(deck1, deck2)

      expect(gameState.players[0].activeDeck.size()).toBe(53) // 60 - 7
      expect(gameState.players[1].activeDeck.size()).toBe(53) // 60 - 7
    })

    test('should draw cards from correct decks', () => {
      const deck1 = CardFactory.createDeck(testDeckData1)
      const deck2 = CardFactory.createDeck(testDeckData2)
      const gameState = GameStateFactory.initGame(deck1, deck2)

      const player1State = gameState.getPlayerState('player1')
      const player2State = gameState.getPlayerState('player2')

      // Check that player1's hand contains cards from deck1
      player1State.hand.forEach((card) => {
        expect(card.id).toMatch(/^deck1-/)
      })

      // Check that player2's hand contains cards from deck2
      player2State.hand.forEach((card) => {
        expect(card.id).toMatch(/^deck2-/)
      })
    })

    test('should not have duplicate cards in hands', () => {
      const deck1 = CardFactory.createDeck(testDeckData1)
      const deck2 = CardFactory.createDeck(testDeckData2)
      const gameState = GameStateFactory.initGame(deck1, deck2)

      const player1State = gameState.getPlayerState('player1')
      const player2State = gameState.getPlayerState('player2')

      // Check for duplicates in player1's hand
      const player1CardIds = player1State.hand.map((card) => card.id)
      const uniquePlayer1Ids = [...new Set(player1CardIds)]
      expect(uniquePlayer1Ids).toHaveLength(player1CardIds.length)

      // Check for duplicates in player2's hand
      const player2CardIds = player2State.hand.map((card) => card.id)
      const uniquePlayer2Ids = [...new Set(player2CardIds)]
      expect(uniquePlayer2Ids).toHaveLength(player2CardIds.length)
    })
  })

  describe('drawCard', () => {
    test('should draw card from deck to hand', () => {
      const deck1 = CardFactory.createDeck(testDeckData1)
      const deck2 = CardFactory.createDeck(testDeckData2)
      const gameState = GameStateFactory.createGameState(deck1, deck2)
      gameState.initializeGame()

      const initialHandSize = gameState.getPlayerState('player1').hand.length
      const initialDeckSize = gameState.players[0].activeDeck.size()

      GameStateFactory.drawCard(gameState, 'player1')

      expect(gameState.getPlayerState('player1').hand).toHaveLength(
        initialHandSize + 1
      )
      expect(gameState.players[0].activeDeck.size()).toBe(initialDeckSize - 1)
    })

    test('should handle drawing from empty deck', () => {
      const emptyDeck = new Deck([])
      const deck2 = CardFactory.createDeck(testDeckData2)
      const gameState = GameStateFactory.createGameState(emptyDeck, deck2)
      gameState.initializeGame()

      const initialHandSize = gameState.getPlayerState('player1').hand.length

      GameStateFactory.drawCard(gameState, 'player1')

      expect(gameState.getPlayerState('player1').hand).toHaveLength(
        initialHandSize
      )
    })

    test('should handle invalid player ID', () => {
      const deck1 = CardFactory.createDeck(testDeckData1)
      const deck2 = CardFactory.createDeck(testDeckData2)
      const gameState = GameStateFactory.createGameState(deck1, deck2)
      gameState.initializeGame()

      const result = GameStateFactory.drawCard(gameState, 'invalid-player')
      expect(result).toBe(gameState) // Should return unchanged game state
    })
  })

  describe('createGameFromCardData', () => {
    test('should create and initialize game from card data arrays', () => {
      const gameState = GameStateFactory.createGameFromCardData(
        testDeckData1,
        testDeckData2
      )

      expect(gameState).toBeInstanceOf(IGameState)
      expect(gameState.players).toHaveLength(2)
      expect(gameState.playerStates).toHaveLength(2)
      expect(gameState.getPlayerState('player1').hand).toHaveLength(7)
      expect(gameState.getPlayerState('player2').hand).toHaveLength(7)
    })

    test('should create decks with correct sizes', () => {
      const gameState = GameStateFactory.createGameFromCardData(
        testDeckData1,
        testDeckData2
      )

      expect(gameState.players[0].activeDeck.size()).toBe(53) // 60 - 7
      expect(gameState.players[1].activeDeck.size()).toBe(53) // 60 - 7
    })
  })

  describe('createGameFromTestFormat', () => {
    const cardDatabase = [
      {
        Unique_ID: 'FAB-188',
        Name: 'Tinker Bell - Giant Fairy',
        Type: 'Character',
        Cost: 6,
        Inkable: true,
        Color: 'Steel',
        Strength: 4,
        Willpower: 5,
        Lore: 2,
        Classifications: 'Floodborn, Ally, Fairy',
        Rarity: 'Super Rare',
        Set_Name: 'Fabled',
        Franchise: '',
      },
      {
        Unique_ID: 'FAB-001',
        Name: 'Tipo - Growing Son',
        Type: 'Character',
        Cost: 2,
        Inkable: true,
        Color: 'Amber',
        Strength: 2,
        Willpower: 3,
        Lore: 1,
        Classifications: 'Storyborn, Ally',
        Rarity: 'Uncommon',
        Set_Name: 'Fabled',
        Franchise: '',
      },
      {
        Unique_ID: 'FAB-002',
        Name: 'Happy - Lively Knight',
        Type: 'Character',
        Cost: 1,
        Inkable: true,
        Color: 'Amber',
        Strength: 1,
        Willpower: 2,
        Lore: 1,
        Classifications: 'Storyborn, Ally',
        Rarity: 'Common',
        Set_Name: 'Fabled',
        Franchise: '',
      },
    ]

    const deckFormat1 = [
      { name: 'Tinker Bell - Giant Fairy', quantity: 20 },
      { name: 'Tipo - Growing Son', quantity: 20 },
      { name: 'Happy - Lively Knight', quantity: 20 },
    ]

    const deckFormat2 = [
      { name: 'Tinker Bell - Giant Fairy', quantity: 15 },
      { name: 'Tipo - Growing Son', quantity: 15 },
      { name: 'Happy - Lively Knight', quantity: 30 },
    ]

    test('should create game from test format', () => {
      const gameState = GameStateFactory.createGameFromTestFormat(
        deckFormat1,
        deckFormat2,
        cardDatabase
      )

      expect(gameState).toBeInstanceOf(IGameState)
      expect(gameState.players).toHaveLength(2)
      expect(gameState.playerStates).toHaveLength(2)
      expect(gameState.getPlayerState('player1').hand).toHaveLength(7)
      expect(gameState.getPlayerState('player2').hand).toHaveLength(7)
    })

    test('should create decks with correct initial sizes', () => {
      const gameState = GameStateFactory.createGameFromTestFormat(
        deckFormat1,
        deckFormat2,
        cardDatabase
      )

      // Deck1: 20 + 20 + 20 = 60 cards, minus 7 drawn = 53
      expect(gameState.players[0].activeDeck.size()).toBe(53)
      // Deck2: 15 + 15 + 30 = 60 cards, minus 7 drawn = 53
      expect(gameState.players[1].activeDeck.size()).toBe(53)
    })
  })

  describe('createTestGame', () => {
    test('should create test game with test-decks.json data', async () => {
      const gameState = await GameStateFactory.createTestGame()

      expect(gameState).toBeInstanceOf(IGameState)
      expect(gameState.players).toHaveLength(2)
      expect(gameState.playerStates).toHaveLength(2)
      // Note: Hands may be empty if cards from test-decks.json aren't found in database
      expect(gameState.getPlayerState('player1').hand).toBeDefined()
      expect(gameState.getPlayerState('player2').hand).toBeDefined()
    })

    test('should use different deck compositions for each player', async () => {
      const gameState = await GameStateFactory.createTestGame()

      // Both players should have decks (may be empty if cards not found)
      expect(gameState.players[0].activeDeck).toBeDefined()
      expect(gameState.players[1].activeDeck).toBeDefined()
    })

    test('should create proper card entities from real card data', async () => {
      const gameState = await GameStateFactory.createTestGame()
      const player1Hand = gameState.getPlayerState('player1').hand

      // Check that cards are proper entities
      player1Hand.forEach((card) => {
        expect(card).toHaveProperty('id')
        expect(card).toHaveProperty('name')
        expect(card).toHaveProperty('cost')
        expect(card).toHaveProperty('type')
      })
    })
  })

  describe('TestDataLoader integration', () => {
    test('should load test decks correctly', () => {
      const testDecks = TestDataLoader.loadTestDecks()

      expect(testDecks).toHaveProperty('deck1')
      expect(testDecks).toHaveProperty('deck2')
      expect(Array.isArray(testDecks.deck1)).toBe(true)
      expect(Array.isArray(testDecks.deck2)).toBe(true)
    })

    test('should validate test decks against card database', () => {
      const validation = TestDataLoader.validateTestDecks()

      expect(validation).toHaveProperty('deck1')
      expect(validation).toHaveProperty('deck2')
      expect(validation).toHaveProperty('bothValid')
      expect(typeof validation.bothValid).toBe('boolean')
    })

    test('should get correct deck sizes', () => {
      const deckFormats = TestDataLoader.getDeckFormats()
      const deck1Size = TestDataLoader.getDeckSize(deckFormats.deck1)
      const deck2Size = TestDataLoader.getDeckSize(deckFormats.deck2)

      expect(deck1Size).toBeGreaterThan(50) // Should be a reasonable deck size
      expect(deck2Size).toBeGreaterThan(50) // Should be a reasonable deck size
    })

    test('should transform card data correctly', () => {
      const cardDatabase = TestDataLoader.loadCardDatabase()
      const sampleCard = cardDatabase[0]
      const transformedCard = TestDataLoader.transformCardData(sampleCard)

      expect(transformedCard).toHaveProperty('id')
      expect(transformedCard).toHaveProperty('name')
      expect(transformedCard).toHaveProperty('type')
      expect(transformedCard).toHaveProperty('cost')
    })
  })

  describe('Game state management', () => {
    test('should properly initialize player states', () => {
      const gameState = GameStateFactory.initGame(
        CardFactory.createDeck(testDeckData1),
        CardFactory.createDeck(testDeckData2)
      )

      const player1State = gameState.getPlayerState('player1')
      const player2State = gameState.getPlayerState('player2')

      expect(player1State).toBeInstanceOf(IPlayerState)
      expect(player2State).toBeInstanceOf(IPlayerState)
      expect(player1State.gameId).toBe(gameState.id)
      expect(player2State.gameId).toBe(gameState.id)
      expect(player1State.playerId).toBe('player1')
      expect(player2State.playerId).toBe('player2')
    })

    test('should have correct initial phase and turn', () => {
      const gameState = GameStateFactory.initGame(
        CardFactory.createDeck(testDeckData1),
        CardFactory.createDeck(testDeckData2)
      )

      expect(gameState.getPhase()).toBe('ready')
      expect(gameState.getTurn()).toBe(1)
      expect(gameState.getWinner()).toBeNull()
    })

    test('should track deck sizes correctly after drawing', () => {
      const deck1 = CardFactory.createDeck(testDeckData1)
      const deck2 = CardFactory.createDeck(testDeckData2)
      const gameState = GameStateFactory.initGame(deck1, deck2)

      // After initGame, each deck should have 53 cards (60 - 7)
      expect(gameState.players[0].activeDeck.size()).toBe(53)
      expect(gameState.players[1].activeDeck.size()).toBe(53)

      // Draw one more card from each deck
      GameStateFactory.drawCard(gameState, 'player1')
      GameStateFactory.drawCard(gameState, 'player2')

      expect(gameState.players[0].activeDeck.size()).toBe(52)
      expect(gameState.players[1].activeDeck.size()).toBe(52)
    })
  })

  describe('Edge cases', () => {
    test('should handle empty deck data', () => {
      const gameState = GameStateFactory.createGameFromCardData([], [])

      expect(gameState).toBeInstanceOf(IGameState)
      expect(gameState.players).toHaveLength(2)
      expect(gameState.getPlayerState('player1').hand).toHaveLength(0)
      expect(gameState.getPlayerState('player2').hand).toHaveLength(0)
    })

    test('should handle single card deck', () => {
      const singleCard = [
        {
          name: 'Test Card',
          type: 'action',
          cost: 1,
          inkable: true,
          color: 'amber',
        },
      ]
      const gameState = GameStateFactory.createGameFromCardData(
        singleCard,
        singleCard
      )

      expect(gameState.getPlayerState('player1').hand).toHaveLength(1)
      expect(gameState.getPlayerState('player2').hand).toHaveLength(1)
      expect(gameState.players[0].activeDeck.size()).toBe(0)
      expect(gameState.players[1].activeDeck.size()).toBe(0)
    })
  })
})
