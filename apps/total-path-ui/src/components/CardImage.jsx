import { Zap } from "lucide-react"
import React, { memo, useState } from "react"
import { createPlaceholderSvg, getSafeImageUrl } from "../utils/imageUtils"

const CardImage = memo(({ card, isExerted = false, isInkwell = false, className = "" }) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const placeholderSvg = createPlaceholderSvg()
  const [imageSrc, setImageSrc] = useState(getSafeImageUrl(card.image))

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true)
      setImageSrc(placeholderSvg)
    }
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={`relative group ${className}`}>
      {isLoading && !imageError && (
        <div className="w-16 h-24 bg-gray-200 rounded border-2 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-xs">Loading...</div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={card.name}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`w-16 h-24 object-cover rounded border-2 transition-all duration-200 ${
          isExerted ? "transform rotate-90" : ""
        } ${isInkwell ? "opacity-75" : ""} group-hover:scale-105 ${isLoading && !imageError ? "hidden" : ""}`}
      />
      {isExerted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
            EXERTED
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
