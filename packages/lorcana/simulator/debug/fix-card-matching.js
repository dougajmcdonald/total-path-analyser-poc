// Debug script to fix card matching in CardFactory
// This script demonstrates the fix for case-insensitive card matching

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

console.log('=== Card Matching Fix Analysis ===\n')

// Current matching logic (exact match only)
function currentMatch(cardName, database) {
  return database.find((card) => card.Name === cardName)
}

// Improved matching logic (case-insensitive)
function improvedMatch(cardName, database) {
  // First try exact match
  let match = database.find((card) => card.Name === cardName)
  if (match) return match

  // Then try case-insensitive match
  match = database.find(
    (card) => card.Name.toLowerCase() === cardName.toLowerCase()
  )
  return match
}

// Test both approaches
const deckFormats = [...testDecks.deck1, ...testDecks.deck2]
const results = {
  current: { found: 0, missing: [] },
  improved: { found: 0, missing: [] },
}

console.log('Testing current matching logic...')
for (const cardEntry of deckFormats) {
  const currentResult = currentMatch(cardEntry.name, cardDatabase)
  if (currentResult) {
    results.current.found++
  } else {
    results.current.missing.push(cardEntry.name)
  }
}

console.log('Testing improved matching logic...')
for (const cardEntry of deckFormats) {
  const improvedResult = improvedMatch(cardEntry.name, cardDatabase)
  if (improvedResult) {
    results.improved.found++
  } else {
    results.improved.missing.push(cardEntry.name)
  }
}

console.log('\n=== RESULTS ===')
console.log(
  `Current logic: ${results.current.found}/${deckFormats.length} cards found`
)
console.log(
  `Improved logic: ${results.improved.found}/${deckFormats.length} cards found`
)
console.log(
  `Improvement: +${results.improved.found - results.current.found} cards`
)

if (results.current.missing.length > 0) {
  console.log('\nCards missed by current logic:')
  results.current.missing.forEach((name) => {
    const improvedResult = improvedMatch(name, cardDatabase)
    console.log(`❌ ${name}`)
    if (improvedResult) {
      console.log(`   → Found as: "${improvedResult.Name}"`)
    }
  })
}

console.log('\n=== RECOMMENDED FIX ===')
console.log(
  'Update CardFactory.createDeckFromFormat to use case-insensitive matching:'
)
console.log(`
// In CardFactory.js, line ~92, change:
const cardData = cardDatabase.find((c) => c.name === cardEntry.name)

// To:
const cardData = cardDatabase.find((c) => 
  c.Name === cardEntry.name || 
  c.Name.toLowerCase() === cardEntry.name.toLowerCase()
)
`)

// Save the fix to a file
const fixCode = `
// Fix for CardFactory.js - Case-insensitive card matching
// Replace line ~92 in CardFactory.createDeckFromFormat method

// OLD CODE:
const cardData = cardDatabase.find((c) => c.name === cardEntry.name)

// NEW CODE:
const cardData = cardDatabase.find((c) => 
  c.Name === cardEntry.name || 
  c.Name.toLowerCase() === cardEntry.name.toLowerCase()
)
`

const fs = await import('fs')
fs.writeFileSync(join(__dirname, 'card-matching-fix.txt'), fixCode)

console.log('\n📁 Fix code saved to: debug/card-matching-fix.txt')
