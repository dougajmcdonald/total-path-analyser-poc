import { Settings, Target } from "lucide-react"
import React, { useEffect, useState } from "react"
import DeckSelector from "../components/DeckSelector"
import FirstPlayerSelector from "../components/FirstPlayerSelector"
import LoadingSpinner from "../components/LoadingSpinner"
import SimulationControls from "../components/SimulationControls"
import SimulationSettings from "../components/SimulationSettings"
import SimulationVisualization from "../components/SimulationVisualization"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { getApiUrl } from "../config/api.js"
import { getUserDecksForSimulator } from "../utils/deckStorage.js"

const SimulatorPage = () => {
  const [testDecks, setTestDecks] = useState([])
  const [userDecks, setUserDecks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Simulation setup state
  const [player1Deck, setPlayer1Deck] = useState("")
  const [player2Deck, setPlayer2Deck] = useState("")
  const [firstPlayer, setFirstPlayer] = useState("random")
  const [strategy, setStrategy] = useState("Default Strategy")
  const [maxTurns, setMaxTurns] = useState(4)
  const [analysisMode, setAnalysisMode] = useState("optimal")
  const [maxPathsPerTurn, setMaxPathsPerTurn] = useState(5)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showSimulation, setShowSimulation] = useState(false)
  const [simulationData, setSimulationData] = useState(null)

  // Load test decks and user decks
  useEffect(() => {
    const loadDecks = async () => {
      try {
        // Load test decks
        const testResponse = await fetch(getApiUrl("/test-decks"))
        if (testResponse.ok) {
          const testDecksData = await testResponse.json()
          setTestDecks(testDecksData)
        }

        // Load user decks from shared storage
        const userDecksData = getUserDecksForSimulator()
        setUserDecks(userDecksData)
        
        setIsLoading(false)
      } catch {
        setIsLoading(false)
      }
    }

    loadDecks()

    // Listen for storage changes to refresh user decks
    const handleStorageChange = () => {
      const userDecksData = getUserDecksForSimulator()
      setUserDecks(userDecksData)
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events from DecksPage
    window.addEventListener('decksUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('decksUpdated', handleStorageChange)
    }
  }, [])


  const handleStartSimulation = async () => {
    if (!player1Deck || !player2Deck) {
      alert("Please select decks for both players")
      return
    }

    setIsSimulating(true)
    
    try {
      const response = await fetch(getApiUrl("/simulate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player1Deck,
          player2Deck,
          firstPlayer,
          strategy,
          maxTurns: maxTurns * 2, // Double the turns to get turns per player
          analysisMode,
          maxPathsPerTurn,
          maxDepth: 3,
          showAllPaths: false
        })
      })

      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setSimulationData(result.simulation)
        setShowSimulation(true)
      } else {
        throw new Error(result.error || "Simulation failed")
      }
    } catch (error) {
      alert("Simulation failed: " + error.message)
    } finally {
      setIsSimulating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner message="Loading Decks..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Setup Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Simulation Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deck Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DeckSelector
              label="Player 1 Deck"
              value={player1Deck}
              onValueChange={setPlayer1Deck}
              testDecks={testDecks}
              userDecks={userDecks}
              placeholder="Select deck for Player 1"
            />
            <DeckSelector
              label="Player 2 Deck"
              value={player2Deck}
              onValueChange={setPlayer2Deck}
              testDecks={testDecks}
              userDecks={userDecks}
              placeholder="Select deck for Player 2"
            />
          </div>

          {/* First Player Selection */}
          <FirstPlayerSelector
            value={firstPlayer}
            onValueChange={setFirstPlayer}
          />

          {/* Strategy and Analysis Settings */}
          <SimulationSettings
            strategy={strategy}
            setStrategy={setStrategy}
            analysisMode={analysisMode}
            setAnalysisMode={setAnalysisMode}
          />

          {/* Simulation Controls */}
          <SimulationControls
            maxTurns={maxTurns}
            setMaxTurns={setMaxTurns}
            maxPathsPerTurn={maxPathsPerTurn}
            setMaxPathsPerTurn={setMaxPathsPerTurn}
            isSimulating={isSimulating}
            onStartSimulation={handleStartSimulation}
            canStart={player1Deck && player2Deck}
          />
        </CardContent>
      </Card>

      {/* Simulation Results Area */}
      {showSimulation && simulationData ? (
        <SimulationVisualization 
          simulationData={simulationData}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Simulation results will appear here after running a simulation</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SimulatorPage
