import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import CardComponent from "../components/CardComponent.jsx"
import { loadLorcanaCards } from "../utils/dataLoader.js"

function DecksPage ({ ruleConfig }) {
  const [deckName, setDeckName] = useState("")
  const [deckExport, setDeckExport] = useState("")
  const [parsedDeck, setParsedDeck] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])
  const [savedDecks, setSavedDecks] = useState([])
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [allCards, setAllCards] = useState([])
  const [loading, setLoading] = useState(true)

  // Load all cards for lookup
  useEffect(() => {
    async function loadCards () {
      try {
        const cards = await loadLorcanaCards(ruleConfig)
        setAllCards(cards)
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }
    loadCards()
  }, [ruleConfig])

  // Load saved decks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedDecks")
    if (saved) {
      try {
        setSavedDecks(JSON.parse(saved))
      } catch {
        // Error loading saved decks
      }
    }
  }, [])

  // Save decks to localStorage
  const saveDecksToStorage = (decks) => {
    localStorage.setItem("savedDecks", JSON.stringify(decks))
    setSavedDecks(decks)
  }

  // Parse deck export text
  const parseDeckExport = (exportText) => {
    const lines = exportText.trim().split("\n")
    const parsedCards = []
    const errors = []

    for (const line of lines) {
      if (!line.trim()) continue

      // Match pattern: "4 Tinker Bell - Giant Fairy" (full card name after quantity)
      const match = line.match(/^(\d+)\s+(.+)$/)
      if (!match) {
        errors.push(`Invalid format: "${line}"`)
        continue
      }

      const [, quantity, fullCardName] = match
      const qty = parseInt(quantity, 10)

      if (isNaN(qty) || qty < 1) {
        errors.push(`Invalid quantity: "${line}"`)
        continue
      }

      parsedCards.push({
        quantity: qty,
        fullCardName: fullCardName.trim(),
        originalLine: line.trim(),
      })
    }

    return { parsedCards, errors }
  }

  // Find matching cards in our collection
  const findMatchingCards = (parsedCards) => {
    const matchedCards = []
    const errors = []

    for (const parsedCard of parsedCards) {
      // Try exact name match first
      let matches = allCards.filter(
        (card) =>
          card.name.toLowerCase() === parsedCard.fullCardName.toLowerCase(),
      )

      // If no exact match, try partial match
      if (matches.length === 0) {
        matches = allCards.filter((card) =>
          card.name
            .toLowerCase()
            .includes(parsedCard.fullCardName.toLowerCase()),
        )
      }

      if (matches.length === 0) {
        errors.push(`Card not found: "${parsedCard.fullCardName}"`)
        continue
      }

      if (matches.length > 1) {
        errors.push(
          `Multiple matches for "${parsedCard.fullCardName}": ${matches
            .map((m) => m.name)
            .join(", ")}`,
        )
        continue
      }

      const matchedCard = matches[0]
      matchedCards.push({
        ...matchedCard,
        quantity: parsedCard.quantity,
        originalLine: parsedCard.originalLine,
      })
    }

    return { matchedCards, errors }
  }

  // Validate deck
  const validateDeck = (matchedCards) => {
    const errors = []
    const totalCards = matchedCards.reduce(
      (sum, card) => sum + card.quantity,
      0,
    )

    if (totalCards < 60) {
      errors.push(`Deck must contain at least 60 cards. Found: ${totalCards}`)
    }

    if (totalCards > 60) {
      errors.push(`Deck contains more than 60 cards: ${totalCards}`)
    }

    return { isValid: errors.length === 0, errors, totalCards }
  }

  // Handle deck import
  const handleImportDeck = () => {
    if (!deckName.trim()) {
      setValidationErrors(["Deck name is required"])
      return
    }

    if (!deckExport.trim()) {
      setValidationErrors(["Deck export data is required"])
      return
    }

    const { parsedCards, errors: parseErrors } = parseDeckExport(deckExport)
    if (parseErrors.length > 0) {
      setValidationErrors(parseErrors)
      return
    }

    const { matchedCards, errors: matchErrors } =
      findMatchingCards(parsedCards)
    const { isValid, errors: validationErrors } = validateDeck(matchedCards)

    const allErrors = [...parseErrors, ...matchErrors, ...validationErrors]
    setValidationErrors(allErrors)

    if (isValid) {
      setParsedDeck(matchedCards)
    }
  }

  // Save deck
  const handleSaveDeck = () => {
    if (!parsedDeck) return

    const deck = {
      id: Date.now().toString(),
      name: deckName,
      cards: parsedDeck,
      ruleConfig,
      createdAt: new Date().toISOString(),
    }

    const updatedDecks = [...savedDecks, deck]
    saveDecksToStorage(updatedDecks)
    setDeckName("")
    setDeckExport("")
    setParsedDeck(null)
    setValidationErrors([])
  }

  // Load saved deck
  const handleLoadDeck = (deck) => {
    setSelectedDeck(deck)
    setParsedDeck(deck.cards)
  }

  // Delete saved deck
  const handleDeleteDeck = (deckId) => {
    const updatedDecks = savedDecks.filter((deck) => deck.id !== deckId)
    saveDecksToStorage(updatedDecks)
    if (selectedDeck?.id === deckId) {
      setSelectedDeck(null)
      setParsedDeck(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg text-muted-foreground">Loading cards...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-3xl font-bold mb-2">Deck Builder</h2>
          <p className="text-muted-foreground">
            Import and manage your Disney Lorcana decks
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Import Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Deck</CardTitle>
              <CardDescription>
                Paste your deck export data to import and validate your deck
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deck-name">Deck Name</Label>
                <Input
                  id="deck-name"
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Enter deck name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deck-export">Deck Export Data</Label>
                <Textarea
                  id="deck-export"
                  value={deckExport}
                  onChange={(e) => setDeckExport(e.target.value)}
                  rows={8}
                  placeholder="Paste your deck export here..."
                />
              </div>

              <Button onClick={handleImportDeck} className="w-full">
                Import Deck
              </Button>
            </CardContent>
          </Card>

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
        <Card>
          <CardHeader>
            <CardTitle>Saved Decks</CardTitle>
            <CardDescription>
              Manage your previously saved decks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {savedDecks.length === 0 ? (
              <p className="text-muted-foreground">No saved decks yet.</p>
            ) : (
              <div className="space-y-2">
                {savedDecks.map((deck) => (
                  <div
                    key={deck.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">{deck.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {deck.cards.length} unique cards • {deck.ruleConfig}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleLoadDeck(deck)}>
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteDeck(deck.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deck Display */}
        <div className="space-y-6">
          {parsedDeck && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedDeck ? selectedDeck.name : "Imported Deck"}
                  </CardTitle>
                  {!selectedDeck && (
                    <Button onClick={handleSaveDeck} variant="default">
                      Save Deck
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Total cards:{" "}
                  {parsedDeck.reduce((sum, card) => sum + card.quantity, 0)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Deck Cards Grid */}
                <div
                  className="grid gap-4 justify-items-center"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(256px, 256px))",
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default DecksPage
