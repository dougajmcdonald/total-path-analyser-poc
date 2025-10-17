import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import CardComponent from "../components/CardComponent.jsx"
import ErrorDisplay from "../components/ErrorDisplay"
import LoadingSpinner from "../components/LoadingSpinner"
import ResponsiveCardGrid from "../components/ResponsiveCardGrid"
import { loadLorcanaCards } from "../utils/dataLoader.js"

const CARDS_PER_PAGE = 100

function CardsPage ({ ruleConfig, availableConfigs, selectedColors, selectedSets }) {
  const [cards, setCards] = useState([])
  const [filteredCards, setFilteredCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  // Load cards when rule config changes
  useEffect(() => {
    async function loadCards () {
      setLoading(true)
      setError(null)
      setCurrentPage(1)

      try {
        const allCards = await loadLorcanaCards(ruleConfig)
        setCards(allCards)
      } catch (err) {
        console.error("Error loading cards:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [ruleConfig])

  // Filter cards when selectedColors, selectedSets, or searchQuery changes
  useEffect(() => {
    if (!cards.length) return

    let filtered = cards

    // Apply set filter
    if (!selectedSets.includes('all')) {
      filtered = filtered.filter((card) => selectedSets.includes(card.setNum.toString()))
    }

    // Apply color filter
    if (!selectedColors.includes('all')) {
      filtered = filtered.filter((card) => {
        // Handle multi-color cards (e.g., "Amber, Steel")
        if (card.color && card.color.includes(',')) {
          const cardColors = card.color.split(',').map(c => c.trim())
          return cardColors.some(color => selectedColors.includes(color))
        }
        // Handle single color cards
        return selectedColors.includes(card.color)
      })
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((card) => 
        card.name.toLowerCase().includes(query) ||
        (card.bodyText && card.bodyText.toLowerCase().includes(query)) ||
        (card.flavorText && card.flavorText.toLowerCase().includes(query)) ||
        (card.classifications && card.classifications.toLowerCase().includes(query)) ||
        (card.franchise && card.franchise.toLowerCase().includes(query))
      )
    }

    setFilteredCards(filtered)
    setTotalPages(Math.ceil(filtered.length / CARDS_PER_PAGE))
    setCurrentPage(1) // Reset to first page when filter changes
  }, [cards, selectedColors, selectedSets, searchQuery])

  // Get current page cards
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE
  const endIndex = startIndex + CARDS_PER_PAGE
  const currentCards = filteredCards.slice(startIndex, endIndex)

  if (loading) {
    return <LoadingSpinner message="Loading cards..." />
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Error Loading Cards"
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-3xl font-bold mb-4">Browse Cards</h2>
          
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search cards by name, text, franchise, or classifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <p className="text-muted-foreground">
            Showing {currentCards.length} of {filteredCards.length} cards in{" "}
            {availableConfigs[ruleConfig]?.name} format
            {!selectedColors.includes('all') && (
              <span className="ml-2">
                (filtered by {selectedColors.length === 1 ? selectedColors[0] : `${selectedColors.length} colors`})
              </span>
            )}
            {!selectedSets.includes('all') && (
              <span className="ml-2">
                (from {selectedSets.length === 1 ? `Set ${selectedSets[0]}` : `${selectedSets.length} sets`})
              </span>
            )}
            {searchQuery.trim() && (
              <span className="ml-2">
                (searching for "{searchQuery}")
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Cards Grid */}
      <ResponsiveCardGrid className="mb-8">
        {currentCards.map((card) => (
          <CardComponent key={card.uniqueId} card={card} />
        ))}
      </ResponsiveCardGrid>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}

      {/* Page Info */}
      <div className="text-center text-sm text-muted-foreground mt-4">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
}

export default CardsPage
