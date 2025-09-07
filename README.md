# Total Path Analyser

A monorepo for analyzing trading card game data, starting with Disney Lorcana. Built with modern JavaScript, Zod validation, and a robust data pipeline.

## 🎯 Overview

This project provides tools for importing, validating, and analyzing trading card game data. Currently focused on Disney Lorcana, with a flexible architecture designed to support multiple games.

## 🏗️ Architecture

### Apps

- **`total-path-ui`** - Vite React app with Tailwind CSS for the user interface

### Packages

- **`@total-path/lorcana/rules`** - Game rules, constants, and data structures
- **`@total-path/lorcana/data-import`** - Data fetching and transformation pipeline
- **`@total-path/lorcana/types`** - Zod schemas for type validation
- **`@total-path/analyser`** - Central analysis engine
- **`@total-path/eslint-config`** - Shared ESLint configurations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Set up development environment
pnpm run dev-setup
```

### Development

```bash
# Start all development servers
pnpm run dev

# Start specific app
pnpm run dev --filter=total-path-ui
```

## 📊 Data Pipeline

The project features a robust data pipeline with type safety:

1. **Import**: Fetches data from [Lorcana API](https://lorcana-api.com)
2. **Validate**: Uses Zod schemas to validate raw API data
3. **Transform**: Converts PascalCase API fields to camelCase
4. **Store**: Saves both raw and transformed data
5. **Analyze**: Processes data with type-safe analysis functions

### Data Import

```bash
# Import fresh Lorcana card data
cd packages/lorcana/data-import
pnpm run import:cards
```

### Analysis

```javascript
import { analyzeLorcanaData } from "@total-path/analyser";

const result = await analyzeLorcanaData();
console.log(result);
// {
//   totalCards: 1837,
//   cardTypeDistribution: { character: 1387, action: 241, ... },
//   averageCost: 3.52,
//   colorDistribution: { Amber: 286, Amethyst: 287, ... },
//   recommendations: []
// }
```

## 🛠️ Development

### Code Style

- **Standard.js** style (no semicolons, 2 spaces, double quotes)
- **ESLint** with auto-fix on save
- **Prettier** for formatting
- **Zod** for runtime type validation

### Available Scripts

```bash
# Development
pnpm run dev              # Start all dev servers
pnpm run dev-setup        # Set up development environment

# Building
pnpm run build            # Build all packages

# Code Quality
pnpm run lint             # Check for linting issues
pnpm run lint:fix         # Auto-fix linting issues
pnpm run format           # Format code with Prettier

# Data Management
cd packages/lorcana/data-import
pnpm run import:cards     # Import fresh card data
```

### VS Code Setup

The project includes VS Code workspace settings for:

- ESLint auto-fix on save
- Prettier formatting
- Recommended extensions

## 📁 Project Structure

```
├── apps/
│   └── total-path-ui/           # Vite React app
├── packages/
│   ├── lorcana/
│   │   ├── rules/               # Game rules and constants
│   │   ├── data-import/         # Data fetching and transformation
│   │   └── types/               # Zod schemas and validation
│   ├── analyser/                # Central analysis engine
│   └── eslint-config/           # Shared ESLint configs
├── .vscode/                     # VS Code workspace settings
├── scripts/                     # Development scripts
└── DEVELOPMENT.md              # Detailed development guide
```

## 🔧 Technology Stack

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Frontend**: Vite + React + Tailwind CSS
- **Language**: JavaScript (ES modules)
- **Validation**: Zod
- **Linting**: ESLint + Prettier
- **Data Source**: [Lorcana API](https://lorcana-api.com)

## 📈 Current Data

- **Total Cards**: 1,837
- **Card Types**: Characters (1,387), Actions (241), Items (149), Locations (60)
- **Colors**: All 6 base colors + multi-color combinations
- **Rarities**: Common (661), Uncommon (481), Rare (426), Super Rare (162), Legendary (107)

## 🤝 Contributing

1. Follow the Standard.js style guide
2. Use ESLint and Prettier for code formatting
3. Add Zod validation for new data structures
4. Update types when adding new features

## 📚 Documentation

- [Development Setup](DEVELOPMENT.md) - Detailed development guide
- [Lorcana API](https://lorcana-api.com/docs) - External data source documentation

## 🎮 Games Supported

- **Disney Lorcana** - Currently supported
- **Future games** - Architecture designed for extensibility

---

Built with ❤️ using modern JavaScript and best practices.
