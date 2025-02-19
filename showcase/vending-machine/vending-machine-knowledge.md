# Vending Machine Project

## Core Design Decisions
- Prices in cents to avoid floating-point issues
- Accepted coins: 5¢, 10¢, 25¢, 50¢, $1
- Products stored in Map for O(1) lookup
- Greedy algorithm for change calculation
- State modifications should only happen in one place (VendingMachine class methods, not API routes)

## Testing Strategy
- Positive tests: Valid transactions
- Negative tests: Invalid inputs
- Boundary tests: Edge cases
- Mock console.log for output verification

## Development Guidelines
- Use TypeScript for type safety
- Jest for testing
- Keep money values in cents
- Validate inputs before processing
- Handle edge cases explicitly

## Running the Application
- CLI Version: `npm start`
- Web UI Version: `npm run start:ui` then visit http://localhost:3000
- If port 3000 is in use, find process with `lsof -i :3000` and kill it

## Building for Production
- Build both CLI and UI: `npm run build`
- Build UI specifically: `npm run build:ui`
- Built files go to ./dist directory
- UI static files (HTML/CSS) are copied to dist/public
- Keep dist/ in version control for deployment
- Run `npm install` after checkout

## UI Features
- LED-style display panel
- Coin insertion buttons
- Animated coin effects for refunds
- Product grid with live inventory
- Success/error message display
