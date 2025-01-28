# Chrome Extension Template

A minimal Chrome extension starter template with TypeScript and modern tooling.

## Use this template

```bash
# Create a new project using this template
codebuff --create chrome-extension my-extension
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development build with watch mode
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Project Structure
- `src/` - Source files
  - `background/` - Service worker (background script)
  - `content/` - Content scripts
  - `popup/` - Extension popup UI
  - `options/` - Options page
- `public/` - Static assets and manifest.json
- `dist/` - Built extension ready for loading into Chrome

## Loading the extension
1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` directory

## Learn More
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions)
