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

// Health check
app.get('/api/lorcana/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Run simulation endpoint
app.post('/api/lorcana/simulate', async (req, res) => {
  try {
    const { player1Deck, player2Deck, firstPlayer, strategy, maxTurns } =
      req.body

    // Validate required parameters
    if (!player1Deck || !player2Deck) {
      return res
        .status(400)
        .json({ error: 'Both player1Deck and player2Deck are required' })
    }

    // Import simulator modules
    const { GameStateFactory, TestDataLoader } = await import(
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
    if (firstPlayer && firstPlayer !== 'random') {
      gameState.setActivePlayer(firstPlayer)
    }

    // For now, return a simple simulation result with the initial game state
    // This will be replaced with actual simulation logic later
    const simulationResults = []

    for (let turn = 1; turn <= maxTurns; turn++) {
      const currentPlayer = gameState.getActivePlayer()
      const playerState = gameState.getPlayerState(currentPlayer.id)

      // Create mock paths for this turn using real card data
      const hand = playerState.hand || []
      const mockPaths = []

      if (hand.length > 0) {
        // Create a path that inks the first card and plays the second (if available)
        const inkCard = hand[0]
        const playCard = hand[1] || hand[0] // Use same card if only one available

        mockPaths.push({
          pathId: `T${turn}-INK+PLAY-1`,
          score: 85.5 + turn * 10,
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
            ink: (playerState.ink || 0) + 1,
            handSize: Math.max(0, (playerState.hand?.length || 0) - 2),
            boardSize: (playerState.board?.length || 0) + 1,
            lore: (playerState.lore || 0) + (playCard.lore || 0),
          },
        })

        // Create a path that only inks a card
        if (hand.length > 1) {
          const inkOnlyCard = hand[1]
          mockPaths.push({
            pathId: `T${turn}-INK-ONLY-1`,
            score: 45.5 + turn * 5,
            description: `Turn ${turn} - Ink ${inkOnlyCard.name} only`,
            actions: [
              {
                type: 'ink',
                cardId: inkOnlyCard.id,
                cardName: inkOnlyCard.name,
                cardImage: inkOnlyCard.image,
                cost: inkOnlyCard.cost,
                lore: inkOnlyCard.lore || 0,
              },
            ],
            endState: {
              ink: (playerState.ink || 0) + 1,
              handSize: Math.max(0, (playerState.hand?.length || 0) - 1),
              boardSize: playerState.board?.length || 0,
              lore: playerState.lore || 0,
            },
          })
        }
      }

      // Create game states for each path by simulating the actions
      const pathsWithGameStates = mockPaths.map((path, pathIndex) => {
        // Get the current game state data (not the object with methods)
        const currentPlayer1State = gameState.getPlayerState('player1')
        const currentPlayer2State = gameState.getPlayerState('player2')

        // Simulate the path's actions to get the resulting game state
        const simulatedPlayerState = {
          hand: [...(playerState.hand || [])],
          board: [...(playerState.board || [])],
          inkwell: [...(playerState.inkwell || [])],
          lore: playerState.lore || 0,
          ink: playerState.ink || 0,
        }

        // Apply the path's actions
        path.actions.forEach((action) => {
          if (action.type === 'ink') {
            // Remove card from hand and add to inkwell
            const cardIndex = simulatedPlayerState.hand.findIndex(
              (card) => card.id === action.cardId
            )
            if (cardIndex !== -1) {
              const card = simulatedPlayerState.hand.splice(cardIndex, 1)[0]
              simulatedPlayerState.inkwell.push({
                ...card,
                exerted: false,
                dry: true,
              })
              simulatedPlayerState.ink += 1
            }
          } else if (action.type === 'play') {
            // Remove card from hand and add to board
            const cardIndex = simulatedPlayerState.hand.findIndex(
              (card) => card.id === action.cardId
            )
            if (cardIndex !== -1) {
              const card = simulatedPlayerState.hand.splice(cardIndex, 1)[0]
              simulatedPlayerState.board.push({
                ...card,
                exerted: false,
                dry: true,
              })
              simulatedPlayerState.lore += action.lore || 0
            }
          }
        })

        // Create the game state for this path
        const pathGameStateResult = {
          player1: {
            hand: (currentPlayer1State?.hand || []).map((card) => ({
              id: card.id,
              name: card.name,
              image: card.image,
              cost: card.cost,
              lore: card.lore || 0,
              exerted: card.exerted || false,
              dry: card.dry !== false,
            })),
            board: (currentPlayer1State?.board || []).map((card) => ({
              id: card.id,
              name: card.name,
              image: card.image,
              cost: card.cost,
              lore: card.lore || 0,
              exerted: card.exerted || false,
              dry: card.dry !== false,
            })),
            inkwell: (currentPlayer1State?.inkwell || []).map((card) => ({
              id: card.id,
              name: card.name,
              image: card.image,
              cost: card.cost,
              exerted: card.exerted || false,
            })),
            lore: currentPlayer1State?.lore || 0,
            ink: currentPlayer1State?.ink || 0,
          },
          player2: {
            hand: (currentPlayer2State?.hand || []).map((card) => ({
              id: card.id,
              name: card.name,
              image: card.image,
              cost: card.cost,
              lore: card.lore || 0,
              exerted: card.exerted || false,
              dry: card.dry !== false,
            })),
            board: (currentPlayer2State?.board || []).map((card) => ({
              id: card.id,
              name: card.name,
              image: card.image,
              cost: card.cost,
              lore: card.lore || 0,
              exerted: card.exerted || false,
              dry: card.dry !== false,
            })),
            inkwell: (currentPlayer2State?.inkwell || []).map((card) => ({
              id: card.id,
              name: card.name,
              image: card.image,
              cost: card.cost,
              exerted: card.exerted || false,
            })),
            lore: currentPlayer2State?.lore || 0,
            ink: currentPlayer2State?.ink || 0,
          },
        }

        // Update the active player's state with the simulated actions
        if (currentPlayer.id === 'player1') {
          pathGameStateResult.player1 = {
            hand: simulatedPlayerState.hand.map((card) => ({
              id: card.id,
              name: card.name,
              image: card.image,
              cost: card.cost,
              lore: card.lore || 0,
              exerted: card.exerted || false,
              dry: card.dry !== false,
            })),
            board: simulatedPlayerState.board.map((card) => ({
              id: card.id,
              name: card.name,
              image: card.image,
              cost: card.cost,
              lore: card.lore || 0,
              exerted: card.exerted || false,
              dry: card.dry !== false,
            })),
            inkwell: simulatedPlayerState.inkwell.map((card) => ({
              id: card.id,
              name: card.name,
              image: card.image,
              cost: card.cost,
              exerted: card.exerted || false,
            })),
            lore: simulatedPlayerState.lore,
            ink: simulatedPlayerState.ink,
          }
        } else {
          pathGameStateResult.player2 = {
            hand: simulatedPlayerState.hand.map((card) => ({
              id: card.id,
              name: card.name,
              image: card.image,
              cost: card.cost,
              lore: card.lore || 0,
              exerted: card.exerted || false,
              dry: card.dry !== false,
            })),
            board: simulatedPlayerState.board.map((card) => ({
              id: card.id,
              name: card.name,
              image: card.image,
              cost: card.cost,
              lore: card.lore || 0,
              exerted: card.exerted || false,
              dry: card.dry !== false,
            })),
            inkwell: simulatedPlayerState.inkwell.map((card) => ({
              id: card.id,
              name: card.name,
              image: card.image,
              cost: card.cost,
              exerted: card.exerted || false,
            })),
            lore: simulatedPlayerState.lore,
            ink: simulatedPlayerState.ink,
          }
        }

        return {
          ...path,
          gameState: pathGameStateResult,
        }
      })

      simulationResults.push({
        turnNumber: turn,
        activePlayer: currentPlayer.id,
        paths: pathsWithGameStates,
      })

      // Switch to next player
      gameState.switchPlayer()
    }

    // Return simulation results
    res.json({
      success: true,
      simulation: {
        gameId: `sim-${Date.now()}`,
        strategy: strategy || 'High Stats Strategy',
        maxTurns: maxTurns,
        totalPaths: simulationResults.reduce(
          (sum, turn) => sum + turn.paths.length,
          0
        ),
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
