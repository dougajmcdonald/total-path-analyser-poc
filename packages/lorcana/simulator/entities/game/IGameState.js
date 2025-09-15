// Game state interface for simulation

export class IGameState {
  constructor(id, players = []) {
    this.id = id
    this.players = players
    this.activePlayer = null
    this.turn = 1
    this.playerStates = [] // IPlayerState[]
    this.winner = null
    this.phase = 'ready'
  }

  // Initialize game with players
  initializeGame() {
    this.playerStates = this.players.map((player) => {
      const playerState = player.initializeForGame(this.id)
      return playerState
    })

    // Randomly determine who goes first
    this.activePlayer = this.players[Math.random() < 0.5 ? 0 : 1]
    this.phase = 'ready'
  }

  // Get current active player
  getActivePlayer() {
    return this.activePlayer
  }

  // Set active player by ID
  setActivePlayer(playerId) {
    const player = this.players.find((p) => p.id === playerId)
    if (player) {
      this.activePlayer = player
    }
    return this
  }

  // Get active player state
  getActivePlayerState() {
    return this.activePlayer?.getState()
  }

  // Switch to next player
  switchPlayer() {
    const currentIndex = this.players.findIndex(
      (p) => p.id === this.activePlayer.id
    )
    const nextIndex = (currentIndex + 1) % this.players.length
    this.activePlayer = this.players[nextIndex]

    if (nextIndex === 0) {
      this.turn++
    }

    this.phase = 'ready'

    // Ready the new current player for their turn
    this.readyPlayer(this.activePlayer.id)
  }

  // Ready a player for their turn
  readyPlayer(playerId) {
    const playerState = this.getPlayerState(playerId)
    if (!playerState) return

    // Ready all exerted ink
    playerState.inkwell.forEach((ink) => {
      ink.exerted = false
    })

    // Ready exerted board cards and transition drying cards to dry
    playerState.board.forEach((card) => {
      if (card.exerted) {
        // Check if it's an ICardState object or plain object
        if (typeof card.ready === 'function') {
          card.ready()
        } else {
          card.exerted = false
        }
      }
      // Check if it's an ICardState object or plain object
      if (typeof card.isReady === 'function') {
        if (!card.isReady()) {
          if (typeof card.dry === 'function') {
            card.dry()
          } else {
            card.dry = true
          }
        }
      } else {
        // For plain objects, just ensure dry is true
        if (!card.dry) {
          card.dry = true
        }
      }
    })

    // Reset inking flag for new turn
    playerState.hasInkedThisTurn = false
  }

  // Check if game is over
  isGameOver() {
    for (const player of this.players) {
      if (player.hasWon()) {
        this.winner = player.id
        return true
      }
    }
    return false
  }

  // Get player by ID
  getPlayer(playerId) {
    return this.players.find((p) => p.id === playerId)
  }

  // Get player state by ID
  getPlayerState(playerId) {
    return this.playerStates.find((ps) => ps.playerId === playerId)
  }

  // Get all player states
  getAllPlayerStates() {
    return [...this.playerStates]
  }

  // Set game phase
  setPhase(phase) {
    this.phase = phase
  }

  // Get current phase
  getPhase() {
    return this.phase
  }

  // Get turn number
  getTurn() {
    return this.turn
  }

  // Get winner
  getWinner() {
    return this.winner
  }
}
