// Browser-compatible analyser

import { loadLorcanaCards } from "@total-path/lorcana-data-import/browser.js"
import { CardTypes, GameRules } from "@total-path/lorcana-rules"
import { validateCards } from "@total-path/lorcana-types"

/**
 * Main analyser class for path analysis and strategy insights (Browser version)
 */
export class Analyser {
  constructor () {
    this.gameRules = GameRules
    this.cardTypes = CardTypes
  }

  /**
   * Analyze card data and provide insights
   * @param {Array} cards - Array of card data
   * @returns {Object} Analysis results
   */
  analyze (cards) {
    const validatedCards = validateCards(cards)

    return {
      totalCards: validatedCards.length,
      cardTypeDistribution: this.getCardTypeDistribution(validatedCards),
      averageCost: this.calculateAverageCost(validatedCards),
      colorDistribution: this.getColorDistribution(validatedCards),
      recommendations: this.generateRecommendations(validatedCards),
    }
  }

  /**
   * Get distribution of card types
   * @param {Array} cards - Array of card data
   * @returns {Object} Type distribution
   */
  getCardTypeDistribution (cards) {
    const distribution = {}
    cards.forEach((card) => {
      const type = card.type || "unknown"
      distribution[type] = (distribution[type] || 0) + 1
    })
    return distribution
  }

  /**
   * Calculate average cost of cards
   * @param {Array} cards - Array of card data
   * @returns {number} Average cost
   */
  calculateAverageCost (cards) {
    const cardsWithCost = cards.filter((card) => typeof card.cost === "number")
    if (cardsWithCost.length === 0) return 0

    const totalCost = cardsWithCost.reduce((sum, card) => sum + card.cost, 0)
    return Math.round((totalCost / cardsWithCost.length) * 100) / 100
  }

  /**
   * Get distribution of card colors
   * @param {Array} cards - Array of card data
   * @returns {Object} Color distribution
   */
  getColorDistribution (cards) {
    const distribution = {}
    cards.forEach((card) => {
      const color = card.color || "unknown"
      distribution[color] = (distribution[color] || 0) + 1
    })
    return distribution
  }

  /**
   * Generate strategy recommendations based on card data
   * @param {Array} cards - Array of card data
   * @returns {Array} Array of recommendations
   */
  generateRecommendations (cards) {
    const recommendations = []

    // Analyze color distribution
    const colorDist = this.getColorDistribution(cards)
    const mostCommonColor = Object.entries(colorDist).sort(
      ([, a], [, b]) => b - a,
    )[0]

    if (mostCommonColor) {
      recommendations.push({
        type: "color_balance",
        message: `Consider balancing your deck - ${mostCommonColor[0]} cards make up ${Math.round((mostCommonColor[1] / cards.length) * 100)}% of your collection`,
        priority: "medium",
      })
    }

    // Analyze cost distribution
    const avgCost = this.calculateAverageCost(cards)
    if (avgCost > 4) {
      recommendations.push({
        type: "cost_curve",
        message: `Your average card cost is ${avgCost}. Consider adding more low-cost cards for better early game presence`,
        priority: "high",
      })
    }

    // Analyze card types
    const typeDist = this.getCardTypeDistribution(cards)
    const characterCount = typeDist.character || 0
    const actionCount = typeDist.action || 0

    if (characterCount < actionCount) {
      recommendations.push({
        type: "deck_composition",
        message:
          "You have more action cards than characters. Consider adding more characters for board presence",
        priority: "medium",
      })
    }

    return recommendations
  }
}

/**
 * Convenience function to analyze Lorcana data in browser by rule config
 * @param {string} ruleConfig - Rule configuration key (default: "core-constructed")
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeLorcanaData (ruleConfig = "core-constructed") {
  const analyser = new Analyser()
  const cards = await loadLorcanaCards(ruleConfig)
  return analyser.analyze(cards)
}

/**
 * Get basic card statistics by rule config
 * @param {string} ruleConfig - Rule configuration key (default: "core-constructed")
 * @returns {Promise<Object>} Card statistics
 */
export async function getCardStatistics (ruleConfig = "core-constructed") {
  const cards = await loadLorcanaCards(ruleConfig)
  const analyser = new Analyser()

  return {
    total: cards.length,
    byType: analyser.getCardTypeDistribution(cards),
    byColor: analyser.getColorDistribution(cards),
    averageCost: analyser.calculateAverageCost(cards),
  }
}
