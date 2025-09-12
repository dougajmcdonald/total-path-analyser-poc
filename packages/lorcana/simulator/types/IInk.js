// Ink type definition for Lorcana cards

export class IInk {
  constructor(color, value = 1) {
    this.color = color
    this.value = value
  }

  // Get ink color
  getColor() {
    return this.color
  }

  // Get ink value
  getValue() {
    return this.value
  }

  // Check if ink is a specific color
  isColor(color) {
    return this.color === color
  }

  // Check if ink is amber
  isAmber() {
    return this.color === 'amber'
  }

  // Check if ink is steel
  isSteel() {
    return this.color === 'steel'
  }

  // Check if ink is sapphire
  isSapphire() {
    return this.color === 'sapphire'
  }

  // Check if ink is emerald
  isEmerald() {
    return this.color === 'emerald'
  }

  // Check if ink is ruby
  isRuby() {
    return this.color === 'ruby'
  }

  // Check if ink is amethyst
  isAmethyst() {
    return this.color === 'amethyst'
  }
}

// Ink color constants
export const INK_COLORS = {
  AMBER: 'amber',
  STEEL: 'steel',
  SAPPHIRE: 'sapphire',
  EMERALD: 'emerald',
  RUBY: 'ruby',
  AMETHYST: 'amethyst',
}
