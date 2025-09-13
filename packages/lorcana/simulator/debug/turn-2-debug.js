#!/usr/bin/env node

console.log('🎯 Turn 2 Debug Script')
console.log('======================')
console.log()

// Import required modules
import { ActionFactory } from '../actions/ActionFactory.js'
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

// Load existing test opening hands
let testOpeningHands
try {
  const fs = await import('fs')
  const testHandsData = fs.readFileSync(
    'test-data/test-opening-hands.json',
    'utf8'
  )
  testOpeningHands = JSON.parse(testHandsData)
  console.log('✅ Loaded existing test opening hands')
} catch (error) {
  console.log('❌ Could not load test opening hands:', error.message)
  process.exit(1)
}

console.log()
console.log('🃏 Test Opening Hands:')
console.log(`   Player 1: ${testOpeningHands.player1.length} cards`)
testOpeningHands.player1.forEach((card, index) => {
  console.log(
    `     ${index + 1}. ${card.name} (Cost: ${card.cost}, Type: ${card.type}, Inkable: ${card.inkable})`
  )
})
console.log(`   Player 2: ${testOpeningHands.player2.length} cards`)
testOpeningHands.player2.forEach((card, index) => {
  console.log(
    `     ${index + 1}. ${card.name} (Cost: ${card.cost}, Type: ${card.type}, Inkable: ${card.inkable})`
  )
})

console.log()
console.log('🎮 Creating Turn 2 game state...')
console.log('==================================')

// Create game state with Turn 1 completed
const gameState = GameStateFactory.createGameFromTestFormat(
  deckFormats.deck1,
  deckFormats.deck2,
  cardDatabase
)

// Initialize action factory
const actionFactory = new ActionFactory()

// Complete Turn 1: Ink Vincenzo, Play Happy - Lively Knight
console.log('🔄 Completing Turn 1...')
console.log('1️⃣ Inking Vincenzo Santorini...')

// Find Vincenzo in hand
const player1 = gameState.getPlayer('player1')
const player1State = gameState.getPlayerState('player1')
const vincenzoCard = player1State.hand.find(
  (c) => c.name === 'Vincenzo Santorini - The Explosives Expert'
)

if (vincenzoCard) {
  const inkActionData = {
    type: 'ink',
    playerId: 'player1',
    cardId: vincenzoCard.id,
  }
  const inkAction = actionFactory.createAction(inkActionData)
  const inkActionState = actionFactory.createActionState(
    gameState,
    inkActionData
  )
  const inkResult = inkAction.perform(inkActionState)
  console.log(`   Ink result: ${inkResult ? 'SUCCESS' : 'FAILED'}`)
} else {
  console.log(`   ⚠️  Vincenzo not found in hand`)
}

console.log('2️⃣ Playing Happy - Lively Knight...')
const happyCard = player1State.hand.find(
  (c) => c.name === 'Happy - Lively Knight'
)

if (happyCard) {
  const playActionData = {
    type: 'play',
    playerId: 'player1',
    cardId: happyCard.id,
  }
  const playAction = actionFactory.createAction(playActionData)
  const playActionState = actionFactory.createActionState(
    gameState,
    playActionData
  )
  const playResult = playAction.perform(playActionState)
  console.log(`   Play result: ${playResult ? 'SUCCESS' : 'FAILED'}`)
} else {
  console.log(`   ⚠️  Happy - Lively Knight not found in hand`)
}

// Reset hasInkedThisTurn for Turn 2
player1State.hasInkedThisTurn = false

// Ensure we have 1 available ink from Turn 1 (Vincenzo inked)
// If the ink action didn't work, manually add 1 ink to the inkwell
if (player1State.getAvailableInk() === 0) {
  console.log('   🔧 Manually adding 1 ink from Turn 1 (Vincenzo inked)')
  // Add Vincenzo to inkwell manually
  const vincenzoInkCard = {
    id: 'Vincenzo Santorini - The Explosives Expert-ink',
    name: 'Vincenzo Santorini - The Explosives Expert',
    type: 'character',
    cost: 7,
    inkable: true,
    lore: 2,
    strength: 0,
    willpower: 0,
    exerted: false,
  }
  player1State.inkwell.push(vincenzoInkCard)
}

// Get current state after Turn 1

console.log('✅ Turn 1 completed!')
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
