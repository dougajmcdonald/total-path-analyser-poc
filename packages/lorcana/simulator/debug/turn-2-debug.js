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
    `     ${index + 1}. ${card.name} (Cost: ${card.cost}, Lore: ${card.lore}, Strength: ${card.strength}, Willpower: ${card.willpower}, Inkable: ${card.inkable})`
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

// Get all valid actions for Turn 2 first
const allValidActions = validator.getValidActions(gameState, 'player1')
const validActions = allValidActions.filter((action) => action.type !== 'draw')

console.log('📋 Turn 2 Analysis:')
console.log(`   Turn: ${gameState.getTurn()}`)
console.log(`   Available ink: ${player1State.getAvailableInk()}`)
console.log(`   Hand size: ${player1State.hand.length} cards`)
console.log(`   Board size: ${player1State.board.length} cards`)
console.log(`   Lore: ${player1State.lore}`)

// Show what's playable with current ink
const currentPlayActions = validActions.filter(
  (action) => action.type === 'play'
)
console.log(
  `   Currently playable: ${currentPlayActions.length} cards (Cost ≤ ${player1State.getAvailableInk()})`
)

// Show what would be playable after inking
const inkableCards = player1State.hand.filter((card) => card.inkable)
if (inkableCards.length > 0) {
  const maxInkAfterInking = player1State.getAvailableInk() + 1
  const wouldBePlayable = player1State.hand.filter(
    (card) => card.cost <= maxInkAfterInking
  )
  console.log(
    `   After inking: ${wouldBePlayable.length} cards would be playable (Cost ≤ ${maxInkAfterInking})`
  )
  console.log(`   Strategic opportunity: INK + PLAY higher-cost cards`)
}
console.log()

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
  console.log(
    `     - ${card?.name} (Cost: ${card?.cost}, Lore: ${card?.lore}, Strength: ${card?.strength}, Willpower: ${card?.willpower})`
  )
})

console.log(`   PLAY: ${playActions.length} actions`)
playActions.forEach((action) => {
  const card = player1State.hand.find((c) => c.id === action.cardId)
  console.log(
    `     - ${card?.name} (Cost: ${card?.cost}, Lore: ${card?.lore}, Strength: ${card?.strength}, Willpower: ${card?.willpower})`
  )
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
  console.log('   Strategy: High Stats Strategy within higher impact approach')
  console.log('   - Ink highest-cost card (lowest combined stats if tied)')
  console.log(
    '   - Play highest-cost playable card (highest combined stats if tied)'
  )

  // Find highest cost inkable card (with stats tiebreaker)
  const highestInkAction = inkActions.reduce((best, current) => {
    const bestCard = player1State.hand.find((c) => c.id === best.cardId)
    const currentCard = player1State.hand.find((c) => c.id === current.cardId)

    // Primary: highest cost
    if ((currentCard?.cost || 0) > (bestCard?.cost || 0)) return current
    if ((currentCard?.cost || 0) < (bestCard?.cost || 0)) return best

    // Tiebreaker: lowest combined stats (keep high-stat cards for playing)
    if ((currentCard?.cost || 0) === (bestCard?.cost || 0)) {
      const currentStats =
        (currentCard?.lore || 0) +
        (currentCard?.strength || 0) +
        (currentCard?.willpower || 0)
      const bestStats =
        (bestCard?.lore || 0) +
        (bestCard?.strength || 0) +
        (bestCard?.willpower || 0)
      return currentStats < bestStats ? current : best
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

  // Debug: Show all valid actions (excluding draw)
  const postInkActionsFiltered = postInkActions.filter(
    (action) => action.type !== 'draw'
  )
  console.log(
    `   - DEBUG: All valid actions (${postInkActionsFiltered.length}):`
  )
  postInkActionsFiltered.forEach((action, index) => {
    const card = player1State.hand.find((c) => c.id === action.cardId)
    console.log(
      `     ${index + 1}. ${action.type.toUpperCase()}: ${card?.name || 'Unknown'} (ID: ${action.cardId})`
    )
  })

  if (postInkPlayActions.length > 0) {
    // Get all playable cards and sort by combined stats (highest first) for high stats strategy
    const playableCards = postInkPlayActions
      .map((action) => {
        const card = player1State.hand.find((c) => c.id === action.cardId)
        return { action, card }
      })
      .filter((item) => item.card) // Only include cards that exist

    const sortedPlayableCards = playableCards.sort((a, b) => {
      const aStats =
        (a.card.lore || 0) + (a.card.strength || 0) + (a.card.willpower || 0)
      const bStats =
        (b.card.lore || 0) + (b.card.strength || 0) + (b.card.willpower || 0)
      return bStats - aStats
    })

    sortedPlayableCards.forEach((item, index) => {
      const { card } = item
      console.log(
        `     ${index + 1}. ${card.name} (Cost: ${card.cost}, Lore: ${card.lore || 0}, Strength: ${card.strength || 0}, Willpower: ${card.willpower || 0})`
      )
    })

    // Show the high stats strategy recommendation
    const bestPlayableCard = sortedPlayableCards[0]
    const bestStats =
      (bestPlayableCard.card.lore || 0) +
      (bestPlayableCard.card.strength || 0) +
      (bestPlayableCard.card.willpower || 0)
    console.log(
      `   - HIGH STATS STRATEGY: Play ${bestPlayableCard.card.name} (Total Stats: ${bestStats})`
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
  console.log('✅ RECOMMENDED: INK + PLAY strategy (High Stats)')
  console.log(
    '   - Ink highest-cost inkable card (lowest combined stats if tied)'
  )
  console.log('   - After inking: 2 available ink')
  console.log('   - Play highest-combined-stats 2-cost card available')
  console.log('   - Maximizes immediate impact + total card value')
} else if (playActions.length > 0) {
  console.log('✅ RECOMMENDED: PLAY only strategy (High Lore)')
  console.log('   - Play highest-lore playable card')
  console.log('   - No inkable cards available')
} else {
  console.log('⚠️  No strategic options available')
}

console.log()
console.log('🌳 Turn 2 Path Analysis - All Possible Turn 3 Entry Points:')
console.log('============================================================')
console.log(
  '📋 Generating all possible Turn 2 end states for Turn 3 analysis...'
)
console.log()

// Generate all possible Turn 2 paths
const allTurn2Paths = []

// Path 1: INK + PLAY Mr. Arrow (if we can ink)
if (inkActions.length > 0) {
  // Find highest cost inkable card for inking
  const bestInkAction = inkActions.reduce((best, current) => {
    const bestCard = player1State.hand.find((c) => c.id === best.cardId)
    const currentCard = player1State.hand.find((c) => c.id === current.cardId)
    if ((currentCard?.cost || 0) > (bestCard?.cost || 0)) return current
    if ((currentCard?.cost || 0) < (bestCard?.cost || 0)) return best
    // Tiebreaker: lowest combined stats
    const currentStats =
      (currentCard?.lore || 0) +
      (currentCard?.strength || 0) +
      (currentCard?.willpower || 0)
    const bestStats =
      (bestCard?.lore || 0) +
      (bestCard?.strength || 0) +
      (bestCard?.willpower || 0)
    return currentStats < bestStats ? current : best
  })

  // After inking, find all playable 2-cost cards
  // We know that after inking, we'll have 2 available ink
  // So we can find all cards with cost <= 2
  const playableAfterInking = player1State.hand.filter((card) => card.cost <= 2)

  // Create play actions for each playable card
  const postInkPlayActions = playableAfterInking.map((card) => ({
    type: 'play',
    playerId: 'player1',
    cardId: card.id,
  }))

  // Create paths for each playable card
  postInkPlayActions.forEach((playAction, index) => {
    const card = player1State.hand.find((c) => c.id === playAction.cardId)
    if (card) {
      allTurn2Paths.push({
        pathId: `INK+PLAY-${index + 1}`,
        description: `INK ${player1State.hand.find((c) => c.id === bestInkAction.cardId)?.name} + PLAY ${card.name}`,
        actions: [bestInkAction, playAction],
        endState: {
          ink: 2,
          handSize: 6, // 7 - 1 (inked) - 1 (played)
          boardSize: 2, // 1 (existing) + 1 (played)
          lore: card.lore || 0,
        },
      })
    }
  })
}

// Path 2: PLAY only (current ink)
const playOnlyActions = validActions.filter((action) => action.type === 'play')
playOnlyActions.forEach((playAction, index) => {
  const card = player1State.hand.find((c) => c.id === playAction.cardId)
  if (card) {
    allTurn2Paths.push({
      pathId: `PLAY-ONLY-${index + 1}`,
      description: `PLAY ${card.name} only`,
      actions: [playAction],
      endState: {
        ink: 1,
        handSize: 6, // 7 - 1 (played)
        boardSize: 2, // 1 (existing) + 1 (played)
        lore: card.lore || 0,
      },
    })
  }
})

// Path 3: INK only (if no playable cards)
if (inkActions.length > 0 && playActions.length === 0) {
  const bestInkAction = inkActions.reduce((best, current) => {
    const bestCard = player1State.hand.find((c) => c.id === best.cardId)
    const currentCard = player1State.hand.find((c) => c.id === current.cardId)
    return (currentCard?.cost || 0) > (bestCard?.cost || 0) ? current : best
  })

  allTurn2Paths.push({
    pathId: 'INK-ONLY-1',
    description: `INK ${player1State.hand.find((c) => c.id === bestInkAction.cardId)?.name} only`,
    actions: [bestInkAction],
    endState: {
      ink: 2,
      handSize: 6, // 7 - 1 (inked)
      boardSize: 1, // 1 (existing)
      lore: 0,
    },
  })
}

// Deduplicate paths based on card names (not IDs)
const uniquePaths = []
const seenPaths = new Set()

allTurn2Paths.forEach((path) => {
  // Create a unique key based on card names and end state
  const pathKey = `${path.description}-${path.endState.ink}-${path.endState.lore}`

  if (!seenPaths.has(pathKey)) {
    seenPaths.add(pathKey)
    uniquePaths.push(path)
  }
})

// Score each path using the TurnEvaluator scoring system

// Helper function to score a path
function scorePath(path) {
  let score = 0

  // 1. Lore gained (highest priority)
  score += path.endState.lore * 20

  // 2. Ink efficiency (more ink = better)
  score += path.endState.ink * 5

  // 3. Board state (more cards = better)
  score += path.endState.boardSize * 8

  // 4. Hand size (more cards = better)
  score += path.endState.handSize * 3

  // 5. Card value bonus (based on what was played)
  if (path.actions.length > 1) {
    // INK + PLAY path
    const playAction = path.actions.find((action) => action.type === 'play')
    if (playAction) {
      const card = player1State.hand.find((c) => c.id === playAction.cardId)
      if (card) {
        // Bonus for higher cost cards
        score += card.cost * 3
        // Bonus for higher combined stats
        const totalStats =
          (card.lore || 0) + (card.strength || 0) + (card.willpower || 0)
        score += totalStats * 2
      }
    }
  } else if (path.actions.length === 1 && path.actions[0].type === 'play') {
    // PLAY only path
    const card = player1State.hand.find((c) => c.id === path.actions[0].cardId)
    if (card) {
      score += card.cost * 2
      const totalStats =
        (card.lore || 0) + (card.strength || 0) + (card.willpower || 0)
      score += totalStats * 1.5
    }
  }

  return Math.round(score)
}

// Score all paths
const scoredPaths = uniquePaths.map((path) => ({
  ...path,
  score: scorePath(path),
}))

// Sort by score (highest first)
scoredPaths.sort((a, b) => b.score - a.score)

// Display scored paths
console.log(`📊 Found ${scoredPaths.length} unique Turn 2 paths (scored):`)
scoredPaths.forEach((path, index) => {
  console.log(`   ${index + 1}. ${path.pathId}: ${path.description}`)
  console.log(
    `      End State: ${path.endState.ink} ink, ${path.endState.handSize} hand, ${path.endState.boardSize} board, ${path.endState.lore} lore`
  )
  console.log(`      Score: ${path.score} points`)
})

console.log()
console.log('🎯 Turn 3 Entry Points:')
console.log('=======================')
console.log('Each path above represents a different starting state for Turn 3:')
console.log('- Different ink amounts (1 or 2)')
console.log('- Different hand compositions')
console.log('- Different board states')
console.log('- Different lore totals')
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
