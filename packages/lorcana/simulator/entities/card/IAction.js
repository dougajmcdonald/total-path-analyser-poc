// Action card interface extending ICard

import { ICard } from './ICard.js'

export class IAction extends ICard {
  constructor(id, name, inkable, ink, cost) {
    super(id, name, inkable, ink, cost)
    this.type = 'action'
  }
}
