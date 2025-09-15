import { ChevronLeft, ChevronRight, Target, Zap } from 'lucide-react'
import React, { useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const TimelineGrid = ({ simulationData, selectedPath, onPathSelect }) => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const cardWidth = 200 // Width of each turn column
  const scrollAmount = cardWidth


  const handleScroll = (direction) => {
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount
    setScrollPosition(newPosition)
  }

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'ink': return <Zap className="w-3 h-3 text-blue-500" />
      case 'play': return <Target className="w-3 h-3 text-green-500" />
      case 'quest': return <Target className="w-3 h-3 text-yellow-500" />
      case 'challenge': return <Target className="w-3 h-3 text-red-500" />
      case 'sing': return <Target className="w-3 h-3 text-purple-500" />
      default: return <Target className="w-3 h-3 text-gray-500" />
    }
  }

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'ink': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'play': return 'bg-green-100 text-green-800 border-green-200'
      case 'quest': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'challenge': return 'bg-red-100 text-red-800 border-red-200'
      case 'sing': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="w-full">
      {/* Scroll Controls */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleScroll('left')}
          disabled={scrollPosition === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold">Simulation Timeline</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleScroll('right')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Timeline Grid */}
      <div className="relative">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {simulationData.turns.map((turn) => (
            <div key={turn.turnNumber} className="flex-shrink-0 mr-4" style={{ width: cardWidth }}>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    Turn {turn.turnNumber}
                    <Badge variant="secondary" className="text-xs">
                      {turn.paths.length} paths
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {turn.activePlayer === 'player1' ? 'Player 1' : 'Player 2'}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {turn.paths.map((path, pathIndex) => (
                      <div key={path.pathId}>
                        {/* Path Header */}
                        <Button
                          variant={selectedPath === path.pathId ? "default" : "outline"}
                          size="sm"
                          className={`w-full justify-start text-left h-auto p-2 ${
                            selectedPath === path.pathId 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => onPathSelect(path.pathId)}
                        >
                          <div className="flex flex-col items-start w-full">
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-medium truncate">
                                {path.description}
                              </span>
                              <Badge variant="outline" className="text-xs ml-2">
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
                              className={`flex items-center space-x-2 p-1 rounded text-xs border ${getActionColor(action.type)}`}
                            >
                              {getActionIcon(action.type)}
                              <span className="truncate flex-1">{action.cardName}</span>
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
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimelineGrid
