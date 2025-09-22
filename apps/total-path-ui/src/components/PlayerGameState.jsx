import { Heart, Users, Zap } from "lucide-react"
import React, { memo } from "react"
import CardImage from "./CardImage"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

const PlayerGameState = memo(({ player, playerName, gameState, selectedPath }) => {
  if (!gameState || !player) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm">{playerName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No game state available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          {playerName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Player Stats */}
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Heart className="w-3 h-3" />
            <span>{player.lore} lore</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>{player.ink} ink</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{player.hand?.length || 0} hand</span>
          </div>
        </div>

        {/* Cards in a single row layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Hand */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Hand ({player.hand?.length || 0})</h4>
            <div className="flex flex-wrap gap-1">
              {player.hand && player.hand.length > 0 ? (
                player.hand.slice(0, 8).map((card, index) => {
                  if (!card || !card.name || card.name === "undefined") {
                    console.log("Invalid card in hand:", card, "at index:", index)
                    return null
                  }
                  return (
                    <div key={`hand-${index}`} className="relative">
                      <CardImage
                        card={card}
                        className="w-24 h-32 rounded border"
                      />
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {card.cost}
                      </div>
                      {card.drawnThisTurn && (
                        <div className="absolute -top-1 -left-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                          D
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-xs text-muted-foreground">No cards</div>
              )}
              {player.hand && player.hand.length > 8 && (
                <div className="w-24 h-32 rounded border border-dashed border-muted-foreground flex items-center justify-center text-xs text-muted-foreground">
                  +{player.hand.length - 8}
                </div>
              )}
            </div>
          </div>

          {/* Inkwell */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Inkwell ({player.inkwell?.length || 0})</h4>
            <div className="flex flex-wrap gap-1">
              {player.inkwell && player.inkwell.length > 0 ? (
                player.inkwell.map((cardState, index) => {
                  const card = cardState.card || cardState
                  if (!card || !card.name || card.name === "undefined") {
                    console.log("Invalid card in inkwell:", cardState, "at index:", index)
                    return null
                  }
                  return (
                    <div key={`inkwell-${index}`} className="relative">
                      <CardImage
                        card={card}
                        isExerted={cardState.exerted}
                        className="w-24 h-32 rounded border"
                      />
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center z-5">
                        {card.cost}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-xs text-muted-foreground">No cards</div>
              )}
            </div>
          </div>

          {/* Board */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Board ({player.board?.length || 0})</h4>
            <div className="flex flex-wrap gap-1">
              {player.board && player.board.length > 0 ? (
                player.board.map((cardState, index) => {
                  const card = cardState.card || cardState
                  if (!card || !card.name || card.name === "undefined") {
                    console.log("Invalid card in board:", cardState, "at index:", index)
                    return null
                  }
                  return (
                    <div key={`board-${index}`} className="relative">
                      <CardImage
                        card={card}
                        isExerted={cardState.exerted}
                        className="w-24 h-32 rounded border"
                      />
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center z-5">
                        {card.cost}
                      </div>
                      <div className="absolute -bottom-1 -left-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center z-5">
                        {card.lore || 0}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-xs text-muted-foreground">No cards</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

PlayerGameState.displayName = "PlayerGameState"

export default PlayerGameState
