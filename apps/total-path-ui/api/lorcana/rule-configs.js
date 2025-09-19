// Vercel serverless function for rule configs
import { readFile } from 'fs/promises'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), '../../packages/lorcana/data-import/data')

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const filePath = join(DATA_DIR, 'rule-configs.json')
    const data = await readFile(filePath, 'utf8')
    const configs = JSON.parse(data)
    res.json(configs)
  } catch (error) {
    console.error('Error reading rule configs:', error.message)
    res.status(500).json({ error: 'Failed to load rule configs' })
  }
}
