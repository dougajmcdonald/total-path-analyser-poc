#!/usr/bin/env node

// Script to bundle Lorcana data for browser consumption

import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_IMPORT_DIR = join(__dirname, "../packages/lorcana/data-import/data");
const OUTPUT_DIR = join(__dirname, "../apps/total-path-ui/public/data");

async function bundleData() {
  try {
    console.log("📦 Bundling Lorcana data for browser...");

    // Ensure output directory exists
    await mkdir(OUTPUT_DIR, { recursive: true });

    // Read the latest transformed data
    const dataPath = join(DATA_IMPORT_DIR, "latest-transformed.json");
    const rawData = await readFile(dataPath, "utf8");
    const cards = JSON.parse(rawData);

    console.log(`📊 Found ${cards.length} cards to bundle`);

    // Create a JS module that exports the data
    const jsContent = `// Auto-generated Lorcana card data
// Generated at: ${new Date().toISOString()}
// Total cards: ${cards.length}

export const lorcanaCards = ${JSON.stringify(cards, null, 2)};

export const cardCount = ${cards.length};

export const lastUpdated = "${new Date().toISOString()}";
`;

    // Write the JS module
    const outputPath = join(OUTPUT_DIR, "lorcana-cards.js");
    await writeFile(outputPath, jsContent);

    // Also create a JSON file for direct import
    const jsonPath = join(OUTPUT_DIR, "lorcana-cards.json");
    await writeFile(jsonPath, rawData);

    console.log("✅ Data bundled successfully!");
    console.log(`📁 JS module: ${outputPath}`);
    console.log(`📁 JSON file: ${jsonPath}`);

    // Generate some basic stats
    const stats = {
      total: cards.length,
      byType: {},
      byColor: {},
      byRarity: {},
    };

    cards.forEach((card) => {
      stats.byType[card.type] = (stats.byType[card.type] || 0) + 1;
      stats.byColor[card.color] = (stats.byColor[card.color] || 0) + 1;
      stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
    });

    // Write stats file
    const statsPath = join(OUTPUT_DIR, "lorcana-stats.js");
    const statsContent = `// Auto-generated Lorcana card statistics
export const cardStats = ${JSON.stringify(stats, null, 2)};
`;
    await writeFile(statsPath, statsContent);

    console.log(`📈 Stats file: ${statsPath}`);
    console.log("\n📊 Bundle Statistics:");
    console.log(`Total cards: ${stats.total}`);
    console.log(`Types: ${Object.keys(stats.byType).length}`);
    console.log(`Colors: ${Object.keys(stats.byColor).length}`);
    console.log(`Rarities: ${Object.keys(stats.byRarity).length}`);
  } catch (error) {
    console.error("❌ Error bundling data:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  bundleData();
}

export { bundleData };
