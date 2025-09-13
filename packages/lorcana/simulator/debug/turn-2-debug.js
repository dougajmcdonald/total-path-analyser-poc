#!/usr/bin/env node

console.log('🎯 Turn 2 Debug Script')
console.log('======================')
console.log()

// Import required modules
import { ActionFactory } from '../actions/ActionFactory.js'
import { ICardState } from '../entities/card-state/ICardState.js'
import { TurnEvaluator } from '../simulation/TurnEvaluator.js'
import { TurnExecutor } from '../simulation/TurnExecutor.js'
import { GameStateFactory } from '../utils/GameStateFactory.js'
import { TestDataLoader } from '../utils/TestDataLoader.js'
import { CardActionValidator } from '../validation/CardActionValidator.js'

console.log('📊 Loading test data...')
const deckFormats = TestDataLoader.getDeckFormats()
const cardDatabase = TestDataLoader.loadCardDatabase()
console.log('✅ Loaded test deck formats:')
console.log(`   Deck 1: ${deckFormats.deck1.length} card types`)
console.log(`   Deck 2: ${deckFormats.deck2.length} card types`)
console.log(`   Card database: ${cardDatabase.length} cards`)

// Load Turn 1 end state
let turn1EndState
try {
  const fs = await import('fs')
  const turn1Data = fs.readFileSync('test-data/turn-1-end-state.json', 'utf8')
  turn1EndState = JSON.parse(turn1Data)
  console.log('✅ Loaded Turn 1 end state')
} catch (error) {
  console.log('❌ Could not load Turn 1 end state:', error.message)
  process.exit(1)
}

console.log()
console.log('🃏 Turn 1 End State:')
console.log(`   Player 1 hand: ${turn1EndState.player1.hand.length} cards`)
turn1EndState.player1.hand.forEach((card, index) => {
  console.log(
    `     ${index + 1}. ${card.name} (Cost: ${card.cost}, Type: ${card.type}, Inkable: ${card.inkable})`
  )
})
console.log(
  `   Player 1 inkwell: ${turn1EndState.player1.inkwell.length} cards`
)
console.log(`   Player 1 board: ${turn1EndState.player1.board.length} cards`)
console.log(`   Player 1 lore: ${turn1EndState.player1.lore}`)

console.log()
console.log('🎮 Creating Turn 2 game state from Turn 1 end state...')
console.log('======================================================')

// Create a new game state and manually set it to the Turn 1 end state
const gameState = GameStateFactory.createGameFromTestFormat(
  deckFormats.deck1,
  deckFormats.deck2,
  cardDatabase
)

// Get player states
const player1 = gameState.getPlayer('player1')
const player1State = gameState.getPlayerState('player1')
const player2 = gameState.getPlayer('player2')
const player2State = gameState.getPlayerState('player2')

// Set Turn 1 end state
console.log('🔄 Setting up Turn 1 end state...')

// Clear existing hands and set Turn 1 end state
// Convert cards from database format
player1State.hand = turn1EndState.player1.hand
  .map((cardData) => {
    const card = cardDatabase.find(
      (c) => c.Name && c.Name.toLowerCase() === cardData.name.toLowerCase()
    )
    if (!card) {
      console.warn(`⚠️  Card not found in database: "${cardData.name}"`)
      return null
    }
    // Convert database card to expected format
    const cardObj = {
      id: cardData.id,
      name: card.Name,
      type: card.Type.toLowerCase(),
      cost: card.Cost,
      inkable: card.Inkable,
      lore: card.Lore || 0,
      strength: card.Strength || 0,
      willpower: card.Willpower || 0,
    }
    // Wrap in ICardState for hand cards (they don't need state yet)
    return cardObj
  })
  .filter(Boolean)

player1State.inkwell = turn1EndState.player1.inkwell
  .map((cardData) => {
    const card = cardDatabase.find(
      (c) => c.Name && c.Name.toLowerCase() === cardData.name.toLowerCase()
    )
    if (!card) {
      console.warn(`⚠️  Card not found in database: "${cardData.name}"`)
      return null
    }
    const cardObj = {
      id: cardData.id,
      name: card.Name,
      type: card.Type.toLowerCase(),
      cost: card.Cost,
      inkable: card.Inkable,
      lore: card.Lore || 0,
      strength: card.Strength || 0,
      willpower: card.Willpower || 0,
    }
    // Wrap in ICardState for inkwell (dry, not exerted)
    return new ICardState(cardObj, true, false)
  })
  .filter(Boolean)

player1State.board = turn1EndState.player1.board
  .map((cardData) => {
    const card = cardDatabase.find(
      (c) => c.Name && c.Name.toLowerCase() === cardData.name.toLowerCase()
    )
    if (!card) {
      console.warn(`⚠️  Card not found in database: "${cardData.name}"`)
      return null
    }
    const cardObj = {
      id: cardData.id,
      name: card.Name,
      type: card.Type.toLowerCase(),
      cost: card.Cost,
      inkable: card.Inkable,
      lore: card.Lore || 0,
      strength: card.Strength || 0,
      willpower: card.Willpower || 0,
    }
    // Wrap in ICardState for board (dry, not exerted)
    return new ICardState(cardObj, true, false)
  })
  .filter(Boolean)

player1State.lore = turn1EndState.player1.lore
player1State.hasInkedThisTurn = turn1EndState.player1.hasInkedThisTurn

// Convert Player 2 cards
player2State.hand = turn1EndState.player2.hand
  .map((cardData) => {
    const card = cardDatabase.find(
      (c) => c.Name && c.Name.toLowerCase() === cardData.name.toLowerCase()
    )
    if (!card) {
      console.warn(`⚠️  Card not found in database: "${cardData.name}"`)
      return null
    }
    const cardObj = {
      id: cardData.id,
      name: card.Name,
      type: card.Type.toLowerCase(),
      cost: card.Cost,
      inkable: card.Inkable,
      lore: card.Lore || 0,
      strength: card.Strength || 0,
      willpower: card.Willpower || 0,
    }
    return cardObj
  })
  .filter(Boolean)

player2State.inkwell = turn1EndState.player2.inkwell
  .map((cardData) => {
    const card = cardDatabase.find(
      (c) => c.Name && c.Name.toLowerCase() === cardData.name.toLowerCase()
    )
    if (!card) {
      console.warn(`⚠️  Card not found in database: "${cardData.name}"`)
      return null
    }
    const cardObj = {
      id: cardData.id,
      name: card.Name,
      type: card.Type.toLowerCase(),
      cost: card.Cost,
      inkable: card.Inkable,
      lore: card.Lore || 0,
      strength: card.Strength || 0,
      willpower: card.Willpower || 0,
    }
    return new ICardState(cardObj, true, false)
  })
  .filter(Boolean)

player2State.board = turn1EndState.player2.board
  .map((cardData) => {
    const card = cardDatabase.find(
      (c) => c.Name && c.Name.toLowerCase() === cardData.name.toLowerCase()
    )
    if (!card) {
      console.warn(`⚠️  Card not found in database: "${cardData.name}"`)
      return null
    }
    const cardObj = {
      id: cardData.id,
      name: card.Name,
      type: card.Type.toLowerCase(),
      cost: card.Cost,
      inkable: card.Inkable,
      lore: card.Lore || 0,
      strength: card.Strength || 0,
      willpower: card.Willpower || 0,
    }
    return new ICardState(cardObj, true, false)
  })
  .filter(Boolean)

player2State.lore = turn1EndState.player2.lore
player2State.hasInkedThisTurn = turn1EndState.player2.hasInkedThisTurn

// Set active player
gameState.activePlayer = { id: turn1EndState.activePlayerId }

console.log('✅ Turn 1 end state loaded!')
console.log(`   Available ink: ${player1State.getAvailableInk()}`)
console.log(`   Hand size: ${player1State.hand.length} cards`)
console.log(`   Board size: ${player1State.board.length} cards`)
console.log(`   Lore: ${player1State.lore}`)

// Draw card for Turn 2 (hardcoded for consistent testing)
console.log()
console.log('🔄 Turn 2: Drawing card...')
// Hardcode the draw to "Happy - Lively Knight" for consistent testing
const hardcodedDraw = cardDatabase.find(
  (c) => c.Name && c.Name.toLowerCase() === 'happy - lively knight'
)
if (hardcodedDraw) {
  // Convert database card to expected format
  const cardData = {
    id: 'Happy - Lively Knight-4', // Use consistent ID for Turn 2
    name: hardcodedDraw.Name,
    type: hardcodedDraw.Type.toLowerCase(),
    cost: hardcodedDraw.Cost,
    inkable: hardcodedDraw.Inkable,
    lore: hardcodedDraw.Lore || 0,
    strength: hardcodedDraw.Strength || 0,
    willpower: hardcodedDraw.Willpower || 0,
  }
  player1State.addToHand(cardData)
  console.log(
    `   ✅ Drew: ${cardData.name} (Cost: ${cardData.cost}, Type: ${cardData.type}, Inkable: ${cardData.inkable})`
  )
} else {
  console.log(
    `   ⚠️  Hardcoded card "Happy - Lively Knight" not found in database!`
  )
}

console.log(`   Hand size after draw: ${player1State.hand.length} cards`)

// Initialize turn evaluator and validator
const validator = new CardActionValidator()
const turnEvaluator = new TurnEvaluator()
const turnExecutor = new TurnExecutor()
const actionFactory = new ActionFactory()

console.log()
console.log('🔧 Initializing turn evaluator and validator...')
console.log('✅ Turn evaluator and validator initialized')

// Analyze Turn 2 strategic options
console.log()
console.log('🔍 Analyzing Turn 2 strategic options...')
console.log('==========================================')
console.log('📋 Turn 2 Analysis:')
console.log(`   Turn: ${gameState.getTurn()}`)
console.log(`   Available ink: ${player1State.getAvailableInk()}`)
console.log(`   Hand size: ${player1State.hand.length} cards`)
console.log(`   Board size: ${player1State.board.length} cards`)
console.log(`   Lore: ${player1State.lore}`)
console.log()

// Get all valid actions for Turn 2
const allValidActions = validator.getValidActions(gameState, 'player1')
const validActions = allValidActions.filter((action) => action.type !== 'draw')

console.log(`📋 Found ${validActions.length} valid actions for Turn 2:`)
validActions.forEach((action, index) => {
  const card = player1State.hand.find((c) => c.id === action.cardId)
  console.log(
    `   ${index + 1}. ${action.type.toUpperCase()}: ${card?.name || 'Unknown'} (ID: ${action.cardId})`
  )
})

// Categorize actions
const inkActions = validActions.filter((action) => action.type === 'ink')
const playActions = validActions.filter((action) => action.type === 'play')
const questActions = validActions.filter((action) => action.type === 'quest')
const challengeActions = validActions.filter(
  (action) => action.type === 'challenge'
)
const singActions = validActions.filter((action) => action.type === 'sing')

console.log()
console.log('📊 Action breakdown by type:')
console.log(`   INK: ${inkActions.length} actions`)
inkActions.forEach((action) => {
  const card = player1State.hand.find((c) => c.id === action.cardId)
  console.log(`     - ${card?.name} (Cost: ${card?.cost})`)
})

console.log(`   PLAY: ${playActions.length} actions`)
playActions.forEach((action) => {
  const card = player1State.hand.find((c) => c.id === action.cardId)
  console.log(`     - ${card?.name} (Cost: ${card?.cost})`)
})

if (questActions.length > 0) {
  console.log(`   QUEST: ${questActions.length} actions`)
  questActions.forEach((action) => {
    const card = player1State.hand.find((c) => c.id === action.cardId)
    console.log(`     - ${card?.name} (Lore: ${card?.lore})`)
  })
}

if (challengeActions.length > 0) {
  console.log(`   CHALLENGE: ${challengeActions.length} actions`)
  challengeActions.forEach((action) => {
    const card = player1State.hand.find((c) => c.id === action.cardId)
    console.log(`     - ${card?.name} (Strength: ${card?.strength})`)
  })
}

if (singActions.length > 0) {
  console.log(`   SING: ${singActions.length} actions`)
  singActions.forEach((action) => {
    const card = player1State.hand.find((c) => c.id === action.cardId)
    console.log(`     - ${card?.name} (Cost: ${card?.cost})`)
  })
}

console.log()
console.log('🎯 Turn 2 Strategic Analysis:')
console.log('==============================')
console.log('📋 Strategic Decision Tree:')
console.log('   1. Current ink: 1 → Can PLAY 1-cost or INK for more ink')
console.log('   2. Strategic question: INK + PLAY 2-cost vs PLAY 1-cost only?')
console.log('   3. Impact assessment: Higher cost = more impactful')
console.log()

// Analyze strategic options
console.log('🔍 Strategic Options Analysis:')
console.log('==============================')

// Option 1: INK + PLAY (if possible)
if (inkActions.length > 0) {
  console.log('📈 Option 1: INK + PLAY (Higher impact)')
  console.log('   Strategy: High Lore Strategy within higher impact approach')
  console.log('   - Ink highest-cost card (lowest lore if tied)')
  console.log('   - Play highest-cost playable card (highest lore if tied)')

  // Find highest cost inkable card (with lore tiebreaker)
  const highestInkAction = inkActions.reduce((best, current) => {
    const bestCard = player1State.hand.find((c) => c.id === best.cardId)
    const currentCard = player1State.hand.find((c) => c.id === current.cardId)

    // Primary: highest cost
    if ((currentCard?.cost || 0) > (bestCard?.cost || 0)) return current
    if ((currentCard?.cost || 0) < (bestCard?.cost || 0)) return best

    // Tiebreaker: lowest lore (keep high-lore cards for playing)
    if ((currentCard?.cost || 0) === (bestCard?.cost || 0)) {
      return (currentCard?.lore || 0) < (bestCard?.lore || 0) ? current : best
    }

    return best
  })

  const highestInkCard = player1State.hand.find(
    (c) => c.id === highestInkAction.cardId
  )
  console.log(
    `   - INK: ${highestInkCard?.name} (Cost: ${highestInkCard?.cost}, Lore: ${highestInkCard?.lore}) → +1 available ink`
  )

  // Actually execute the ink action to get 2 available ink
  console.log(`   - Executing ink action...`)
  const inkActionData = {
    type: 'ink',
    playerId: 'player1',
    cardId: highestInkCard.id,
  }
  const inkAction = actionFactory.createAction(inkActionData)
  const inkActionState = actionFactory.createActionState(
    gameState,
    inkActionData
  )
  const inkResult = inkAction.perform(inkActionState)
  console.log(`   - Ink result: ${inkResult ? 'SUCCESS' : 'FAILED'}`)

  console.log(
    `   - After inking: ${player1State.getAvailableInk()} available ink`
  )

  // Now evaluate what becomes playable with the new ink amount
  const postInkActions = validator.getValidActions(gameState, 'player1')
  const postInkPlayActions = postInkActions.filter(
    (action) => action.type === 'play'
  )

  console.log(
    `   - Playable cards after inking (${postInkPlayActions.length}):`
  )

  // Debug: Show all cards in hand
  console.log(`   - DEBUG: All cards in hand (${player1State.hand.length}):`)
  player1State.hand.forEach((card, index) => {
    console.log(
      `     ${index + 1}. ${card.name} (Cost: ${card.cost}, Type: ${card.type})`
    )
  })

  // Debug: Show all valid actions
  console.log(`   - DEBUG: All valid actions (${postInkActions.length}):`)
  postInkActions.forEach((action, index) => {
    const card = player1State.hand.find((c) => c.id === action.cardId)
    console.log(
      `     ${index + 1}. ${action.type.toUpperCase()}: ${card?.name || 'Unknown'} (ID: ${action.cardId})`
    )
  })

  if (postInkPlayActions.length > 0) {
    // Get all playable cards and sort by lore (highest first) for high lore strategy
    const playableCards = postInkPlayActions
      .map((action) => {
        const card = player1State.hand.find((c) => c.id === action.cardId)
        return { action, card }
      })
      .filter((item) => item.card) // Only include cards that exist

    const sortedPlayableCards = playableCards.sort(
      (a, b) => (b.card.lore || 0) - (a.card.lore || 0)
    )

    sortedPlayableCards.forEach((item, index) => {
      const { card } = item
      console.log(
        `     ${index + 1}. ${card.name} (Cost: ${card.cost}, Lore: ${card.lore || 0}, Strength: ${card.strength || 0}, Willpower: ${card.willpower || 0})`
      )
    })

    // Show the high lore strategy recommendation
    const bestPlayableCard = sortedPlayableCards[0]
    console.log(
      `   - HIGH LORE STRATEGY: Play ${bestPlayableCard.card.name} (Lore: ${bestPlayableCard.card.lore || 0})`
    )
  } else {
    console.log(`     No playable cards available with current ink`)
  }

  console.log(
    `   - Impact: High (ink high-cost + play highest-lore available card)`
  )
}

// Option 2: PLAY only (if no inkable cards or no higher-cost playable cards)
if (playActions.length > 0) {
  console.log()
  console.log('📉 Option 2: PLAY only (Lower impact)')
  console.log('   Strategy: Play highest-cost card with current ink')

  const highestPlayAction = playActions.reduce((best, current) => {
    const bestCard = player1State.hand.find((c) => c.id === best.cardId)
    const currentCard = player1State.hand.find((c) => c.id === current.cardId)
    return (currentCard?.cost || 0) > (bestCard?.cost || 0) ? current : best
  })

  const highestPlayCard = player1State.hand.find(
    (c) => c.id === highestPlayAction.cardId
  )
  console.log(
    `   - PLAY: ${highestPlayCard?.name} (Cost: ${highestPlayCard?.cost})`
  )
  console.log(`   - Impact: Medium (single high-cost card)`)
}

// Option 3: INK only (if no playable cards)
if (inkActions.length > 0 && playActions.length === 0) {
  console.log()
  console.log('📊 Option 3: INK only (Future impact)')
  console.log('   Strategy: Ink highest-cost card for future turns')

  const highestInkAction = inkActions.reduce((best, current) => {
    const bestCard = player1State.hand.find((c) => c.id === best.cardId)
    const currentCard = player1State.hand.find((c) => c.id === current.cardId)
    return (currentCard?.cost || 0) > (bestCard?.cost || 0) ? current : best
  })

  const highestInkCard = player1State.hand.find(
    (c) => c.id === highestInkAction.cardId
  )
  console.log(
    `   - INK: ${highestInkCard?.name} (Cost: ${highestInkCard?.cost})`
  )
  console.log(`   - Impact: Future (sets up next turn)`)
}

console.log()
console.log('🎯 Turn 2 Strategic Recommendation:')
console.log('====================================')
if (inkActions.length > 0) {
  console.log('✅ RECOMMENDED: INK + PLAY strategy (High Lore)')
  console.log('   - Ink highest-cost inkable card (lowest lore if tied)')
  console.log('   - After inking: 2 available ink')
  console.log('   - Play highest-lore 2-cost card available')
  console.log('   - Maximizes immediate impact + lore generation')
} else if (playActions.length > 0) {
  console.log('✅ RECOMMENDED: PLAY only strategy (High Lore)')
  console.log('   - Play highest-lore playable card')
  console.log('   - No inkable cards available')
} else {
  console.log('⚠️  No strategic options available')
}

console.log()
console.log('🎉 Turn 2 debug completed!')
console.log()
console.log('📝 Summary:')
console.log('===========')
console.log('✅ Turn 2 Analysis Completed:')
console.log('   1️⃣ Turn 1 completed: Vincenzo inked, Happy played')
console.log('   2️⃣ Turn 2 draw: New card added to hand')
console.log('   3️⃣ Strategic options: INK vs PLAY analysis')
console.log('✅ Strategic decision tree presented')
console.log('✅ Impact assessment based on cost')
console.log('✅ Strategic recommendation provided')
console.log()
console.log('🎯 Turn 2 Insights:')
console.log('   - Strategic depth: INK + PLAY vs PLAY only')
console.log('   - Impact principle: Higher cost = more impactful')
console.log('   - Future flexibility vs immediate impact')
console.log('   - Ready for complex strategy implementation')
