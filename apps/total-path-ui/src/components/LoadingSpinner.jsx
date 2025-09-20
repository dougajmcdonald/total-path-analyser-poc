import { Card, CardContent } from "./ui/card"

const LoadingSpinner = ({ 
  message = "Loading...", 
  size = "large",
  showCard = true 
}) => {
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-16 w-16", 
    large: "h-32 w-32"
  }

  const iconSize = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-12 h-12"
  }

  const spinner = (
    <div className="text-center">
      <div className={`animate-spin rounded-full border-b-2 border-primary mx-auto ${sizeClasses[size]}`}></div>
      <p className={`mt-4 text-muted-foreground ${size === 'small' ? 'text-sm' : 'text-lg'}`}>
        {message}
      </p>
    </div>
  )

  if (!showCard) {
    return spinner
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-96">
        <CardContent className="pt-6">
          {spinner}
        </CardContent>
      </Card>
    </div>
  )
}

export default LoadingSpinner
