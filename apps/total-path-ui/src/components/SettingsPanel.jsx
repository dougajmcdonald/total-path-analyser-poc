import { ChevronUp, X } from "lucide-react"
import React from "react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Label } from "./ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"

const SettingsPanel = ({
  isOpen,
  onClose,
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
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Settings Panel */}
      <div className="fixed top-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] md:top-20 md:right-4 sm:top-16 sm:right-2 sm:w-[calc(100vw-1rem)]">
        <Card className="shadow-lg border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Settings</h3>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
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

              {/* Set Filter */}
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Set Filter
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableSets.map((set) => (
                    <Button
                      key={set.value}
                      variant={selectedSets.includes(set.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSetToggle(set.value)}
                    >
                      {set.label}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Card browser and deck builder will show cards from {selectedSets.includes("all") 
                    ? "all sets" 
                    : selectedSets.length === 1 
                      ? availableSets.find(s => s.value === selectedSets[0])?.label
                      : `${selectedSets.length} sets`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default SettingsPanel
