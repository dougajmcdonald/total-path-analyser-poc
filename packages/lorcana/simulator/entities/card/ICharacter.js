// Character card interface extending ICard

import { ICard } from './ICard.js'

export class ICharacter extends ICard {
  constructor(id, name, inkable, ink, cost, strength, willpower, lore = 0) {
    super(id, name, inkable, ink, cost)
    this.type = 'character'
    this.strength = strength
    this.willpower = willpower
    this.lore = lore
  }
}
