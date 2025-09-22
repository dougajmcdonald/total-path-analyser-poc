import cors from 'cors'
import express from 'express'
import { runFullAnalysis, runOptimalAnalysis } from './analysisLogic.js'
import { readJsonFile, readTestDataFile } from './helpers.js'

export function createApp() {
  const app = express()
  const PORT = process.env.PORT || 3001

  // CORS configuration
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://lorcanapaths.com',
        'https://www.lorcanapaths.com',
        'https://total-path-analyser-poc-backend-tau.vercel.app',
        'https://total-path-analyser-poc-frontend.vercel.app', // Frontend Vercel URL
      ]

      // Also allow any subdomain of lorcanapaths.com
      const isLorcanapathsDomain =
        origin &&
        (origin.includes('lorcanapaths.com') || origin.endsWith('.vercel.app')) // Allow Vercel preview deployments

      if (allowedOrigins.includes(origin) || isLorcanapathsDomain) {
        console.log('CORS allowed origin:', origin)
        callback(null, true)
      } else {
        console.log('CORS blocked origin:', origin)
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }

  // Middleware
  app.use(cors(corsOptions))
  app.use(express.json())

  // Debug middleware to log requests
  app.use((req, res, next) => {
    console.log(
      `${req.method} ${req.path} - Origin: ${req.get('Origin') || 'No Origin'}`
    )
    next()
  })

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
        strategy: strategy || 'Default Strategy',
        maxTurns: maxTurns || 3,
        analysisMode,
        maxPathsPerTurn: Math.max(1, Math.min(maxPathsPerTurn, 20)), // Clamp between 1-20
        maxDepth: Math.max(1, Math.min(maxDepth, 10)), // Clamp between 1-10
        showAllPaths: showAllPaths || false,
      }

      console.log('Simulation config:', config)

      // Import simulator modules
      const { GameStateFactory, StrategyFactory } = await import(
        '../../../packages/lorcana/simulator/index.js'
      )

      // Import local data loader
      const { LocalDataLoader } = await import('./dataLoader.js')

      // Load card database and test decks
      const cardDatabase = LocalDataLoader.loadCardDatabase()
      const deckFormats = LocalDataLoader.getDeckFormats()

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

  return app
}
