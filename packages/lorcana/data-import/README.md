# @total-path/lorcana-data-import

This package contains scripts to retrieve and import Lorcana card data in bulk from external sources.

## Overview

This package provides:
- Data fetching scripts
- Data transformation utilities
- Bulk import functionality
- Data validation

## Usage

```javascript
import { importCardData } from '@total-path/lorcana-data-import'

// Import all card data
const cards = await importCardData()
```

## Development

This package is part of the Total Path Analyser monorepo and uses shared ESLint configuration.

### Running the import script

```bash
pnpm run import
```
