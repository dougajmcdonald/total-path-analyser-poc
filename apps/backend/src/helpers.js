import { readFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Path to data files - use local data directory for Vercel deployment
const DATA_DIR = join(__dirname, '../data')
const TEST_DATA_DIR = join(__dirname, '../test-data')

console.log('Backend data paths:')
console.log('__dirname:', __dirname)
console.log('DATA_DIR:', DATA_DIR)
console.log('TEST_DATA_DIR:', TEST_DATA_DIR)

// Helper function to read JSON files
export async function readJsonFile(filename) {
  try {
    const filePath = join(DATA_DIR, filename)
    const data = await readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message)
    return null
  }
}

// Helper function to read test data files
export async function readTestDataFile(filename) {
  try {
    const filePath = join(TEST_DATA_DIR, filename)
    const data = await readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading test data ${filename}:`, error.message)
    return null
  }
}
