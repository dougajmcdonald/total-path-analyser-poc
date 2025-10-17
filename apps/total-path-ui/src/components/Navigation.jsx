import { Menu, Settings, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import SettingsPanel from "./SettingsPanel"
import { Button } from "./ui/button"

const Navigation = ({
  ruleConfig,
  setRuleConfig,
  availableConfigs,
  configLoading,
  selectedColors,
  setSelectedColors,
  availableColors,
  handleColorToggle,
  selectedSets,
  setSelectedSets,
  availableSets,
  handleSetToggle
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const location = useLocation()
  const mobileMenuRef = useRef(null)

  const navigationItems = [
    { path: "/", label: "Dashboard" },
    { path: "/cards", label: "Browse Cards" },
    { path: "/decks", label: "Deck Builder" },
    { path: "/simulator", label: "Simulator" }
  ]

  const isActive = (path) => location.pathname === path

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobileMenuOpen])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      <nav className="mb-8">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="text-left">
            <h1 className="text-2xl font-bold mb-1">
              Lorcana Paths
            </h1>
            <p className="text-sm text-muted-foreground">
              Disney Lorcana Deck Analysis & Simulation
            </p>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                asChild
                variant={isActive(item.path) ? "default" : "outline"}
              >
                <Link to={item.path}>{item.label}</Link>
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="ml-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden mt-4 p-4 bg-card border rounded-lg shadow-lg">
            <div className="flex flex-col space-y-3">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive(item.path) ? "default" : "outline"}
                  className="justify-start h-12 text-base"
                  onClick={closeMobileMenu}
                >
                  <Link to={item.path}>{item.label}</Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
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
        availableSets={availableSets}
        handleSetToggle={handleSetToggle}
      />
    </>
  )
}

export default Navigation
