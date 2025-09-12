// Card Actions tests for ink action validation

import { InkAction } from '../actions/InkAction.js'
import { PlayAction } from '../actions/PlayAction.js'
import { CardFactory } from '../utils/CardFactory.js'
import { GameStateFactory } from '../utils/GameStateFactory.js'
import { CardActionValidator } from '../validation/CardActionValidator.js'

describe('Card Actions - Ink Action', () => {
  let gameState
  let player1State
  let validator

  beforeEach(() => {
    // Create empty decks for testing
    const emptyDeck1 = CardFactory.createDeck([])
    const emptyDeck2 = CardFactory.createDeck([])

    // Create a fresh game state for each test
    gameState = GameStateFactory.createGameState(emptyDeck1, emptyDeck2)
    gameState.initializeGame()
    player1State = gameState.getPlayerState('player1')
    validator = new CardActionValidator()
  })

  describe('Ink Action Validation', () => {
    test('should validate ink action as valid when player has inkable card in hand', () => {
      // Create an inkable card
      const inkableCard = CardFactory.createCard({
        id: 'test-inkable-1',
        name: 'Test Inkable Card',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
      })

      // Add only this card to player's hand
      player1State.hand = [inkableCard]

      // Create ink action
      const inkAction = new InkAction('player1', inkableCard.id, 0)

      // Validate the action
      const isValid = validator.validateInkAction(gameState, inkAction)

      expect(isValid).toBe(true)
    })

    test('should validate ink action as invalid when player has no inkable cards in hand', () => {
      // Create an uninkable card
      const uninkableCard = CardFactory.createCard({
        id: 'test-uninkable-1',
        name: 'Test Uninkable Card',
        type: 'character',
        cost: 2,
        inkable: false,
        color: 'amber',
        strength: 2,
        willpower: 3,
      })

      // Add only this card to player's hand
      player1State.hand = [uninkableCard]

      // Create ink action for the uninkable card
      const inkAction = new InkAction('player1', uninkableCard.id, 0)

      // Validate the action
      const isValid = validator.validateInkAction(gameState, inkAction)

      expect(isValid).toBe(false)
    })

    test('should validate ink action as invalid when card is not in player hand', () => {
      // Create an inkable card but don't add it to hand
      const inkableCard = CardFactory.createCard({
        id: 'test-inkable-2',
        name: 'Test Inkable Card',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
      })

      // Keep hand empty
      player1State.hand = []

      // Create ink action for card not in hand
      const inkAction = new InkAction('player1', inkableCard.id, 0)

      // Validate the action
      const isValid = validator.validateInkAction(gameState, inkAction)

      expect(isValid).toBe(false)
    })

    test('should validate ink action as invalid when player has already inked this turn', () => {
      // Create an inkable card
      const inkableCard = CardFactory.createCard({
        id: 'test-inkable-3',
        name: 'Test Inkable Card',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
      })

      // Add card to hand
      player1State.hand = [inkableCard]

      // Mark player as having already inked this turn
      player1State.hasInkedThisTurn = true

      // Create ink action
      const inkAction = new InkAction('player1', inkableCard.id, 0)

      // Validate the action
      const isValid = validator.validateInkAction(gameState, inkAction)

      expect(isValid).toBe(false)
    })

    test('should validate ink action as valid when player has not inked this turn', () => {
      // Create an inkable card
      const inkableCard = CardFactory.createCard({
        id: 'test-inkable-4',
        name: 'Test Inkable Card',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
      })

      // Add card to hand
      player1State.hand = [inkableCard]

      // Ensure player has not inked this turn
      player1State.hasInkedThisTurn = false

      // Create ink action
      const inkAction = new InkAction('player1', inkableCard.id, 0)

      // Validate the action
      const isValid = validator.validateInkAction(gameState, inkAction)

      expect(isValid).toBe(true)
    })

    test('should validate ink action with mixed hand (inkable and uninkable cards)', () => {
      // Create both inkable and uninkable cards
      const inkableCard = CardFactory.createCard({
        id: 'test-inkable-5',
        name: 'Test Inkable Card',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
      })

      const uninkableCard = CardFactory.createCard({
        id: 'test-uninkable-2',
        name: 'Test Uninkable Card',
        type: 'character',
        cost: 3,
        inkable: false,
        color: 'steel',
        strength: 3,
        willpower: 4,
      })

      // Add both cards to hand
      player1State.hand = [inkableCard, uninkableCard]

      // Test ink action on inkable card
      const inkActionInkable = new InkAction('player1', inkableCard.id, 0)
      const isValidInkable = validator.validateInkAction(
        gameState,
        inkActionInkable
      )
      expect(isValidInkable).toBe(true)

      // Test ink action on uninkable card
      const inkActionUninkable = new InkAction('player1', uninkableCard.id, 0)
      const isValidUninkable = validator.validateInkAction(
        gameState,
        inkActionUninkable
      )
      expect(isValidUninkable).toBe(false)
    })
  })

  describe('Ink Action Execution', () => {
    test('should execute ink action successfully', () => {
      // Create an inkable card
      const inkableCard = CardFactory.createCard({
        id: 'test-inkable-6',
        name: 'Test Inkable Card',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
      })

      // Add card to hand
      player1State.hand = [inkableCard]

      // Create and execute ink action
      const inkAction = new InkAction('player1', inkableCard.id, 0)
      const result = inkAction.perform({
        gameState,
        playerId: 'player1',
        cardId: inkableCard.id,
        cost: 0,
      })

      // Check that card was removed from hand
      expect(player1State.hand).toHaveLength(0)
      expect(
        player1State.hand.find((card) => card.id === inkableCard.id)
      ).toBeUndefined()

      // Check that card was added to inkwell
      expect(player1State.inkwell).toHaveLength(1)
      expect(player1State.inkwell[0].card.id).toBe(inkableCard.id)

      // Check that player has inked this turn
      expect(player1State.hasInkedThisTurn).toBe(true)

      expect(result).toBe(true)
    })

    test('should not execute ink action when validation fails', () => {
      // Create an uninkable card
      const uninkableCard = CardFactory.createCard({
        id: 'test-uninkable-3',
        name: 'Test Uninkable Card',
        type: 'character',
        cost: 2,
        inkable: false,
        color: 'amber',
        strength: 2,
        willpower: 3,
      })

      // Add card to hand
      player1State.hand = [uninkableCard]

      // Create ink action (should fail validation)
      const inkAction = new InkAction('player1', uninkableCard.id, 0)
      const result = inkAction.perform({
        gameState,
        playerId: 'player1',
        cardId: uninkableCard.id,
        cost: 0,
      })

      // Check that card remained in hand
      expect(player1State.hand).toHaveLength(1)
      expect(player1State.hand[0].id).toBe(uninkableCard.id)

      // Check that card was not added to inkwell
      expect(player1State.inkwell).toHaveLength(0)

      // Check that player has not inked this turn
      expect(player1State.hasInkedThisTurn).toBe(false)

      expect(result).toBe(false)
    })
  })
})

describe('Card Actions - Play Action', () => {
  let gameState
  let player1State
  let validator

  beforeEach(() => {
    // Create empty decks for testing
    const emptyDeck1 = CardFactory.createDeck([])
    const emptyDeck2 = CardFactory.createDeck([])

    // Create a fresh game state for each test
    gameState = GameStateFactory.createGameState(emptyDeck1, emptyDeck2)
    gameState.initializeGame()
    player1State = gameState.getPlayerState('player1')
    validator = new CardActionValidator()
  })

  describe('Play Action Validation', () => {
    test('should validate play action as valid when player has enough ink', () => {
      // Create a card with cost 2
      const playableCard = CardFactory.createCard({
        id: 'test-playable-1',
        name: 'Test Playable Card',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
      })

      // Add card to hand
      player1State.hand = [playableCard]

      // Add 3 ink to inkwell (more than card cost)
      const inkCard1 = CardFactory.createCard({
        id: 'ink-1',
        name: 'Ink Card 1',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })
      const inkCard2 = CardFactory.createCard({
        id: 'ink-2',
        name: 'Ink Card 2',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })
      const inkCard3 = CardFactory.createCard({
        id: 'ink-3',
        name: 'Ink Card 3',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })

      // Add ink cards to inkwell
      player1State.inkwell = [
        { card: inkCard1, dry: true, exerted: false },
        { card: inkCard2, dry: true, exerted: false },
        { card: inkCard3, dry: true, exerted: false },
      ]

      // Create play action
      const playAction = new PlayAction('player1', playableCard.id, 2)

      // Validate the action
      const isValid = validator.validatePlayAction(gameState, playAction)

      expect(isValid).toBe(true)
    })

    test('should validate play action as invalid when player has insufficient ink', () => {
      // Create a card with cost 3
      const expensiveCard = CardFactory.createCard({
        id: 'test-expensive-1',
        name: 'Test Expensive Card',
        type: 'character',
        cost: 3,
        inkable: true,
        color: 'amber',
        strength: 3,
        willpower: 4,
      })

      // Add card to hand
      player1State.hand = [expensiveCard]

      // Add only 2 ink to inkwell (less than card cost)
      const inkCard1 = CardFactory.createCard({
        id: 'ink-1',
        name: 'Ink Card 1',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })
      const inkCard2 = CardFactory.createCard({
        id: 'ink-2',
        name: 'Ink Card 2',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })

      // Add ink cards to inkwell
      player1State.inkwell = [
        { card: inkCard1, dry: true, exerted: false },
        { card: inkCard2, dry: true, exerted: false },
      ]

      // Create play action
      const playAction = new PlayAction('player1', expensiveCard.id, 3)

      // Validate the action
      const isValid = validator.validatePlayAction(gameState, playAction)

      expect(isValid).toBe(false)
    })

    test('should validate play action as invalid when card is not in player hand', () => {
      // Create a card but don't add it to hand
      const card = CardFactory.createCard({
        id: 'test-card-1',
        name: 'Test Card',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })

      // Keep hand empty
      player1State.hand = []

      // Add some ink
      const inkCard = CardFactory.createCard({
        id: 'ink-1',
        name: 'Ink Card',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })
      player1State.inkwell = [{ card: inkCard, dry: true, exerted: false }]

      // Create play action for card not in hand
      const playAction = new PlayAction('player1', card.id, 1)

      // Validate the action
      const isValid = validator.validatePlayAction(gameState, playAction)

      expect(isValid).toBe(false)
    })

    test('should validate play action with mixed hand (affordable and expensive cards)', () => {
      // Create affordable card (cost 1)
      const affordableCard = CardFactory.createCard({
        id: 'test-affordable-1',
        name: 'Test Affordable Card',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 2,
      })

      // Create expensive card (cost 4)
      const expensiveCard = CardFactory.createCard({
        id: 'test-expensive-2',
        name: 'Test Expensive Card',
        type: 'character',
        cost: 4,
        inkable: true,
        color: 'steel',
        strength: 4,
        willpower: 5,
      })

      // Add both cards to hand
      player1State.hand = [affordableCard, expensiveCard]

      // Add 2 ink to inkwell
      const inkCard1 = CardFactory.createCard({
        id: 'ink-1',
        name: 'Ink Card 1',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })
      const inkCard2 = CardFactory.createCard({
        id: 'ink-2',
        name: 'Ink Card 2',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })

      player1State.inkwell = [
        { card: inkCard1, dry: true, exerted: false },
        { card: inkCard2, dry: true, exerted: false },
      ]

      // Test play action on affordable card
      const playActionAffordable = new PlayAction(
        'player1',
        affordableCard.id,
        1
      )
      const isValidAffordable = validator.validatePlayAction(
        gameState,
        playActionAffordable
      )
      expect(isValidAffordable).toBe(true)

      // Test play action on expensive card
      const playActionExpensive = new PlayAction('player1', expensiveCard.id, 4)
      const isValidExpensive = validator.validatePlayAction(
        gameState,
        playActionExpensive
      )
      expect(isValidExpensive).toBe(false)
    })

    test('should validate play action with exact ink amount', () => {
      // Create a card with cost 2
      const card = CardFactory.createCard({
        id: 'test-exact-1',
        name: 'Test Exact Cost Card',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
      })

      // Add card to hand
      player1State.hand = [card]

      // Add exactly 2 ink to inkwell
      const inkCard1 = CardFactory.createCard({
        id: 'ink-1',
        name: 'Ink Card 1',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })
      const inkCard2 = CardFactory.createCard({
        id: 'ink-2',
        name: 'Ink Card 2',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })

      player1State.inkwell = [
        { card: inkCard1, dry: true, exerted: false },
        { card: inkCard2, dry: true, exerted: false },
      ]

      // Create play action
      const playAction = new PlayAction('player1', card.id, 2)

      // Validate the action
      const isValid = validator.validatePlayAction(gameState, playAction)

      expect(isValid).toBe(true)
    })
  })

  describe('Play Action Execution', () => {
    test('should execute play action successfully', () => {
      // Create a card
      const card = CardFactory.createCard({
        id: 'test-play-execute-1',
        name: 'Test Play Execute Card',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
      })

      // Add card to hand
      player1State.hand = [card]

      // Add ink to inkwell
      const inkCard1 = CardFactory.createCard({
        id: 'ink-1',
        name: 'Ink Card 1',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })
      const inkCard2 = CardFactory.createCard({
        id: 'ink-2',
        name: 'Ink Card 2',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })

      player1State.inkwell = [
        { card: inkCard1, dry: true, exerted: false },
        { card: inkCard2, dry: true, exerted: false },
      ]

      // Create and execute play action
      const playAction = new PlayAction('player1', card.id, 2)
      const result = playAction.perform({
        gameState,
        playerId: 'player1',
        cardId: card.id,
        cost: 2,
      })

      // Check that card was removed from hand
      expect(player1State.hand).toHaveLength(0)
      expect(player1State.hand.find((c) => c.id === card.id)).toBeUndefined()

      // Check that card was added to board
      expect(player1State.board).toHaveLength(1)
      expect(player1State.board[0].card.id).toBe(card.id)

      // Check that ink was exerted (cost 2 means 2 ink should be exerted)
      const exertedInk = player1State.inkwell.filter((ink) => ink.exerted)
      expect(exertedInk).toHaveLength(2)

      expect(result).toBe(true)
    })

    test('should not execute play action when validation fails', () => {
      // Create an expensive card
      const expensiveCard = CardFactory.createCard({
        id: 'test-expensive-execute-1',
        name: 'Test Expensive Execute Card',
        type: 'character',
        cost: 3,
        inkable: true,
        color: 'amber',
        strength: 3,
        willpower: 4,
      })

      // Add card to hand
      player1State.hand = [expensiveCard]

      // Add only 1 ink to inkwell (insufficient)
      const inkCard = CardFactory.createCard({
        id: 'ink-1',
        name: 'Ink Card',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 1,
      })

      player1State.inkwell = [{ card: inkCard, dry: true, exerted: false }]

      // Create play action (should fail validation)
      const playAction = new PlayAction('player1', expensiveCard.id, 3)
      const result = playAction.perform({
        gameState,
        playerId: 'player1',
        cardId: expensiveCard.id,
        cost: 3,
      })

      // Check that card remained in hand
      expect(player1State.hand).toHaveLength(1)
      expect(player1State.hand[0].id).toBe(expensiveCard.id)

      // Check that card was not added to board
      expect(player1State.board).toHaveLength(0)

      // Check that no ink was exerted
      const exertedInk = player1State.inkwell.filter((ink) => ink.exerted)
      expect(exertedInk).toHaveLength(0)

      expect(result).toBe(false)
    })
  })
})
