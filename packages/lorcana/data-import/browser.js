// Browser-compatible data loading utilities

import { validateCards } from "@total-path/lorcana-types";

/**
 * Load Lorcana card data in browser environment
 * @returns {Promise<Array>} Array of validated card data
 */
export async function loadLorcanaCards() {
  try {
    // Try to load from bundled data first
    const response = await fetch("/data/lorcana-cards.json");
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`);
    }

    const cards = await response.json();
    return validateCards(cards);
  } catch (error) {
    console.error("Error loading Lorcana cards:", error.message);
    throw new Error(
      "Failed to load Lorcana card data. Make sure to run 'pnpm run bundle:data' first.",
    );
  }
}

/**
 * Load Lorcana card statistics in browser environment
 * @returns {Promise<Object>} Card statistics
 */
export async function loadLorcanaStats() {
  try {
    const response = await fetch("/data/lorcana-stats.js");
    if (!response.ok) {
      throw new Error(`Failed to load stats: ${response.status}`);
    }

    const statsModule = await import("/data/lorcana-stats.js");
    return statsModule.cardStats;
  } catch (error) {
    console.error("Error loading Lorcana stats:", error.message);
    throw new Error(
      "Failed to load Lorcana card statistics. Make sure to run 'pnpm run bundle:data' first.",
    );
  }
}

/**
 * Check if data is available in browser environment
 * @returns {Promise<boolean>} True if data is available
 */
export async function isDataAvailable() {
  try {
    const response = await fetch("/data/lorcana-cards.json");
    return response.ok;
  } catch {
    return false;
  }
}
