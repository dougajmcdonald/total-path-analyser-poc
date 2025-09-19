// API configuration for different environments
const getApiBaseUrl = () => {
  // In production (Vercel), handle www redirect issue first
  if (import.meta.env.PROD) {
    const hostname = window.location.hostname
    const protocol = window.location.protocol

    // Always use www.lorcanapaths.com for API calls to avoid redirect issues
    if (
      hostname === 'https://total-path-analyser-poc-backend-tau.vercel.app' ||
      hostname === 'http://total-path-analyser-poc-backend-tau.vercel.app'
    ) {
      const apiUrl = `${protocol}total-path-analyser-poc-backend-tau.vercel.app//api`
      console.log('🔧 Using url for API:', apiUrl)
      return apiUrl
    }

    // If VITE_API_URL is set and we're not on lorcanapaths.com, use it
    if (import.meta.env.VITE_API_URL) {
      console.log('🔧 Using VITE_API_URL:', import.meta.env.VITE_API_URL)
      return import.meta.env.VITE_API_URL
    }

    // Fallback to same origin for other domains
    const origin = window.location.origin
    console.log('🔧 Using same origin for API:', origin)
    return `${origin}/api`
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
