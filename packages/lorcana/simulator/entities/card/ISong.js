// Song card interface extending IAction

import { IAction } from './IAction.js'

export class ISong extends IAction {
  constructor(id, name, inkable, ink, cost, image = null) {
    super(id, name, inkable, ink, cost, image)
    this.type = 'action - song'
  }
}
