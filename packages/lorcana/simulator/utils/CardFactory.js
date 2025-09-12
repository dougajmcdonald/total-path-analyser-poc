// Card factory for converting data to entity objects

import { IAction } from '../entities/card/IAction.js'
import { ICharacter } from '../entities/card/ICharacter.js'
import { ILocation } from '../entities/card/ILocation.js'
import { ISong } from '../entities/card/ISong.js'
import { Deck } from '../entities/deck/Deck.js'

export class CardFactory {
  // Convert raw card data to appropriate entity
  static createCard(cardData) {
    const baseCard = {
      id: cardData.uniqueId || cardData.id,
      name: cardData.name,
      inkable: cardData.inkable,
      ink: cardData.color ? { color: cardData.color } : null,
      cost: cardData.cost || 0,
    }

    switch (cardData.type?.toLowerCase()) {
      case 'character':
        return new ICharacter(
          baseCard.id,
          baseCard.name,
          baseCard.inkable,
          baseCard.ink,
          baseCard.cost,
          cardData.strength || 0,
          cardData.willpower || 0
        )

      case 'action':
        if (
          cardData.classifications?.includes('song') ||
          cardData.name?.includes('Song')
        ) {
          return new ISong(
            baseCard.id,
            baseCard.name,
            baseCard.inkable,
            baseCard.ink,
            baseCard.cost
          )
        }
        return new IAction(
          baseCard.id,
          baseCard.name,
          baseCard.inkable,
          baseCard.ink,
          baseCard.cost
        )

      case 'location':
        return new ILocation(
          baseCard.id,
          baseCard.name,
          baseCard.inkable,
          baseCard.ink,
          baseCard.cost,
          cardData.willpower || 0
        )

      default:
        // Default to IAction for unknown types
        return new IAction(
          baseCard.id,
          baseCard.name,
          baseCard.inkable,
          baseCard.ink,
          baseCard.cost
        )
    }
  }

  // Convert array of card data to entities
  static createCards(cardsData) {
    return cardsData.map((cardData) => this.createCard(cardData))
  }

  // Create deck from card data
  static createDeck(cardsData) {
    const cards = this.createCards(cardsData)
    return new Deck(cards)
  }

  // Create deck from test format (name, quantity)
  static createDeckFromFormat(deckFormat, cardDatabase) {
    const cards = []

    for (const cardEntry of deckFormat) {
      // Find the card in the database (case-insensitive matching)
      const cardData = cardDatabase.find(
        (c) =>
          c.Name === cardEntry.name ||
          (c.Name && c.Name.toLowerCase() === cardEntry.name.toLowerCase())
      )

      if (!cardData) {
        console.warn(`Card not found: ${cardEntry.name}`)
        continue
      }

      // Add the specified quantity to the deck
      for (let i = 0; i < cardEntry.quantity; i++) {
        // Transform the database card data to our format
        const transformedCard = {
          id: cardData.Unique_ID,
          name: cardData.Name,
          type: cardData.Type?.toLowerCase(),
          cost: cardData.Cost || 0,
          inkable: cardData.Inkable || false,
          color: cardData.Color?.split(', ')[0]?.toLowerCase(),
          strength: cardData.Strength || 0,
          willpower: cardData.Willpower || 0,
          lore: cardData.Lore || 0,
          classifications: cardData.Classifications?.split(', ') || [],
          rarity: cardData.Rarity,
          set: cardData.Set_Name,
          franchise: cardData.Franchise,
          uniqueId: `${cardData.Name}-${i}`, // Add unique ID for testing
        }

        const card = this.createCard(transformedCard)
        cards.push(card)
      }
    }

    return new Deck(cards)
  }
}
