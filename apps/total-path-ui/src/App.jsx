import { useEffect, useState } from "react"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Navigation from "./components/Navigation"
import { ThemeProvider } from "./components/ThemeProvider"
import { getApiUrl } from "./config/api.js"
import CardsPage from "./pages/CardsPage.jsx"
import DashboardPage from "./pages/DashboardPage.jsx"
import DecksPage from "./pages/DecksPage.jsx"
import SimulatorPage from "./pages/SimulatorPage.jsx"

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
        const response = await fetch(getApiUrl("/rule-configs"))
        const configs = await response.json()
        setAvailableConfigs(configs)
        setConfigLoading(false)
      } catch {
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
            <Navigation
              ruleConfig={ruleConfig}
              setRuleConfig={setRuleConfig}
              availableConfigs={availableConfigs}
              configLoading={configLoading}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              availableColors={availableColors}
              handleColorToggle={handleColorToggle}
            />

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
              <Route
                path="/simulator"
                element={<SimulatorPage />}
              />
            </Routes>
          </div>
        </div>
      </ThemeProvider>
    </Router>
  )
}

export default App
