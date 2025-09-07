// Browser-compatible data loading utilities

import { validateCards } from "@total-path/lorcana-types";

// Cache for loaded data to avoid multiple fetches
const cardsCache = new Map();
const statsCache = new Map();

/**
 * Load Lorcana card data in browser environment by rule config
 * @param {string} ruleConfig - Rule configuration key (default: "core-constructed")
 * @returns {Promise<Array>} Array of validated card data
 */
export async function loadLorcanaCards(ruleConfig = "core-constructed") {
  // Return cached data if available
  if (cardsCache.has(ruleConfig)) {
    return cardsCache.get(ruleConfig);
  }

  try {
    // Try to load from minified bundled data first (smaller file size)
    const response = await fetch(`/data/lorcana-cards-${ruleConfig}-min.json`);
    if (!response.ok) {
      throw new Error(
        `Failed to load data for ${ruleConfig}: ${response.status}`,
      );
    }

    const cards = await response.json();
    const validatedCards = validateCards(cards);

    // Cache the validated data
    cardsCache.set(ruleConfig, validatedCards);
    return validatedCards;
  } catch (error) {
    console.error(
      `Error loading Lorcana cards for ${ruleConfig}:`,
      error.message,
    );
    throw new Error(
      `Failed to load Lorcana card data for ${ruleConfig}. Make sure to run 'pnpm run bundle:data' first.`,
    );
  }
}

/**
 * Load Lorcana card statistics in browser environment by rule config
 * @param {string} ruleConfig - Rule configuration key (default: "core-constructed")
 * @returns {Promise<Object>} Card statistics
 */
export async function loadLorcanaStats(ruleConfig = "core-constructed") {
  // Return cached data if available
  if (statsCache.has(ruleConfig)) {
    return statsCache.get(ruleConfig);
  }

  try {
    const response = await fetch(`/data/lorcana-stats-${ruleConfig}.json`);
    if (!response.ok) {
      throw new Error(
        `Failed to load stats for ${ruleConfig}: ${response.status}`,
      );
    }

    const statsData = await response.json();
    const stats = statsData.cardStats;

    // Cache the stats
    statsCache.set(ruleConfig, stats);
    return stats;
  } catch (error) {
    console.error(
      `Error loading Lorcana stats for ${ruleConfig}:`,
      error.message,
    );
    throw new Error(
      `Failed to load Lorcana card statistics for ${ruleConfig}. Make sure to run 'pnpm run bundle:data' first.`,
    );
  }
}

/**
 * Check if data is available in browser environment for a specific rule config
 * @param {string} ruleConfig - Rule configuration key (default: "core-constructed")
 * @returns {Promise<boolean>} True if data is available
 */
export async function isDataAvailable(ruleConfig = "core-constructed") {
  try {
    const response = await fetch(`/data/lorcana-cards-${ruleConfig}-min.json`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Load available rule configurations
 * @returns {Promise<Object>} Available rule configurations
 */
export async function loadRuleConfigs() {
  try {
    const response = await fetch("/data/rule-configs.json");
    if (!response.ok) {
      throw new Error(`Failed to load rule configs: ${response.status}`);
    }

    const configData = await response.json();
    return configData.ruleConfigs;
  } catch (error) {
    console.error("Error loading rule configs:", error.message);
    throw new Error(
      "Failed to load rule configurations. Make sure to run 'pnpm run bundle:data' first.",
    );
  }
}
