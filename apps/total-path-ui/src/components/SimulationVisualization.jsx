import { BarChart3, RotateCcw } from "lucide-react"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import PlayerGameState from "./PlayerGameState"
import TimelineGrid from "./TimelineGrid"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

const SimulationVisualization = ({ simulationData: propSimulationData }) => {
  const [selectedPath, setSelectedPath] = useState(null)
  const [currentGameState, setCurrentGameState] = useState(null)
  const [simulationData, setSimulationData] = useState(propSimulationData)

  // Update simulation data when prop changes
  useEffect(() => {
    if (propSimulationData) {
      setSimulationData(propSimulationData)
    }
  }, [propSimulationData])

  // Create a stable reference to game states to prevent unnecessary re-renders
  const stableGameStates = useMemo(() => {
    if (!simulationData || !simulationData.turns) return {}
    
    // Create a map of pathId to gameState from the simulation data
    // Each path now has its own gameState embedded
    const gameStateMap = {}
    simulationData.turns.forEach(turn => {
      turn.paths.forEach(path => {
        gameStateMap[path.pathId] = path.gameState
      })
    })
    return gameStateMap
  }, [simulationData])

  // Initialize with the highest scoring path from turn 1
  useEffect(() => {
    if (simulationData && simulationData.turns && simulationData.turns.length > 0) {
      const turn1 = simulationData.turns[0]
      const highestScoringPath = turn1.paths.reduce((best, current) => 
        current.score > best.score ? current : best
      )
      setSelectedPath(highestScoringPath.pathId)
      setCurrentGameState(highestScoringPath.gameState)
    }
  }, [simulationData])

  const handlePathSelect = useCallback((pathId) => {
    setSelectedPath(pathId)
    
    // Use the stable game states map
    const gameState = stableGameStates[pathId]
    setCurrentGameState(gameState || null)
  }, [stableGameStates])


  const handleResetSimulation = useCallback(() => {
    setSelectedPath(null)
    setCurrentGameState(null)
  }, [])

  const selectedPathInfo = useMemo(() => {
    if (!selectedPath || !simulationData || !simulationData.turns) return null
    
    for (const turn of simulationData.turns) {
      const path = turn.paths.find(p => p.pathId === selectedPath)
      if (path) {
        return {
          ...path,
          turnNumber: turn.turnNumber,
          activePlayer: turn.activePlayer
        }
      }
    }
    return null
  }, [selectedPath, simulationData])

  // Memoize the current game state to prevent unnecessary re-renders
  const memoizedGameState = useMemo(() => {
    return currentGameState
  }, [currentGameState])

  // Don't render if no simulation data
  if (!simulationData || !simulationData.turns) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Simulation Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No simulation data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group turns by player
  const playerTurns = useMemo(() => {
    if (!simulationData || !simulationData.turns) return { player1: [], player2: [] }
    
    return {
      player1: simulationData.turns.filter(turn => turn.activePlayer === "player1"),
      player2: simulationData.turns.filter(turn => turn.activePlayer === "player2")
    }
  }, [simulationData])

  // Get the game state for a specific player from the selected path
  const getPlayerGameState = (playerId) => {
    if (!selectedPath || !simulationData || !simulationData.turns) return null
    
    // Find the turn and path that matches the selected path
    for (const turn of simulationData.turns) {
      const path = turn.paths.find(p => p.pathId === selectedPath)
      if (path && path.gameState) {
        return path.gameState[playerId]
      }
    }
    
    return null
  }

  return (
    <div className="w-full space-y-6">
      {/* Simulation Results Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Simulation Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleResetSimulation}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </Button>
            </div>

            {selectedPathInfo && (
              <div className="flex items-center space-x-4 text-sm">
                <Badge variant="outline">
                  Turn {selectedPathInfo.turnNumber}
                </Badge>
                <Badge variant="secondary">
                  {selectedPathInfo.activePlayer === "player1" ? "Player 1" : "Player 2"}
                </Badge>
                <Badge variant="default">
                  Score: {selectedPathInfo.score}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Player 1 Section */}
      {playerTurns.player1.length > 0 && (
        <div className="space-y-4">
          <PlayerGameState
            key={`player1-${selectedPath}`}
            player={getPlayerGameState("player1")}
            playerName="Player 1"
            gameState={getPlayerGameState("player1")}
            selectedPath={selectedPath}
          />
          <TimelineGrid
            simulationData={{ ...simulationData, turns: playerTurns.player1 }}
            selectedPath={selectedPath}
            onPathSelect={handlePathSelect}
          />
        </div>
      )}

      {/* Player 2 Section */}
      {playerTurns.player2.length > 0 && (
        <div className="space-y-4">
          <PlayerGameState
            key={`player2-${selectedPath}`}
            player={getPlayerGameState("player2")}
            playerName="Player 2"
            gameState={getPlayerGameState("player2")}
            selectedPath={selectedPath}
          />
          <TimelineGrid
            simulationData={{ ...simulationData, turns: playerTurns.player2 }}
            selectedPath={selectedPath}
            onPathSelect={handlePathSelect}
          />
        </div>
      )}
    </div>
  )
}

export default SimulationVisualization
