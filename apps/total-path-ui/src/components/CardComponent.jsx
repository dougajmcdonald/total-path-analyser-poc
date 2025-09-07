import { Card, CardContent } from "./ui/card"

function CardComponent ({ card }) {
  const getRarityColor = (rarity) => {
    switch (rarity) {
    case "common":
      return "bg-gray-100 text-gray-800"
    case "uncommon":
      return "bg-green-100 text-green-800"
    case "rare":
      return "bg-blue-100 text-blue-800"
    case "super rare":
      return "bg-purple-100 text-purple-800"
    case "legendary":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
    case "character":
      return "bg-red-100 text-red-800"
    case "action":
      return "bg-blue-100 text-blue-800"
    case "action - song":
      return "bg-purple-100 text-purple-800"
    case "item":
      return "bg-yellow-100 text-yellow-800"
    case "location":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="overflow-hidden w-64 max-w-64 flex-shrink-0 hover:shadow-lg transition-shadow duration-200">
      {/* Card Image */}
      <div className="w-full h-64 bg-muted flex items-center justify-center">
        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none"
              e.target.nextSibling.style.display = "flex"
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center text-muted-foreground text-sm"
          style={{ display: card.image ? "none" : "flex" }}
        >
          No Image
        </div>
      </div>

      {/* Card Info */}
      <CardContent className="p-3">
        {/* Name and Cost */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1">
            {card.name}
          </h3>
          {card.cost !== undefined && (
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">
              {card.cost}
            </span>
          )}
        </div>

        {/* Set and Number */}
        <div className="text-xs text-muted-foreground mb-2">
          {card.setName} #{card.cardNum}
        </div>

        {/* Type and Rarity */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${getTypeColor(card.type)}`}
          >
            {card.type}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${getRarityColor(card.rarity)}`}
          >
            {card.rarity}
          </span>
        </div>

        {/* Stats for Characters */}
        {card.type === "character" && (
          <div className="flex justify-between text-xs text-muted-foreground">
            {card.lore !== undefined && <span>Lore: {card.lore}</span>}
            {card.willpower !== undefined && (
              <span>Will: {card.willpower}</span>
            )}
            {card.strength !== undefined && <span>Str: {card.strength}</span>}
          </div>
        )}

        {/* Color */}
        <div className="mt-2">
          <span className="text-xs text-muted-foreground">
            Color: <span className="font-medium">{card.color}</span>
          </span>
        </div>

        {/* Inkable indicator */}
        {card.inkable !== undefined && (
          <div className="mt-1">
            <span className="text-xs text-muted-foreground">
              {card.inkable ? "🖋️ Inkable" : "🚫 Not Inkable"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CardComponent
