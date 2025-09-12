// Location card interface extending ICard

import { ICard } from './ICard.js'

export class ILocation extends ICard {
  constructor(id, name, inkable, ink, cost, willpower) {
    super(id, name, inkable, ink, cost)
    this.type = 'location'
    this.willpower = willpower
  }
}
