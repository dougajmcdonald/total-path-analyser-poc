// API configuration for different environments
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it (for custom API deployments)
  if (import.meta.env.VITE_API_URL) {
    console.log('🔧 Using VITE_API_URL:', import.meta.env.VITE_API_URL)
    return import.meta.env.VITE_API_URL
  }

  // In production (Vercel), handle www redirect issue
  if (import.meta.env.PROD) {
    const hostname = window.location.hostname
    const protocol = window.location.protocol

    // Always use www.lorcanapaths.com for API calls to avoid redirect issues
    if (
      hostname === 'lorcanapaths.com' ||
      hostname === 'www.lorcanapaths.com'
    ) {
      const apiUrl = `${protocol}//www.lorcanapaths.com/api`
      console.log('🔧 Using www.lorcanapaths.com for API:', apiUrl)
      return apiUrl
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
