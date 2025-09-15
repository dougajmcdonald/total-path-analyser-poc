// Action card interface extending ICard

import { ICard } from './ICard.js'

export class IAction extends ICard {
  constructor(id, name, inkable, ink, cost, image = null) {
    super(id, name, inkable, ink, cost, image)
    this.type = 'action'
  }
}
