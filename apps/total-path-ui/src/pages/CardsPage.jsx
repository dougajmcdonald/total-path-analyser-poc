import { loadLorcanaCards } from "@total-path/lorcana-data-import/browser.js";
import { useEffect, useState } from "react";
import CardComponent from "../components/CardComponent.jsx";

const CARDS_PER_PAGE = 100;

function CardsPage({ ruleConfig, availableConfigs }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Load cards when rule config changes
  useEffect(() => {
    async function loadCards() {
      setLoading(true);
      setError(null);
      setCurrentPage(1);

      try {
        const allCards = await loadLorcanaCards(ruleConfig);
        setCards(allCards);
        setTotalPages(Math.ceil(allCards.length / CARDS_PER_PAGE));
      } catch (err) {
        console.error("Error loading cards:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCards();
  }, [ruleConfig]);

  // Get current page cards
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const endIndex = startIndex + CARDS_PER_PAGE;
  const currentCards = cards.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Cards
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Browse Cards</h2>
        <p className="text-gray-600">
          Showing {currentCards.length} of {cards.length} cards in{" "}
          {availableConfigs[ruleConfig]?.name} format
        </p>
      </div>

      {/* Cards Grid */}
      <div
        className="grid gap-4 mb-8 justify-items-center"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(256px, 256px))",
          justifyContent: "center",
        }}
      >
        {currentCards.map((card) => (
          <CardComponent key={card.uniqueId} card={card} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-md ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Page Info */}
      <div className="text-center text-sm text-gray-600 mt-4">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}

export default CardsPage;
