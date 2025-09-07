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
export async function analyzeLorcanaData (ruleConfig = "core-constructed") {
  const cards = await loadLorcanaCards(ruleConfig)
  
  // Calculate average cost
  const totalCost = cards.reduce((sum, card) => sum + (card.cost || 0), 0)
  const averageCost = cards.length > 0 ? (totalCost / cards.length).toFixed(1) : 0
  
  return {
    totalCards: cards.length,
    averageCost,
    ruleConfig
  }
}

export async function getCardStatistics (ruleConfig = "core-constructed") {
  const cards = await loadLorcanaCards(ruleConfig)
  
  // Simple statistics
  const typeCounts = {}
  const colorCounts = {}
  const costCounts = {}
  
  cards.forEach(card => {
    typeCounts[card.type] = (typeCounts[card.type] || 0) + 1
    colorCounts[card.color] = (colorCounts[card.color] || 0) + 1
    costCounts[card.cost] = (costCounts[card.cost] || 0) + 1
  })
  
  return {
    typeDistribution: typeCounts,
    colorDistribution: colorCounts,
    costDistribution: costCounts,
    totalCards: cards.length
  }
}
