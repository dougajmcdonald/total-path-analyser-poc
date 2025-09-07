// Lorcana data import utilities

import { validateCards, validateRawCards } from "@total-path/lorcana-types";
import axios from "axios";
import fs from "fs/promises";
import path from "path";

const API_URL = "https://api.lorcana-api.com/bulk/cards";
const DATA_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "data",
);

/**
 * Transform a raw card object from PascalCase to camelCase
 * @param {Object} rawCard - Raw card data from API
 * @returns {Object} Transformed card data in camelCase
 */
function transformCardToCamelCase(rawCard) {
  return {
    artist: rawCard.Artist,
    setName: rawCard.Set_Name,
    classifications: rawCard.Classifications,
    dateAdded: rawCard.Date_Added,
    setNum: rawCard.Set_Num,
    color: rawCard.Color,
    gamemode: rawCard.Gamemode,
    franchise: rawCard.Franchise,
    image: rawCard.Image,
    cost: rawCard.Cost,
    inkable: rawCard.Inkable,
    name: rawCard.Name,
    type: rawCard.Type?.toLowerCase(),
    lore: rawCard.Lore,
    rarity: rawCard.Rarity?.toLowerCase(),
    flavorText: rawCard.Flavor_Text,
    uniqueId: rawCard.Unique_ID,
    cardNum: rawCard.Card_Num,
    bodyText: rawCard.Body_Text,
    willpower: rawCard.Willpower,
    cardVariants: rawCard.Card_Variants,
    dateModified: rawCard.Date_Modified,
    strength: rawCard.Strength,
    setId: rawCard.Set_ID,
    moveCost: rawCard.Move_Cost,
    abilities: rawCard.Abilities,
  };
}

/**
 * Transform an array of raw cards to camelCase
 * @param {Array} rawCards - Array of raw card data
 * @returns {Array} Array of transformed card data
 */
function transformCardsToCamelCase(rawCards) {
  return rawCards.map(transformCardToCamelCase);
}

/**
 * Check if we already have data from today
 * @returns {Promise<boolean>} True if we have data from today
 */
async function hasDataFromToday() {
  try {
    const latestPath = path.join(DATA_DIR, "latest-transformed.json");
    const stats = await fs.stat(latestPath);
    const today = new Date();
    const fileDate = new Date(stats.mtime);

    // Check if file was modified today
    return (
      fileDate.getDate() === today.getDate() &&
      fileDate.getMonth() === today.getMonth() &&
      fileDate.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
}

/**
 * Import card data from external sources
 * @param {boolean} force - Force import even if data exists from today
 * @returns {Promise<Array>} Array of card data
 */
export async function importCardData(force = false) {
  try {
    // Check if we already have data from today (unless force is true)
    if (!force) {
      const hasTodayData = await hasDataFromToday();
      if (hasTodayData) {
        console.log("📅 Data from today already exists, loading from cache...");
        return await loadLatestData();
      }
    }

    console.log("Fetching Lorcana card data from API...");

    const response = await axios.get(API_URL, {
      timeout: 30000, // 30 second timeout
      headers: {
        "User-Agent": "Total-Path-Analyser/1.0.0",
      },
    });

    const rawCards = response.data;
    console.log(`Successfully fetched ${rawCards.length} cards`);

    // Validate raw data
    console.log("Validating raw card data...");
    const validatedRawCards = validateRawCards(rawCards);
    console.log("✅ Raw data validation passed");

    // Transform to camelCase
    console.log("Transforming data to camelCase...");
    const transformedCards = transformCardsToCamelCase(validatedRawCards);

    // Validate transformed data
    console.log("Validating transformed card data...");
    const validatedTransformedCards = validateCards(transformedCards);
    console.log("✅ Transformed data validation passed");

    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Save raw data as JSON
    const rawFilename = `cards-raw-${timestamp}.json`;
    const rawFilepath = path.join(DATA_DIR, rawFilename);
    await fs.writeFile(rawFilepath, JSON.stringify(validatedRawCards, null, 2));
    console.log(`Raw data saved to: ${rawFilepath}`);

    // Save transformed data as JSON
    const transformedFilename = `cards-transformed-${timestamp}.json`;
    const transformedFilepath = path.join(DATA_DIR, transformedFilename);
    await fs.writeFile(
      transformedFilepath,
      JSON.stringify(validatedTransformedCards, null, 2),
    );
    console.log(`Transformed data saved to: ${transformedFilepath}`);

    // Save latest versions
    const latestRawPath = path.join(DATA_DIR, "latest-raw.json");
    await fs.writeFile(
      latestRawPath,
      JSON.stringify(validatedRawCards, null, 2),
    );

    const latestTransformedPath = path.join(
      DATA_DIR,
      "latest-transformed.json",
    );
    await fs.writeFile(
      latestTransformedPath,
      JSON.stringify(validatedTransformedCards, null, 2),
    );
    console.log(
      `Latest data saved to: ${latestRawPath} and ${latestTransformedPath}`,
    );

    return validatedTransformedCards;
  } catch (error) {
    console.error("Error importing card data:", error.message);
    throw error;
  }
}

/**
 * Validate imported card data
 * @param {Array} cards - Array of card data to validate
 * @returns {boolean} Whether the data is valid
 */
export function validateCardData(cards) {
  if (!Array.isArray(cards)) {
    return false;
  }

  // Add validation logic here
  return true;
}

/**
 * Load the latest imported card data from disk (transformed format)
 * @returns {Promise<Array>} Array of transformed card data
 */
export async function loadLatestData() {
  try {
    const latestPath = path.join(DATA_DIR, "latest-transformed.json");
    const data = await fs.readFile(latestPath, "utf8");
    const parsedData = JSON.parse(data);

    // Validate the loaded data
    return validateCards(parsedData);
  } catch (error) {
    console.error("Error loading latest data:", error.message);
    throw new Error("No transformed data found. Run import first.");
  }
}

/**
 * Load the latest raw card data from disk
 * @returns {Promise<Array>} Array of raw card data
 */
export async function loadLatestRawData() {
  try {
    const latestPath = path.join(DATA_DIR, "latest-raw.json");
    const data = await fs.readFile(latestPath, "utf8");
    const parsedData = JSON.parse(data);

    // Validate the loaded data
    return validateRawCards(parsedData);
  } catch (error) {
    console.error("Error loading latest raw data:", error.message);
    throw new Error("No raw data found. Run import first.");
  }
}

/**
 * Transform raw card data into standardized format
 * @param {Array} rawData - Raw card data
 * @returns {Array} Transformed card data
 */
export function transformCardData(rawData) {
  return transformCardsToCamelCase(rawData);
}
