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
      inkGainWeight: 25,
      inkUseWeight: 20,
      boardPresenceWeight: 30,
      actionEfficiencyWeight: 15,
      handSizeWeight: -2,
      turnProgressionWeight: 3,
      multiActionBonus: 20,
      inkUtilizationBonus: 30,
      earlyGameInkBonus: 25,
      lateGameLoreBonus: 20,

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

    // Early game: prefer cheaper cards
    if (turn <= this.config.earlyGameThreshold) {
      return efficiency + (10 - card.cost) * this.config.cardCostWeight
    }

    // Late game: prefer high-value cards
    return efficiency + (card.lore || 0) * this.config.cardEfficiencyWeight
  }
}
