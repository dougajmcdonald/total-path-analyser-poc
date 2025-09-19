// Debug utilities for API configuration
import { API_BASE, LORCANA_API_BASE } from '../config/api.js'

export const debugApiConfig = () => {
  console.log('🔧 API Configuration Debug:')
  console.log('Environment:', import.meta.env.MODE)
  console.log('Production:', import.meta.env.PROD)
  console.log('API_BASE:', API_BASE)
  console.log('LORCANA_API_BASE:', LORCANA_API_BASE)
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)

  // Test API connectivity
  return {
    environment: import.meta.env.MODE,
    isProduction: import.meta.env.PROD,
    apiBase: API_BASE,
    lorcanaApiBase: LORCANA_API_BASE,
    viteApiUrl: import.meta.env.VITE_API_URL,
  }
}

// Call this in development to debug API configuration
if (import.meta.env.DEV) {
  debugApiConfig()
}
