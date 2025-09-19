// API configuration test utility
import { API_BASE, LORCANA_API_BASE, getApiUrl } from '../config/api.js'

export const testApiConfiguration = async () => {
  console.log('🧪 Testing API Configuration...')
  console.log('Current hostname:', window.location.hostname)
  console.log('Current origin:', window.location.origin)
  console.log('API_BASE:', API_BASE)
  console.log('LORCANA_API_BASE:', LORCANA_API_BASE)
  console.log('Test URL:', getApiUrl('/rule-configs'))

  // Test a simple API call
  try {
    const testUrl = getApiUrl('/rule-configs')
    console.log('Testing API call to:', testUrl)

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      console.log('✅ API call successful!')
      const data = await response.json()
      console.log('Response data:', data)
      return { success: true, data }
    } else {
      console.log('❌ API call failed:', response.status, response.statusText)
      return {
        success: false,
        error: `${response.status} ${response.statusText}`,
      }
    }
  } catch (error) {
    console.log('❌ API call error:', error.message)
    return { success: false, error: error.message }
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  testApiConfiguration()
}
