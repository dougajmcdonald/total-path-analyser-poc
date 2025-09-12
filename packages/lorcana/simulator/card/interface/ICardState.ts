export enum CardState {
    READY = 'ready',
    EXERTED = 'exerted',
}

export enum PlayState {
    DRYING = 'drying',
    DRY = 'dry',
}

export interface ICardState {
    PLAY_STATE: PlayState
    CARD_STATE: CardState
}