import { ChevronLeft, ChevronRight } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

const TimelineGrid = ({ simulationData, selectedPath, onPathSelect }) => {
  const scrollContainerRef = useRef(null)
  const [cardWidth, setCardWidth] = useState(280)
  
  // Responsive card width - smaller on mobile for better fit
  useEffect(() => {
    const updateCardWidth = () => {
      setCardWidth(window.innerWidth < 640 ? 240 : 280)
    }
    
    updateCardWidth()
    window.addEventListener('resize', updateCardWidth)
    return () => window.removeEventListener('resize', updateCardWidth)
  }, [])

  // Group turns by player
  const playerTurns = {
    player1: simulationData.turns.filter(turn => turn.activePlayer === "player1"),
    player2: simulationData.turns.filter(turn => turn.activePlayer === "player2")
  }

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const scrollAmount = cardWidth
    
    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  const canScrollLeft = () => {
    if (!scrollContainerRef.current) return false
    return scrollContainerRef.current.scrollLeft > 0
  }

  const canScrollRight = () => {
    if (!scrollContainerRef.current) return false
    const container = scrollContainerRef.current
    return container.scrollLeft < (container.scrollWidth - container.clientWidth)
  }

  const getActionText = (actionType) => {
    switch (actionType) {
    case "ink": return "Ink"
    case "play": return "Play"
    case "quest": return "Quest"
    case "challenge": return "Challenge"
    case "sing": return "Sing"
    default: return "Action"
    }
  }

  const getActionColor = (actionType) => {
    switch (actionType) {
    case "ink": return "text-blue-600 border-blue-300"
    case "play": return "text-green-600 border-green-300"
    case "quest": return "text-yellow-600 border-yellow-300"
    case "challenge": return "text-red-600 border-red-300"
    case "sing": return "text-purple-600 border-purple-300"
    default: return "text-gray-600 border-gray-300"
    }
  }

  // Helper function to check if a path is the optimal path
  const isOptimalPath = (turn, path) => {
    return turn.optimalPathExecuted && turn.optimalPathExecuted.pathId === path.pathId
  }

  // Helper function to render a single turn card
  const renderTurnCard = (turn) => (
    <div 
      key={turn.turnNumber} 
      className="flex-shrink-0" 
      style={{ 
        width: cardWidth,
        scrollSnapAlign: "start"
      }}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            Turn {turn.turnNumber}
            <Badge variant="secondary" className="text-xs">
              {turn.paths.length} paths
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {turn.paths.map((path, pathIndex) => {
              const isOptimal = isOptimalPath(turn, path)
              return (
                <div 
                  key={path.pathId} 
                  className={`${
                    isOptimal ? "ring-2 ring-primary rounded-lg p-1" : ""
                  } ${
                    selectedPath === path.pathId 
                      ? "bg-muted" 
                      : "hover:bg-muted cursor-pointer"
                  } rounded-lg p-2 transition-colors`}
                  onClick={() => onPathSelect(path.pathId)}
                >
                  {/* Path Header */}
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-medium">
                      Path {pathIndex + 1}
                    </span>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {path.score}
                    </Badge>
                  </div>

                  {/* Path Stats */}
                  <div className="mb-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Ink: {path.endState.ink}</span>
                      <span>Lore: {path.endState.lore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hand: {path.endState.handSize}</span>
                      <span>Board: {path.endState.boardSize}</span>
                    </div>
                  </div>

                  {/* Action Sub-rows */}
                  <div className="space-y-1">
                    {path.actions.map((action, actionIndex) => (
                      <div
                        key={`${path.pathId}-action-${actionIndex}`}
                        className={`flex items-center space-x-2 p-2 rounded text-xs border ${getActionColor(action.type)}`}
                      >
                        <span className="font-medium">{getActionText(action.type)}</span>
                        <span className="flex-1 break-words">{action.cardName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="w-full">
      {/* Header with Scroll Controls */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft()}
          className="hidden sm:flex"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold">Simulation Timeline</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight()}
          className="hidden sm:flex"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Timeline Grid - Horizontal Scroll Container */}
      <div className="space-y-6">
        {/* Player 1 Row */}
        {playerTurns.player1.length > 0 && (
          <div className="relative">
            <div className="flex items-center mb-3">
              <h4 className="text-md font-semibold text-blue-600">Player 1</h4>
              <div className="ml-4 h-px bg-blue-200 flex-1"></div>
            </div>
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto scrollbar-hide gap-4 pb-4"
              style={{ 
                scrollSnapType: "x mandatory",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
            >
              {playerTurns.player1.map(renderTurnCard)}
            </div>
          </div>
        )}
        
        {/* Player 2 Row */}
        {playerTurns.player2.length > 0 && (        
          <div className="relative">
            <div className="flex items-center mb-3">
              <h4 className="text-md font-semibold text-red-600">Player 2</h4>
              <div className="ml-4 h-px bg-red-200 flex-1"></div>
            </div>
            <div 
              className="flex overflow-x-auto scrollbar-hide gap-4 pb-4"
              style={{ 
                scrollSnapType: "x mandatory",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
            >
              {playerTurns.player2.map(renderTurnCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimelineGrid
