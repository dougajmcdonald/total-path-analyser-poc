// Integration tests for complete game flows
import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import { executeAction } from '../actions/player.js'
import {
  checkGameOver,
  executeTurn,
  initGame,
  switchPlayer,
} from '../game-state.js'
import { createMinimalDeck, createValidDeck, getPlayer } from './test-utils.js'

describe('Game Integration Tests', () => {
  // Suppress console.log output during tests
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('Complete Turn Flow', () => {
    test('should execute a complete turn with ink, play, and quest', () => {
      const deck1 = createValidDeck([
        'Roger Radcliff - Dog Lover',
        'Hades - Infernal Schemer',
      ])
      const deck2 = createValidDeck([
        'Elsa - The Fifth Spirit',
        'Develop Your Brain',
      ])

      const gameState = initGame(deck1, deck2)
      const player1 = getPlayer(gameState, 'player1')

      // Find inkable card in hand
      const inkableCard = player1.hand.find((card) => card.inkable === true)
      expect(inkableCard).toBeDefined()

      // Find playable character card (cost 1)
      const characterCard = player1.hand.find(
        (card) => card.type === 'character' && card.cost === 1
      )
      expect(characterCard).toBeDefined()

      // Execute turn with ink and play actions
      const actions = [
        { type: 'ink', playerId: 'player1', cardId: inkableCard.uniqueId },
        { type: 'play', playerId: 'player1', cardId: characterCard.uniqueId },
      ]

      executeTurn(gameState, 'player1', actions)

      // Verify ink action
      expect(player1.inkwell).toHaveLength(1)
      expect(player1.hasInkedThisTurn).toBe(true)

      // Verify play action
      expect(player1.board).toHaveLength(1)
      expect(player1.board[0].name).toBe(characterCard.name)
    })

    test('should handle questing after playing a character', () => {
      const deck1 = createValidDeck(['Roger Radcliff - Dog Lover'])
      const deck2 = createValidDeck(['Elsa - The Fifth Spirit'])

      const gameState = initGame(deck1, deck2)
      const player1 = getPlayer(gameState, 'player1')

      // Find and ink a card
      const inkableCard = player1.hand.find((card) => card.inkable === true)
      const characterCard = player1.hand.find(
        (card) => card.type === 'character' && card.cost === 1
      )

      const actions = [
        { type: 'ink', playerId: 'player1', cardId: inkableCard.uniqueId },
        { type: 'play', playerId: 'player1', cardId: characterCard.uniqueId },
      ]

      executeTurn(gameState, 'player1', actions)

      // Character should be in drying state, not ready to quest
      expect(player1.board[0].playState).toBe('drying')

      // Ready the character for next turn
      player1.board[0].playState = 'dry'
      player1.board[0].actionState = 'ready'

      // Now should be able to quest
      const questAction = {
        type: 'quest',
        playerId: 'player1',
        cardId: player1.board[0].uniqueId,
      }
      executeAction(gameState, questAction)

      expect(player1.board[0].actionState).toBe('exerted')
      expect(player1.lore).toBeGreaterThan(0)
    })
  })

  describe('Multi-Turn Game Flow', () => {
    test('should progress through multiple turns correctly', () => {
      const deck1 = createValidDeck(['Roger Radcliff - Dog Lover'])
      const deck2 = createValidDeck(['Elsa - The Fifth Spirit'])

      const gameState = initGame(deck1, deck2)

      // Player 1 turn
      const player1 = getPlayer(gameState, 'player1')
      const inkableCard1 = player1.hand.find((card) => card.inkable === true)
      executeTurn(gameState, 'player1', [
        { type: 'ink', playerId: 'player1', cardId: inkableCard1.uniqueId },
      ])

      expect(gameState.turn).toBe(1)
      expect(player1.hasInkedThisTurn).toBe(true)

      // Switch to player 2
      switchPlayer(gameState)
      const player2 = getPlayer(gameState, 'player2')

      expect(gameState.currentPlayer).toBe(1)
      expect(gameState.turn).toBe(1)
      expect(player2.hasInkedThisTurn).toBe(false) // Reset for new turn

      // Player 2 turn
      const inkableCard2 = player2.hand.find((card) => card.inkable === true)
      executeTurn(gameState, 'player2', [
        { type: 'ink', playerId: 'player2', cardId: inkableCard2.uniqueId },
      ])

      // Switch back to player 1 (turn 2)
      switchPlayer(gameState)

      expect(gameState.currentPlayer).toBe(0)
      expect(gameState.turn).toBe(2)
      expect(player1.hasInkedThisTurn).toBe(false) // Reset for new turn
    })

    test('should handle deck depletion gracefully', () => {
      const deck1 = createMinimalDeck(['Roger Radcliff - Dog Lover'], 10) // Only 10 cards
      const deck2 = createMinimalDeck(['Elsa - The Fifth Spirit'], 10)

      const gameState = initGame(deck1, deck2)

      // Draw cards until deck is empty
      const player1 = getPlayer(gameState, 'player1')
      const initialHandSize = player1.hand.length
      const initialDeckSize = player1.deck.length

      // Draw remaining cards
      for (let i = 0; i < initialDeckSize; i++) {
        executeTurn(gameState, 'player1', [])
      }

      // Should have drawn all available cards
      expect(player1.hand.length).toBe(initialHandSize + initialDeckSize)
      expect(player1.deck.length).toBe(0)

      // Further draws should not add cards
      const handSizeBefore = player1.hand.length
      executeTurn(gameState, 'player1', [])
      expect(player1.hand.length).toBe(handSizeBefore)
    })
  })

  describe('Game End Conditions', () => {
    test('should detect game over when player reaches 20 lore', () => {
      const deck1 = createValidDeck(['Roger Radcliff - Dog Lover'])
      const deck2 = createValidDeck(['Elsa - The Fifth Spirit'])

      const gameState = initGame(deck1, deck2)
      const player1 = getPlayer(gameState, 'player1')

      // Set player1 lore to 20
      player1.lore = 20

      const isGameOver = checkGameOver(gameState)

      expect(isGameOver).toBe(true)
      expect(gameState.winner).toBe('player1')
    })

    test('should not detect game over when no player has 20 lore', () => {
      const deck1 = createValidDeck(['Roger Radcliff - Dog Lover'])
      const deck2 = createValidDeck(['Elsa - The Fifth Spirit'])

      const gameState = initGame(deck1, deck2)
      const player1 = getPlayer(gameState, 'player1')
      const player2 = getPlayer(gameState, 'player2')

      player1.lore = 15
      player2.lore = 10

      const isGameOver = checkGameOver(gameState)

      expect(isGameOver).toBe(false)
      expect(gameState.winner).toBeNull()
    })
  })

  describe('Action Validation Integration', () => {
    test('should prevent invalid actions from executing', () => {
      const deck1 = createValidDeck([
        'Roger Radcliff - Dog Lover',
        'Hades - Infernal Schemer',
      ])
      const deck2 = createValidDeck(['Elsa - The Fifth Spirit'])

      const gameState = initGame(deck1, deck2)
      const player1 = getPlayer(gameState, 'player1')

      // Try to ink twice in one turn
      const inkableCards = player1.hand.filter((card) => card.inkable === true)
      expect(inkableCards.length).toBeGreaterThanOrEqual(2)

      const actions = [
        { type: 'ink', playerId: 'player1', cardId: inkableCards[0].uniqueId },
        { type: 'ink', playerId: 'player1', cardId: inkableCards[1].uniqueId }, // Should fail
      ]

      executeTurn(gameState, 'player1', actions)

      // Only first ink should succeed
      expect(player1.inkwell).toHaveLength(1)
      expect(player1.hasInkedThisTurn).toBe(true)
    })

    test('should prevent playing cards without sufficient ink', () => {
      const deck1 = createValidDeck(['Hades - Infernal Schemer']) // Cost 7
      const deck2 = createValidDeck(['Elsa - The Fifth Spirit'])

      const gameState = initGame(deck1, deck2)
      const player1 = getPlayer(gameState, 'player1')

      // Try to play expensive card without ink
      const expensiveCard = player1.hand.find((card) => card.cost === 7)
      expect(expensiveCard).toBeDefined()

      const actions = [
        { type: 'play', playerId: 'player1', cardId: expensiveCard.uniqueId },
      ]

      executeTurn(gameState, 'player1', actions)

      // Card should still be in hand
      expect(player1.hand).toContain(expensiveCard)
      expect(player1.board).toHaveLength(0)
    })
  })

  describe('Card State Transitions', () => {
    test('should handle card state transitions correctly through turns', () => {
      const deck1 = createValidDeck(['Roger Radcliff - Dog Lover'])
      const deck2 = createValidDeck(['Elsa - The Fifth Spirit'])

      const gameState = initGame(deck1, deck2)
      const player1 = getPlayer(gameState, 'player1')

      // Play a character
      const characterCard = player1.hand.find(
        (card) => card.type === 'character'
      )
      const inkCard = player1.hand.find((card) => card.inkable === true)

      executeTurn(gameState, 'player1', [
        { type: 'ink', playerId: 'player1', cardId: inkCard.uniqueId },
        { type: 'play', playerId: 'player1', cardId: characterCard.uniqueId },
      ])

      // Character should be in drying state
      expect(player1.board[0].playState).toBe('drying')
      expect(player1.board[0].actionState).toBe('ready')

      // Switch turns to make character dry
      switchPlayer(gameState)
      switchPlayer(gameState)

      // Character should now be dry and ready to quest
      expect(player1.board[0].playState).toBe('dry')
      expect(player1.board[0].actionState).toBe('ready')

      // Quest the character
      executeAction(gameState, {
        type: 'quest',
        playerId: 'player1',
        cardId: player1.board[0].uniqueId,
      })

      // Character should be exerted
      expect(player1.board[0].actionState).toBe('exerted')
    })
  })
})
