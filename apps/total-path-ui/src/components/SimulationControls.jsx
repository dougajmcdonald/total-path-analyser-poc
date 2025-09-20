import { Play, Settings } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

const SimulationControls = ({
  maxTurns,
  setMaxTurns,
  maxPathsPerTurn,
  setMaxPathsPerTurn,
  isSimulating,
  onStartSimulation,
  canStart
}) => {
  return (
    <>
      {/* Turns and Paths Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Max Turns per Player */}
        <div className="space-y-2">
          <Label htmlFor="max-turns" className="text-sm font-medium">
            Max Turns per Player
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

        {/* Max Paths per Turn */}
        <div className="space-y-2">
          <Label htmlFor="max-paths" className="text-sm font-medium">
            Max Paths per Turn
          </Label>
          <Input
            id="max-paths"
            type="number"
            min="1"
            max="20"
            value={maxPathsPerTurn}
            onChange={(e) => setMaxPathsPerTurn(parseInt(e.target.value) || 5)}
            className="w-full"
          />
        </div>
      </div>

      {/* Start Simulation Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onStartSimulation}
          disabled={isSimulating || !canStart}
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
    </>
  )
}

export default SimulationControls
