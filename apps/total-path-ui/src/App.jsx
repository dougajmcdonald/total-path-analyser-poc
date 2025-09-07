import { useEffect, useState } from "react"
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom"

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <nav className="mb-8">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  Total Path Analyser
                </h1>
                <p className="text-muted-foreground mb-6">
                  Disney Lorcana Card Analysis
                </p>
              </div>
              <div className="flex space-x-4">
                <Button asChild variant="default">
                  <Link to="/">Dashboard</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/cards">Browse Cards</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/decks">Deck Builder</Link>
                </Button>
              </div>
            </div>

            {/* Rule Config Selector */}
            <Card className="max-w-md mx-auto mt-6">
              <CardContent className="pt-6">
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
                    Valid sets:{" "}
                    {availableConfigs[ruleConfig].validSetNums.join(", ")}
                  </p>
                )}
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
    </Router>
  )
}

export default App
