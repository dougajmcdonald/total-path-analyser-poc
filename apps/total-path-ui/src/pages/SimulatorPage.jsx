import { Play, Settings, Shuffle, Target } from "lucide-react"
import React, { useEffect, useState } from "react"
import SimulationVisualization from "../components/SimulationVisualization"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

const SimulatorPage = () => {
  const [testDecks, setTestDecks] = useState([])
  const [userDecks, setUserDecks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Simulation setup state
  const [player1Deck, setPlayer1Deck] = useState("")
  const [player2Deck, setPlayer2Deck] = useState("")
  const [firstPlayer, setFirstPlayer] = useState("random")
  const [strategy, setStrategy] = useState("high-stats")
  const [maxTurns, setMaxTurns] = useState(4)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showSimulation, setShowSimulation] = useState(false)
  const [simulationData, setSimulationData] = useState(null)

  // Load test decks and user decks
  useEffect(() => {
    const loadDecks = async () => {
      try {
        // Load test decks
        const testResponse = await fetch("http://localhost:3001/api/lorcana/test-decks")
        if (testResponse.ok) {
          const testDecksData = await testResponse.json()
          setTestDecks(testDecksData)
        }

        // TODO: Load user decks from DecksPage
        // For now, we'll use empty array
        setUserDecks([])
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading decks:", error)
        setIsLoading(false)
      }
    }

    loadDecks()
  }, [])

  const allDecks = [...testDecks, ...userDecks]

  const handleStartSimulation = async () => {
    if (!player1Deck || !player2Deck) {
      alert("Please select decks for both players")
      return
    }

    setIsSimulating(true)
    
    try {
      const response = await fetch("http://localhost:3001/api/lorcana/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player1Deck,
          player2Deck,
          firstPlayer,
          strategy,
          maxTurns
        })
      })

      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("API Response:", result)
      
      if (result.success) {
        console.log("Setting simulation data:", result.simulation)
        setSimulationData(result.simulation)
        setShowSimulation(true)
      } else {
        throw new Error(result.error || "Simulation failed")
      }
    } catch (error) {
      console.error("Simulation error:", error)
      alert("Simulation failed: " + error.message)
    } finally {
      setIsSimulating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Settings className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Loading Decks...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lorcana Simulator</h1>
        <p className="text-gray-600">
          Configure and run strategic path analysis simulations
        </p>
      </div>

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
            {/* Player 1 Deck */}
            <div className="space-y-2">
              <Label htmlFor="player1-deck" className="text-sm font-medium">
                Player 1 Deck
              </Label>
              <Select value={player1Deck} onValueChange={setPlayer1Deck}>
                <SelectTrigger>
                  <SelectValue placeholder="Select deck for Player 1" />
                </SelectTrigger>
                <SelectContent>
                  {testDecks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="font-medium">{deck.name}</div>
                          <div className="text-xs text-gray-500">{deck.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  {userDecks.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500">User Decks</div>
                      {userDecks.map((deck) => (
                        <SelectItem key={deck.id} value={deck.id}>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-green-500" />
                            <div>
                              <div className="font-medium">{deck.name}</div>
                              <div className="text-xs text-gray-500">{deck.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Player 2 Deck */}
            <div className="space-y-2">
              <Label htmlFor="player2-deck" className="text-sm font-medium">
                Player 2 Deck
              </Label>
              <Select value={player2Deck} onValueChange={setPlayer2Deck}>
                <SelectTrigger>
                  <SelectValue placeholder="Select deck for Player 2" />
                </SelectTrigger>
                <SelectContent>
                  {testDecks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="font-medium">{deck.name}</div>
                          <div className="text-xs text-gray-500">{deck.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  {userDecks.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500">User Decks</div>
                      {userDecks.map((deck) => (
                        <SelectItem key={deck.id} value={deck.id}>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-green-500" />
                            <div>
                              <div className="font-medium">{deck.name}</div>
                              <div className="text-xs text-gray-500">{deck.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* First Player Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">First Player</Label>
            <RadioGroup value={firstPlayer} onValueChange={setFirstPlayer} className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="player1" id="player1" />
                <Label htmlFor="player1" className="text-sm">Player 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="player2" id="player2" />
                <Label htmlFor="player2" className="text-sm">Player 2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="random" id="random" />
                <Label htmlFor="random" className="text-sm flex items-center space-x-1">
                  <Shuffle className="w-4 h-4" />
                  <span>Random</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Strategy and Turns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strategy Selection */}
            <div className="space-y-2">
              <Label htmlFor="strategy" className="text-sm font-medium">
                Strategy
              </Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-stats">High Stats Strategy</SelectItem>
                  <SelectItem value="lore-focused">Lore Focused</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                  <SelectItem value="defensive">Defensive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Turns */}
            <div className="space-y-2">
              <Label htmlFor="max-turns" className="text-sm font-medium">
                Max Turns
              </Label>
              <Input
                id="max-turns"
                type="number"
                min="1"
                max="10"
                value={maxTurns}
                onChange={(e) => setMaxTurns(parseInt(e.target.value) || 4)}
                className="w-full"
              />
            </div>
          </div>

          {/* Start Simulation Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleStartSimulation}
              disabled={isSimulating || !player1Deck || !player2Deck}
              className="px-8 py-2"
            >
              {isSimulating ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Simulation
                </>
              )}
            </Button>
          </div>
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
