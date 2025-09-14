// Debug script to analyze missing cards from test-decks.json
// This script will help identify which cards are truly missing vs. name matching issues

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load test decks
const testDecksPath = join(__dirname, '../test-data/test-decks.json')
const testDecks = JSON.parse(readFileSync(testDecksPath, 'utf8'))

// Load card database
const cardDatabasePath = join(__dirname, '../../data-import/data/latest.json')
const cardDatabase = JSON.parse(readFileSync(cardDatabasePath, 'utf8'))

console.log('=== Missing Cards Analysis ===\n')

// Get all unique card names from both decks
const allDeckCards = [
  ...testDecks.deck1.map((card) => card.name),
  ...testDecks.deck2.map((card) => card.name),
]
const uniqueDeckCards = [...new Set(allDeckCards)]

console.log(`Total unique cards in test-decks.json: ${uniqueDeckCards.length}`)
console.log(`Total cards in database: ${cardDatabase.length}\n`)

// Function to find cards with fuzzy matching
function findCardVariations(cardName, database) {
  const variations = []

  // Exact match
  const exactMatch = database.find((card) => card.Name === cardName)
  if (exactMatch) {
    variations.push({ type: 'exact', card: exactMatch })
  }

  // Case insensitive match
  const caseInsensitiveMatch = database.find(
    (card) => card.Name.toLowerCase() === cardName.toLowerCase()
  )
  if (caseInsensitiveMatch && !exactMatch) {
    variations.push({ type: 'case-insensitive', card: caseInsensitiveMatch })
  }

  // Partial match (contains)
  const partialMatches = database.filter(
    (card) =>
      card.Name.toLowerCase().includes(cardName.toLowerCase()) ||
      cardName.toLowerCase().includes(card.Name.toLowerCase())
  )
  if (partialMatches.length > 0) {
    variations.push({ type: 'partial', cards: partialMatches })
  }

  // Word-based matching (split by spaces and dashes)
  const cardWords = cardName.toLowerCase().split(/[\s-]+/)
  const wordMatches = database.filter((card) => {
    const dbWords = card.Name.toLowerCase().split(/[\s-]+/)
    return cardWords.some(
      (word) =>
        word.length > 2 &&
        dbWords.some((dbWord) => dbWord.includes(word) || word.includes(dbWord))
    )
  })
  if (wordMatches.length > 0) {
    variations.push({ type: 'word-based', cards: wordMatches })
  }

  return variations
}

// Analyze each card
const results = {
  found: [],
  notFound: [],
  partialMatches: [],
  wordMatches: [],
}

for (const cardName of uniqueDeckCards) {
  const variations = findCardVariations(cardName, cardDatabase)

  if (
    variations.some((v) => v.type === 'exact' || v.type === 'case-insensitive')
  ) {
    const exactMatch = variations.find(
      (v) => v.type === 'exact' || v.type === 'case-insensitive'
    )
    results.found.push({
      deckName: cardName,
      dbName: exactMatch.card.Name,
      type: exactMatch.type,
      cost: exactMatch.card.Cost,
      inkable: exactMatch.card.Inkable,
      rarity: exactMatch.card.Rarity,
    })
  } else if (variations.some((v) => v.type === 'partial')) {
    const partialMatch = variations.find((v) => v.type === 'partial')
    results.partialMatches.push({
      deckName: cardName,
      matches: partialMatch.cards.map((card) => ({
        name: card.Name,
        cost: card.Cost,
        inkable: card.Inkable,
        rarity: card.Rarity,
      })),
    })
  } else if (variations.some((v) => v.type === 'word-based')) {
    const wordMatch = variations.find((v) => v.type === 'word-based')
    results.wordMatches.push({
      deckName: cardName,
      matches: wordMatch.cards.map((card) => ({
        name: card.Name,
        cost: card.Cost,
        inkable: card.Inkable,
        rarity: card.Rarity,
      })),
    })
  } else {
    results.notFound.push(cardName)
  }
}

// Print results
console.log('=== FOUND CARDS (Exact or Case-Insensitive Match) ===')
console.log(`Found ${results.found.length} cards:\n`)
results.found.forEach((card) => {
  console.log(`✅ ${card.deckName}`)
  console.log(`   → ${card.dbName} (${card.type})`)
  console.log(
    `   Cost: ${card.cost}, Inkable: ${card.inkable}, Rarity: ${card.rarity}\n`
  )
})

console.log('=== PARTIAL MATCHES ===')
console.log(
  `Found ${results.partialMatches.length} cards with partial matches:\n`
)
results.partialMatches.forEach((card) => {
  console.log(`🔍 ${card.deckName}`)
  card.matches.forEach((match) => {
    console.log(
      `   → ${match.name} (Cost: ${match.cost}, Inkable: ${match.inkable})`
    )
  })
  console.log()
})

console.log('=== WORD-BASED MATCHES ===')
console.log(
  `Found ${results.wordMatches.length} cards with word-based matches:\n`
)
results.wordMatches.forEach((card) => {
  console.log(`🔤 ${card.deckName}`)
  card.matches.forEach((match) => {
    console.log(
      `   → ${match.name} (Cost: ${match.cost}, Inkable: ${match.inkable})`
    )
  })
  console.log()
})

console.log('=== TRULY MISSING CARDS ===')
console.log(
  `Found ${results.notFound.length} cards that appear to be completely missing:\n`
)
results.notFound.forEach((cardName) => {
  console.log(`❌ ${cardName}`)
})

// Summary
console.log('\n=== SUMMARY ===')
console.log(`Total cards in test-decks.json: ${uniqueDeckCards.length}`)
console.log(`Found (exact/case-insensitive): ${results.found.length}`)
console.log(`Partial matches: ${results.partialMatches.length}`)
console.log(`Word-based matches: ${results.wordMatches.length}`)
console.log(`Truly missing: ${results.notFound.length}`)
console.log(
  `Coverage: ${(((results.found.length + results.partialMatches.length + results.wordMatches.length) / uniqueDeckCards.length) * 100).toFixed(1)}%`
)

// Save detailed results to file
const detailedResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: uniqueDeckCards.length,
    found: results.found.length,
    partialMatches: results.partialMatches.length,
    wordMatches: results.wordMatches.length,
    missing: results.notFound.length,
    coverage:
      (
        ((results.found.length +
          results.partialMatches.length +
          results.wordMatches.length) /
          uniqueDeckCards.length) *
        100
      ).toFixed(1) + '%',
  },
  results,
}

const fs = await import('fs')
fs.writeFileSync(
  join(__dirname, 'missing-cards-analysis.json'),
  JSON.stringify(detailedResults, null, 2)
)

console.log('\n📁 Detailed results saved to: debug/missing-cards-analysis.json')
