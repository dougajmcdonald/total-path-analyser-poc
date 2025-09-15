// Character card interface extending ICard

import { ICard } from './ICard.js'

export class ICharacter extends ICard {
  constructor(
    id,
    name,
    inkable,
    ink,
    cost,
    strength,
    willpower,
    lore = 0,
    image = null
  ) {
    super(id, name, inkable, ink, cost, image)
    this.type = 'character'
    this.strength = strength
    this.willpower = willpower
    this.lore = lore
  }
}
