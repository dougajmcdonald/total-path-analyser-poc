export interface ICard {
    uniqueId: string
    name: string
    type: string
    cost: number
    inkable: boolean
    bodyText: string
    flavorText: string
    image: string
    artist: string
    setName: string
    setNum: number
    setId: string
    cardNum: number
    cardVariants: string
    dateModified: string
    dateAdded: string
    classifications: string
    franchise: string
    gamemode: string
    rarity: string
    play(): void
  }

  export interface ICharacter extends ICard {
    abilities: string
    lore: number
    willpower: number
    strength: number
    challenge(): void
    quest(): void
  }

  export interface IAction extends ICard {
    abilities: string
  }

  export interface IItem extends ICard {
    abilities: string
  }

  export interface ILocation extends ICard {
    abilities: string
  }

  export interface ISong extends IAction {
    abilities: string
    sing(): void
  }