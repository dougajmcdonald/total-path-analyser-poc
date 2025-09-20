import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"

const ErrorDisplay = ({ 
  title = "Error",
  message,
  onRetry,
  showCard = true,
  size = "large"
}) => {
  const iconSize = {
    small: "w-6 h-6",
    medium: "w-8 h-8", 
    large: "w-12 h-12"
  }

  const errorContent = (
    <div className="text-center">
      <div className={`text-destructive mx-auto mb-4 ${iconSize[size]}`}>
        <AlertTriangle className="w-full h-full" />
      </div>
      <h2 className={`font-bold mb-2 ${size === 'small' ? 'text-lg' : 'text-2xl'}`}>
        {title}
      </h2>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} className="flex items-center space-x-2 mx-auto">
          <RotateCcw className="w-4 h-4" />
          <span>Retry</span>
        </Button>
      )}
    </div>
  )

  if (!showCard) {
    return errorContent
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-96">
        <CardContent className="pt-6">
          {errorContent}
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorDisplay
