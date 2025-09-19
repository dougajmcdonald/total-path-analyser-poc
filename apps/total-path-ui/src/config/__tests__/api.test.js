// Simple test to verify API configuration
import { API_BASE, LORCANA_API_BASE, getApiUrl } from '../api.js'

// Mock import.meta.env for testing
const mockEnv = {
  PROD: false,
  VITE_API_URL: undefined,
}

// Test development environment
console.log('Testing API configuration...')
console.log('API_BASE:', API_BASE)
console.log('LORCANA_API_BASE:', LORCANA_API_BASE)
console.log('Test endpoint URL:', getApiUrl('/test'))

// Expected results:
// Development: API_BASE should be 'http://localhost:3001/api'
// Production: API_BASE should be 'https://lorcanapaths.com/api' (or VITE_API_URL if set)
