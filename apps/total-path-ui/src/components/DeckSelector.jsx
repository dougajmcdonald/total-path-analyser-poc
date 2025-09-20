import { Target } from "lucide-react"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const DeckSelector = ({
  label,
  value,
  onValueChange,
  testDecks = [],
  userDecks = [],
  placeholder = "Select deck"
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
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
  )
}

export default DeckSelector
