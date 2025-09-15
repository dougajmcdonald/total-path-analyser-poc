import cors from 'cors'
import express from 'express'
import { readFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Path to data files
const DATA_DIR = join(__dirname, '../../packages/lorcana/data-import/data')
const TEST_DATA_DIR = join(
  __dirname,
  '../../packages/lorcana/simulator/test-data'
)

// Helper function to read JSON files
async function readJsonFile(filename) {
  try {
    const filePath = join(DATA_DIR, filename)
    const data = await readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message)
    return null
  }
}

// Helper function to read test data files
async function readTestDataFile(filename) {
  try {
    const filePath = join(TEST_DATA_DIR, filename)
    const data = await readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading test data ${filename}:`, error.message)
    return null
  }
}

// API Routes with /api/lorcana prefix

// Get rule configurations
app.get('/api/lorcana/rule-configs', async (req, res) => {
  try {
    const configs = await readJsonFile('rule-configs.json')
    if (!configs) {
      return res.status(404).json({ error: 'Rule configs not found' })
    }
    res.json(configs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load rule configs' })
  }
})

// Get cards for a specific rule config
app.get('/api/lorcana/cards/:ruleConfig', async (req, res) => {
  try {
    const { ruleConfig } = req.params
    const cards = await readJsonFile(`latest-${ruleConfig}.json`)
    if (!cards) {
      return res
        .status(404)
        .json({ error: `Cards for ${ruleConfig} not found` })
    }
    res.json(cards)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load cards' })
  }
})

// Get statistics
app.get('/api/lorcana/stats', async (req, res) => {
  try {
    const stats = await readJsonFile('lorcana-stats.json')
    if (!stats) {
      return res.status(404).json({ error: 'Stats not found' })
    }
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load stats' })
  }
})

// Get test decks for simulation
app.get('/api/lorcana/test-decks', async (req, res) => {
  try {
    const testDecks = await readTestDataFile('test-decks.json')
    if (!testDecks) {
      return res.status(404).json({ error: 'Test decks not found' })
    }

    // Transform the data to include deck metadata
    const decks = Object.entries(testDecks).map(([key, deckData]) => ({
      id: key,
      name: `Test Deck ${key === 'deck1' ? '1' : '2'}`,
      description: `Pre-built test deck with ${deckData.length} card types`,
      cardCount: deckData.length,
      type: 'test',
      cards: deckData,
    }))

    res.json(decks)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load test decks' })
  }
})

// Analysis functions

// Optimal path analysis - find best path each turn and execute it
async function runOptimalAnalysis(gameState, config, StrategyFactory) {
  const simulationResults = []
  const strategy = StrategyFactory.createStrategy(
    config.strategy,
    config.strategyConfig || {}
  )

  for (let turn = 1; turn <= config.maxTurns; turn++) {
    const currentPlayer = gameState.getActivePlayer()
    const playerState = gameState.getPlayerState(currentPlayer.id)

    console.log(`Turn ${turn}: Analyzing optimal paths for ${currentPlayer.id}`)

    // Draw a card at the start of the turn (second player draws on turn 1, both players draw on turn 2+)
    if (
      currentPlayer.activeDeck &&
      typeof currentPlayer.activeDeck.drawRandomCard === 'function'
    ) {
      // First player doesn't draw on turn 1, second player does
      const shouldDraw = turn > 1 || currentPlayer.id === 'player2'
      if (shouldDraw) {
        const drawnCard = currentPlayer.activeDeck.drawRandomCard()
        if (drawnCard) {
          playerState.addToHand(drawnCard)
          console.log(`  Drew card: ${drawnCard.name}`)
        }
      }
    }

    // Generate all possible paths for this turn
    const paths = generateTurnPaths(gameState, currentPlayer.id, turn, strategy)

    // Score and sort paths using strategy
    const scoredPaths = paths
      .map((path) => ({
        ...path,
        score: strategy.scorePath(path, playerState, gameState, turn),
      }))
      .sort((a, b) => b.score - a.score)

    // Limit paths based on configuration
    const limitedPaths = config.showAllPaths
      ? scoredPaths
      : scoredPaths.slice(0, config.maxPathsPerTurn)

    // Create game states for each path (for display purposes)
    const pathsWithGameStates = limitedPaths.map((path) => ({
      ...path,
      gameState: simulatePathActions(gameState, path, currentPlayer.id),
    }))

    // EXECUTE the optimal path to update the actual game state
    if (scoredPaths.length > 0) {
      const optimalPath = scoredPaths[0] // Highest scoring path
      console.log(
        `Turn ${turn}: Executing optimal path: ${optimalPath.description} (score: ${optimalPath.score})`
      )

      // Execute the optimal path actions on the actual game state
      executePathActions(gameState, optimalPath, currentPlayer.id)
    }

    // Get the actual game state after executing the optimal path
    const finalPlayerState = gameState.getPlayerState(currentPlayer.id)
    const actualGameState = {
      hand: finalPlayerState.hand.map((card) => ({
        id: card.id,
        name: card.name,
        cost: card.cost,
        lore: card.lore || 0,
        inkable: card.inkable,
      })),
      inkwell: finalPlayerState.inkwell.map((cardState) => ({
        id: cardState.card.id,
        name: cardState.card.name,
        cost: cardState.card.cost,
        lore: cardState.card.lore || 0,
        exerted: cardState.exerted,
        dry: cardState.dry,
      })),
      board: finalPlayerState.board.map((cardState) => ({
        id: cardState.card.id,
        name: cardState.card.name,
        cost: cardState.card.cost,
        lore: cardState.card.lore || 0,
        exerted: cardState.exerted,
        dry: cardState.dry,
      })),
      lore: finalPlayerState.lore,
      availableInk: finalPlayerState.getAvailableInk
        ? finalPlayerState.getAvailableInk()
        : 0,
    }

    simulationResults.push({
      turnNumber: turn,
      activePlayer: currentPlayer.id,
      paths: pathsWithGameStates,
      totalPathsGenerated: paths.length,
      pathsReturned: pathsWithGameStates.length,
      optimalPathExecuted:
        scoredPaths.length > 0
          ? {
              ...scoredPaths[0],
              actualGameStateAfterExecution: actualGameState,
            }
          : null,
    })

    // Switch to next player for next turn
    gameState.switchPlayer()
  }

  return simulationResults
}

// Full permutation analysis - explore all possible paths
async function runFullAnalysis(gameState, config, StrategyFactory) {
  const simulationResults = []

  for (let turn = 1; turn <= config.maxTurns; turn++) {
    const currentPlayer = gameState.getActivePlayer()
    const playerState = gameState.getPlayerState(currentPlayer.id)

    console.log(
      `Turn ${turn}: Analyzing all permutations for ${currentPlayer.id}`
    )

    // Draw a card at the start of the turn (second player draws on turn 1, both players draw on turn 2+)
    if (
      currentPlayer.activeDeck &&
      typeof currentPlayer.activeDeck.drawRandomCard === 'function'
    ) {
      // First player doesn't draw on turn 1, second player does
      const shouldDraw = turn > 1 || currentPlayer.id === 'player2'
      if (shouldDraw) {
        const drawnCard = currentPlayer.activeDeck.drawRandomCard()
        if (drawnCard) {
          playerState.addToHand(drawnCard)
          console.log(`  Drew card: ${drawnCard.name}`)
        }
      }
    }

    // Generate all possible paths for this turn
    const strategy = StrategyFactory.createStrategy(
      config.strategy,
      config.strategyConfig || {}
    )
    const paths = generateAllTurnPaths(
      gameState,
      currentPlayer.id,
      turn,
      config.maxDepth,
      strategy
    )

    // Score and sort paths using strategy
    const scoredPaths = paths
      .map((path) => ({
        ...path,
        score: strategy.scorePath(path, playerState, gameState, turn),
      }))
      .sort((a, b) => b.score - a.score)

    // Limit paths based on configuration
    const limitedPaths = config.showAllPaths
      ? scoredPaths
      : scoredPaths.slice(0, config.maxPathsPerTurn)

    // Create game states for each path
    const pathsWithGameStates = limitedPaths.map((path) => ({
      ...path,
      gameState: simulatePathActions(gameState, path, currentPlayer.id),
    }))

    simulationResults.push({
      turnNumber: turn,
      activePlayer: currentPlayer.id,
      paths: pathsWithGameStates,
      totalPathsGenerated: paths.length,
      pathsReturned: pathsWithGameStates.length,
    })

    // Switch to next player for next turn
    gameState.switchPlayer()
  }

  return simulationResults
}

// Generate optimal turn paths with intelligent combinations
function generateTurnPaths(gameState, playerId, turn, strategy = null) {
  const playerState = gameState.getPlayerState(playerId)
  const hand = playerState.hand || []
  const availableInk = playerState.getAvailableInk
    ? playerState.getAvailableInk()
    : 0

  const paths = []

  if (hand.length === 0) {
    return [
      {
        pathId: `T${turn}-PASS-1`,
        description: `Turn ${turn} - Pass (no cards in hand)`,
        actions: [],
        endState: {
          ink: availableInk,
          handSize: 0,
          boardSize: playerState.board?.length || 0,
          lore: playerState.lore || 0,
        },
      },
    ]
  }

  // Helper functions
  const canPlay = (card) => availableInk >= card.cost
  const canPlayAfterInk = (card, inkCard) => availableInk + 1 >= card.cost
  const isInkable = (card) => card.inkable === true
  const playableCards = hand.filter(canPlay)
  const inkableCards = hand.filter(isInkable)

  // Sort cards by strategy priority or default efficiency
  const sortByStrategy = (cards, priorityFn) => {
    if (strategy && typeof priorityFn === 'function') {
      return cards.sort(
        (a, b) =>
          priorityFn(b, gameState, turn) - priorityFn(a, gameState, turn)
      )
    }
    // Fallback to efficiency sorting
    return cards.sort((a, b) => {
      const aEfficiency = (a.lore || 0) / Math.max(a.cost, 1)
      const bEfficiency = (b.lore || 0) / Math.max(b.cost, 1)
      if (Math.abs(aEfficiency - bEfficiency) < 0.01) {
        return a.cost - b.cost // Prefer cheaper cards if efficiency is similar
      }
      return bEfficiency - aEfficiency
    })
  }

  // Generate all possible action combinations
  const generateCombinations = () => {
    const combinations = []

    // 1. Ink only paths (prioritize using strategy)
    const sortedInkableCards = sortByStrategy(
      [...inkableCards],
      strategy?.getInkPriority.bind(strategy)
    )
    sortedInkableCards.forEach((inkCard, index) => {
      combinations.push({
        pathId: `T${turn}-INK-ONLY-${index + 1}`,
        description: `Turn ${turn} - Ink ${inkCard.name} only`,
        actions: [
          {
            type: 'ink',
            cardId: inkCard.id,
            cardName: inkCard.name,
            cardImage: inkCard.image,
            cost: inkCard.cost,
            lore: inkCard.lore || 0,
          },
        ],
        endState: {
          ink: availableInk + 1,
          handSize: hand.length - 1,
          boardSize: playerState.board?.length || 0,
          lore: playerState.lore || 0,
        },
      })
    })

    // 2. Play only paths (prioritize using strategy)
    const sortedPlayableCards = sortByStrategy(
      [...playableCards],
      strategy?.getPlayPriority.bind(strategy)
    )
    sortedPlayableCards.forEach((playCard, index) => {
      combinations.push({
        pathId: `T${turn}-PLAY-ONLY-${index + 1}`,
        description: `Turn ${turn} - Play ${playCard.name} only`,
        actions: [
          {
            type: 'play',
            cardId: playCard.id,
            cardName: playCard.name,
            cardImage: playCard.image,
            cost: playCard.cost,
            lore: playCard.lore || 0,
          },
        ],
        endState: {
          ink: availableInk - playCard.cost,
          handSize: hand.length - 1,
          boardSize: (playerState.board?.length || 0) + 1,
          lore: (playerState.lore || 0) + (playCard.lore || 0),
        },
      })
    })

    // 3. Ink + Play combinations (prioritize using strategy)
    sortedInkableCards.forEach((inkCard, inkIndex) => {
      const newInk = availableInk + 1
      const playableAfterInk = hand.filter(
        (card) => card.id !== inkCard.id && newInk >= card.cost
      )
      const sortedPlayableAfterInk = sortByStrategy(
        playableAfterInk,
        strategy?.getPlayPriority.bind(strategy)
      )

      sortedPlayableAfterInk.forEach((playCard, playIndex) => {
        combinations.push({
          pathId: `T${turn}-INK+PLAY-${inkIndex + 1}-${playIndex + 1}`,
          description: `Turn ${turn} - Ink ${inkCard.name} + Play ${playCard.name}`,
          actions: [
            {
              type: 'ink',
              cardId: inkCard.id,
              cardName: inkCard.name,
              cardImage: inkCard.image,
              cost: inkCard.cost,
              lore: inkCard.lore || 0,
            },
            {
              type: 'play',
              cardId: playCard.id,
              cardName: playCard.name,
              cardImage: playCard.image,
              cost: playCard.cost,
              lore: playCard.lore || 0,
            },
          ],
          endState: {
            ink: newInk - playCard.cost,
            handSize: hand.length - 2,
            boardSize: (playerState.board?.length || 0) + 1,
            lore: (playerState.lore || 0) + (playCard.lore || 0),
          },
        })
      })
    })

    // 4. Quest paths (if we have characters on board)
    if (playerState.board && playerState.board.length > 0) {
      const questingCharacters = sortByStrategy(
        [...playerState.board],
        strategy?.getPlayPriority.bind(strategy)
      )
      questingCharacters.forEach((character, index) => {
        // Handle both ICardState objects and plain card objects
        const card = character.card || character
        combinations.push({
          pathId: `T${turn}-QUEST-${index + 1}`,
          description: `Turn ${turn} - Quest with ${card.name}`,
          actions: [
            {
              type: 'quest',
              cardId: card.id,
              cardName: card.name,
              cardImage: card.image,
              cost: card.cost,
              lore: card.lore || 0,
            },
          ],
          endState: {
            ink: availableInk,
            handSize: hand.length,
            boardSize: playerState.board.length,
            lore: (playerState.lore || 0) + (card.lore || 0),
          },
        })
      })
    }

    // 5. Multi-action paths (Ink + Play + Quest if possible)
    if (
      inkableCards.length > 0 &&
      playableCards.length > 0 &&
      playerState.board &&
      playerState.board.length > 0
    ) {
      const bestInkCard = sortedInkableCards[0]
      const newInk = availableInk + 1
      const playableAfterInk = hand.filter(
        (card) => card.id !== bestInkCard.id && newInk >= card.cost
      )

      if (playableAfterInk.length > 0) {
        const bestPlayCard = sortByStrategy(
          playableAfterInk,
          strategy?.getPlayPriority.bind(strategy)
        )[0]
        const bestQuestCharacter = sortByStrategy(
          [...playerState.board],
          strategy?.getPlayPriority.bind(strategy)
        )[0]

        // Handle both ICardState objects and plain card objects
        const questCard = bestQuestCharacter.card || bestQuestCharacter

        combinations.push({
          pathId: `T${turn}-INK+PLAY+QUEST-1`,
          description: `Turn ${turn} - Ink ${bestInkCard.name} + Play ${bestPlayCard.name} + Quest ${questCard.name}`,
          actions: [
            {
              type: 'ink',
              cardId: bestInkCard.id,
              cardName: bestInkCard.name,
              cardImage: bestInkCard.image,
              cost: bestInkCard.cost,
              lore: bestInkCard.lore || 0,
            },
            {
              type: 'play',
              cardId: bestPlayCard.id,
              cardName: bestPlayCard.name,
              cardImage: bestPlayCard.image,
              cost: bestPlayCard.cost,
              lore: bestPlayCard.lore || 0,
            },
            {
              type: 'quest',
              cardId: questCard.id,
              cardName: questCard.name,
              cardImage: questCard.image,
              cost: questCard.cost,
              lore: questCard.lore || 0,
            },
          ],
          endState: {
            ink: newInk - bestPlayCard.cost,
            handSize: hand.length - 2,
            boardSize: (playerState.board?.length || 0) + 1,
            lore:
              (playerState.lore || 0) +
              (bestPlayCard.lore || 0) +
              (questCard.lore || 0),
          },
        })
      }
    }

    return combinations
  }

  return generateCombinations()
}

// Generate all possible turn paths (full mode)
function generateAllTurnPaths(
  gameState,
  playerId,
  turn,
  maxDepth,
  strategy = null
) {
  // For now, use the same logic as optimal mode
  // TODO: Implement full permutation generation
  return generateTurnPaths(gameState, playerId, turn, strategy)
}

// Note: Scoring is now handled by the strategy system
// The old scorePath function has been replaced with strategy.scorePath()

// Simulate path actions and return game state
function simulatePathActions(gameState, path, playerId) {
  const playerState = gameState.getPlayerState(playerId)
  const otherPlayerId = playerId === 'player1' ? 'player2' : 'player1'
  const otherPlayerState = gameState.getPlayerState(otherPlayerId)

  // Create simulated state
  const simulatedState = {
    hand: [...(playerState.hand || [])],
    board: [...(playerState.board || [])],
    inkwell: [...(playerState.inkwell || [])],
    lore: playerState.lore || 0,
    ink: playerState.getAvailableInk ? playerState.getAvailableInk() : 0,
  }

  // Apply actions
  path.actions.forEach((action) => {
    if (action.type === 'ink') {
      const cardIndex = simulatedState.hand.findIndex(
        (card) => card.id === action.cardId
      )
      if (cardIndex !== -1) {
        const card = simulatedState.hand.splice(cardIndex, 1)[0]
        simulatedState.inkwell.push({
          ...card,
          exerted: false,
          dry: true,
        })
        simulatedState.ink += 1
      }
    } else if (action.type === 'play') {
      const cardIndex = simulatedState.hand.findIndex(
        (card) => card.id === action.cardId
      )
      if (cardIndex !== -1) {
        const card = simulatedState.hand.splice(cardIndex, 1)[0]
        simulatedState.board.push({
          ...card,
          exerted: false,
          dry: true,
        })
        simulatedState.ink -= action.cost || 0
        simulatedState.lore += action.lore || 0
      }
    } else if (action.type === 'quest') {
      const characterIndex = simulatedState.board.findIndex(
        (card) => card.id === action.cardId
      )
      if (characterIndex !== -1) {
        simulatedState.lore += action.lore || 0
      }
    }
  })

  // Return formatted game state
  return {
    player1: {
      hand: (playerId === 'player1'
        ? simulatedState
        : otherPlayerState
      ).hand.map(formatCard),
      board: (playerId === 'player1'
        ? simulatedState
        : otherPlayerState
      ).board.map(formatCard),
      inkwell: (playerId === 'player1'
        ? simulatedState
        : otherPlayerState
      ).inkwell.map(formatCard),
      lore:
        playerId === 'player1'
          ? simulatedState.lore
          : otherPlayerState.lore || 0,
      ink:
        playerId === 'player1'
          ? simulatedState.ink
          : otherPlayerState.getAvailableInk
            ? otherPlayerState.getAvailableInk()
            : 0,
    },
    player2: {
      hand: (playerId === 'player2'
        ? simulatedState
        : otherPlayerState
      ).hand.map(formatCard),
      board: (playerId === 'player2'
        ? simulatedState
        : otherPlayerState
      ).board.map(formatCard),
      inkwell: (playerId === 'player2'
        ? simulatedState
        : otherPlayerState
      ).inkwell.map(formatCard),
      lore:
        playerId === 'player2'
          ? simulatedState.lore
          : otherPlayerState.lore || 0,
      ink:
        playerId === 'player2'
          ? simulatedState.ink
          : otherPlayerState.getAvailableInk
            ? otherPlayerState.getAvailableInk()
            : 0,
    },
  }
}

// Execute path actions on the actual game state (not a copy)
function executePathActions(gameState, path, playerId) {
  const playerState = gameState.getPlayerState(playerId)

  if (!playerState) {
    console.error(`Player ${playerId} not found`)
    return
  }

  console.log(`Executing ${path.actions.length} actions for ${playerId}:`)

  // Execute each action in the path on the real game state
  path.actions.forEach((action, index) => {
    console.log(`  Action ${index + 1}: ${action.type} ${action.cardName}`)

    switch (action.type) {
      case 'ink':
        // Remove card from hand and add to inkwell
        const inkCardIndex = playerState.hand.findIndex(
          (card) => card.id === action.cardId
        )
        if (inkCardIndex !== -1) {
          const inkCard = playerState.hand.splice(inkCardIndex, 1)[0]
          // Create proper ICardState for inkwell
          const inkCardState = {
            card: inkCard,
            dry: true,
            exerted: false,
            isReady: function () {
              return !this.exerted && this.dry
            },
            exert: function () {
              this.exerted = true
            },
            ready: function () {
              this.exerted = false
            },
            dry: function () {
              this.dry = true
            },
            wet: function () {
              this.dry = false
            },
          }
          playerState.inkwell.push(inkCardState)
          console.log(
            `    Inked ${inkCard.name}, inkwell now has ${playerState.inkwell.length} cards`
          )
        }
        break

      case 'play':
        // Remove card from hand and add to board
        const playCardIndex = playerState.hand.findIndex(
          (card) => card.id === action.cardId
        )
        if (playCardIndex !== -1) {
          const playCard = playerState.hand.splice(playCardIndex, 1)[0]
          // Create proper ICardState for board
          const playCardState = {
            card: playCard,
            dry: false, // Newly played cards are wet
            exerted: false,
            isReady: function () {
              return !this.exerted && this.dry
            },
            exert: function () {
              this.exerted = true
            },
            ready: function () {
              this.exerted = false
            },
            dry: function () {
              this.dry = true
            },
            wet: function () {
              this.dry = false
            },
          }
          playerState.board.push(playCardState)
          console.log(
            `    Played ${playCard.name}, board now has ${playerState.board.length} cards`
          )
        }
        break

      case 'quest':
        // Exert a character on the board and gain lore
        const questCardIndex = playerState.board.findIndex(
          (card) => card.id === action.cardId
        )
        if (questCardIndex !== -1) {
          playerState.board[questCardIndex].exerted = true
          playerState.lore += action.lore || 0
          console.log(
            `    Quested with ${action.cardName} (+${action.lore || 0} lore)`
          )
        }
        break

      default:
        console.warn(`Unknown action type: ${action.type}`)
    }
  })

  console.log(
    `  Final state - Hand: ${playerState.hand.length}, Inkwell: ${playerState.inkwell.length}, Board: ${playerState.board.length}, Lore: ${playerState.lore}`
  )
}

// Format card for response
function formatCard(card) {
  return {
    id: card.id,
    name: card.name,
    image: card.image,
    cost: card.cost,
    inkable: card.inkable || false,
    lore: card.lore || 0,
    exerted: card.exerted || false,
    dry: card.dry !== false,
  }
}

// Health check
app.get('/api/lorcana/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Run simulation endpoint
app.post('/api/lorcana/simulate', async (req, res) => {
  try {
    const {
      player1Deck,
      player2Deck,
      firstPlayer,
      strategy,
      maxTurns,
      analysisMode = 'optimal', // 'optimal' or 'full'
      maxPathsPerTurn = 5, // Maximum paths to return per turn
      maxDepth = 3, // Maximum depth for full analysis
      showAllPaths = false, // Whether to show all paths or just top N
    } = req.body

    // Validate required parameters
    if (!player1Deck || !player2Deck) {
      return res
        .status(400)
        .json({ error: 'Both player1Deck and player2Deck are required' })
    }

    // Validate analysis mode
    if (!['optimal', 'full'].includes(analysisMode)) {
      return res
        .status(400)
        .json({ error: 'analysisMode must be either "optimal" or "full"' })
    }

    // Set defaults for missing parameters
    const config = {
      player1Deck,
      player2Deck,
      firstPlayer: firstPlayer || 'random',
      strategy: strategy || 'High Stats Strategy',
      maxTurns: maxTurns || 3,
      analysisMode,
      maxPathsPerTurn: Math.max(1, Math.min(maxPathsPerTurn, 20)), // Clamp between 1-20
      maxDepth: Math.max(1, Math.min(maxDepth, 10)), // Clamp between 1-10
      showAllPaths: showAllPaths || false,
    }

    console.log('Simulation config:', config)

    // Import simulator modules
    const { GameStateFactory, TestDataLoader, StrategyFactory } = await import(
      '../../packages/lorcana/simulator/index.js'
    )

    // Load card database and test decks
    const cardDatabase = TestDataLoader.loadCardDatabase()
    const deckFormats = TestDataLoader.getDeckFormats()

    // Handle deck selection - if string IDs, use test decks; otherwise use provided formats
    let deck1Format, deck2Format

    if (typeof player1Deck === 'string') {
      deck1Format = deckFormats[player1Deck] || deckFormats.deck1
    } else {
      deck1Format = player1Deck
    }

    if (typeof player2Deck === 'string') {
      deck2Format = deckFormats[player2Deck] || deckFormats.deck2
    } else {
      deck2Format = player2Deck
    }

    // Create game state from deck formats
    const gameState = GameStateFactory.createGameFromTestFormat(
      deck1Format,
      deck2Format,
      cardDatabase
    )

    // Set first player if specified
    if (config.firstPlayer && config.firstPlayer !== 'random') {
      gameState.setActivePlayer(config.firstPlayer)
    }

    // Run simulation based on analysis mode
    const simulationResults = []

    if (config.analysisMode === 'optimal') {
      // Optimal path analysis - find best path each turn
      simulationResults.push(
        ...(await runOptimalAnalysis(gameState, config, StrategyFactory))
      )
    } else {
      // Full permutation analysis - explore all possible paths
      simulationResults.push(
        ...(await runFullAnalysis(gameState, config, StrategyFactory))
      )
    }

    // Return simulation results

    // Return simulation results
    res.json({
      success: true,
      simulation: {
        gameId: `sim-${Date.now()}`,
        config: {
          strategy: config.strategy,
          maxTurns: config.maxTurns,
          analysisMode: config.analysisMode,
          maxPathsPerTurn: config.maxPathsPerTurn,
          maxDepth: config.maxDepth,
          showAllPaths: config.showAllPaths,
        },
        summary: {
          totalTurns: simulationResults.length,
          totalPaths: simulationResults.reduce(
            (sum, turn) => sum + turn.paths.length,
            0
          ),
          totalPathsGenerated: simulationResults.reduce(
            (sum, turn) => sum + turn.totalPathsGenerated,
            0
          ),
          averagePathsPerTurn:
            simulationResults.length > 0
              ? Math.round(
                  simulationResults.reduce(
                    (sum, turn) => sum + turn.paths.length,
                    0
                  ) / simulationResults.length
                )
              : 0,
          optimalPathSummary: simulationResults.map((turn) => ({
            turnNumber: turn.turnNumber,
            activePlayer: turn.activePlayer,
            optimalPath: turn.optimalPathExecuted
              ? {
                  description: turn.optimalPathExecuted.description,
                  score: turn.optimalPathExecuted.score,
                  actions: turn.optimalPathExecuted.actions.map((action) => ({
                    type: action.type,
                    cardName: action.cardName,
                    cost: action.cost,
                  })),
                  finalGameState: {
                    handSize:
                      turn.optimalPathExecuted.actualGameStateAfterExecution
                        ?.hand.length || 0,
                    inkwellSize:
                      turn.optimalPathExecuted.actualGameStateAfterExecution
                        ?.inkwell.length || 0,
                    boardSize:
                      turn.optimalPathExecuted.actualGameStateAfterExecution
                        ?.board.length || 0,
                    lore:
                      turn.optimalPathExecuted.actualGameStateAfterExecution
                        ?.lore || 0,
                    availableInk:
                      turn.optimalPathExecuted.actualGameStateAfterExecution
                        ?.availableInk || 0,
                  },
                }
              : null,
          })),
        },
        turns: simulationResults,
      },
    })
  } catch (error) {
    console.error('Simulation error:', error)
    res.status(500).json({
      error: 'Simulation failed',
      details: error.message,
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(
    `📊 API endpoints available at http://localhost:${PORT}/api/lorcana/`
  )
})
