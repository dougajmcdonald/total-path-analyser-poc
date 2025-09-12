// Song card interface extending IAction

import { IAction } from './IAction.js'

export class ISong extends IAction {
  constructor(id, name, inkable, ink, cost) {
    super(id, name, inkable, ink, cost)
    this.type = 'action - song'
  }
}
