import { Shuffle } from "lucide-react"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"

const FirstPlayerSelector = ({ value, onValueChange }) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">First Player</Label>
      <RadioGroup value={value} onValueChange={onValueChange} className="flex space-x-6">
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
  )
}

export default FirstPlayerSelector
