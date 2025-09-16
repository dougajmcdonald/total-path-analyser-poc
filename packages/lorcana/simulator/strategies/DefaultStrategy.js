import { IStrategy } from './IStrategy.js'

/**
 * Default strategy implementation
 * Focuses on efficient ink usage and lore generation
 */
export class DefaultStrategy extends IStrategy {
  constructor(config = {}) {
    super('Default Strategy', {
      // Scoring weights
      loreWeight: 100,
      inkGainWeight: 50, // Increased: Ink building is very important
      inkUseWeight: 15, // Decreased: Using ink is less important than gaining it
      boardPresenceWeight: 40, // Increased: Board presence is crucial
      actionEfficiencyWeight: 20, // Increased: More actions per turn is better
      handSizeWeight: -2,
      turnProgressionWeight: 3,
      multiActionBonus: 30, // Increased: Multi-action paths are very valuable
      inkUtilizationBonus: 40, // Increased: Using all ink is very good
      earlyGameInkBonus: 35, // Increased: Early ink building is crucial
      lateGameLoreBonus: 20,
      highCostCardBonus: 25, // New: Bonus for playing high-cost cards
      inkRetentionBonus: 20, // New: Bonus for ending with more ink

      // Turn thresholds
      earlyGameThreshold: 3,
      lateGameThreshold: 3,

      // Card evaluation weights
      cardEfficiencyWeight: 1.0,
      cardCostWeight: 0.1,

      ...config,
    })
  }

  getScoringWeights() {
    return {
      loreWeight: this.config.loreWeight,
      inkGainWeight: this.config.inkGainWeight,
      inkUseWeight: this.config.inkUseWeight,
      boardPresenceWeight: this.config.boardPresenceWeight,
      actionEfficiencyWeight: this.config.actionEfficiencyWeight,
      handSizeWeight: this.config.handSizeWeight,
      turnProgressionWeight: this.config.turnProgressionWeight,
      multiActionBonus: this.config.multiActionBonus,
      inkUtilizationBonus: this.config.inkUtilizationBonus,
      earlyGameInkBonus: this.config.earlyGameInkBonus,
      lateGameLoreBonus: this.config.lateGameLoreBonus,
      highCostCardBonus: this.config.highCostCardBonus,
      inkRetentionBonus: this.config.inkRetentionBonus,
    }
  }

  scorePath(path, playerState, gameState, turn) {
    const weights = this.getScoringWeights()
    let score = 0

    const currentLore = playerState.lore || 0
    const currentInk = playerState.getAvailableInk
      ? playerState.getAvailableInk()
      : 0
    const currentBoardSize = playerState.board?.length || 0

    // Lore gain is the most valuable (primary win condition)
    const loreGained = path.endState.lore - currentLore
    score += loreGained * weights.loreWeight

    // Ink efficiency - prioritize using ink efficiently
    const inkUsed = currentInk - path.endState.ink
    const inkGained = path.endState.ink - currentInk
    score += inkGained * weights.inkGainWeight // Reward gaining ink
    score += inkUsed * weights.inkUseWeight // Reward using ink (but less than gaining it)

    // Board presence (characters that can quest)
    const boardGained = path.endState.boardSize - currentBoardSize
    score += boardGained * weights.boardPresenceWeight

    // Action efficiency - prefer more actions per turn
    score += path.actions.length * weights.actionEfficiencyWeight

    // Hand size management (slight penalty for having too many cards)
    const handSizeChange =
      path.endState.handSize - (playerState.hand?.length || 0)
    score += handSizeChange * weights.handSizeWeight // Slight penalty for keeping cards

    // Turn progression bonus (early game is more important)
    score += (10 - turn) * weights.turnProgressionWeight // Higher bonus for earlier turns

    // Efficiency bonus - reward paths that do multiple things
    if (path.actions.length > 1) {
      score += weights.multiActionBonus // Bonus for multi-action paths
    }

    // Ink utilization bonus - reward using all available ink
    if (inkUsed > 0 && path.endState.ink === 0) {
      score += weights.inkUtilizationBonus // Bonus for using all ink
    }

    // Early game ink building bonus
    if (turn <= this.config.earlyGameThreshold && inkGained > 0) {
      score += weights.earlyGameInkBonus // Extra bonus for building ink early
    }

    // Late game lore focus
    if (turn > this.config.lateGameThreshold) {
      score += loreGained * weights.lateGameLoreBonus // Extra lore bonus in late game
    }

    // High-cost card bonus - reward playing expensive cards
    const playActions = path.actions.filter((action) => action.type === 'play')
    if (playActions.length > 0) {
      const highestCostPlayed = Math.max(
        ...playActions.map((action) => action.cost || 0)
      )
      score += highestCostPlayed * weights.highCostCardBonus
    }

    // Ink retention bonus - reward ending with more ink
    if (path.endState.ink > currentInk) {
      score += (path.endState.ink - currentInk) * weights.inkRetentionBonus
    }

    // Quest efficiency bonus - reward questing with multiple characters
    const questActions = path.actions.filter(
      (action) => action.type === 'quest'
    )
    if (questActions.length > 1) {
      score += questActions.length * 15 // Bonus for questing multiple characters
    }

    return Math.round(score)
  }

  getInkPriority(card, gameState, turn) {
    // Early game: prioritize low-cost inkable cards
    if (turn <= this.config.earlyGameThreshold) {
      return (card.lore || 0) / Math.max(card.cost, 1) + (10 - card.cost) * 0.1
    }

    // Late game: prioritize high-value inkable cards
    return (card.lore || 0) / Math.max(card.cost, 1)
  }

  getPlayPriority(card, gameState, turn) {
    // Calculate efficiency (lore per cost)
    const efficiency = (card.lore || 0) / Math.max(card.cost, 1)

    // Base score from efficiency
    let score = efficiency

    // High-cost card bonus - prioritize expensive cards
    score += (card.cost || 0) * 0.5

    // Lore value bonus - prioritize high-lore cards
    score += (card.lore || 0) * 0.3

    // Early game: still prefer some efficiency but favor higher cost
    if (turn <= this.config.earlyGameThreshold) {
      score += (card.cost || 0) * 0.2 // Still reward higher cost even early
    }

    // Late game: heavily favor high-value cards
    if (turn > this.config.earlyGameThreshold) {
      score += (card.cost || 0) * 0.8 // Much higher bonus for expensive cards late game
    }

    return score
  }
}
