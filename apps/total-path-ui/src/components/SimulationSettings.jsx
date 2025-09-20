import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const SimulationSettings = ({
  strategy,
  setStrategy,
  analysisMode,
  setAnalysisMode
}) => {
  return (
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
            <SelectItem value="Default Strategy">Default Strategy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analysis Mode */}
      <div className="space-y-2">
        <Label htmlFor="analysis-mode" className="text-sm font-medium">
          Analysis Mode
        </Label>
        <Select value={analysisMode} onValueChange={setAnalysisMode}>
          <SelectTrigger>
            <SelectValue placeholder="Select analysis mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="optimal">Optimal Paths</SelectItem>
            <SelectItem value="full">Full Permutations</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default SimulationSettings
