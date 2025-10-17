// Simple data loading utilities that work with Express API
import { LORCANA_API_BASE } from '../config/api.js'

export async function loadLorcanaCards(ruleConfig = 'core-constructed') {
  try {
    const response = await fetch(`${LORCANA_API_BASE}/cards/${ruleConfig}`)
    if (!response.ok) {
      throw new Error(`Failed to load cards: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error loading Lorcana cards:', error)
    return []
  }
}

export async function loadLorcanaStats() {
  try {
    const response = await fetch(`${LORCANA_API_BASE}/stats`)
    if (!response.ok) {
      throw new Error(`Failed to load stats: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error loading Lorcana stats:', error)
    return {}
  }
}

export async function loadRuleConfigs() {
  try {
    const response = await fetch(`${LORCANA_API_BASE}/rule-configs`)
    if (!response.ok) {
      throw new Error(`Failed to load rule configs: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error loading rule configs:', error)
    return {}
  }
}

// Simple analysis functions
export async function analyzeLorcanaData(
  ruleConfig = 'core-constructed',
  colorFilters = ['all'],
  setFilters = ['all']
) {
  const cards = await loadLorcanaCards(ruleConfig)

  let filteredCards = cards

  // Filter by sets first
  if (!setFilters.includes('all')) {
    filteredCards = filteredCards.filter((card) => setFilters.includes(card.setNum.toString()))
  }

  // Filter by colors - if "all" is selected, show all cards, otherwise filter by selected colors
  if (!colorFilters.includes('all')) {
    filteredCards = filteredCards.filter((card) => {
      // Handle multi-color cards (e.g., "Amber, Steel")
      if (card.color && card.color.includes(',')) {
        const cardColors = card.color.split(',').map(c => c.trim())
        return cardColors.some(color => colorFilters.includes(color))
      }
      // Handle single color cards
      return colorFilters.includes(card.color)
    })
  }

  // Calculate average cost
  const totalCost = filteredCards.reduce(
    (sum, card) => sum + (card.cost || 0),
    0
  )
  const averageCost =
    filteredCards.length > 0 ? (totalCost / filteredCards.length).toFixed(1) : 0

  // Calculate average lore (only for characters)
  const characterCards = filteredCards.filter(
    (card) => card.type === 'character'
  )
  const totalLore = characterCards.reduce(
    (sum, card) => sum + (card.lore || 0),
    0
  )
  const averageLore =
    characterCards.length > 0
      ? (totalLore / characterCards.length).toFixed(1)
      : 0

  // Calculate average strength (only for characters)
  const totalStrength = characterCards.reduce(
    (sum, card) => sum + (card.strength || 0),
    0
  )
  const averageStrength =
    characterCards.length > 0
      ? (totalStrength / characterCards.length).toFixed(1)
      : 0

  // Calculate average willpower (only for characters)
  const totalWillpower = characterCards.reduce(
    (sum, card) => sum + (card.willpower || 0),
    0
  )
  const averageWillpower =
    characterCards.length > 0
      ? (totalWillpower / characterCards.length).toFixed(1)
      : 0

  return {
    totalCards: filteredCards.length,
    averageCost,
    averageLore,
    averageStrength,
    averageWillpower,
    ruleConfig,
    colorFilters,
    setFilters,
  }
}

export async function getCardStatistics(
  ruleConfig = 'core-constructed',
  colorFilters = ['all'],
  setFilters = ['all']
) {
  const cards = await loadLorcanaCards(ruleConfig)

  let filteredCards = cards

  // Filter by sets first
  if (!setFilters.includes('all')) {
    filteredCards = filteredCards.filter((card) => setFilters.includes(card.setNum.toString()))
  }

  // Filter by colors - if "all" is selected, show all cards, otherwise filter by selected colors
  if (!colorFilters.includes('all')) {
    filteredCards = filteredCards.filter((card) => {
      // Handle multi-color cards (e.g., "Amber, Steel")
      if (card.color && card.color.includes(',')) {
        const cardColors = card.color.split(',').map(c => c.trim())
        return cardColors.some(color => colorFilters.includes(color))
      }
      // Handle single color cards
      return colorFilters.includes(card.color)
    })
  }

  // Simple statistics
  const typeCounts = {}
  const colorCounts = {}
  const costCounts = {}

  filteredCards.forEach((card) => {
    typeCounts[card.type] = (typeCounts[card.type] || 0) + 1

    // Handle color distribution - combine multi-color cards into "Dual Ink"
    if (card.color && card.color.includes(',')) {
      colorCounts['Dual Ink'] = (colorCounts['Dual Ink'] || 0) + 1
    } else {
      colorCounts[card.color] = (colorCounts[card.color] || 0) + 1
    }

    costCounts[card.cost] = (costCounts[card.cost] || 0) + 1
  })

  return {
    typeDistribution: typeCounts,
    colorDistribution: colorCounts,
    costDistribution: costCounts,
    totalCards: filteredCards.length,
  }
}
