// API configuration for different environments
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // In production (Vercel), use the same domain as the frontend
  if (import.meta.env.PROD) {
    // Use the same origin as the frontend to avoid CORS issues
    return `${window.location.origin}/api`
  }

  // In development, use localhost
  return 'http://localhost:3001/api'
}

export const API_BASE = getApiBaseUrl()
export const LORCANA_API_BASE = `${API_BASE}/lorcana`

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${LORCANA_API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}
