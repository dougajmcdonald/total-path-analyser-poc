import { Heart, Users, Zap } from 'lucide-react'
import React, { memo } from 'react'
import CardImage from './CardImage'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const GameStatePanel = memo(({ gameState, selectedPath }) => {

  if (!gameState) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm">Game State</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Select a path to view game state</p>
        </CardContent>
      </Card>
    )
  }

  const { player1, player2 } = gameState

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Game State
          {selectedPath && (
            <Badge variant="outline" className="text-xs">
              {selectedPath}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Player 1 State */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-sm">Player 1</h4>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{player1.lore} lore</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>{player1.ink} ink</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{player1.hand.length} hand</span>
              </div>
            </div>
          </div>

          {/* Hand */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-2">Hand ({player1.hand.length})</h5>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {player1.hand.map((card, index) => (
                <CardImage key={`p1-hand-${card.id}-${index}`} card={card} className="flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Board */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-2">Board ({player1.board.length})</h5>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {player1.board.map((card, index) => (
                <CardImage 
                  key={`p1-board-${card.id}-${index}`} 
                  card={card} 
                  isExerted={card.exerted}
                  className="flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Inkwell */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-2">Inkwell ({player1.inkwell.length})</h5>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {player1.inkwell.map((card, index) => (
                <div 
                  key={`p1-inkwell-${card.id}-${index}`} 
                  className="relative flex-shrink-0"
                  style={{ 
                    transform: `translateX(${index * 8}px)`,
                    zIndex: player1.inkwell.length - index
                  }}
                >
                  <CardImage 
                    card={card} 
                    isInkwell={true}
                    className="relative"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Player 2 State */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-sm">Player 2</h4>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{player2.lore} lore</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>{player2.ink} ink</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{player2.hand.length} hand</span>
              </div>
            </div>
          </div>

          {/* Hand */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-2">Hand ({player2.hand.length})</h5>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {player2.hand.map((card, index) => (
                <CardImage key={`p2-hand-${card.id}-${index}`} card={card} className="flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Board */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-2">Board ({player2.board.length})</h5>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {player2.board.map((card, index) => (
                <CardImage 
                  key={`p2-board-${card.id}-${index}`} 
                  card={card} 
                  isExerted={card.exerted}
                  className="flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Inkwell */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-2">Inkwell ({player2.inkwell.length})</h5>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {player2.inkwell.map((card, index) => (
                <div 
                  key={`p2-inkwell-${card.id}-${index}`} 
                  className="relative flex-shrink-0"
                  style={{ 
                    transform: `translateX(${index * 8}px)`,
                    zIndex: player2.inkwell.length - index
                  }}
                >
                  <CardImage 
                    card={card} 
                    isInkwell={true}
                    className="relative"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

GameStatePanel.displayName = 'GameStatePanel'

export default GameStatePanel
