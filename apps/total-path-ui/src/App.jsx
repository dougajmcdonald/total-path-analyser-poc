import { useEffect, useState } from "react"
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { ThemeProvider } from "./components/ThemeProvider"
import { Button } from "./components/ui/button"
import { Card, CardContent } from "./components/ui/card"
import { Label } from "./components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"
import CardsPage from "./pages/CardsPage.jsx"
import DashboardPage from "./pages/DashboardPage.jsx"
import DecksPage from "./pages/DecksPage.jsx"

import "./index.css"

function App () {
  const [ruleConfig, setRuleConfig] = useState("core-constructed")
  const [availableConfigs, setAvailableConfigs] = useState({})
  const [configLoading, setConfigLoading] = useState(true)
  const [selectedColors, setSelectedColors] = useState(["all"])
  
  const availableColors = ["all", "Amber", "Amethyst", "Emerald", "Ruby", "Sapphire", "Steel"]

  // Handle color selection with multiple values
  const handleColorToggle = (color) => {
    if (color === "all") {
      setSelectedColors(["all"])
    } else {
      setSelectedColors(prev => {
        const newColors = prev.includes(color) 
          ? prev.filter(c => c !== color) // Remove if already selected
          : [...prev.filter(c => c !== "all"), color] // Add and remove "all"
        
        // If no colors selected, default to "all"
        return newColors.length === 0 ? ["all"] : newColors
      })
    }
  }

  // Load available rule configurations
  useEffect(() => {
    async function loadConfigs () {
      try {
        const response = await fetch("http://localhost:3001/api/lorcana/rule-configs")
        const configs = await response.json()
        setAvailableConfigs(configs)
        setConfigLoading(false)
      } catch (err) {
        console.error("Error loading rule configs:", err)
        setConfigLoading(false)
      }
    }
    loadConfigs()
  }, [])

  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            {/* Navigation */}
            <nav className="mb-8">
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <h1 className="text-2xl font-bold mb-1">
                    Total Path Analyser
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Disney Lorcana Card Analysis
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Button asChild variant="outline">
                    <Link to="/">Dashboard</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/cards">Browse Cards</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/decks">Deck Builder</Link>
                  </Button>
                </div>
              </div>

              {/* Rule Config Selector */}
              <Card className="max-w-2xl mx-auto mt-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Game Format */}
                    <div>
                      <Label htmlFor="rule-config" className="block text-sm font-medium mb-2">
                        Game Format
                      </Label>
                      <Select
                        value={ruleConfig}
                        onValueChange={setRuleConfig}
                        disabled={configLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={configLoading ? "Loading formats..." : "Select format"} />
                        </SelectTrigger>
                        <SelectContent>
                          {configLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading formats...
                            </SelectItem>
                          ) : (
                            Object.entries(availableConfigs).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {!configLoading && availableConfigs[ruleConfig] && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Valid sets: {availableConfigs[ruleConfig].validSetNums.join(", ")}
                        </p>
                      )}
                    </div>

                    {/* Color Filter */}
                    <div>
                      <Label className="block text-sm font-medium mb-2">
                        Color Filter
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map((color) => (
                          <Button
                            key={color}
                            variant={selectedColors.includes(color) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleColorToggle(color)}
                          >
                            {color === "all" ? "All Colors" : color}
                          </Button>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Showing data for {selectedColors.includes("all") 
                          ? "all colors" 
                          : selectedColors.length === 1 
                            ? selectedColors[0] 
                            : `${selectedColors.length} colors (${selectedColors.join(", ")})`
                        } cards
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </nav>

            {/* Routes */}
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage
                    ruleConfig={ruleConfig}
                    availableConfigs={availableConfigs}
                    selectedColors={selectedColors}
                    setSelectedColors={setSelectedColors}
                  />
                }
              />
              <Route
                path="/cards"
                element={
                  <CardsPage
                    ruleConfig={ruleConfig}
                    availableConfigs={availableConfigs}
                  />
                }
              />
              <Route
                path="/decks"
                element={
                  <DecksPage
                    ruleConfig={ruleConfig}
                    availableConfigs={availableConfigs}
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </ThemeProvider>
    </Router>
  )
}

export default App
