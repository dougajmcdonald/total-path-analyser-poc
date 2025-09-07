# @total-path/lorcana-types

Shared Zod schemas and types for Lorcana card data validation and type safety.

## Overview

This package provides:
- Zod schemas for raw API data (PascalCase)
- Zod schemas for transformed data (camelCase)
- Validation helpers for type safety
- Type inference for TypeScript-like development

## Usage

```javascript
import { 
  LorcanaCardSchema, 
  validateCard, 
  safeValidateCards 
} from '@total-path/lorcana-types'

// Validate a single card
const card = validateCard(cardData)

// Safe validation (returns success/error)
const result = safeValidateCards(cardsArray)
if (result.success) {
  console.log('Valid cards:', result.data)
} else {
  console.error('Validation errors:', result.error)
}
```

## Schemas

- `RawLorcanaCardSchema` - Raw API data format (PascalCase)
- `LorcanaCardSchema` - Transformed data format (camelCase)
- `RawLorcanaCardsSchema` - Array of raw cards
- `LorcanaCardsSchema` - Array of transformed cards

## Development

This package is part of the Total Path Analyser monorepo and uses shared ESLint configuration.
