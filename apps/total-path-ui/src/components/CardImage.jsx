import { Zap } from "lucide-react"
import React, { memo, useState } from "react"
import { createPlaceholderSvg, getSafeImageUrl } from "../utils/imageUtils"

const CardImage = memo(({ card, isExerted = false, isInkwell = false, className = "" }) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Handle undefined or missing card data
  if (!card || !card.name || card.name === 'undefined') {
    return (
      <div className={`bg-gray-200 rounded border-2 flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-xs px-2 py-1 text-center">
          Invalid Card
        </div>
      </div>
    )
  }
  
  const placeholderSvg = createPlaceholderSvg()
  const [imageSrc, setImageSrc] = useState(() => {
    const safeUrl = getSafeImageUrl(card.image)
    console.log(`Card: ${card.name}, Image URL: ${safeUrl}`)
    return safeUrl
  })

  const handleImageError = () => {
    if (!imageError) {
      console.log(`Image failed to load for card: ${card.name}`)
      setImageError(true)
      // Don't set imageSrc to placeholder - we want to show the card name fallback instead
    }
  }

  const handleImageLoad = () => {
    console.log(`Image loaded successfully for card: ${card.name}`)
    setIsLoading(false)
  }

  return (
    <div className={`relative group ${className}`}>
      {isLoading && !imageError && (
        <div className={`bg-gray-200 rounded border-2 animate-pulse flex items-center justify-center ${className}`}>
          <div className="text-gray-400 text-xs">Loading...</div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={card.name}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`object-cover rounded border-2 transition-all duration-200 ${
          isExerted ? "transform rotate-90" : ""
        } ${isInkwell ? "opacity-75" : ""} group-hover:scale-[3] group-hover:z-50 ${(isLoading && !imageError) || imageError ? "hidden" : ""} ${className}`}
      />
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded border-2 z-10">
          <div className="text-gray-600 text-xs px-2 py-1 text-center break-words">
            {card.name}
          </div>
        </div>
      )}
      {isInkwell && (
        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          <Zap className="w-3 h-3" />
        </div>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.card.name === nextProps.card.name &&
    prevProps.card.image === nextProps.card.image &&
    prevProps.isExerted === nextProps.isExerted &&
    prevProps.isInkwell === nextProps.isInkwell &&
    prevProps.className === nextProps.className
  )
})

CardImage.displayName = "CardImage"

export default CardImage
