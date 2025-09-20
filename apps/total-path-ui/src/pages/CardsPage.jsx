import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import CardComponent from "../components/CardComponent.jsx"
import ErrorDisplay from "../components/ErrorDisplay"
import LoadingSpinner from "../components/LoadingSpinner"
import ResponsiveCardGrid from "../components/ResponsiveCardGrid"
import { loadLorcanaCards } from "../utils/dataLoader.js"

const CARDS_PER_PAGE = 100

function CardsPage ({ ruleConfig, availableConfigs }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  // Load cards when rule config changes
  useEffect(() => {
    async function loadCards () {
      setLoading(true)
      setError(null)
      setCurrentPage(1)

      try {
        const allCards = await loadLorcanaCards(ruleConfig)
        setCards(allCards)
        setTotalPages(Math.ceil(allCards.length / CARDS_PER_PAGE))
      } catch (err) {
        console.error("Error loading cards:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [ruleConfig])

  // Get current page cards
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE
  const endIndex = startIndex + CARDS_PER_PAGE
  const currentCards = cards.slice(startIndex, endIndex)

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
          <h2 className="text-3xl font-bold mb-2">Browse Cards</h2>
          <p className="text-muted-foreground">
            Showing {currentCards.length} of {cards.length} cards in{" "}
            {availableConfigs[ruleConfig]?.name} format
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
