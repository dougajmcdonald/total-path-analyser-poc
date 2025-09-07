// Central analysis package

import {
  importCardData,
  validateCardData,
} from "@total-path/lorcana-data-import";
import { CardTypes, GameRules } from "@total-path/lorcana-rules";

/**
 * Main analyser class for path analysis and strategy insights
 */
export class Analyser {
  constructor() {
    this.gameRules = GameRules;
    this.cardTypes = CardTypes;
  }

  /**
   * Analyze card data and provide insights
   * @param {Array} cards - Array of card data
   * @returns {Object} Analysis results
   */
  async analyze(cards) {
    if (!validateCardData(cards)) {
      throw new Error("Invalid card data provided");
    }

    return {
      totalCards: cards.length,
      cardTypeDistribution: this.getCardTypeDistribution(cards),
      averageCost: this.calculateAverageCost(cards),
      colorDistribution: this.getColorDistribution(cards),
      recommendations: this.generateRecommendations(cards),
    };
  }

  /**
   * Get distribution of card types
   * @param {Array} cards - Array of card data
   * @returns {Object} Card type distribution
   */
  getCardTypeDistribution(cards) {
    const distribution = {};
    Object.values(this.cardTypes).forEach((type) => {
      distribution[type] = 0;
    });

    cards.forEach((card) => {
      if (Object.prototype.hasOwnProperty.call(distribution, card.type)) {
        distribution[card.type]++;
      }
    });

    return distribution;
  }

  /**
   * Calculate average cost of cards
   * @param {Array} cards - Array of card data
   * @returns {number} Average cost
   */
  calculateAverageCost(cards) {
    const totalCost = cards.reduce((sum, card) => sum + (card.cost || 0), 0);
    return cards.length > 0 ? totalCost / cards.length : 0;
  }

  /**
   * Get color distribution of cards
   * @param {Array} cards - Array of card data
   * @returns {Object} Color distribution
   */
  getColorDistribution(cards) {
    const distribution = {};
    cards.forEach((card) => {
      if (card.color) {
        distribution[card.color] = (distribution[card.color] || 0) + 1;
      }
    });
    return distribution;
  }

  /**
   * Generate strategy recommendations
   * @param {Array} cards - Array of card data
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(cards) {
    const recommendations = [];

    // Add basic recommendations based on card data
    if (cards.length < 10) {
      recommendations.push("Consider adding more cards to your collection");
    }

    const characterCount = cards.filter(
      (card) => card.type === this.cardTypes.CHARACTER
    ).length;
    if (characterCount < 3) {
      recommendations.push(
        "Add more character cards for better gameplay balance"
      );
    }

    return recommendations;
  }
}

/**
 * Convenience function to analyze Lorcana data
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeLorcanaData() {
  const analyser = new Analyser();
  const cards = await importCardData();
  return analyser.analyze(cards);
}
