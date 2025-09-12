// Tests for action execution and validation functions
import { describe, expect, test } from '@jest/globals'
import {
  canChallengeCard,
  canInkCard,
  canPlayCard,
  canQuestCard,
  canSingCard,
  challenge,
  executeAction,
  inkCard,
  playCard,
  quest,
} from '../actions/player.js'
import { createMockCard, createMockGameState, getPlayer } from './test-utils.js'

describe('Action Validation', () => {
  describe('canInkCard', () => {
    test('should allow inking inkable cards when player has not inked this turn', () => {
      const card = createMockCard({ inkable: true })
      const gameState = createMockGameState({
        players: [{ id: 'player1', hasInkedThisTurn: false }],
      })

      const canInk = canInkCard(card, gameState, 'player1')
      expect(canInk).toBe(true)
    })

    test('should not allow inking uninkable cards', () => {
      const card = createMockCard({ inkable: false })
      const gameState = createMockGameState({
        players: [{ id: 'player1', hasInkedThisTurn: false }],
      })

      const canInk = canInkCard(card, gameState, 'player1')
      expect(canInk).toBe(false)
    })

    test('should not allow inking when player has already inked this turn', () => {
      const card = createMockCard({ inkable: true })
      const gameState = createMockGameState({
        players: [{ id: 'player1', hasInkedThisTurn: true }],
      })

      const canInk = canInkCard(card, gameState, 'player1')
      expect(canInk).toBe(false)
    })
  })

  describe('canPlayCard', () => {
    test('should allow playing cards when cost is within available ink', () => {
      const card = createMockCard({ cost: 3 })
      const availableInk = 5

      const canPlay = canPlayCard(card, availableInk)
      expect(canPlay).toBe(true)
    })

    test('should not allow playing cards when cost exceeds available ink', () => {
      const card = createMockCard({ cost: 5 })
      const availableInk = 3

      const canPlay = canPlayCard(card, availableInk)
      expect(canPlay).toBe(false)
    })

    test('should allow playing free cards', () => {
      const card = createMockCard({ cost: 0 })
      const availableInk = 0

      const canPlay = canPlayCard(card, availableInk)
      expect(canPlay).toBe(true)
    })
  })

  describe('canQuestCard', () => {
    test('should allow questing ready, dry character cards', () => {
      const card = createMockCard({
        type: 'character',
        actionState: 'ready',
        playState: 'dry',
      })

      const canQuest = canQuestCard(card)
      expect(canQuest).toBe(true)
    })

    test('should not allow questing exerted cards', () => {
      const card = createMockCard({
        type: 'character',
        actionState: 'exerted',
        playState: 'dry',
      })

      const canQuest = canQuestCard(card)
      expect(canQuest).toBe(false)
    })

    test('should not allow questing drying cards', () => {
      const card = createMockCard({
        type: 'character',
        actionState: 'ready',
        playState: 'drying',
      })

      const canQuest = canQuestCard(card)
      expect(canQuest).toBe(false)
    })

    test('should not allow questing non-character cards', () => {
      const card = createMockCard({
        type: 'action',
        actionState: 'ready',
        playState: 'dry',
      })

      const canQuest = canQuestCard(card)
      expect(canQuest).toBe(false)
    })
  })

  describe('canChallengeCard', () => {
    test('should allow challenging with ready, dry character against exerted character', () => {
      const attacker = createMockCard({
        type: 'character',
        actionState: 'ready',
        playState: 'dry',
      })
      const target = createMockCard({
        type: 'character',
        actionState: 'exerted',
        playState: 'dry',
      })

      const canChallenge = canChallengeCard(attacker, target)
      expect(canChallenge).toBe(true)
    })

    test('should not allow challenging with exerted attacker', () => {
      const attacker = createMockCard({
        type: 'character',
        actionState: 'exerted',
        playState: 'dry',
      })
      const target = createMockCard({
        type: 'character',
        actionState: 'exerted',
        playState: 'dry',
      })

      const canChallenge = canChallengeCard(attacker, target)
      expect(canChallenge).toBe(false)
    })

    test('should not allow challenging ready target', () => {
      const attacker = createMockCard({
        type: 'character',
        actionState: 'ready',
        playState: 'dry',
      })
      const target = createMockCard({
        type: 'character',
        actionState: 'ready',
        playState: 'dry',
      })

      const canChallenge = canChallengeCard(attacker, target)
      expect(canChallenge).toBe(false)
    })
  })

  describe('canSingCard', () => {
    test('should allow singing with ready, dry character for song within cost', () => {
      const singer = createMockCard({
        type: 'character',
        actionState: 'ready',
        playState: 'dry',
        cost: 3,
      })
      const song = createMockCard({
        type: 'action - song',
        cost: 2,
      })

      const canSing = canSingCard(singer, song)
      expect(canSing).toBe(true)
    })

    test('should not allow singing with exerted singer', () => {
      const singer = createMockCard({
        type: 'character',
        actionState: 'exerted',
        playState: 'dry',
        cost: 3,
      })
      const song = createMockCard({
        type: 'action - song',
        cost: 2,
      })

      const canSing = canSingCard(singer, song)
      expect(canSing).toBe(false)
    })

    test('should not allow singing song that exceeds singer cost', () => {
      const singer = createMockCard({
        type: 'character',
        actionState: 'ready',
        playState: 'dry',
        cost: 2,
      })
      const song = createMockCard({
        type: 'action - song',
        cost: 3,
      })

      const canSing = canSingCard(singer, song)
      expect(canSing).toBe(false)
    })
  })
})

describe('Action Execution', () => {
  describe('inkCard', () => {
    test('should ink a valid card and move it to inkwell', () => {
      const card = createMockCard({
        name: 'Test Card',
        inkable: true,
        uniqueId: 'test-card-1',
      })
      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [card],
            inkwell: [],
            hasInkedThisTurn: false,
          },
        ],
      })

      inkCard(gameState, 'player1', 'test-card-1')

      const player = getPlayer(gameState, 'player1')
      expect(player.hand).toHaveLength(0)
      expect(player.inkwell).toHaveLength(1)
      expect(player.inkwell[0].name).toBe('Test Card')
      expect(player.hasInkedThisTurn).toBe(true)
    })

    test('should not ink uninkable cards', () => {
      const card = createMockCard({
        name: 'Test Card',
        inkable: false,
        uniqueId: 'test-card-1',
      })
      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [card],
            inkwell: [],
            hasInkedThisTurn: false,
          },
        ],
      })

      inkCard(gameState, 'player1', 'test-card-1')

      const player = getPlayer(gameState, 'player1')
      expect(player.hand).toHaveLength(1)
      expect(player.inkwell).toHaveLength(0)
      expect(player.hasInkedThisTurn).toBe(false)
    })

    test('should not ink when player has already inked this turn', () => {
      const card = createMockCard({
        name: 'Test Card',
        inkable: true,
        uniqueId: 'test-card-1',
      })
      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [card],
            inkwell: [],
            hasInkedThisTurn: true,
          },
        ],
      })

      inkCard(gameState, 'player1', 'test-card-1')

      const player = getPlayer(gameState, 'player1')
      expect(player.hand).toHaveLength(1)
      expect(player.inkwell).toHaveLength(0)
    })
  })

  describe('playCard', () => {
    test('should play a valid card and move it to board', () => {
      const card = createMockCard({
        name: 'Test Character',
        cost: 2,
        uniqueId: 'test-card-1',
      })
      const inkCard = createMockCard({
        name: 'Ink Card',
        isExerted: false,
      })
      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [card],
            board: [],
            inkwell: [inkCard, inkCard], // 2 available ink
          },
        ],
      })

      playCard(gameState, 'player1', 'test-card-1')

      const player = getPlayer(gameState, 'player1')
      expect(player.hand).toHaveLength(0)
      expect(player.board).toHaveLength(1)
      expect(player.board[0].name).toBe('Test Character')
      expect(player.board[0].actionState).toBe('ready')
      expect(player.board[0].playState).toBe('drying')
    })

    test('should exert ink equal to card cost', () => {
      const card = createMockCard({
        name: 'Test Character',
        cost: 3,
        uniqueId: 'test-card-1',
      })
      const inkCard1 = createMockCard({ name: 'Ink 1', isExerted: false })
      const inkCard2 = createMockCard({ name: 'Ink 2', isExerted: false })
      const inkCard3 = createMockCard({ name: 'Ink 3', isExerted: false })
      const inkCard4 = createMockCard({ name: 'Ink 4', isExerted: false })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [card],
            board: [],
            inkwell: [inkCard1, inkCard2, inkCard3, inkCard4],
          },
        ],
      })

      playCard(gameState, 'player1', 'test-card-1')

      const player = getPlayer(gameState, 'player1')
      const exertedInk = player.inkwell.filter((ink) => ink.isExerted)
      expect(exertedInk).toHaveLength(3)
    })

    test('should not play card if insufficient ink', () => {
      const card = createMockCard({
        name: 'Test Character',
        cost: 3,
        uniqueId: 'test-card-1',
      })
      const inkCard = createMockCard({ name: 'Ink Card', isExerted: false })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [card],
            board: [],
            inkwell: [inkCard], // Only 1 available ink
          },
        ],
      })

      playCard(gameState, 'player1', 'test-card-1')

      const player = getPlayer(gameState, 'player1')
      expect(player.hand).toHaveLength(1)
      expect(player.board).toHaveLength(0)
    })
  })

  describe('questCard', () => {
    test('should quest a valid character and gain lore', () => {
      const card = createMockCard({
        name: 'Test Character',
        type: 'character',
        actionState: 'ready',
        playState: 'dry',
        lore: 2,
        uniqueId: 'test-card-1',
      })
      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            board: [card],
            lore: 0,
          },
        ],
      })

      quest(gameState, 'player1', 'test-card-1')

      const player = getPlayer(gameState, 'player1')
      expect(player.lore).toBe(2)
      expect(player.board[0].actionState).toBe('exerted')
    })

    test('should not quest invalid characters', () => {
      const card = createMockCard({
        name: 'Test Character',
        type: 'character',
        actionState: 'exerted', // Already exerted
        playState: 'dry',
        lore: 2,
        uniqueId: 'test-card-1',
      })
      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            board: [card],
            lore: 0,
          },
        ],
      })

      quest(gameState, 'player1', 'test-card-1')

      const player = getPlayer(gameState, 'player1')
      expect(player.lore).toBe(0)
    })
  })

  describe('challengeCard', () => {
    test('should execute combat between valid characters', () => {
      const attacker = createMockCard({
        name: 'Attacker',
        type: 'character',
        actionState: 'ready',
        playState: 'dry',
        strength: 3,
        willpower: 2,
        uniqueId: 'attacker-1',
      })
      const target = createMockCard({
        name: 'Target',
        type: 'character',
        actionState: 'exerted',
        playState: 'dry',
        strength: 2,
        willpower: 3,
        uniqueId: 'target-1',
      })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            board: [attacker],
          },
          {
            id: 'player2',
            board: [target],
          },
        ],
      })

      challenge(gameState, 'player1', 'attacker-1', 'target-1')

      const player1 = getPlayer(gameState, 'player1')
      const player2 = getPlayer(gameState, 'player2')

      expect(player1.board[0].actionState).toBe('exerted')
      expect(player1.board[0].willpower).toBe(-1) // 2 - 3 = -1
      expect(player2.board[0].willpower).toBe(0) // 3 - 3 = 0
    })

    test('should remove defeated characters', () => {
      const attacker = createMockCard({
        name: 'Attacker',
        type: 'character',
        actionState: 'ready',
        playState: 'dry',
        strength: 5,
        willpower: 1,
        uniqueId: 'attacker-1',
      })
      const target = createMockCard({
        name: 'Target',
        type: 'character',
        actionState: 'exerted',
        playState: 'dry',
        strength: 2,
        willpower: 2,
        uniqueId: 'target-1',
      })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            board: [attacker],
          },
          {
            id: 'player2',
            board: [target],
          },
        ],
      })

      challenge(gameState, 'player1', 'attacker-1', 'target-1')

      const player1 = getPlayer(gameState, 'player1')
      const player2 = getPlayer(gameState, 'player2')

      expect(player1.board).toHaveLength(0) // Attacker defeated
      expect(player2.board).toHaveLength(0) // Target defeated
    })
  })

  describe('executeAction', () => {
    test('should execute ink action', () => {
      const card = createMockCard({
        name: 'Test Card',
        inkable: true,
        uniqueId: 'test-card-1',
      })
      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [card],
            inkwell: [],
            hasInkedThisTurn: false,
          },
        ],
      })

      const action = { type: 'ink', playerId: 'player1', cardId: 'test-card-1' }
      executeAction(gameState, action)

      const player = getPlayer(gameState, 'player1')
      expect(player.hand).toHaveLength(0)
      expect(player.inkwell).toHaveLength(1)
    })

    test('should execute play action', () => {
      const card = createMockCard({
        name: 'Test Character',
        cost: 1,
        uniqueId: 'test-card-1',
      })
      const inkCard = createMockCard({ name: 'Ink Card', isExerted: false })

      const gameState = createMockGameState({
        players: [
          {
            id: 'player1',
            hand: [card],
            board: [],
            inkwell: [inkCard],
          },
        ],
      })

      const action = {
        type: 'play',
        playerId: 'player1',
        cardId: 'test-card-1',
      }
      executeAction(gameState, action)

      const player = getPlayer(gameState, 'player1')
      expect(player.hand).toHaveLength(0)
      expect(player.board).toHaveLength(1)
    })

    test('should handle unknown action types gracefully', () => {
      const gameState = createMockGameState()
      const action = { type: 'unknown', playerId: 'player1' }

      const result = executeAction(gameState, action)
      expect(result).toBe(gameState) // Should return unchanged state
    })
  })
})

