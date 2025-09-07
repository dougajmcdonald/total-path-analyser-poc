#!/usr/bin/env node

// CLI script to import Lorcana card data

import { importCardData } from "./index.js"

async function main () {
  try {
    console.log("🚀 Starting Lorcana card data import...")

    const cards = await importCardData()

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
