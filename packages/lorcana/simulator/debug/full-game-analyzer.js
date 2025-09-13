// Full Game Analyzer - 4 Turn Deep Path Analysis
// Demonstrates complete recursive path analysis with strategic decision trees

import { ActionFactory } from '../actions/ActionFactory.js'
import { ICardState } from '../entities/card-state/ICardState.js'
import { TurnEvaluator } from '../simulation/TurnEvaluator.js'
import { TurnExecutor } from '../simulation/TurnExecutor.js'
import { GameStateFactory } from '../utils/GameStateFactory.js'
import { TestDataLoader } from '../utils/TestDataLoader.js'
import { CardActionValidator } from '../validation/CardActionValidator.js'

console.log('🎮 Full Game Analyzer - 4 Turn Deep')
console.log('===================================')
console.log()

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
console.log(
  `   Player 1 inkwell: ${turn1EndState.player1.inkwell.length} cards`
)
console.log(`   Player 1 board: ${turn1EndState.player1.board.length} cards`)
console.log(`   Player 1 lore: ${turn1EndState.player1.lore}`)

console.log()
console.log('🎮 Creating base game state...')
console.log('================================')

// Create a new game state and manually set it to the Turn 1 end state
const baseGameState = GameStateFactory.createGameFromTestFormat(
  deckFormats.deck1,
  deckFormats.deck2,
  cardDatabase
)

// Get player states
const player1 = baseGameState.getPlayer('player1')
const player1State = baseGameState.getPlayerState('player1')
const player2 = baseGameState.getPlayer('player2')
const player2State = baseGameState.getPlayerState('player2')

// Set Turn 1 end state
console.log('🔄 Setting up Turn 1 end state...')

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
baseGameState.activePlayer = { id: turn1EndState.activePlayerId }

console.log('✅ Turn 1 end state loaded!')
console.log(`   Available ink: ${player1State.getAvailableInk()}`)
console.log(`   Hand size: ${player1State.hand.length} cards`)
console.log(`   Board size: ${player1State.board.length} cards`)
console.log(`   Lore: ${player1State.lore}`)

// Initialize components
const validator = new CardActionValidator()
const turnEvaluator = new TurnEvaluator()
const turnExecutor = new TurnExecutor()
const actionFactory = new ActionFactory()

console.log()
console.log('🔧 Initializing full game analyzer...')
console.log('✅ Full game analyzer initialized')

// Full Game Analysis Function
function analyzeFullGame(gameState, maxTurns = 4) {
  console.log()
  console.log('🌳 Full Game Analysis')
  console.log('====================')
  console.log(`🎯 Analyzing ${maxTurns} turns deep...`)
  console.log()

  const gameTree = analyzeTurnRecursively(gameState, 2, maxTurns)

  console.log()
  console.log('📊 Game Tree Summary')
  console.log('===================')
  displayGameTree(gameTree, 0)

  return gameTree
}

// Recursive Turn Analysis Function (enhanced for full game)
function analyzeTurnRecursively(gameState, turnNumber, maxTurns = 4) {
  console.log()
  console.log(`🌳 Turn ${turnNumber} Analysis`)
  console.log('='.repeat(30))

  if (turnNumber > maxTurns) {
    console.log(`   ⏹️  Reached maximum turn depth (${maxTurns})`)
    return []
  }

  const player1State = gameState.getPlayerState('player1')

  // Mandatory turn phases
  console.log(`🔄 Turn ${turnNumber}: Mandatory phases...`)

  // Ready Phase
  console.log('   1️⃣ Ready Phase: Unexerting all ink and characters...')
  if (player1State.board) {
    player1State.board.forEach((cardState) => {
      if (cardState.exerted) {
        cardState.exerted = false
      }
    })
  }
  if (player1State.inkwell) {
    player1State.inkwell.forEach((cardState) => {
      if (cardState.exerted) {
        cardState.exerted = false
      }
    })
  }

  // Draw Phase
  console.log('   2️⃣ Draw Phase: Drawing one card...')
  // For consistency, hardcode draws based on turn number
  const drawCards = [
    'Happy - Lively Knight', // Turn 2
    "Mr. Arrow - Legacy's First Mate", // Turn 3
    'Nala - Undaunted Lioness', // Turn 4
    'Lilo - Best Explorer Ever', // Turn 5
  ]

  const drawnCardName = drawCards[turnNumber - 2] || 'Happy - Lively Knight'
  const drawnCard = {
    id: `${drawnCardName}-${Date.now()}`,
    name: drawnCardName,
    type: 'character',
    cost:
      drawnCardName === 'Lilo - Best Explorer Ever'
        ? 3
        : drawnCardName === "Mr. Arrow - Legacy's First Mate"
          ? 2
          : drawnCardName === 'Nala - Undaunted Lioness'
            ? 2
            : 1,
    inkable:
      drawnCardName === 'Lilo - Best Explorer Ever'
        ? true
        : drawnCardName === 'Happy - Lively Knight'
          ? true
          : false,
    lore:
      drawnCardName === 'Lilo - Best Explorer Ever'
        ? 1
        : drawnCardName === "Mr. Arrow - Legacy's First Mate"
          ? 2
          : drawnCardName === 'Nala - Undaunted Lioness'
            ? 2
            : 1,
    strength:
      drawnCardName === 'Lilo - Best Explorer Ever'
        ? 2
        : drawnCardName === "Mr. Arrow - Legacy's First Mate"
          ? 2
          : drawnCardName === 'Nala - Undaunted Lioness'
            ? 2
            : 2,
    willpower:
      drawnCardName === 'Lilo - Best Explorer Ever'
        ? 2
        : drawnCardName === "Mr. Arrow - Legacy's First Mate"
          ? 1
          : drawnCardName === 'Nala - Undaunted Lioness'
            ? 2
            : 1,
  }
  player1State.hand.push(drawnCard)
  console.log(
    `   ✅ Drew: ${drawnCard.name} (Cost: ${drawnCard.cost}, Lore: ${drawnCard.lore}, Strength: ${drawnCard.strength}, Willpower: ${drawnCard.willpower})`
  )

  // Reset hasInkedThisTurn for new turn
  player1State.hasInkedThisTurn = false

  console.log(`   Hand size after draw: ${player1State.hand.length} cards`)

  // Get all valid actions for this turn
  const allValidActions = validator.getValidActions(gameState, 'player1')
  const validActions = allValidActions.filter(
    (action) => action.type !== 'draw'
  )

  console.log(
    `📋 Found ${validActions.length} valid actions for Turn ${turnNumber}:`
  )
  validActions.forEach((action, index) => {
    const card = player1State.hand.find((c) => c.id === action.cardId)
    console.log(
      `   ${index + 1}. ${action.type.toUpperCase()}: ${card?.name || 'Unknown'} (ID: ${action.cardId})`
    )
  })

  // Generate all possible paths for this turn
  const turnPaths = generateTurnPaths(gameState, validActions, turnNumber)

  // Score all paths
  const scoredPaths = turnPaths.map((path) => ({
    ...path,
    score: scorePath(path, turnNumber),
  }))

  // Sort by score (highest first)
  scoredPaths.sort((a, b) => b.score - a.score)

  console.log()
  console.log(
    `📊 Found ${scoredPaths.length} unique Turn ${turnNumber} paths (scored):`
  )
  scoredPaths.forEach((path, index) => {
    const strategyIcon =
      path.strategy === 'PRIMARY'
        ? '🎯'
        : path.strategy === 'FALLBACK'
          ? '⚠️'
          : path.strategy === 'EMERGENCY'
            ? '❌'
            : '❓'
    console.log(
      `   ${index + 1}. ${strategyIcon} ${path.pathId}: ${path.description}`
    )
    console.log(
      `      End State: ${path.endState.ink} ink, ${path.endState.handSize} hand, ${path.endState.boardSize} board, ${path.endState.lore} lore`
    )
    console.log(`      Score: ${path.score} points (${path.strategy} strategy)`)
  })

  // If we haven't reached max depth, recursively analyze next turn for top paths
  if (turnNumber < maxTurns) {
    console.log()
    console.log(`🔄 Analyzing Turn ${turnNumber + 1} for top paths...`)

    // Take top 2 paths and analyze next turn for each
    const topPaths = scoredPaths.slice(0, 2)
    const nextTurnResults = []

    for (const path of topPaths) {
      console.log()
      console.log(`   📍 Analyzing from: ${path.pathId} (Score: ${path.score})`)

      // Create a copy of game state for this path
      const pathGameState = createGameStateCopy(gameState)
      // Apply path actions to pathGameState
      applyPathActions(pathGameState, path.actions)

      // Recursively analyze next turn
      const nextTurnPaths = analyzeTurnRecursively(
        pathGameState,
        turnNumber + 1,
        maxTurns
      )

      nextTurnResults.push({
        parentPath: path,
        nextTurnPaths: nextTurnPaths,
      })
    }

    return {
      currentTurn: scoredPaths,
      nextTurns: nextTurnResults,
    }
  }

  return scoredPaths
}

// Generate all possible paths for a turn
function generateTurnPaths(gameState, validActions, turnNumber) {
  const paths = []
  const player1State = gameState.getPlayerState('player1')

  // Separate actions by type
  const inkActions = validActions.filter((action) => action.type === 'ink')
  const playActions = validActions.filter((action) => action.type === 'play')
  const questActions = validActions.filter((action) => action.type === 'quest')

  console.log(
    `   🎯 Strategic Analysis: ${inkActions.length} inkable cards, ${playActions.length} playable cards`
  )

  // PRIMARY STRATEGY: INK + PLAY (always preferred when possible)
  if (inkActions.length > 0) {
    // Find highest cost inkable card for inking (High Stats Strategy)
    const bestInkAction = inkActions.reduce((best, current) => {
      const bestCard = player1State.hand.find((c) => c.id === best.cardId)
      const currentCard = player1State.hand.find((c) => c.id === current.cardId)

      // Primary: highest cost
      if ((currentCard?.cost || 0) > (bestCard?.cost || 0)) return current
      if ((currentCard?.cost || 0) < (bestCard?.cost || 0)) return best

      // Tiebreaker: lowest combined stats (keep high-stat cards for playing)
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

    // After inking, find all playable cards with increased ink
    const availableInkAfterInking = player1State.getAvailableInk() + 1
    const playableAfterInking = player1State.hand.filter(
      (card) => card.cost <= availableInkAfterInking
    )

    console.log(
      `   💡 INK+PLAY Strategy: After inking, ${playableAfterInking.length} cards playable with ${availableInkAfterInking} ink`
    )

    if (playableAfterInking.length > 0) {
      // Create play actions for each playable card (sorted by High Stats Strategy)
      const postInkPlayActions = playableAfterInking
        .map((card) => ({
          card,
          action: {
            type: 'play',
            playerId: 'player1',
            cardId: card.id,
          },
        }))
        .sort((a, b) => {
          // Primary: highest cost
          if (a.card.cost > b.card.cost) return -1
          if (a.card.cost < b.card.cost) return 1

          // Tiebreaker: highest combined stats
          const aStats =
            (a.card.lore || 0) +
            (a.card.strength || 0) +
            (a.card.willpower || 0)
          const bStats =
            (b.card.lore || 0) +
            (b.card.strength || 0) +
            (b.card.willpower || 0)
          return bStats - aStats
        })

      // SINGLE CARD PLAY: Create INK+PLAY paths for each playable card
      postInkPlayActions.forEach(({ card, action }, index) => {
        paths.push({
          pathId: `T${turnNumber}-INK+PLAY-${index + 1}`,
          description: `INK ${player1State.hand.find((c) => c.id === bestInkAction.cardId)?.name} + PLAY ${card.name}`,
          actions: [bestInkAction, action],
          endState: {
            ink: availableInkAfterInking,
            handSize: player1State.hand.length - 2, // -1 (inked) -1 (played)
            boardSize: player1State.board.length + 1, // +1 (played)
            lore: card.lore || 0,
          },
          strategy: 'PRIMARY',
        })
      })

      // MULTI-CARD PLAY: Generate combinations of playable cards
      if (playableAfterInking.length > 1) {
        console.log(
          `   🔥 Multi-Card Strategy: Generating ${playableAfterInking.length} card combinations...`
        )

        // Generate all possible combinations of 2 cards
        for (let i = 0; i < postInkPlayActions.length; i++) {
          for (let j = i + 1; j < postInkPlayActions.length; j++) {
            const card1 = postInkPlayActions[i].card
            const action1 = postInkPlayActions[i].action
            const card2 = postInkPlayActions[j].card
            const action2 = postInkPlayActions[j].action

            const totalCost = card1.cost + card2.cost

            // Only include if total cost is affordable
            if (totalCost <= availableInkAfterInking) {
              const totalLore = (card1.lore || 0) + (card2.lore || 0)
              const totalStats =
                (card1.lore || 0) +
                (card1.strength || 0) +
                (card1.willpower || 0) +
                (card2.lore || 0) +
                (card2.strength || 0) +
                (card2.willpower || 0)

              paths.push({
                pathId: `T${turnNumber}-INK+MULTI-${i + 1}-${j + 1}`,
                description: `INK ${player1State.hand.find((c) => c.id === bestInkAction.cardId)?.name} + PLAY ${card1.name} + ${card2.name}`,
                actions: [bestInkAction, action1, action2],
                endState: {
                  ink: availableInkAfterInking,
                  handSize: player1State.hand.length - 3, // -1 (inked) -2 (played)
                  boardSize: player1State.board.length + 2, // +2 (played)
                  lore: totalLore,
                },
                strategy: 'PRIMARY',
                multiCard: true,
                totalCost: totalCost,
                totalStats: totalStats,
              })
            }
          }
        }

        // Generate all possible combinations of 3 cards (if ink allows)
        if (playableAfterInking.length > 2) {
          for (let i = 0; i < postInkPlayActions.length; i++) {
            for (let j = i + 1; j < postInkPlayActions.length; j++) {
              for (let k = j + 1; k < postInkPlayActions.length; k++) {
                const card1 = postInkPlayActions[i].card
                const action1 = postInkPlayActions[i].action
                const card2 = postInkPlayActions[j].card
                const action2 = postInkPlayActions[j].action
                const card3 = postInkPlayActions[k].card
                const action3 = postInkPlayActions[k].action

                const totalCost = card1.cost + card2.cost + card3.cost

                // Only include if total cost is affordable
                if (totalCost <= availableInkAfterInking) {
                  const totalLore =
                    (card1.lore || 0) + (card2.lore || 0) + (card3.lore || 0)
                  const totalStats =
                    (card1.lore || 0) +
                    (card1.strength || 0) +
                    (card1.willpower || 0) +
                    (card2.lore || 0) +
                    (card2.strength || 0) +
                    (card2.willpower || 0) +
                    (card3.lore || 0) +
                    (card3.strength || 0) +
                    (card3.willpower || 0)

                  paths.push({
                    pathId: `T${turnNumber}-INK+MULTI-${i + 1}-${j + 1}-${k + 1}`,
                    description: `INK ${player1State.hand.find((c) => c.id === bestInkAction.cardId)?.name} + PLAY ${card1.name} + ${card2.name} + ${card3.name}`,
                    actions: [bestInkAction, action1, action2, action3],
                    endState: {
                      ink: availableInkAfterInking,
                      handSize: player1State.hand.length - 4, // -1 (inked) -3 (played)
                      boardSize: player1State.board.length + 3, // +3 (played)
                      lore: totalLore,
                    },
                    strategy: 'PRIMARY',
                    multiCard: true,
                    totalCost: totalCost,
                    totalStats: totalStats,
                  })
                }
              }
            }
          }
        }
      }
    } else {
      // EDGE CASE: INK only (no playable cards after inking)
      console.log(`   ⚠️  EDGE CASE: INK only - no playable cards after inking`)
      paths.push({
        pathId: `T${turnNumber}-INK-ONLY-1`,
        description: `INK ${player1State.hand.find((c) => c.id === bestInkAction.cardId)?.name} only (no playable cards)`,
        actions: [bestInkAction],
        endState: {
          ink: availableInkAfterInking,
          handSize: player1State.hand.length - 1, // -1 (inked)
          boardSize: player1State.board.length, // no change
          lore: 0,
        },
        strategy: 'FALLBACK',
      })
    }
  } else {
    // EDGE CASE: PLAY only (no inkable cards available)
    console.log(`   ⚠️  EDGE CASE: PLAY only - no inkable cards available`)
    if (playActions.length > 0) {
      // Sort playable cards by High Stats Strategy
      const sortedPlayActions = playActions
        .map((action) => ({
          action,
          card: player1State.hand.find((c) => c.id === action.cardId),
        }))
        .filter((item) => item.card)
        .sort((a, b) => {
          // Primary: highest cost
          if (a.card.cost > b.card.cost) return -1
          if (a.card.cost < b.card.cost) return 1

          // Tiebreaker: highest combined stats
          const aStats =
            (a.card.lore || 0) +
            (a.card.strength || 0) +
            (a.card.willpower || 0)
          const bStats =
            (b.card.lore || 0) +
            (b.card.strength || 0) +
            (b.card.willpower || 0)
          return bStats - aStats
        })

      // SINGLE CARD PLAY: Create PLAY-only paths for each playable card
      sortedPlayActions.forEach(({ action, card }, index) => {
        paths.push({
          pathId: `T${turnNumber}-PLAY-ONLY-${index + 1}`,
          description: `PLAY ${card.name} only (no inkable cards)`,
          actions: [action],
          endState: {
            ink: player1State.getAvailableInk(),
            handSize: player1State.hand.length - 1, // -1 (played)
            boardSize: player1State.board.length + 1, // +1 (played)
            lore: card.lore || 0,
          },
          strategy: 'FALLBACK',
        })
      })

      // MULTI-CARD PLAY: Generate combinations of playable cards (fallback case)
      if (sortedPlayActions.length > 1) {
        console.log(
          `   🔥 Multi-Card Fallback: Generating ${sortedPlayActions.length} card combinations...`
        )

        const availableInk = player1State.getAvailableInk()

        // Generate all possible combinations of 2 cards
        for (let i = 0; i < sortedPlayActions.length; i++) {
          for (let j = i + 1; j < sortedPlayActions.length; j++) {
            const card1 = sortedPlayActions[i].card
            const action1 = sortedPlayActions[i].action
            const card2 = sortedPlayActions[j].card
            const action2 = sortedPlayActions[j].action

            const totalCost = card1.cost + card2.cost

            // Only include if total cost is affordable
            if (totalCost <= availableInk) {
              const totalLore = (card1.lore || 0) + (card2.lore || 0)
              const totalStats =
                (card1.lore || 0) +
                (card1.strength || 0) +
                (card1.willpower || 0) +
                (card2.lore || 0) +
                (card2.strength || 0) +
                (card2.willpower || 0)

              paths.push({
                pathId: `T${turnNumber}-PLAY-MULTI-${i + 1}-${j + 1}`,
                description: `PLAY ${card1.name} + ${card2.name} (no inkable cards)`,
                actions: [action1, action2],
                endState: {
                  ink: availableInk,
                  handSize: player1State.hand.length - 2, // -2 (played)
                  boardSize: player1State.board.length + 2, // +2 (played)
                  lore: totalLore,
                },
                strategy: 'FALLBACK',
                multiCard: true,
                totalCost: totalCost,
                totalStats: totalStats,
              })
            }
          }
        }

        // Generate all possible combinations of 3 cards (if ink allows)
        if (sortedPlayActions.length > 2) {
          for (let i = 0; i < sortedPlayActions.length; i++) {
            for (let j = i + 1; j < sortedPlayActions.length; j++) {
              for (let k = j + 1; k < sortedPlayActions.length; k++) {
                const card1 = sortedPlayActions[i].card
                const action1 = sortedPlayActions[i].action
                const card2 = sortedPlayActions[j].card
                const action2 = sortedPlayActions[j].action
                const card3 = sortedPlayActions[k].card
                const action3 = sortedPlayActions[k].action

                const totalCost = card1.cost + card2.cost + card3.cost

                // Only include if total cost is affordable
                if (totalCost <= availableInk) {
                  const totalLore =
                    (card1.lore || 0) + (card2.lore || 0) + (card3.lore || 0)
                  const totalStats =
                    (card1.lore || 0) +
                    (card1.strength || 0) +
                    (card1.willpower || 0) +
                    (card2.lore || 0) +
                    (card2.strength || 0) +
                    (card2.willpower || 0) +
                    (card3.lore || 0) +
                    (card3.strength || 0) +
                    (card3.willpower || 0)

                  paths.push({
                    pathId: `T${turnNumber}-PLAY-MULTI-${i + 1}-${j + 1}-${k + 1}`,
                    description: `PLAY ${card1.name} + ${card2.name} + ${card3.name} (no inkable cards)`,
                    actions: [action1, action2, action3],
                    endState: {
                      ink: availableInk,
                      handSize: player1State.hand.length - 3, // -3 (played)
                      boardSize: player1State.board.length + 3, // +3 (played)
                      lore: totalLore,
                    },
                    strategy: 'FALLBACK',
                    multiCard: true,
                    totalCost: totalCost,
                    totalStats: totalStats,
                  })
                }
              }
            }
          }
        }
      }
    } else {
      // ULTIMATE EDGE CASE: No actions possible
      console.log(`   ❌ ULTIMATE EDGE CASE: No actions possible`)
      paths.push({
        pathId: `T${turnNumber}-PASS-1`,
        description: `PASS (no actions possible)`,
        actions: [],
        endState: {
          ink: player1State.getAvailableInk(),
          handSize: player1State.hand.length,
          boardSize: player1State.board.length,
          lore: 0,
        },
        strategy: 'EMERGENCY',
      })
    }
  }

  // Deduplicate paths based on card names (not IDs)
  const uniquePaths = []
  const seenPaths = new Set()

  paths.forEach((path) => {
    // Create a unique key based on card names and end state
    const pathKey = `${path.description}-${path.endState.ink}-${path.endState.lore}`

    if (!seenPaths.has(pathKey)) {
      seenPaths.add(pathKey)
      uniquePaths.push(path)
    }
  })

  // Sort by strategy priority: PRIMARY > FALLBACK > EMERGENCY
  uniquePaths.sort((a, b) => {
    const strategyOrder = { PRIMARY: 0, FALLBACK: 1, EMERGENCY: 2 }
    return strategyOrder[a.strategy] - strategyOrder[b.strategy]
  })

  return uniquePaths
}

// Score a path
function scorePath(path, turnNumber) {
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
  if (path.multiCard) {
    // Multi-card play bonus
    score += path.totalCost * 4 // Higher bonus for multi-card plays
    score += path.totalStats * 2.5 // Higher stats bonus for multi-card plays
    score += 10 // Multi-card play efficiency bonus
  } else if (path.actions.length > 1) {
    // INK + PLAY path (single card)
    const playAction = path.actions.find((action) => action.type === 'play')
    if (playAction) {
      // Find the card that was played
      const baseGameState = GameStateFactory.createGameFromTestFormat(
        deckFormats.deck1,
        deckFormats.deck2,
        cardDatabase
      )
      const player1State = baseGameState.getPlayerState('player1')
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
    // PLAY only path (single card)
    const baseGameState = GameStateFactory.createGameFromTestFormat(
      deckFormats.deck1,
      deckFormats.deck2,
      cardDatabase
    )
    const player1State = baseGameState.getPlayerState('player1')
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

// Helper function to create a game state copy
function createGameStateCopy(originalGameState) {
  // For now, create a new game state and copy the essential data
  const newGameState = GameStateFactory.createGameFromTestFormat(
    deckFormats.deck1,
    deckFormats.deck2,
    cardDatabase
  )

  // Copy player states
  const originalPlayer1 = originalGameState.getPlayerState('player1')
  const originalPlayer2 = originalGameState.getPlayerState('player2')
  const newPlayer1 = newGameState.getPlayerState('player1')
  const newPlayer2 = newGameState.getPlayerState('player2')

  // Copy hand, inkwell, board, lore, and flags
  newPlayer1.hand = [...originalPlayer1.hand]
  newPlayer1.inkwell = [...originalPlayer1.inkwell]
  newPlayer1.board = [...originalPlayer1.board]
  newPlayer1.lore = originalPlayer1.lore
  newPlayer1.hasInkedThisTurn = originalPlayer1.hasInkedThisTurn

  newPlayer2.hand = [...originalPlayer2.hand]
  newPlayer2.inkwell = [...originalPlayer2.inkwell]
  newPlayer2.board = [...originalPlayer2.board]
  newPlayer2.lore = originalPlayer2.lore
  newPlayer2.hasInkedThisTurn = originalPlayer2.hasInkedThisTurn

  // Copy active player
  newGameState.activePlayer = { ...originalGameState.activePlayer }

  return newGameState
}

// Helper function to apply path actions to a game state
function applyPathActions(gameState, actions) {
  const player1State = gameState.getPlayerState('player1')

  for (const action of actions) {
    if (action.type === 'ink') {
      // Find and remove card from hand
      const cardIndex = player1State.hand.findIndex(
        (c) => c.id === action.cardId
      )
      if (cardIndex !== -1) {
        const card = player1State.hand[cardIndex]
        player1State.hand.splice(cardIndex, 1)

        // Add to inkwell
        const inkCard = {
          id: `${card.id}-ink`,
          name: card.name,
          type: card.type,
          cost: 0,
          inkable: true,
          lore: 0,
          strength: 0,
          willpower: 0,
          exerted: false,
        }
        player1State.inkwell.push(new ICardState(inkCard, true, false))
        player1State.hasInkedThisTurn = true
      }
    } else if (action.type === 'play') {
      // Find and remove card from hand
      const cardIndex = player1State.hand.findIndex(
        (c) => c.id === action.cardId
      )
      if (cardIndex !== -1) {
        const card = player1State.hand[cardIndex]
        player1State.hand.splice(cardIndex, 1)

        // Add to board
        const boardCard = {
          id: `${card.id}-board`,
          name: card.name,
          type: card.type,
          cost: card.cost,
          inkable: card.inkable,
          lore: card.lore,
          strength: card.strength,
          willpower: card.willpower,
          exerted: false,
        }
        player1State.board.push(new ICardState(boardCard, false, false)) // wet, not exerted
      }
    }
  }
}

// Display game tree in a readable format
function displayGameTree(gameTree, depth = 0) {
  const indent = '  '.repeat(depth)

  if (Array.isArray(gameTree)) {
    // Leaf node - just paths
    gameTree.forEach((path, index) => {
      console.log(
        `${indent}${index + 1}. ${path.pathId}: ${path.description} (Score: ${path.score})`
      )
    })
  } else if (gameTree.currentTurn) {
    // Branch node - has current turn and next turns
    console.log(`${indent}📊 Turn ${depth + 2} Paths:`)
    gameTree.currentTurn.forEach((path, index) => {
      console.log(
        `${indent}  ${index + 1}. ${path.pathId}: ${path.description} (Score: ${path.score})`
      )
    })

    if (gameTree.nextTurns && gameTree.nextTurns.length > 0) {
      console.log(`${indent}🌳 Next Turn Analysis:`)
      gameTree.nextTurns.forEach((nextTurn, index) => {
        console.log(
          `${indent}  📍 From ${nextTurn.parentPath.pathId} (Score: ${nextTurn.parentPath.score}):`
        )
        displayGameTree(nextTurn.nextTurnPaths, depth + 2)
      })
    }
  }
}

// Start full game analysis
console.log()
console.log('🚀 Starting full game analysis...')
console.log('==================================')

const gameTree = analyzeFullGame(baseGameState, 4)

console.log()
console.log('🎉 Full game analysis completed!')
console.log('=================================')
console.log()
console.log('📝 Summary:')
console.log('===========')
console.log('✅ 4-turn deep path analysis completed')
console.log('✅ Strategic decision trees generated')
console.log('✅ Full game simulation framework ready')
console.log()
console.log('🎯 Key Insights:')
console.log('   - Multi-turn strategic planning working')
console.log('   - Path branching demonstrates decision complexity')
console.log('   - Scoring system guides optimal play')
console.log('   - Ready for opponent modeling and win conditions')
