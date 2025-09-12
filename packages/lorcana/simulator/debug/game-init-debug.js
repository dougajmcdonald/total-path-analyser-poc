#!/usr/bin/env node

// Debug script to check game initialization process
// This script verifies that game setup works correctly with test data

import { GameStateFactory } from '../utils/GameStateFactory.js'
import { TestDataLoader } from '../utils/TestDataLoader.js'

console.log('🎮 Game Initialization Debug Script')
console.log('=====================================\n')

async function debugGameInit() {
  try {
    console.log('📊 Loading test data...')
    const deckFormats = TestDataLoader.getDeckFormats()
    const cardDatabase = TestDataLoader.loadCardDatabase()

    console.log(`✅ Loaded test deck formats:`)
    console.log(`   Deck 1: ${deckFormats.deck1.length} card types`)
    console.log(`   Deck 2: ${deckFormats.deck2.length} card types`)
    console.log(`   Card database: ${cardDatabase.length} cards`)

    // Verify starting deck sizes are at least 60 cards
    const deck1Size = TestDataLoader.getDeckSize(deckFormats.deck1)
    const deck2Size = TestDataLoader.getDeckSize(deckFormats.deck2)
    console.log(`   Deck 1 total cards: ${deck1Size} (minimum 60)`)
    console.log(`   Deck 2 total cards: ${deck2Size} (minimum 60)`)

    if (deck1Size < 60 || deck2Size < 60) {
      console.log(`❌ ERROR: Test decks must have at least 60 cards each!`)
      console.log(`   Deck 1: ${deck1Size}/60 cards`)
      console.log(`   Deck 2: ${deck2Size}/60 cards`)
      process.exit(1)
    }
    console.log()

    // Test multiple game initializations to check consistency
    const numTests = 5
    console.log(`🔄 Running ${numTests} game initialization tests...\n`)

    for (let i = 1; i <= numTests; i++) {
      console.log(`--- Test ${i} ---`)

      // Create game state with test decks (already initialized)
      const gameState = GameStateFactory.createGameFromTestFormat(
        deckFormats.deck1,
        deckFormats.deck2,
        cardDatabase
      )

      console.log(
        `🎲 Starting player: ${gameState.activePlayer?.id || 'undefined'}`
      )
      console.log(
        `👥 Players: ${gameState.players.map((p) => p.id).join(', ')}`
      )

      // Check player 1 state
      const player1 = gameState.getPlayerState('player1')
      const player1Deck = gameState.getPlayer('player1')?.activeDeck
      console.log(`👤 Player 1:`)
      console.log(`   Hand: ${player1?.hand?.length || 0} cards`)
      console.log(`   Deck: ${player1Deck?.cards?.length || 0} cards`)
      console.log(`   Inkwell: ${player1?.inkwell?.length || 0} cards`)
      console.log(`   Board: ${player1?.board?.length || 0} cards`)
      console.log(`   Lore: ${player1?.lore || 0}`)

      // Check player 2 state
      const player2 = gameState.getPlayerState('player2')
      const player2Deck = gameState.getPlayer('player2')?.activeDeck
      console.log(`👤 Player 2:`)
      console.log(`   Hand: ${player2?.hand?.length || 0} cards`)
      console.log(`   Deck: ${player2Deck?.cards?.length || 0} cards`)
      console.log(`   Inkwell: ${player2?.inkwell?.length || 0} cards`)
      console.log(`   Board: ${player2?.board?.length || 0} cards`)
      console.log(`   Lore: ${player2?.lore || 0}`)

      // Validation checks
      console.log(`✅ Validation:`)

      // Check if player states exist
      if (!player1 || !player2) {
        console.log(`   ❌ Player states not found!`)
        console.log(`   Player 1 state: ${player1 ? '✅' : '❌'}`)
        console.log(`   Player 2 state: ${player2 ? '✅' : '❌'}`)
        console.log()
        continue
      }

      // Check hand sizes
      const player1HandValid = player1.hand?.length === 7
      const player2HandValid = player2.hand?.length === 7
      console.log(
        `   Player 1 hand size (7): ${player1HandValid ? '✅' : '❌'} (${player1.hand?.length || 0})`
      )
      console.log(
        `   Player 2 hand size (7): ${player2HandValid ? '✅' : '❌'} (${player2.hand?.length || 0})`
      )

      // Check deck sizes (should be original deck size - 7 after drawing 7 cards)
      const expectedDeckSize1 = deck1Size - 7
      const expectedDeckSize2 = deck2Size - 7
      const player1DeckValid = player1Deck?.cards?.length === expectedDeckSize1
      const player2DeckValid = player2Deck?.cards?.length === expectedDeckSize2
      console.log(
        `   Player 1 deck size (${expectedDeckSize1}): ${player1DeckValid ? '✅' : '❌'} (${player1Deck?.cards?.length || 0})`
      )
      console.log(
        `   Player 2 deck size (${expectedDeckSize2}): ${player2DeckValid ? '✅' : '❌'} (${player2Deck?.cards?.length || 0})`
      )

      // Check that no cards are duplicated between hand and deck (by unique ID)
      const player1HandIds = new Set(
        (player1.hand || []).map((card) => card.id)
      )
      const player1DeckIds = new Set(
        (player1Deck?.cards || []).map((card) => card.id)
      )
      const player1NoDuplicates = [...player1HandIds].every(
        (id) => !player1DeckIds.has(id)
      )

      const player2HandIds = new Set(
        (player2.hand || []).map((card) => card.id)
      )
      const player2DeckIds = new Set(
        (player2Deck?.cards || []).map((card) => card.id)
      )
      const player2NoDuplicates = [...player2HandIds].every(
        (id) => !player2DeckIds.has(id)
      )

      console.log(
        `   Player 1 no hand/deck ID duplicates: ${player1NoDuplicates ? '✅' : '❌'}`
      )
      console.log(
        `   Player 2 no hand/deck ID duplicates: ${player2NoDuplicates ? '✅' : '❌'}`
      )

      // Check that all cards are from the correct deck by verifying they were drawn from the right player's deck
      // Since cards are drawn from the player's activeDeck, we just need to verify the deck contains the right cards

      // Check that all cards in hand were drawn from the correct deck
      const player1HandFromCorrectDeck = (player1.hand || []).every((card) => {
        // Check if this card name exists in the original deck format for player 1 (case-insensitive)
        return deckFormats.deck1.some(
          (entry) => entry.name.toLowerCase() === card.name.toLowerCase()
        )
      })

      const player2HandFromCorrectDeck = (player2.hand || []).every((card) => {
        // Check if this card name exists in the original deck format for player 2 (case-insensitive)
        return deckFormats.deck2.some(
          (entry) => entry.name.toLowerCase() === card.name.toLowerCase()
        )
      })

      // Debug: Show detailed validation for Player 2 on first test
      if (i === 1) {
        console.log(`   Debug - Player 2 hand validation (case-insensitive):`)
        player2.hand.forEach((card, index) => {
          const isInDeck2 = deckFormats.deck2.some(
            (entry) => entry.name.toLowerCase() === card.name.toLowerCase()
          )
          console.log(
            `     Card ${index + 1}: "${card.name}" - ${isInDeck2 ? '✅' : '❌'}`
          )
        })
        console.log(`   Debug - Deck 2 format names:`)
        deckFormats.deck2.forEach((entry, index) => {
          console.log(`     ${index + 1}: "${entry.name}"`)
        })
      }

      console.log(
        `   Player 1 cards from correct deck: ${player1HandFromCorrectDeck ? '✅' : '❌'}`
      )
      console.log(
        `   Player 2 cards from correct deck: ${player2HandFromCorrectDeck ? '✅' : '❌'}`
      )

      // Check starting conditions
      const player1StartingValid =
        (player1.inkwell?.length || 0) === 0 &&
        (player1.board?.length || 0) === 0 &&
        (player1.lore || 0) === 0
      const player2StartingValid =
        (player2.inkwell?.length || 0) === 0 &&
        (player2.board?.length || 0) === 0 &&
        (player2.lore || 0) === 0
      console.log(
        `   Player 1 starting conditions: ${player1StartingValid ? '✅' : '❌'}`
      )
      console.log(
        `   Player 2 starting conditions: ${player2StartingValid ? '✅' : '❌'}`
      )

      // Overall test result
      const testPassed =
        player1HandValid &&
        player2HandValid &&
        player1DeckValid &&
        player2DeckValid &&
        player1NoDuplicates &&
        player2NoDuplicates &&
        player1HandFromCorrectDeck &&
        player2HandFromCorrectDeck &&
        player1StartingValid &&
        player2StartingValid

      console.log(
        `   Overall test result: ${testPassed ? '✅ PASSED' : '❌ FAILED'}`
      )
      console.log()
    }

    // Test coin flip randomness
    console.log('🎲 Testing coin flip randomness...')
    const coinFlips = []
    for (let i = 0; i < 100; i++) {
      const gameState = GameStateFactory.createGameFromTestFormat(
        deckFormats.deck1,
        deckFormats.deck2,
        cardDatabase
      )
      coinFlips.push(gameState.activePlayer?.id)
    }

    const player1Count = coinFlips.filter((id) => id === 'player1').length
    const player2Count = coinFlips.filter((id) => id === 'player2').length

    console.log(`   Player 1 starts: ${player1Count}/100 (${player1Count}%)`)
    console.log(`   Player 2 starts: ${player2Count}/100 (${player2Count}%)`)
    console.log(
      `   Randomness check: ${player1Count > 20 && player1Count < 80 ? '✅' : '❌'} (should be roughly 50/50)`
    )
    console.log()

    // Test deck consistency
    console.log('🃏 Testing deck consistency...')
    const gameState1 = GameStateFactory.createGameFromTestFormat(
      deckFormats.deck1,
      deckFormats.deck2,
      cardDatabase
    )
    const gameState2 = GameStateFactory.createGameFromTestFormat(
      deckFormats.deck1,
      deckFormats.deck2,
      cardDatabase
    )

    const player1Deck1 =
      gameState1
        .getPlayer('player1')
        ?.activeDeck?.cards?.map((card) => card.id)
        .sort() || []
    const player1Deck2 =
      gameState2
        .getPlayer('player1')
        ?.activeDeck?.cards?.map((card) => card.id)
        .sort() || []
    const player2Deck1 =
      gameState1
        .getPlayer('player2')
        ?.activeDeck?.cards?.map((card) => card.id)
        .sort() || []
    const player2Deck2 =
      gameState2
        .getPlayer('player2')
        ?.activeDeck?.cards?.map((card) => card.id)
        .sort() || []

    const decksAreDifferent =
      JSON.stringify(player1Deck1) !== JSON.stringify(player1Deck2) ||
      JSON.stringify(player2Deck1) !== JSON.stringify(player2Deck2)

    console.log(
      `   Decks are shuffled differently: ${decksAreDifferent ? '✅' : '❌'}`
    )
    console.log()

    console.log('🎉 Game initialization debug completed!')
  } catch (error) {
    console.error('❌ Error during game initialization debug:', error)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run the debug script
debugGameInit()
