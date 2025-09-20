import { forwardRef } from "react"

const ResponsiveCardGrid = forwardRef(({ 
  children, 
  className = "", 
  cardSize = "default",
  ...props 
}, ref) => {
  // Different grid configurations based on card size
  const gridConfigs = {
    small: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
    default: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    large: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  }

  const gapConfigs = {
    small: "gap-2 sm:gap-3",
    default: "gap-4",
    large: "gap-6"
  }

  const baseClasses = "grid justify-items-center"
  const gridClasses = gridConfigs[cardSize] || gridConfigs.default
  const gapClasses = gapConfigs[cardSize] || gapConfigs.default

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${gridClasses} ${gapClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})

ResponsiveCardGrid.displayName = "ResponsiveCardGrid"

export default ResponsiveCardGrid
