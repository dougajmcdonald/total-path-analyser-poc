import { ChevronLeft, ChevronRight } from "lucide-react"
import React, { useState } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

const TimelineGrid = ({ simulationData, selectedPath, onPathSelect }) => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const cardWidth = 280 // Width of each turn column - increased for better text display
  const scrollAmount = cardWidth

  // Group turns by player
  const playerTurns = {
    player1: simulationData.turns.filter(turn => turn.activePlayer === "player1"),
    player2: simulationData.turns.filter(turn => turn.activePlayer === "player2")
  }

  const handleScroll = (direction) => {
    const newPosition = direction === "left" 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount
    setScrollPosition(newPosition)
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
    case "ink": return "bg-blue-50 text-blue-800 border-blue-300"
    case "play": return "bg-green-50 text-green-800 border-green-300"
    case "quest": return "bg-yellow-50 text-yellow-800 border-yellow-300"
    case "challenge": return "bg-red-50 text-red-800 border-red-300"
    case "sing": return "bg-purple-50 text-purple-800 border-purple-300"
    default: return "bg-gray-50 text-gray-800 border-gray-300"
    }
  }

  // Helper function to check if a path is the optimal path
  const isOptimalPath = (turn, path) => {
    return turn.optimalPathExecuted && turn.optimalPathExecuted.pathId === path.pathId
  }

  // Helper function to render a single turn card
  const renderTurnCard = (turn) => (
    <div key={turn.turnNumber} className="flex-shrink-0 mr-4" style={{ width: cardWidth }}>
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
                <div key={path.pathId} className={isOptimal ? "ring-2 ring-primary rounded-lg p-1" : ""}>
                  {/* Path Header */}
                  <Button
                    variant={selectedPath === path.pathId ? "default" : "outline"}
                    size="sm"
                    className={`w-full justify-start text-left h-auto p-2 ${
                      selectedPath === path.pathId 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => onPathSelect(path.pathId)}
                  >
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-medium">
                          Path {pathIndex + 1}
                        </span>
                        <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                          {path.score}
                        </Badge>
                      </div>
                    </div>
                  </Button>

                  {/* Action Sub-rows */}
                  <div className="ml-2 mt-1 space-y-1">
                    {path.actions.map((action, actionIndex) => (
                      <div
                        key={`${path.pathId}-action-${actionIndex}`}
                        className={`flex items-center space-x-2 p-2 rounded text-xs border-2 ${getActionColor(action.type)}`}
                      >
                        <span className="font-medium">{getActionText(action.type)}</span>
                        <span className="flex-1 break-words">{action.cardName}</span>
                      </div>
                    ))}
                  </div>

                  {/* Path Stats */}
                  <div className="ml-2 mt-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Ink: {path.endState.ink}</span>
                      <span>Lore: {path.endState.lore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hand: {path.endState.handSize}</span>
                      <span>Board: {path.endState.boardSize}</span>
                    </div>
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
      {/* Scroll Controls */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleScroll("left")}
          disabled={scrollPosition === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold">Simulation Timeline</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleScroll("right")}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Timeline Grid - Two Rows for Players */}
      <div className="space-y-6">
        {/* Player 1 Row */}
        <div className="relative">
          <div className="flex items-center mb-3">
            <h4 className="text-md font-semibold text-blue-600">Player 1</h4>
            <div className="ml-4 h-px bg-blue-200 flex-1"></div>
          </div>
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${scrollPosition}px)` }}
          >
            {playerTurns.player1.map(renderTurnCard)}
          </div>
        </div>

        {/* Player 2 Row */}
        <div className="relative">
          <div className="flex items-center mb-3">
            <h4 className="text-md font-semibold text-red-600">Player 2</h4>
            <div className="ml-4 h-px bg-red-200 flex-1"></div>
          </div>
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${scrollPosition}px)` }}
          >
            {playerTurns.player2.map(renderTurnCard)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineGrid
