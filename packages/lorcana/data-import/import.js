#!/usr/bin/env node

// CLI script to import Lorcana card data

import { importCardData } from "./index.js"

async function main () {
  try {
    // Check for help flag
    if (process.argv.includes("--help") || process.argv.includes("-h")) {
      console.log("📖 Lorcana Data Import")
      console.log("")
      console.log("Usage:")
      console.log(
        "  pnpm run import:cards          # Import data (skip if already have today's data)",
      )
      console.log(
        "  pnpm run import:cards --force  # Force import even if data exists from today",
      )
      console.log("  pnpm run import:cards --help   # Show this help message")
      console.log("")
      console.log("Options:")
      console.log(
        "  --force, -f    Force import even if data exists from today",
      )
      console.log("  --help, -h     Show this help message")
      return
    }

    // Check for force flag
    const force =
      process.argv.includes("--force") || process.argv.includes("-f")

    if (force) {
      console.log("🚀 Starting Lorcana card data import (force mode)...")
    } else {
      console.log("🚀 Starting Lorcana card data import...")
    }

    const cards = await importCardData(force)

    console.log("✅ Import completed successfully!")
    console.log(`📊 Imported ${cards.length} cards`)
    console.log("📁 Data saved to ./data/ directory")

    // Show some basic stats
    const stats = {
      total: cards.length,
      byType: {},
      byColor: {},
      byRarity: {},
    }

    cards.forEach((card) => {
      // Count by type
      stats.byType[card.type] = (stats.byType[card.type] || 0) + 1

      // Count by color
      stats.byColor[card.color] = (stats.byColor[card.color] || 0) + 1

      // Count by rarity
      stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1
    })

    console.log("\n📈 Import Statistics:")
    console.log(`Total cards: ${stats.total}`)
    console.log("By type:", stats.byType)
    console.log("By color:", stats.byColor)
    console.log("By rarity:", stats.byRarity)
  } catch (error) {
    console.error("❌ Import failed:", error.message)
    process.exit(1)
  }
}

main()
