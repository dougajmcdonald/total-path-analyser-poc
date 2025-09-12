// Tests for game state management functions
import { beforeEach, describe, expect, test } from '@jest/globals'
import {
  checkGameOver,
  createGameState,
  drawCard,
  executeTurn,
  getAvailableInk,
  getCurrentPlayer,
  initGame,
  ready,
  switchPlayer
} from '../game-state.js'
import {
  createMockCard,
  createMockGameState,
  createValidDeck,
  getTestDecks
} from './test-utils.js'

describe('Game State Management', () => {
  describe('createGameState', () => {
    test('should create a valid game state with two players', () => {
      const deck1 = [createMockCard({ name: 'Card 1' })]
      const deck2 = [createMockCard({ name: 'Card 2' })]
      
      const gameState = createGameState(deck1, deck2)
      
      expect(gameState.players).toHaveLength(2)
      expect(gameState.players[0].id).toBe('player1')
      expect(gameState.players[1].id).toBe('player2')
      expect(gameState.players[0].deck).toEqual(deck1)
      expect(gameState.players[1].deck).toEqual(deck2)
      expect(gameState.currentPlayer).toBe(0)
      expect(gameState.turn).toBe(1)
      expect(gameState.winner).toBeNull()
    })

    test('should create independent deck copies', () => {
      const deck1 = [createMockCard({ name: 'Card 1' })]
      const deck2 = [createMockCard({ name: 'Card 2' })]
      
      const gameState = createGameState(deck1, deck2)
      
      // Modify original deck
      deck1.push(createMockCard({ name: 'Card 3' }))
      
      // Game state deck should be unchanged
      expect(gameState.players[0].deck).toHaveLength(1)
      expect(gameState.players[0].deck[0].name).toBe('Card 1')
    })
  })

  describe('initGame', () => {
    test('should initialize game with 7 cards in each hand', () => {
      const { deck1, deck2 } = getTestDecks()
      const gameState = initGame(deck1, deck2)
      
      expect(gameState.players[0].hand).toHaveLength(7)
      expect(gameState.players[1].hand).toHaveLength(7)
    })

    test('should reduce deck size by 7 cards for each player', () => {
      const deck1 = createValidDeck(['Tinker Bell - Giant Fairy'])
      const deck2 = createValidDeck(['Hades - Infernal Schemer'])
      
      const gameState = initGame(deck1, deck2)
      
      expect(gameState.players[0].deck).toHaveLength(53) // 60 - 7
      expect(gameState.players[1].deck).toHaveLength(53) // 60 - 7
    })

    test('should set onThePlay and onTheDraw correctly', () => {
      const { deck1, deck2 } = getTestDecks()
      const gameState = initGame(deck1, deck2)
      
      expect(gameState.onThePlay).toBeDefined()
      expect(gameState.onTheDraw).toBeDefined()
      expect(gameState.onThePlay).not.toBe(gameState.onTheDraw)
    })

    test('should not draw cards if deck is empty', () => {
      const gameState = createGameState([], [])
      const initializedState = initGame([], [])
      
      expect(initializedState.players[0].hand).toHaveLength(0)
      expect(initializedState.players[1].hand).toHaveLength(0)
    })
  })

  describe('drawCard', () => {
    let gameState

    beforeEach(() => {
      const deck1 = [createMockCard({ name: 'Card 1' }), createMockCard({ name: 'Card 2' })]
      const deck2 = [createMockCard({ name: 'Card 3' })]
      gameState = createGameState(deck1, deck2)
    })

    test('should draw a card from deck to hand', () => {
      const initialDeckSize = gameState.players[0].deck.length
      const initialHandSize = gameState.players[0].hand.length
      
      drawCard(gameState, 'player1')
      
      expect(gameState.players[0].deck).toHaveLength(initialDeckSize - 1)
      expect(gameState.players[0].hand).toHaveLength(initialHandSize + 1)
    })

    test('should not draw if deck is empty', () => {
      gameState.players[0].deck = []
      const initialHandSize = gameState.players[0].hand.length
      
      drawCard(gameState, 'player1')
      
      expect(gameState.players[0].hand).toHaveLength(initialHandSize)
    })

    test('should not draw if player does not exist', () => {
      const initialHandSize = gameState.players[0].hand.length
      
      drawCard(gameState, 'nonexistent')
      
      expect(gameState.players[0].hand).toHaveLength(initialHandSize)
    })
  })

  describe('getAvailableInk', () => {
    test('should return count of unexerted ink', () => {
      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            inkwell: [
              { isExerted: false },
              { isExerted: true },
              { isExerted: false }
            ]
          }
        ]
      })
      
      const availableInk = getAvailableInk(gameState, 'player1')
      expect(availableInk).toBe(2)
    })

    test('should return 0 if player has no ink', () => {
      const gameState = createMockGameState()
      const availableInk = getAvailableInk(gameState, 'player1')
      expect(availableInk).toBe(0)
    })
  })

  describe('ready', () => {
    test('should ready all exerted ink and cards', () => {
      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            inkwell: [
              { isExerted: true },
              { isExerted: false }
            ],
            board: [
              { actionState: 'exerted', playState: 'drying' },
              { actionState: 'ready', playState: 'dry' }
            ],
            hasInkedThisTurn: true
          }
        ]
      })
      
      ready(gameState, 'player1')
      
      expect(gameState.players[0].inkwell[0].isExerted).toBe(false)
      expect(gameState.players[0].inkwell[1].isExerted).toBe(false)
      expect(gameState.players[0].board[0].actionState).toBe('ready')
      expect(gameState.players[0].board[0].playState).toBe('dry')
      expect(gameState.players[0].hasInkedThisTurn).toBe(false)
    })
  })

  describe('checkGameOver', () => {
    test('should return true when a player has 20+ lore', () => {
      const gameState = createMockGameState({
        players: [
          { id: 'player1', lore: 20 },
          { id: 'player2', lore: 10 }
        ]
      })
      
      const isGameOver = checkGameOver(gameState)
      
      expect(isGameOver).toBe(true)
      expect(gameState.winner).toBe('player1')
    })

    test('should return false when no player has 20+ lore', () => {
      const gameState = createMockGameState({
        players: [
          { id: 'player1', lore: 15 },
          { id: 'player2', lore: 10 }
        ]
      })
      
      const isGameOver = checkGameOver(gameState)
      
      expect(isGameOver).toBe(false)
      expect(gameState.winner).toBeNull()
    })
  })

  describe('getCurrentPlayer', () => {
    test('should return the current player', () => {
      const gameState = createMockGameState({ currentPlayer: 1 })
      const currentPlayer = getCurrentPlayer(gameState)
      
      expect(currentPlayer.id).toBe('player2')
    })
  })

  describe('switchPlayer', () => {
    test('should switch to next player', () => {
      const gameState = createMockGameState({ currentPlayer: 0, turn: 1 })
      switchPlayer(gameState)
      
      expect(gameState.currentPlayer).toBe(1)
      expect(gameState.turn).toBe(1)
    })

    test('should increment turn when switching back to player 1', () => {
      const gameState = createMockGameState({ currentPlayer: 1, turn: 1 })
      switchPlayer(gameState)
      
      expect(gameState.currentPlayer).toBe(0)
      expect(gameState.turn).toBe(2)
    })
  })

  describe('executeTurn', () => {
    test('should execute a complete turn with draw and actions', () => {
      const deck1 = createValidDeck(['Tinker Bell - Giant Fairy'])
      const deck2 = createValidDeck(['Hades - Infernal Schemer'])
      const gameState = initGame(deck1, deck2)
      
      const initialHandSize = gameState.players[0].hand.length
      const actions = []
      
      executeTurn(gameState, 'player1', actions)
      
      // Should have drawn a card (unless first turn on the play)
      const expectedHandSize = gameState.onThePlay === 'player1' && gameState.turn === 1 
        ? initialHandSize 
        : initialHandSize + 1
      
      expect(gameState.players[0].hand.length).toBe(expectedHandSize)
    })

    test('should not draw on first turn if player is on the play', () => {
      const deck1 = createValidDeck(['Tinker Bell - Giant Fairy'])
      const deck2 = createValidDeck(['Hades - Infernal Schemer'])
      const gameState = initGame(deck1, deck2)
      
      // Force player1 to be on the play
      gameState.onThePlay = 'player1'
      gameState.turn = 1
      
      const initialHandSize = gameState.players[0].hand.length
      executeTurn(gameState, 'player1', [])
      
      expect(gameState.players[0].hand.length).toBe(initialHandSize)
    })
  })
})

