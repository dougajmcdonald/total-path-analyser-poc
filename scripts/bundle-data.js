#!/usr/bin/env node

// Script to bundle Lorcana data for browser consumption

import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { loadFilteredData } from "../packages/lorcana/data-import/index.js"; // Node.js data loader
import { ruleConfigs } from "../packages/lorcana/types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_IMPORT_DIR = join(__dirname, "../packages/lorcana/data-import/data");
const OUTPUT_DIR = join(__dirname, "../apps/total-path-ui/public/data");

async function bundleData() {
  try {
    console.log("📦 Bundling Lorcana data for browser...");

    // Ensure output directory exists
    await mkdir(OUTPUT_DIR, { recursive: true });

    // Process each rule configuration
    for (const [configKey, config] of Object.entries(ruleConfigs)) {
      console.log(`\n🔄 Processing ${config.name} (${configKey})...`);

      // Load filtered data for this rule config
      const cards = await loadFilteredData(configKey);
      console.log(`📊 Found ${cards.length} cards for ${config.name}`);

      // Create compressed JSON for this rule config
      const compressedData = JSON.stringify(cards);
      const compressedPath = join(
        OUTPUT_DIR,
        `lorcana-cards-${configKey}-min.json`,
      );
      await writeFile(compressedPath, compressedData);

      // Create pretty JSON for this rule config
      const prettyData = JSON.stringify(cards, null, 2);
      const prettyPath = join(OUTPUT_DIR, `lorcana-cards-${configKey}.json`);
      await writeFile(prettyPath, prettyData);

      // Generate stats for this rule config
      const stats = {
        total: cards.length,
        byType: {},
        byColor: {},
        byRarity: {},
        bySet: {},
      };

      cards.forEach((card) => {
        stats.byType[card.type] = (stats.byType[card.type] || 0) + 1;
        stats.byColor[card.color] = (stats.byColor[card.color] || 0) + 1;
        stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
        stats.bySet[card.setNum] = (stats.bySet[card.setNum] || 0) + 1;
      });

      // Write stats file for this rule config
      const statsPath = join(OUTPUT_DIR, `lorcana-stats-${configKey}.json`);
      const statsData = {
        cardStats: stats,
        ruleConfig: config,
        lastUpdated: new Date().toISOString(),
      };
      await writeFile(statsPath, JSON.stringify(statsData, null, 2));

      // Show file sizes
      const fs = await import("fs/promises");
      const prettyStats = await fs.stat(prettyPath);
      const minStats = await fs.stat(compressedPath);

      console.log(`✅ ${config.name} bundled successfully!`);
      console.log(
        `📁 Pretty JSON: ${prettyPath} (${(prettyStats.size / 1024 / 1024).toFixed(2)} MB)`,
      );
      console.log(
        `📁 Minified JSON: ${compressedPath} (${(minStats.size / 1024 / 1024).toFixed(2)} MB)`,
      );
      console.log(`📈 Stats file: ${statsPath}`);
      console.log(
        `📊 Cards by set: ${Object.entries(stats.bySet)
          .map(([set, count]) => `Set ${set}: ${count}`)
          .join(", ")}`,
      );
    }

    // Create a rule configs JSON file
    const ruleConfigsPath = join(OUTPUT_DIR, "rule-configs.json");
    const ruleConfigsData = {
      ruleConfigs,
      defaultRuleConfig: "core-constructed",
      lastUpdated: new Date().toISOString(),
    };
    await writeFile(ruleConfigsPath, JSON.stringify(ruleConfigsData, null, 2));
    console.log(`\n📋 Rule configs index: ${ruleConfigsPath}`);

    console.log("\n🎉 All data bundled successfully!");
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
