// API configuration for different environments
const getApiBaseUrl = () => {
  // In production (Vercel), use the production API URL
  if (import.meta.env.PROD) {
    // You'll need to set this environment variable in Vercel
    return import.meta.env.VITE_API_URL || 'https://lorcanapaths.com/api'
  }

  // In development, use localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
}

export const API_BASE = getApiBaseUrl()
export const LORCANA_API_BASE = `${API_BASE}/lorcana`

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${LORCANA_API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}
