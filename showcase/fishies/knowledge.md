# Vite + React Template Knowledge

## Project Overview
A fish tank simulation with swimming fish, predator behavior, and interactive elements.

## Key Features
- Fish swim with natural movement patterns
- Fish speed up to escape when predators are nearby
- Predators chase nearest prey
- Collision detection between creatures
- Death animations for caught fish

## Animation Guidelines
- Use CSS transitions for smooth movement
- Use 3D transforms for depth
- Scale with depth for dramatic effect
- Use rotateY for direction changes
- Remove transitions for immediate reactions

## Combat Mechanics
- Shark must be moving towards fish to attack
- Fish speed increases near predators
- Whale shark protects fish from sharks

## Game Balance
- Base fish speed: 0.5 units
- Shark speed: 3 units
- Whale shark speed: 4 units
- Protection radius: 100px for whale shark

## Interactive Elements
- Click for bubbles
- Shift+click for food
- Ctrl/Cmd+click for sparkles
- Ripple effects under fast predators

## Fish Behavior
- School with nearby fish
- Avoid predators
- Seek food
- Hide near decorations when threatened

## Ecosystem Interactions
- Predator competition
- Safe zones near decorations
- Territorial behaviors
- Water current effects

## Verifying changes
After every change, run:
```bash
npm run lint && npm run typecheck
```
