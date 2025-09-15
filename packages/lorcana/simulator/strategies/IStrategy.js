/**
 * Interface for game strategies
 * Each strategy defines how to evaluate and optimize game actions
 */
export class IStrategy {
  constructor(name, config = {}) {
    this.name = name
    this.config = config
  }

  /**
   * Score a path based on the strategy's evaluation criteria
   * @param {Object} path - The path to score
   * @param {Object} playerState - Current player state
   * @param {Object} gameState - Current game state
   * @param {number} turn - Current turn number
   * @returns {number} - Score for the path
   */
  scorePath(path, playerState, gameState, turn) {
    throw new Error('scorePath must be implemented by strategy')
  }

  /**
   * Get the strategy's scoring weights
   * @returns {Object} - Scoring weights for different factors
   */
  getScoringWeights() {
    throw new Error('getScoringWeights must be implemented by strategy')
  }

  /**
   * Determine if a card should be prioritized for inking
   * @param {Object} card - Card to evaluate
   * @param {Object} gameState - Current game state
   * @param {number} turn - Current turn number
   * @returns {number} - Priority score (higher = more priority)
   */
  getInkPriority(card, gameState, turn) {
    throw new Error('getInkPriority must be implemented by strategy')
  }

  /**
   * Determine if a card should be prioritized for playing
   * @param {Object} card - Card to evaluate
   * @param {Object} gameState - Current game state
   * @param {number} turn - Current turn number
   * @returns {number} - Priority score (higher = more priority)
   */
  getPlayPriority(card, gameState, turn) {
    throw new Error('getPlayPriority must be implemented by strategy')
  }

  /**
   * Get the strategy's name
   * @returns {string} - Strategy name
   */
  getName() {
    return this.name
  }

  /**
   * Get the strategy's configuration
   * @returns {Object} - Strategy configuration
   */
  getConfig() {
    return this.config
  }
}
