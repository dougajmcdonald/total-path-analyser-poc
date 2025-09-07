import cors from "cors"
import express from "express"
import { readFile } from "fs/promises"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Path to data files
const DATA_DIR = join(__dirname, "../../packages/lorcana/data-import/data")

// Helper function to read JSON files
async function readJsonFile(filename) {
  try {
    const filePath = join(DATA_DIR, filename)
    const data = await readFile(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message)
    return null
  }
}

// API Routes with /api/lorcana prefix

// Get rule configurations
app.get("/api/lorcana/rule-configs", async (req, res) => {
  try {
    const configs = await readJsonFile("rule-configs.json")
    if (!configs) {
      return res.status(404).json({ error: "Rule configs not found" })
    }
    res.json(configs)
  } catch (error) {
    res.status(500).json({ error: "Failed to load rule configs" })
  }
})

// Get cards for a specific rule config
app.get("/api/lorcana/cards/:ruleConfig", async (req, res) => {
  try {
    const { ruleConfig } = req.params
    const cards = await readJsonFile(`latest-${ruleConfig}.json`)
    if (!cards) {
      return res.status(404).json({ error: `Cards for ${ruleConfig} not found` })
    }
    res.json(cards)
  } catch (error) {
    res.status(500).json({ error: "Failed to load cards" })
  }
})

// Get statistics
app.get("/api/lorcana/stats", async (req, res) => {
  try {
    const stats = await readJsonFile("lorcana-stats.json")
    if (!stats) {
      return res.status(404).json({ error: "Stats not found" })
    }
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: "Failed to load stats" })
  }
})

// Health check
app.get("/api/lorcana/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/lorcana/`)
})
