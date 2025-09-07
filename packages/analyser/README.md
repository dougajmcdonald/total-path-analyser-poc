# @total-path/analyser

The central analysis package that consumes game-specific packages to provide path analysis and strategy insights.

## Overview

This package provides:
- Game-agnostic analysis algorithms
- Path finding and optimization
- Strategy recommendations
- Performance metrics

## Usage

```javascript
import { Analyser } from '@total-path/analyser'
import { importCardData } from '@total-path/lorcana-data-import'

// Initialize analyser with game data
const analyser = new Analyser()
const cards = await importCardData()
const analysis = analyser.analyze(cards)
```

## Development

This package is part of the Total Path Analyser monorepo and uses shared ESLint configuration.

It depends on game-specific packages like `@total-path/lorcana-rules` and `@total-path/lorcana-data-import`.
