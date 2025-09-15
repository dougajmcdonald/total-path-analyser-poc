import { DefaultStrategy } from './DefaultStrategy.js'

/**
 * Factory for creating strategy instances
 */
export class StrategyFactory {
  static strategies = new Map()

  /**
   * Register a strategy class
   * @param {string} name - Strategy name
   * @param {Class} strategyClass - Strategy class constructor
   */
  static registerStrategy(name, strategyClass) {
    this.strategies.set(name, strategyClass)
  }

  /**
   * Create a strategy instance
   * @param {string} name - Strategy name
   * @param {Object} config - Strategy configuration
   * @returns {IStrategy} - Strategy instance
   */
  static createStrategy(name, config = {}) {
    const StrategyClass = this.strategies.get(name)
    if (!StrategyClass) {
      throw new Error(
        `Strategy '${name}' not found. Available strategies: ${Array.from(this.strategies.keys()).join(', ')}`
      )
    }
    return new StrategyClass(config)
  }

  /**
   * Get available strategy names
   * @returns {string[]} - Array of strategy names
   */
  static getAvailableStrategies() {
    return Array.from(this.strategies.keys())
  }

  /**
   * Check if a strategy exists
   * @param {string} name - Strategy name
   * @returns {boolean} - True if strategy exists
   */
  static hasStrategy(name) {
    return this.strategies.has(name)
  }
}

// Register default strategies
StrategyFactory.registerStrategy('Default Strategy', DefaultStrategy)
StrategyFactory.registerStrategy('default', DefaultStrategy)
