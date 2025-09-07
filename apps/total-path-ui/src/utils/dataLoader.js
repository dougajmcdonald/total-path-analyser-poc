// Simple data loading utilities that work with Express API
const API_BASE = "http://localhost:3001/api/lorcana"

export async function loadLorcanaCards (ruleConfig = "core-constructed") {
  try {
    const response = await fetch(`${API_BASE}/cards/${ruleConfig}`)
    if (!response.ok) {
      throw new Error(`Failed to load cards: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error loading Lorcana cards:", error)
    return []
  }
}

export async function loadLorcanaStats () {
  try {
    const response = await fetch(`${API_BASE}/stats`)
    if (!response.ok) {
      throw new Error(`Failed to load stats: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error loading Lorcana stats:", error)
    return {}
  }
}

export async function loadRuleConfigs () {
  try {
    const response = await fetch(`${API_BASE}/rule-configs`)
    if (!response.ok) {
      throw new Error(`Failed to load rule configs: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error loading rule configs:", error)
    return {}
  }
}

// Simple analysis functions
export async function analyzeLorcanaData (ruleConfig = "core-constructed", colorFilters = ["all"]) {
  const cards = await loadLorcanaCards(ruleConfig)
  
  // Filter by colors - if "all" is selected, show all cards, otherwise filter by selected colors
  const filteredCards = colorFilters.includes("all")
    ? cards 
    : cards.filter(card => colorFilters.includes(card.color))
  
  // Calculate average cost
  const totalCost = filteredCards.reduce((sum, card) => sum + (card.cost || 0), 0)
  const averageCost = filteredCards.length > 0 ? (totalCost / filteredCards.length).toFixed(1) : 0
  
  // Calculate average lore (only for characters)
  const characterCards = filteredCards.filter(card => card.type === "character")
  const totalLore = characterCards.reduce((sum, card) => sum + (card.lore || 0), 0)
  const averageLore = characterCards.length > 0 ? (totalLore / characterCards.length).toFixed(1) : 0
  
  // Calculate average strength (only for characters)
  const totalStrength = characterCards.reduce((sum, card) => sum + (card.strength || 0), 0)
  const averageStrength = characterCards.length > 0 ? (totalStrength / characterCards.length).toFixed(1) : 0
  
  // Calculate average willpower (only for characters)
  const totalWillpower = characterCards.reduce((sum, card) => sum + (card.willpower || 0), 0)
  const averageWillpower = characterCards.length > 0 ? (totalWillpower / characterCards.length).toFixed(1) : 0
  
  return {
    totalCards: filteredCards.length,
    averageCost,
    averageLore,
    averageStrength,
    averageWillpower,
    ruleConfig,
    colorFilters
  }
}

export async function getCardStatistics (ruleConfig = "core-constructed", colorFilters = ["all"]) {
  const cards = await loadLorcanaCards(ruleConfig)
  
  // Filter by colors - if "all" is selected, show all cards, otherwise filter by selected colors
  const filteredCards = colorFilters.includes("all")
    ? cards 
    : cards.filter(card => colorFilters.includes(card.color))
  
  // Simple statistics
  const typeCounts = {}
  const colorCounts = {}
  const costCounts = {}

  filteredCards.forEach(card => {
    typeCounts[card.type] = (typeCounts[card.type] || 0) + 1

    // Handle color distribution - combine multi-color cards into "Dual Ink"
    if (card.color && card.color.includes(",")) {
      colorCounts["Dual Ink"] = (colorCounts["Dual Ink"] || 0) + 1
    } else {
      colorCounts[card.color] = (colorCounts[card.color] || 0) + 1
    }

    costCounts[card.cost] = (costCounts[card.cost] || 0) + 1
  })

  return {
    typeDistribution: typeCounts,
    colorDistribution: colorCounts,
    costDistribution: costCounts,
    totalCards: filteredCards.length
  }
}
