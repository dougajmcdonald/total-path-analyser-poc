import { Card, CardContent } from "./ui/card"

function CardComponent ({ card }) {

  return (
    <Card className="overflow-hidden w-64 max-w-64 flex-shrink-0 hover:shadow-lg transition-shadow duration-200">
      {/* Card Image */}
      <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
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
        {/* Name */}
        <div className="mb-2">
          <h3 className="font-semibold text-sm line-clamp-2">
            {card.name}
          </h3>
        </div>

        {/* Set and Number */}
        <div className="text-xs text-muted-foreground mb-2">
          {card.setName} #{card.cardNum}
        </div>

        {/* Stats for Characters */}
        {card.type === "character" && (
          <div className="flex justify-between text-xs text-muted-foreground">
            {card.lore !== undefined && <span>Lore: {card.lore}</span>}
            {card.strength !== undefined && <span>Str: {card.strength}</span>}
            {card.willpower !== undefined && (
              <span>Will: {card.willpower}</span>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  )
}

export default CardComponent
