// Base card action interface for Lorcana simulation

export class ICardAction {
  constructor(id, name) {
    this.id = id
    this.name = name
  }

  // Perform the action with given state
  perform(actionState) {
    throw new Error('perform() must be implemented by subclass')
  }

  // Get action type
  getType() {
    return this.constructor.name
  }

  // Get action name
  getName() {
    return this.name
  }

  // Get action ID
  getId() {
    return this.id
  }
}
