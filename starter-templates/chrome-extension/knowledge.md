# Chrome Extension Template Knowledge

## Project Overview
A minimal Chrome extension template with TypeScript, React, and Vite for modern extension development.

## Key Features
- Uses Vite for fast builds and HMR
- React for popup and options pages
- TypeScript for type safety
- Manifest V3 compliant
- Multiple entry points (popup, options, background, content)

## Verifying changes
After every change, run:
```bash
npm run typecheck && npm run lint
```
This will check for type errors and linting issues.

## Best Practices
- Keep service worker (background script) lightweight
- Use content scripts sparingly and only on needed pages
- Prefer using storage.sync over storage.local for user settings
- Follow Chrome's security best practices for CSP

## Development Workflow
- Always test extension in incognito mode to verify permissions
- Test on both HTTP and HTTPS sites if using content scripts
- Keep permissions minimal - request only what you need
- Chrome Web Store requires:
  - One-time $5 USD developer fee
  - Detailed description and screenshots
  - Privacy policy if collecting data
  - Review process takes 1-3 business days

## Common Gotchas
- Service worker cannot use DOM APIs
- Content scripts have limited access to Chrome APIs
- Popup must be loaded from local extension files
- Cross-origin requests need explicit permissions
