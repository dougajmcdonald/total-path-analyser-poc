// API configuration for different environments
const getApiBaseUrl = () => {
  // If VITE_API_URL is set, use it (for production deployments)
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '') // Remove trailing slash
    console.log('🔧 Using VITE_API_URL:', apiUrl)
    return apiUrl
  }

  // In production (Vercel), use the Vercel backend URL
  if (import.meta.env.PROD) {
    const apiUrl = 'https://total-path-analyser-poc-backend-tau.vercel.app/api'
    console.log('🔧 Using Vercel backend API:', apiUrl)
    return apiUrl
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
