# Development Setup

This document explains how to set up the development environment for the Total Path Analyser monorepo.

## Prerequisites

- Node.js 18+
- pnpm
- VS Code or Cursor (recommended)

## Quick Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Run development setup:**

   ```bash
   pnpm run dev-setup
   ```

3. **Install VS Code extensions:**
   - ESLint (`dbaeumer.vscode-eslint`)
   - Prettier (`esbenp.prettier-vscode`)
   - Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)

4. **Reload VS Code window:**
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Developer: Reload Window" and press Enter

## ESLint Auto-Fix on Save

The project is configured to automatically fix ESLint issues when you save files. This includes:

- Removing unnecessary semicolons (Standard.js style)
- Fixing spacing issues
- Auto-formatting code

### Manual Linting

You can also run linting manually:

```bash
# Check for issues
pnpm run lint

# Auto-fix issues
pnpm run lint:fix

# Format code with Prettier
pnpm run format
```

## Project Structure

```
├── apps/
│   └── total-path-ui/          # Vite React app
├── packages/
│   ├── lorcana/
│   │   ├── rules/              # Game rules and constants
│   │   ├── data-import/        # Data fetching and transformation
│   │   └── types/              # Zod schemas and validation
│   └── analyser/               # Central analysis logic
└── .vscode/                    # VS Code workspace settings
```

## Development Commands

```bash
# Start development servers
pnpm run dev

# Build all packages
pnpm run build

# Run linting
pnpm run lint

# Auto-fix linting issues
pnpm run lint:fix

# Format code
pnpm run format

# Clean build artifacts
pnpm run clean
```

## Code Style

The project uses:

- **Standard.js** style (no semicolons, 2 spaces, double quotes)
- **ESLint** for code quality
- **Prettier** for formatting
- **Zod** for type validation

## Troubleshooting

### ESLint not working in VS Code

1. Make sure the ESLint extension is installed
2. Reload the VS Code window
3. Check the Output panel for ESLint errors
4. Ensure the workspace is opened at the root level

### Formatting issues

If auto-formatting isn't working:

1. Check that Prettier extension is installed
2. Verify `.vscode/settings.json` is present
3. Run `pnpm run lint:fix` manually

### Type validation errors

If you see Zod validation errors:

1. Check that data matches the expected schema
2. Run `pnpm run import:cards` to refresh data
3. Verify the transformation pipeline is working
