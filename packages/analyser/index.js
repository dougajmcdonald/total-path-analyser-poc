// Central analysis package

import {
  importCardData,
  loadLatestData,
} from "@total-path/lorcana-data-import"
import { CardTypes, GameRules } from "@total-path/lorcana-rules"
import { validateCards } from "@total-path/lorcana-types"

/**
 * Main analyser class for path analysis and strategy insights
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
  async analyze (cards) {
    // Validate cards using Zod schema
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
   * @returns {Object} Card type distribution
   */
  getCardTypeDistribution (cards) {
    const distribution = {}
    Object.values(this.cardTypes).forEach((type) => {
      distribution[type] = 0
    })

    cards.forEach((card) => {
      // Map transformed types to our internal types
      const cardType = card.type
      if (cardType === "character") {
        distribution[this.cardTypes.CHARACTER]++
      } else if (cardType === "action" || cardType === "action - song") {
        distribution[this.cardTypes.ACTION]++
      } else if (cardType === "item") {
        distribution[this.cardTypes.ITEM]++
      } else if (cardType === "location") {
        distribution[this.cardTypes.LOCATION]++
      }
    })

    return distribution
  }

  /**
   * Calculate average cost of cards
   * @param {Array} cards - Array of card data
   * @returns {number} Average cost
   */
  calculateAverageCost (cards) {
    const totalCost = cards.reduce((sum, card) => sum + (card.cost || 0), 0)
    return cards.length > 0 ? totalCost / cards.length : 0
  }

  /**
   * Get color distribution of cards
   * @param {Array} cards - Array of card data
   * @returns {Object} Color distribution
   */
  getColorDistribution (cards) {
    const distribution = {}
    cards.forEach((card) => {
      if (card.color) {
        distribution[card.color] = (distribution[card.color] || 0) + 1
      }
    })
    return distribution
  }

  /**
   * Generate strategy recommendations
   * @param {Array} cards - Array of card data
   * @returns {Array} Array of recommendations
   */
  generateRecommendations (cards) {
    const recommendations = []

    // Add basic recommendations based on card data
    if (cards.length < 10) {
      recommendations.push("Consider adding more cards to your collection")
    }

    const characterCount = cards.filter(
      (card) => card.type === "character"
    ).length
    if (characterCount < 3) {
      recommendations.push(
        "Add more character cards for better gameplay balance"
      )
    }

    return recommendations
  }
}

/**
 * Convenience function to analyze Lorcana data
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeLorcanaData () {
  const analyser = new Analyser()
  const cards = await loadLatestData()
  return analyser.analyze(cards)
}

/**
 * Import fresh data and analyze it
 * @returns {Promise<Object>} Analysis results
 */
export async function importAndAnalyzeLorcanaData () {
  const analyser = new Analyser()
  const cards = await importCardData()
  return analyser.analyze(cards)
}
