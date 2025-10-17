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
  const [selectedSets, setSelectedSets] = useState(["all"])
  
  const availableColors = ["all", "Amber", "Amethyst", "Emerald", "Ruby", "Sapphire", "Steel"]
  const availableSets = [
    { value: "all", label: "All Sets" },
    { value: "1", label: "The First Chapter" },
    { value: "2", label: "Rise of the Floodborn" },
    { value: "3", label: "Into the Inklands" },
    { value: "4", label: "Ursula's Return" },
    { value: "5", label: "Shimmering Skies" },
    { value: "6", label: "Fabled" },
    { value: "7", label: "Archazia's Island" },
    { value: "8", label: "Reign of Jafar" },
    { value: "9", label: "Azurite Sea" }
  ]

  // Get available sets based on current rule config
  const getAvailableSetsForConfig = () => {
    if (!availableConfigs[ruleConfig]?.validSetNums) {
      return availableSets
    }
    
    const validSetNums = availableConfigs[ruleConfig].validSetNums
    return availableSets.filter(set => 
      set.value === "all" || validSetNums.includes(parseInt(set.value))
    )
  }

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

  // Handle set selection with multiple values
  const handleSetToggle = (setValue) => {
    if (setValue === "all") {
      setSelectedSets(["all"])
    } else {
      setSelectedSets(prev => {
        const newSets = prev.includes(setValue) 
          ? prev.filter(s => s !== setValue) // Remove if already selected
          : [...prev.filter(s => s !== "all"), setValue] // Add and remove "all"
        
        // If no sets selected, default to "all"
        return newSets.length === 0 ? ["all"] : newSets
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

  // Reset selected sets when rule config changes
  useEffect(() => {
    if (availableConfigs[ruleConfig]?.validSetNums) {
      const validSetNums = availableConfigs[ruleConfig].validSetNums
      const currentSelectedSets = selectedSets.filter(set => 
        set === "all" || validSetNums.includes(parseInt(set))
      )
      
      // If no valid sets are selected, reset to "all"
      if (currentSelectedSets.length === 0) {
        setSelectedSets(["all"])
      } else if (currentSelectedSets.length !== selectedSets.length) {
        setSelectedSets(currentSelectedSets)
      }
    }
  }, [ruleConfig, availableConfigs])

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
              selectedSets={selectedSets}
              setSelectedSets={setSelectedSets}
              availableSets={getAvailableSetsForConfig()}
              handleSetToggle={handleSetToggle}
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
                    selectedSets={selectedSets}
                  />
                }
              />
              <Route
                path="/cards"
                element={
                  <CardsPage
                    ruleConfig={ruleConfig}
                    availableConfigs={availableConfigs}
                    selectedColors={selectedColors}
                    selectedSets={selectedSets}
                  />
                }
              />
              <Route
                path="/decks"
                element={
                  <DecksPage
                    ruleConfig={ruleConfig}
                    availableConfigs={availableConfigs}
                    selectedSets={selectedSets}
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
