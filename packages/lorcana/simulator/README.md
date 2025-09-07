# Lorcana Simulator

A turn-by-turn simulation engine for Disney Lorcana card game analysis.

## Features

- **Game State Management**: Complete game state tracking with separate action and play states
- **Action System**: All core game actions (ink, play, quest, challenge, sing, pass)
- **Simulation Engine**: Turn-by-turn analysis with permutation evaluation
- **Scoring System**: Evaluates action sequences to find optimal plays

## Core Concepts

### Card States
- **Action States**: `ready` | `exerted` - Whether card can perform actions
- **Play States**: `dry` | `drying` - Whether card can act (drying cards must wait)

### Turn Structure
1. **Ready Phase**: Ready all exerted cards
2. **Draw Phase**: Draw a card from deck
3. **Main Phase**: Perform actions (ink, play, quest, challenge, sing)
4. **Pass Phase**: End turn

### Simulation
- Analyzes all possible action sequences per turn
- Scores each sequence based on multiple criteria
- Keeps top 4 simulations for further analysis
- Focuses on first 5-7 turns for opening analysis

## Usage

```javascript
import { runSimulation, initGame } from '@total-path/lorcana-simulator'

// Initialize with two decks
const gameState = initGame(deck1, deck2)

// Run full simulation
const results = runSimulation(deck1, deck2, 7)

// Get available actions for current player
const actions = getAvailableActions(gameState, 'player1')

// Execute a specific action
const newState = executeAction(gameState, action)
```

## Scoring Criteria

- **Lore Gained**: 10 points per lore
- **Board Presence**: 5 points per card on board
- **Hand Size**: 1 point per card in hand
- **Available Ink**: 2 points per available ink
- **Opponent Damage**: 8 points per opponent card removed
