import { loadLorcanaCards } from "@total-path/lorcana-data-import/browser.js";
import { useEffect, useState } from "react";
import CardComponent from "../components/CardComponent.jsx";

function DecksPage({ ruleConfig, availableConfigs }) {
  const [deckName, setDeckName] = useState("");
  const [deckExport, setDeckExport] = useState("");
  const [parsedDeck, setParsedDeck] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [savedDecks, setSavedDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all cards for lookup
  useEffect(() => {
    async function loadCards() {
      try {
        const cards = await loadLorcanaCards(ruleConfig);
        setAllCards(cards);
        setLoading(false);
      } catch (err) {
        console.error("Error loading cards:", err);
        setLoading(false);
      }
    }
    loadCards();
  }, [ruleConfig]);

  // Load saved decks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedDecks");
    if (saved) {
      try {
        setSavedDecks(JSON.parse(saved));
      } catch (err) {
        console.error("Error loading saved decks:", err);
      }
    }
  }, []);

  // Save decks to localStorage
  const saveDecksToStorage = (decks) => {
    localStorage.setItem("savedDecks", JSON.stringify(decks));
    setSavedDecks(decks);
  };

  // Parse deck export text
  const parseDeckExport = (exportText) => {
    const lines = exportText.trim().split("\n");
    const parsedCards = [];
    const errors = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      // Match pattern: "4 Tinker Bell - Giant Fairy" (full card name after quantity)
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (!match) {
        errors.push(`Invalid format: "${line}"`);
        continue;
      }

      const [, quantity, fullCardName] = match;
      const qty = parseInt(quantity, 10);

      if (isNaN(qty) || qty < 1) {
        errors.push(`Invalid quantity: "${line}"`);
        continue;
      }

      parsedCards.push({
        quantity: qty,
        fullCardName: fullCardName.trim(),
        originalLine: line.trim(),
      });
    }

    return { parsedCards, errors };
  };

  // Find matching cards in our collection
  const findMatchingCards = (parsedCards) => {
    const matchedCards = [];
    const errors = [];

    for (const parsedCard of parsedCards) {
      // Try exact name match first
      let matches = allCards.filter(
        (card) =>
          card.name.toLowerCase() === parsedCard.fullCardName.toLowerCase(),
      );

      // If no exact match, try partial match
      if (matches.length === 0) {
        matches = allCards.filter((card) =>
          card.name
            .toLowerCase()
            .includes(parsedCard.fullCardName.toLowerCase()),
        );
      }

      if (matches.length === 0) {
        errors.push(`Card not found: "${parsedCard.fullCardName}"`);
        continue;
      }

      if (matches.length > 1) {
        errors.push(
          `Multiple matches for "${parsedCard.fullCardName}": ${matches
            .map((m) => m.name)
            .join(", ")}`,
        );
        continue;
      }

      const matchedCard = matches[0];
      matchedCards.push({
        ...matchedCard,
        quantity: parsedCard.quantity,
        originalLine: parsedCard.originalLine,
      });
    }

    return { matchedCards, errors };
  };

  // Validate deck
  const validateDeck = (matchedCards) => {
    const errors = [];
    const totalCards = matchedCards.reduce(
      (sum, card) => sum + card.quantity,
      0,
    );

    if (totalCards < 60) {
      errors.push(`Deck must contain at least 60 cards. Found: ${totalCards}`);
    }

    if (totalCards > 60) {
      errors.push(`Deck contains more than 60 cards: ${totalCards}`);
    }

    return { isValid: errors.length === 0, errors, totalCards };
  };

  // Handle deck import
  const handleImportDeck = () => {
    if (!deckName.trim()) {
      setValidationErrors(["Deck name is required"]);
      return;
    }

    if (!deckExport.trim()) {
      setValidationErrors(["Deck export data is required"]);
      return;
    }

    const { parsedCards, errors: parseErrors } = parseDeckExport(deckExport);
    if (parseErrors.length > 0) {
      setValidationErrors(parseErrors);
      return;
    }

    const { matchedCards, errors: matchErrors } =
      findMatchingCards(parsedCards);
    const { isValid, errors: validationErrors } = validateDeck(matchedCards);

    const allErrors = [...parseErrors, ...matchErrors, ...validationErrors];
    setValidationErrors(allErrors);

    if (isValid) {
      setParsedDeck(matchedCards);
    }
  };

  // Save deck
  const handleSaveDeck = () => {
    if (!parsedDeck) return;

    const deck = {
      id: Date.now().toString(),
      name: deckName,
      cards: parsedDeck,
      ruleConfig,
      createdAt: new Date().toISOString(),
    };

    const updatedDecks = [...savedDecks, deck];
    saveDecksToStorage(updatedDecks);
    setDeckName("");
    setDeckExport("");
    setParsedDeck(null);
    setValidationErrors([]);
  };

  // Load saved deck
  const handleLoadDeck = (deck) => {
    setSelectedDeck(deck);
    setParsedDeck(deck.cards);
  };

  // Delete saved deck
  const handleDeleteDeck = (deckId) => {
    const updatedDecks = savedDecks.filter((deck) => deck.id !== deckId);
    saveDecksToStorage(updatedDecks);
    if (selectedDeck?.id === deckId) {
      setSelectedDeck(null);
      setParsedDeck(null);
    }
  };

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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Deck Builder</h2>
        <p className="text-gray-600">
          Import and manage your Disney Lorcana decks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Import Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Import Deck
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="deck-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Deck Name
                </label>
                <input
                  id="deck-name"
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter deck name"
                />
              </div>

              <div>
                <label
                  htmlFor="deck-export"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Deck Export Data
                </label>
                <textarea
                  id="deck-export"
                  value={deckExport}
                  onChange={(e) => setDeckExport(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paste your deck export here..."
                />
              </div>

              <button
                onClick={handleImportDeck}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Import Deck
              </button>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Validation Errors:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Saved Decks */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Saved Decks
            </h3>
            {savedDecks.length === 0 ? (
              <p className="text-gray-600">No saved decks yet.</p>
            ) : (
              <div className="space-y-2">
                {savedDecks.map((deck) => (
                  <div
                    key={deck.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{deck.name}</p>
                      <p className="text-sm text-gray-600">
                        {deck.cards.length} unique cards • {deck.ruleConfig}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleLoadDeck(deck)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteDeck(deck.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Deck Display */}
        <div className="space-y-6">
          {parsedDeck && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedDeck ? selectedDeck.name : "Imported Deck"}
                </h3>
                {!selectedDeck && (
                  <button
                    onClick={handleSaveDeck}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save Deck
                  </button>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Total cards:{" "}
                  {parsedDeck.reduce((sum, card) => sum + card.quantity, 0)}
                </p>
              </div>

              {/* Deck Cards Grid */}
              <div
                className="grid gap-4 justify-items-center"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(256px, 256px))",
                  justifyContent: "center",
                }}
              >
                {parsedDeck.map((card, index) => (
                  <div key={`${card.uniqueId}-${index}`} className="relative">
                    <CardComponent card={card} />
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {card.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DecksPage;
