// Location card interface extending ICard

import { ICard } from './ICard.js'

export class ILocation extends ICard {
  constructor(id, name, inkable, ink, cost, willpower, image = null) {
    super(id, name, inkable, ink, cost, image)
    this.type = 'location'
    this.willpower = willpower
  }
}
