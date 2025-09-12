// Card action validator for Lorcana simulation

export class CardActionValidator {
  constructor() {
    this.validators = new Map()
    this.setupValidators()
  }

  setupValidators() {
    this.validators.set('ink', this.validateInkAction.bind(this))
    this.validators.set('play', this.validatePlayAction.bind(this))
    this.validators.set('quest', this.validateQuestAction.bind(this))
    this.validators.set('challenge', this.validateChallengeAction.bind(this))
    this.validators.set('sing', this.validateSingAction.bind(this))
    this.validators.set('draw', this.validateDrawAction.bind(this))
  }

  // Main validation method
  isActionValid(gameState, action) {
    const validator = this.validators.get(action.type)
    if (!validator) {
      return false
    }

    return validator(gameState, action)
  }

  // Validate ink action
  validateInkAction(gameState, action) {
    const { playerId, cardId } = action
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) return false

    const card = playerState.hand.find((card) => card.id === cardId)
    if (!card) return false

    // Check if card is inkable and player hasn't inked this turn
    return card.inkable === true && !playerState.hasInkedThisTurn
  }

  // Validate play action
  validatePlayAction(gameState, action) {
    const { playerId, cardId } = action
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) return false

    const card = playerState.hand.find((card) => card.id === cardId)
    if (!card) return false

    // Check if player has enough ink
    const availableInk = playerState.getAvailableInk()
    return card.cost <= availableInk
  }

  // Validate quest action
  validateQuestAction(gameState, action) {
    const { playerId, cardId } = action
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) return false

    const cardState = playerState.board.find((cs) => cs.card.id === cardId)
    if (!cardState) return false

    // Check if card is ready and dry and is a character
    return (
      cardState.isReady() &&
      cardState.dry &&
      cardState.card.type === 'character'
    )
  }

  // Validate challenge action
  validateChallengeAction(gameState, action) {
    const { playerId, cardId, targetId } = action
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) return false

    const attacker = playerState.board.find((cs) => cs.card.id === cardId)
    if (!attacker) return false

    // Find target on opponent's board
    const opponent = gameState.players.find((p) => p.id !== playerId)
    const opponentState = gameState.getPlayerState(opponent.id)
    const target = opponentState.board.find((cs) => cs.card.id === targetId)

    if (!target) return false

    // Check if attacker is ready and dry and both are characters
    return (
      attacker.isReady() &&
      attacker.dry &&
      attacker.card.type === 'character' &&
      target.card.type === 'character'
    )
  }

  // Validate sing action
  validateSingAction(gameState, action) {
    const { playerId, singerId, songId } = action
    const playerState = gameState.getPlayerState(playerId)

    if (!playerState) return false

    const singer = playerState.board.find((cs) => cs.card.id === singerId)
    const song = playerState.hand.find((card) => card.id === songId)

    if (!singer || !song) return false

    // Check if singer is ready and dry, song is a song, and singer can afford it
    return (
      singer.isReady() &&
      singer.dry &&
      singer.card.type === 'character' &&
      song.type === 'action - song' &&
      song.cost <= singer.card.cost
    )
  }

  // Validate draw action
  validateDrawAction(gameState, action) {
    const { playerId } = action
    const player = gameState.getPlayer(playerId)

    if (!player) return false

    // Can always draw if deck has cards
    return !player.activeDeck.isEmpty()
  }

  // Get all valid actions for a player
  getValidActions(gameState, playerId) {
    const playerState = gameState.getPlayerState(playerId)
    if (!playerState) return []

    const validActions = []

    // Check hand cards for ink/play actions
    for (const card of playerState.hand) {
      // Ink action
      if (
        this.validateInkAction(gameState, {
          type: 'ink',
          playerId,
          cardId: card.id,
        })
      ) {
        validActions.push({
          type: 'ink',
          playerId,
          cardId: card.id,
          cost: 0,
        })
      }

      // Play action
      if (
        this.validatePlayAction(gameState, {
          type: 'play',
          playerId,
          cardId: card.id,
        })
      ) {
        validActions.push({
          type: 'play',
          playerId,
          cardId: card.id,
          cost: card.cost,
        })
      }
    }

    // Check board cards for quest actions
    for (const cardState of playerState.board) {
      if (
        this.validateQuestAction(gameState, {
          type: 'quest',
          playerId,
          cardId: cardState.card.id,
        })
      ) {
        validActions.push({
          type: 'quest',
          playerId,
          cardId: cardState.card.id,
          cost: 0,
        })
      }
    }

    // Check for challenge actions
    for (const attacker of playerState.board) {
      for (const opponent of gameState.players) {
        if (opponent.id !== playerId) {
          const opponentState = gameState.getPlayerState(opponent.id)
          for (const target of opponentState.board) {
            if (
              this.validateChallengeAction(gameState, {
                type: 'challenge',
                playerId,
                cardId: attacker.card.id,
                targetId: target.card.id,
              })
            ) {
              validActions.push({
                type: 'challenge',
                playerId,
                cardId: attacker.card.id,
                targetId: target.card.id,
                cost: 0,
              })
            }
          }
        }
      }
    }

    // Check for sing actions
    for (const singer of playerState.board) {
      for (const song of playerState.hand) {
        if (
          this.validateSingAction(gameState, {
            type: 'sing',
            playerId,
            singerId: singer.card.id,
            songId: song.id,
          })
        ) {
          validActions.push({
            type: 'sing',
            playerId,
            singerId: singer.card.id,
            songId: song.id,
            cost: 0,
          })
        }
      }
    }

    // Check for draw action
    if (this.validateDrawAction(gameState, { type: 'draw', playerId })) {
      validActions.push({
        type: 'draw',
        playerId,
        cost: 0,
      })
    }

    // Add pass action if no other actions available
    if (validActions.length === 0) {
      validActions.push({
        type: 'pass',
        playerId,
        cost: 0,
      })
    }

    return validActions
  }
}
