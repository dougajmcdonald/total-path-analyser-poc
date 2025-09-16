// Utility functions for handling card images

/**
 * Check if an image URL is from an external API that might be unreliable
 */
export const isExternalApiImage = (imageUrl) => {
  if (!imageUrl) return false

  // Only block truly unreliable external APIs, not the official Lorcana API
  const unreliableApis = ['unreliable-api.com', 'placeholder-api.com']

  return unreliableApis.some((api) => imageUrl.includes(api))
}

/**
 * Create a placeholder SVG data URL for card images
 */
export const createPlaceholderSvg = () => {
  const svg = `
    <svg width="64" height="96" viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="96" fill="#F3F4F6"/>
      <rect x="4" y="4" width="56" height="88" rx="4" fill="#E5E7EB"/>
      <svg x="16" y="24" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 12L15 6L21 12"/>
        <path d="M15 6V18"/>
      </svg>
      <text x="32" y="70" text-anchor="middle" font-family="Arial" font-size="10" fill="#6B7280">Card</text>
    </svg>
  `

  return 'data:image/svg+xml;base64,' + btoa(svg)
}

/**
 * Get a safe image URL, falling back to placeholder if external API
 */
export const getSafeImageUrl = (imageUrl) => {
  const placeholder = createPlaceholderSvg()

  if (!imageUrl) return placeholder
  if (isExternalApiImage(imageUrl)) return placeholder

  return imageUrl
}
