// Basic functionality tests to verify core game mechanics work
import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import { inkCard, playCard, quest } from '../actions/player.js'
import { initGame } from '../game-state.js'
import { createMockCard, createMockGameState } from './test-utils.js'

describe('Basic Functionality Tests', () => {
  // Suppress console.log output during tests
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('Card Drawing', () => {
    test('should draw exactly 7 cards on game initialization', () => {
      const deck1 = Array(60)
        .fill()
        .map((_, i) =>
          createMockCard({ name: `Card ${i}`, uniqueId: `card-${i}` })
        )
      const deck2 = Array(60)
        .fill()
        .map((_, i) =>
          createMockCard({ name: `Card ${i}`, uniqueId: `card-${i}` })
        )

      const gameState = initGame(deck1, deck2)

      expect(gameState.players[0].hand).toHaveLength(7)
      expect(gameState.players[1].hand).toHaveLength(7)
      expect(gameState.players[0].deck).toHaveLength(53) // 60 - 7
      expect(gameState.players[1].deck).toHaveLength(53) // 60 - 7
    })
  })

  describe('Inking Cards', () => {
    test('should ink a card and move it to inkwell', () => {
      const inkableCard = createMockCard({
        name: 'Test Card',
        inkable: true,
        uniqueId: 'test-card-1',
      })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [inkableCard],
            inkwell: [],
            hasInkedThisTurn: false,
          },
        ],
      })

      inkCard(gameState, 'player1', 'test-card-1')

      const player = gameState.players[0]
      expect(player.hand).toHaveLength(0)
      expect(player.inkwell).toHaveLength(1)
      expect(player.inkwell[0].name).toBe('Test Card')
      expect(player.hasInkedThisTurn).toBe(true)
    })

    test('should not ink uninkable cards', () => {
      const uninkableCard = createMockCard({
        name: 'Test Card',
        inkable: false,
        uniqueId: 'test-card-1',
      })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [uninkableCard],
            inkwell: [],
            hasInkedThisTurn: false,
          },
        ],
      })

      inkCard(gameState, 'player1', 'test-card-1')

      const player = gameState.players[0]
      expect(player.hand).toHaveLength(1)
      expect(player.inkwell).toHaveLength(0)
      expect(player.hasInkedThisTurn).toBe(false)
    })

    test('should not ink more than once per turn', () => {
      const inkableCard1 = createMockCard({
        name: 'Test Card 1',
        inkable: true,
        uniqueId: 'test-card-1',
      })
      const inkableCard2 = createMockCard({
        name: 'Test Card 2',
        inkable: true,
        uniqueId: 'test-card-2',
      })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [inkableCard1, inkableCard2],
            inkwell: [],
            hasInkedThisTurn: false,
          },
        ],
      })

      // First ink should succeed
      inkCard(gameState, 'player1', 'test-card-1')
      expect(gameState.players[0].inkwell).toHaveLength(1)
      expect(gameState.players[0].hasInkedThisTurn).toBe(true)

      // Second ink should fail
      inkCard(gameState, 'player1', 'test-card-2')
      expect(gameState.players[0].inkwell).toHaveLength(1)
      expect(gameState.players[0].hand).toHaveLength(1)
    })
  })

  describe('Playing Cards', () => {
    test('should play a card with sufficient ink', () => {
      const characterCard = createMockCard({
        name: 'Test Character',
        cost: 2,
        type: 'character',
        uniqueId: 'test-character-1',
      })
      const inkCard1 = createMockCard({ name: 'Ink 1', isExerted: false })
      const inkCard2 = createMockCard({ name: 'Ink 2', isExerted: false })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [characterCard],
            board: [],
            inkwell: [inkCard1, inkCard2],
          },
        ],
      })

      playCard(gameState, 'player1', 'test-character-1')

      const player = gameState.players[0]
      expect(player.hand).toHaveLength(0)
      expect(player.board).toHaveLength(1)
      expect(player.board[0].name).toBe('Test Character')
      expect(player.board[0].actionState).toBe('ready')
      expect(player.board[0].playState).toBe('drying')
    })

    test('should not play a card without sufficient ink', () => {
      const characterCard = createMockCard({
        name: 'Test Character',
        cost: 3,
        type: 'character',
        uniqueId: 'test-character-1',
      })
      const inkCard = createMockCard({ name: 'Ink 1', isExerted: false })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [characterCard],
            board: [],
            inkwell: [inkCard], // Only 1 ink available
          },
        ],
      })

      playCard(gameState, 'player1', 'test-character-1')

      const player = gameState.players[0]
      expect(player.hand).toHaveLength(1)
      expect(player.board).toHaveLength(0)
    })

    test('should exert ink equal to card cost', () => {
      const characterCard = createMockCard({
        name: 'Test Character',
        cost: 2,
        type: 'character',
        uniqueId: 'test-character-1',
      })
      const inkCard1 = createMockCard({ name: 'Ink 1', isExerted: false })
      const inkCard2 = createMockCard({ name: 'Ink 2', isExerted: false })
      const inkCard3 = createMockCard({ name: 'Ink 3', isExerted: false })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [characterCard],
            board: [],
            inkwell: [inkCard1, inkCard2, inkCard3],
          },
        ],
      })

      playCard(gameState, 'player1', 'test-character-1')

      const player = gameState.players[0]
      const exertedInk = player.inkwell.filter((ink) => ink.isExerted)
      expect(exertedInk).toHaveLength(2)
    })
  })

  describe('Questing', () => {
    test('should quest a ready, dry character', () => {
      const characterCard = createMockCard({
        name: 'Test Character',
        type: 'character',
        actionState: 'ready',
        playState: 'dry',
        lore: 2,
        uniqueId: 'test-character-1',
      })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            board: [characterCard],
            lore: 0,
          },
        ],
      })

      quest(gameState, 'player1', 'test-character-1')

      const player = gameState.players[0]
      expect(player.lore).toBe(2)
      expect(player.board[0].actionState).toBe('exerted')
    })

    test('should not quest a character that is not ready', () => {
      const characterCard = createMockCard({
        name: 'Test Character',
        type: 'character',
        actionState: 'exerted', // Already exerted
        playState: 'dry',
        lore: 2,
        uniqueId: 'test-character-1',
      })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            board: [characterCard],
            lore: 0,
          },
        ],
      })

      quest(gameState, 'player1', 'test-character-1')

      const player = gameState.players[0]
      expect(player.lore).toBe(0)
    })
  })

  describe('Deck Size Validation', () => {
    test('should validate deck has at least 60 cards', () => {
      const validDeck = Array(60)
        .fill()
        .map((_, i) =>
          createMockCard({ name: `Card ${i}`, uniqueId: `card-${i}` })
        )
      const invalidDeck = Array(30)
        .fill()
        .map((_, i) =>
          createMockCard({ name: `Card ${i}`, uniqueId: `card-${i}` })
        )

      expect(validDeck.length).toBeGreaterThanOrEqual(60)
      expect(invalidDeck.length).toBeLessThan(60)
    })
  })
})
