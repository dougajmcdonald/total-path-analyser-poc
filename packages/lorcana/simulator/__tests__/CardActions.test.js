// Card Actions tests for ink action validation

import { InkAction } from '../actions/InkAction.js'
import { PlayAction } from '../actions/PlayAction.js'
import { QuestAction } from '../actions/QuestAction.js'
import { SingAction } from '../actions/SingAction.js'
import { ICardState } from '../entities/card-state/ICardState.js'
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

describe('Card Actions - Quest Action', () => {
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

  describe('Quest Action Validation', () => {
    test('should validate quest action as invalid when card is wet (drying)', () => {
      // Create a character card with lore
      const characterCard = CardFactory.createCard({
        id: 'test-character-1',
        name: 'Test Character',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 2,
      })

      // Add card to board in wet state (drying)
      const cardState = new ICardState(characterCard, false, false) // dry=false, exerted=false
      player1State.board = [cardState]

      // Create quest action
      const questAction = new QuestAction('player1', characterCard.id)

      // Validate the action
      const isValid = validator.validateQuestAction(gameState, questAction)

      expect(isValid).toBe(false)
    })

    test('should validate quest action as valid when card is dry and ready', () => {
      // Create a character card with lore
      const characterCard = CardFactory.createCard({
        id: 'test-character-2',
        name: 'Test Character',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 2,
      })

      // Add card to board in dry state
      const cardState = new ICardState(characterCard, true, false) // dry=true, exerted=false
      player1State.board = [cardState]

      // Create quest action
      const questAction = new QuestAction('player1', characterCard.id)

      // Validate the action
      const isValid = validator.validateQuestAction(gameState, questAction)

      expect(isValid).toBe(true)
    })

    test('should validate quest action as invalid when card is exerted', () => {
      // Create a character card with lore
      const characterCard = CardFactory.createCard({
        id: 'test-character-3',
        name: 'Test Character',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 2,
      })

      // Add card to board in dry but exerted state
      const cardState = new ICardState(characterCard, true, true) // dry=true, exerted=true
      player1State.board = [cardState]

      // Create quest action
      const questAction = new QuestAction('player1', characterCard.id)

      // Validate the action
      const isValid = validator.validateQuestAction(gameState, questAction)

      expect(isValid).toBe(false)
    })

    test('should validate quest action as invalid when card is not on board', () => {
      // Create a character card but don't add it to board
      const characterCard = CardFactory.createCard({
        id: 'test-character-4',
        name: 'Test Character',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 2,
      })

      // Keep board empty
      player1State.board = []

      // Create quest action
      const questAction = new QuestAction('player1', characterCard.id)

      // Validate the action
      const isValid = validator.validateQuestAction(gameState, questAction)

      expect(isValid).toBe(false)
    })

    test('should validate quest action as invalid when card is not a character', () => {
      // Create an action card (not a character)
      const actionCard = CardFactory.createCard({
        id: 'test-action-1',
        name: 'Test Action',
        type: 'action',
        cost: 1,
        inkable: true,
        color: 'amber',
      })

      // Add card to board in dry state
      const cardState = new ICardState(actionCard, true, false) // dry=true, exerted=false
      player1State.board = [cardState]

      // Create quest action
      const questAction = new QuestAction('player1', actionCard.id)

      // Validate the action
      const isValid = validator.validateQuestAction(gameState, questAction)

      expect(isValid).toBe(false)
    })

    test('should validate quest action with mixed board states', () => {
      // Create multiple cards with different states
      const wetCard = CardFactory.createCard({
        id: 'test-wet-1',
        name: 'Wet Card',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 2,
        lore: 1,
      })

      const dryReadyCard = CardFactory.createCard({
        id: 'test-dry-ready-1',
        name: 'Dry Ready Card',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 2,
      })

      const dryExertedCard = CardFactory.createCard({
        id: 'test-dry-exerted-1',
        name: 'Dry Exerted Card',
        type: 'character',
        cost: 3,
        inkable: true,
        color: 'amber',
        strength: 3,
        willpower: 4,
        lore: 3,
      })

      // Add cards to board with different states
      player1State.board = [
        new ICardState(wetCard, false, false), // wet
        new ICardState(dryReadyCard, true, false), // dry and ready
        new ICardState(dryExertedCard, true, true), // dry but exerted
      ]

      // Test quest action on wet card (should be invalid)
      const questActionWet = new QuestAction('player1', wetCard.id)
      const isValidWet = validator.validateQuestAction(
        gameState,
        questActionWet
      )
      expect(isValidWet).toBe(false)

      // Test quest action on dry ready card (should be valid)
      const questActionDryReady = new QuestAction('player1', dryReadyCard.id)
      const isValidDryReady = validator.validateQuestAction(
        gameState,
        questActionDryReady
      )
      expect(isValidDryReady).toBe(true)

      // Test quest action on dry exerted card (should be invalid)
      const questActionDryExerted = new QuestAction(
        'player1',
        dryExertedCard.id
      )
      const isValidDryExerted = validator.validateQuestAction(
        gameState,
        questActionDryExerted
      )
      expect(isValidDryExerted).toBe(false)
    })
  })

  describe('Quest Action Execution', () => {
    test('should execute quest action successfully and gain lore', () => {
      // Create a character card with lore
      const characterCard = CardFactory.createCard({
        id: 'test-quest-execute-1',
        name: 'Test Quest Character',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 2,
      })

      // Add card to board in dry state
      const cardState = new ICardState(characterCard, true, false) // dry=true, exerted=false
      player1State.board = [cardState]

      // Set initial lore to 0
      player1State.lore = 0

      // Create and execute quest action
      const questAction = new QuestAction('player1', characterCard.id)
      const result = questAction.perform({
        gameState,
        playerId: 'player1',
        cardId: characterCard.id,
      })

      // Check that card is now exerted
      expect(cardState.exerted).toBe(true)

      // Check that player gained lore
      expect(player1State.lore).toBe(2)

      expect(result).toBe(true)
    })

    test('should not execute quest action when validation fails', () => {
      // Create a character card
      const characterCard = CardFactory.createCard({
        id: 'test-quest-fail-1',
        name: 'Test Quest Character',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 2,
      })

      // Add card to board in wet state (should fail validation)
      const cardState = new ICardState(characterCard, false, false) // dry=false, exerted=false
      player1State.board = [cardState]

      // Set initial lore to 0
      player1State.lore = 0

      // Create quest action (should fail validation)
      const questAction = new QuestAction('player1', characterCard.id)
      const result = questAction.perform({
        gameState,
        playerId: 'player1',
        cardId: characterCard.id,
      })

      // Check that card is still not exerted
      expect(cardState.exerted).toBe(false)

      // Check that player did not gain lore
      expect(player1State.lore).toBe(0)

      expect(result).toBe(false)
    })

    test('should not execute quest action when card is already exerted', () => {
      // Create a character card
      const characterCard = CardFactory.createCard({
        id: 'test-quest-exerted-1',
        name: 'Test Quest Character',
        type: 'character',
        cost: 2,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 2,
      })

      // Add card to board in dry but exerted state
      const cardState = new ICardState(characterCard, true, true) // dry=true, exerted=true
      player1State.board = [cardState]

      // Set initial lore to 0
      player1State.lore = 0

      // Create quest action (should fail validation)
      const questAction = new QuestAction('player1', characterCard.id)
      const result = questAction.perform({
        gameState,
        playerId: 'player1',
        cardId: characterCard.id,
      })

      // Check that card is still exerted (no change)
      expect(cardState.exerted).toBe(true)

      // Check that player did not gain lore
      expect(player1State.lore).toBe(0)

      expect(result).toBe(false)
    })

    test('should execute quest action with different lore values', () => {
      // Create character cards with different lore values
      const lowLoreCard = CardFactory.createCard({
        id: 'test-low-lore-1',
        name: 'Low Lore Character',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 2,
        lore: 1,
      })

      const highLoreCard = CardFactory.createCard({
        id: 'test-high-lore-1',
        name: 'High Lore Character',
        type: 'character',
        cost: 4,
        inkable: true,
        color: 'amber',
        strength: 4,
        willpower: 5,
        lore: 4,
      })

      // Add both cards to board in dry state
      const lowLoreState = new ICardState(lowLoreCard, true, false) // dry=true, exerted=false
      const highLoreState = new ICardState(highLoreCard, true, false) // dry=true, exerted=false
      player1State.board = [lowLoreState, highLoreState]

      // Set initial lore to 0
      player1State.lore = 0

      // Quest the low lore card
      const questActionLow = new QuestAction('player1', lowLoreCard.id)
      const resultLow = questActionLow.perform({
        gameState,
        playerId: 'player1',
        cardId: lowLoreCard.id,
      })

      expect(resultLow).toBe(true)
      expect(lowLoreState.exerted).toBe(true)
      expect(player1State.lore).toBe(1)

      // Quest the high lore card
      const questActionHigh = new QuestAction('player1', highLoreCard.id)
      const resultHigh = questActionHigh.perform({
        gameState,
        playerId: 'player1',
        cardId: highLoreCard.id,
      })

      expect(resultHigh).toBe(true)
      expect(highLoreState.exerted).toBe(true)
      expect(player1State.lore).toBe(5) // 1 + 4
    })
  })
})

describe('Card Actions - Sing Action', () => {
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

  describe('Song Card Playing (via Play Action)', () => {
    test('should be able to play song card with sufficient ink', () => {
      // Create a song card
      const songCard = CardFactory.createCard({
        id: 'test-song-1',
        name: 'Test Song',
        type: 'action',
        cost: 2,
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      // Add song to hand
      player1State.hand = [songCard]

      // Add sufficient ink to inkwell
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
        new ICardState(inkCard1, true, false),
        new ICardState(inkCard2, true, false),
      ]

      // Create play action for song
      const playAction = new PlayAction('player1', songCard.id, 2)

      // Validate the action
      const isValid = validator.validatePlayAction(gameState, playAction)

      expect(isValid).toBe(true)
    })

    test('should not be able to play song card with insufficient ink', () => {
      // Create a song card
      const songCard = CardFactory.createCard({
        id: 'test-song-2',
        name: 'Test Song',
        type: 'action',
        cost: 3,
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      // Add song to hand
      player1State.hand = [songCard]

      // Add insufficient ink to inkwell
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

      player1State.inkwell = [new ICardState(inkCard, true, false)]

      // Create play action for song
      const playAction = new PlayAction('player1', songCard.id, 3)

      // Validate the action
      const isValid = validator.validatePlayAction(gameState, playAction)

      expect(isValid).toBe(false)
    })
  })

  describe('Sing Action Validation', () => {
    test('should validate sing action as valid when singer can afford song', () => {
      // Create a character card (singer)
      const singerCard = CardFactory.createCard({
        id: 'test-singer-1',
        name: 'Test Singer',
        type: 'character',
        cost: 3,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 1,
      })

      // Create a song card
      const songCard = CardFactory.createCard({
        id: 'test-song-3',
        name: 'Test Song',
        type: 'action',
        cost: 2,
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      // Add singer to board (dry and ready)
      const singerState = new ICardState(singerCard, true, false) // dry=true, exerted=false
      player1State.board = [singerState]

      // Add song to hand
      player1State.hand = [songCard]

      // Create sing action
      const singAction = new SingAction('player1', singerCard.id, songCard.id)

      // Validate the action
      const isValid = validator.validateSingAction(gameState, singAction)

      expect(isValid).toBe(true)
    })

    test('should validate sing action as invalid when singer cannot afford song', () => {
      // Create a character card (singer) with low cost
      const singerCard = CardFactory.createCard({
        id: 'test-singer-2',
        name: 'Test Singer',
        type: 'character',
        cost: 1, // Low cost singer
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 2,
        lore: 1,
      })

      // Create an expensive song card
      const songCard = CardFactory.createCard({
        id: 'test-song-4',
        name: 'Expensive Song',
        type: 'action',
        cost: 3, // Expensive song
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      // Add singer to board (dry and ready)
      const singerState = new ICardState(singerCard, true, false) // dry=true, exerted=false
      player1State.board = [singerState]

      // Add song to hand
      player1State.hand = [songCard]

      // Create sing action
      const singAction = new SingAction('player1', singerCard.id, songCard.id)

      // Validate the action
      const isValid = validator.validateSingAction(gameState, singAction)

      expect(isValid).toBe(false)
    })

    test('should validate sing action as invalid when singer is not ready', () => {
      // Create a character card (singer)
      const singerCard = CardFactory.createCard({
        id: 'test-singer-3',
        name: 'Test Singer',
        type: 'character',
        cost: 3,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 1,
      })

      // Create a song card
      const songCard = CardFactory.createCard({
        id: 'test-song-5',
        name: 'Test Song',
        type: 'action',
        cost: 2,
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      // Add singer to board (dry but exerted)
      const singerState = new ICardState(singerCard, true, true) // dry=true, exerted=true
      player1State.board = [singerState]

      // Add song to hand
      player1State.hand = [songCard]

      // Create sing action
      const singAction = new SingAction('player1', singerCard.id, songCard.id)

      // Validate the action
      const isValid = validator.validateSingAction(gameState, singAction)

      expect(isValid).toBe(false)
    })

    test('should validate sing action as invalid when singer is wet', () => {
      // Create a character card (singer)
      const singerCard = CardFactory.createCard({
        id: 'test-singer-4',
        name: 'Test Singer',
        type: 'character',
        cost: 3,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 1,
      })

      // Create a song card
      const songCard = CardFactory.createCard({
        id: 'test-song-6',
        name: 'Test Song',
        type: 'action',
        cost: 2,
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      // Add singer to board (wet)
      const singerState = new ICardState(singerCard, false, false) // dry=false, exerted=false
      player1State.board = [singerState]

      // Add song to hand
      player1State.hand = [songCard]

      // Create sing action
      const singAction = new SingAction('player1', singerCard.id, songCard.id)

      // Validate the action
      const isValid = validator.validateSingAction(gameState, singAction)

      expect(isValid).toBe(false)
    })

    test('should validate sing action as invalid when singer is not a character', () => {
      // Create an action card (not a character)
      const actionCard = CardFactory.createCard({
        id: 'test-action-1',
        name: 'Test Action',
        type: 'action',
        cost: 3,
        inkable: true,
        color: 'amber',
      })

      // Create a song card
      const songCard = CardFactory.createCard({
        id: 'test-song-7',
        name: 'Test Song',
        type: 'action',
        cost: 2,
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      // Add action card to board (dry and ready)
      const actionState = new ICardState(actionCard, true, false) // dry=true, exerted=false
      player1State.board = [actionState]

      // Add song to hand
      player1State.hand = [songCard]

      // Create sing action
      const singAction = new SingAction('player1', actionCard.id, songCard.id)

      // Validate the action
      const isValid = validator.validateSingAction(gameState, singAction)

      expect(isValid).toBe(false)
    })

    test('should validate sing action as invalid when song is not in hand', () => {
      // Create a character card (singer)
      const singerCard = CardFactory.createCard({
        id: 'test-singer-5',
        name: 'Test Singer',
        type: 'character',
        cost: 3,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 1,
      })

      // Create a song card but don't add it to hand
      const songCard = CardFactory.createCard({
        id: 'test-song-8',
        name: 'Test Song',
        type: 'action',
        cost: 2,
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      // Add singer to board (dry and ready)
      const singerState = new ICardState(singerCard, true, false) // dry=true, exerted=false
      player1State.board = [singerState]

      // Keep hand empty
      player1State.hand = []

      // Create sing action
      const singAction = new SingAction('player1', singerCard.id, songCard.id)

      // Validate the action
      const isValid = validator.validateSingAction(gameState, singAction)

      expect(isValid).toBe(false)
    })

    test('should validate sing action as invalid when song is not a song', () => {
      // Create a character card (singer)
      const singerCard = CardFactory.createCard({
        id: 'test-singer-6',
        name: 'Test Singer',
        type: 'character',
        cost: 3,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 1,
      })

      // Create a regular action card (not a song)
      const actionCard = CardFactory.createCard({
        id: 'test-action-2',
        name: 'Test Action',
        type: 'action',
        cost: 2,
        inkable: true,
        color: 'amber',
      })

      // Add singer to board (dry and ready)
      const singerState = new ICardState(singerCard, true, false) // dry=true, exerted=false
      player1State.board = [singerState]

      // Add action card to hand
      player1State.hand = [actionCard]

      // Create sing action
      const singAction = new SingAction('player1', singerCard.id, actionCard.id)

      // Validate the action
      const isValid = validator.validateSingAction(gameState, singAction)

      expect(isValid).toBe(false)
    })
  })

  describe('Sing Action Execution', () => {
    test('should execute sing action successfully', () => {
      // Create a character card (singer)
      const singerCard = CardFactory.createCard({
        id: 'test-singer-execute-1',
        name: 'Test Singer',
        type: 'character',
        cost: 3,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 1,
      })

      // Create a song card
      const songCard = CardFactory.createCard({
        id: 'test-song-execute-1',
        name: 'Test Song',
        type: 'action',
        cost: 2,
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      // Add singer to board (dry and ready)
      const singerState = new ICardState(singerCard, true, false) // dry=true, exerted=false
      player1State.board = [singerState]

      // Add song to hand
      player1State.hand = [songCard]

      // Create and execute sing action
      const singAction = new SingAction('player1', singerCard.id, songCard.id)
      const result = singAction.perform({
        gameState,
        playerId: 'player1',
        singerId: singerCard.id,
        songId: songCard.id,
      })

      // Check that song was removed from hand
      expect(player1State.hand).toHaveLength(0)
      expect(
        player1State.hand.find((card) => card.id === songCard.id)
      ).toBeUndefined()

      // Check that singer is now exerted
      expect(singerState.exerted).toBe(true)

      // Check that no ink was exerted (inkwell should remain unchanged)
      const exertedInk = player1State.inkwell.filter((ink) => ink.exerted)
      expect(exertedInk).toHaveLength(0)

      expect(result).toBe(true)
    })

    test('should not execute sing action when validation fails', () => {
      // Create a character card (singer)
      const singerCard = CardFactory.createCard({
        id: 'test-singer-fail-1',
        name: 'Test Singer',
        type: 'character',
        cost: 1, // Low cost singer
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 2,
        lore: 1,
      })

      // Create an expensive song card
      const songCard = CardFactory.createCard({
        id: 'test-song-fail-1',
        name: 'Expensive Song',
        type: 'action',
        cost: 3, // Expensive song
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      // Add singer to board (dry and ready)
      const singerState = new ICardState(singerCard, true, false) // dry=true, exerted=false
      player1State.board = [singerState]

      // Add song to hand
      player1State.hand = [songCard]

      // Create sing action (should fail validation)
      const singAction = new SingAction('player1', singerCard.id, songCard.id)
      const result = singAction.perform({
        gameState,
        playerId: 'player1',
        singerId: singerCard.id,
        songId: songCard.id,
      })

      // Check that song remained in hand
      expect(player1State.hand).toHaveLength(1)
      expect(player1State.hand[0].id).toBe(songCard.id)

      // Check that singer is still not exerted
      expect(singerState.exerted).toBe(false)

      expect(result).toBe(false)
    })

    test('should not execute sing action when singer is not ready', () => {
      // Create a character card (singer)
      const singerCard = CardFactory.createCard({
        id: 'test-singer-not-ready-1',
        name: 'Test Singer',
        type: 'character',
        cost: 3,
        inkable: true,
        color: 'amber',
        strength: 2,
        willpower: 3,
        lore: 1,
      })

      // Create a song card
      const songCard = CardFactory.createCard({
        id: 'test-song-not-ready-1',
        name: 'Test Song',
        type: 'action',
        cost: 2,
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      // Add singer to board (dry but exerted)
      const singerState = new ICardState(singerCard, true, true) // dry=true, exerted=true
      player1State.board = [singerState]

      // Add song to hand
      player1State.hand = [songCard]

      // Create sing action (should fail validation)
      const singAction = new SingAction('player1', singerCard.id, songCard.id)
      const result = singAction.perform({
        gameState,
        playerId: 'player1',
        singerId: singerCard.id,
        songId: songCard.id,
      })

      // Check that song remained in hand
      expect(player1State.hand).toHaveLength(1)
      expect(player1State.hand[0].id).toBe(songCard.id)

      // Check that singer is still exerted (no change)
      expect(singerState.exerted).toBe(true)

      expect(result).toBe(false)
    })

    test('should execute sing action with different singer costs', () => {
      // Create character cards with different costs
      const lowCostSinger = CardFactory.createCard({
        id: 'test-low-cost-singer-1',
        name: 'Low Cost Singer',
        type: 'character',
        cost: 1,
        inkable: true,
        color: 'amber',
        strength: 1,
        willpower: 2,
        lore: 1,
      })

      const highCostSinger = CardFactory.createCard({
        id: 'test-high-cost-singer-1',
        name: 'High Cost Singer',
        type: 'character',
        cost: 4,
        inkable: true,
        color: 'amber',
        strength: 4,
        willpower: 5,
        lore: 2,
      })

      // Create song cards with different costs
      const cheapSong = CardFactory.createCard({
        id: 'test-cheap-song-1',
        name: 'Cheap Song',
        type: 'action',
        cost: 1,
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      const expensiveSong = CardFactory.createCard({
        id: 'test-expensive-song-1',
        name: 'Expensive Song',
        type: 'action',
        cost: 3,
        inkable: true,
        color: 'amber',
        classifications: ['song'],
      })

      // Add both singers to board (dry and ready)
      const lowCostSingerState = new ICardState(lowCostSinger, true, false)
      const highCostSingerState = new ICardState(highCostSinger, true, false)
      player1State.board = [lowCostSingerState, highCostSingerState]

      // Add both songs to hand
      player1State.hand = [cheapSong, expensiveSong]

      // Test: Low cost singer can sing cheap song
      const singAction1 = new SingAction(
        'player1',
        lowCostSinger.id,
        cheapSong.id
      )
      const result1 = singAction1.perform({
        gameState,
        playerId: 'player1',
        singerId: lowCostSinger.id,
        songId: cheapSong.id,
      })

      expect(result1).toBe(true)
      expect(lowCostSingerState.exerted).toBe(true)
      expect(player1State.hand).toHaveLength(1) // One song removed

      // Test: High cost singer can sing expensive song
      const singAction2 = new SingAction(
        'player1',
        highCostSinger.id,
        expensiveSong.id
      )
      const result2 = singAction2.perform({
        gameState,
        playerId: 'player1',
        singerId: highCostSinger.id,
        songId: expensiveSong.id,
      })

      expect(result2).toBe(true)
      expect(highCostSingerState.exerted).toBe(true)
      expect(player1State.hand).toHaveLength(0) // Both songs removed
    })
  })
})
