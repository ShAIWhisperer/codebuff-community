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
- Use 3D transforms for depth:
  - Container needs perspective: 2000px
  - Container needs transform-style: preserve-3d
  - Fish: ±200px depth, fast cycle
  - Shark: ±300px depth, medium cycle
  - Whale shark: ±400px depth, slow cycle
- Scale with depth for more dramatic effect:
  - Fish: ±10% scale
  - Shark: ±15% scale
  - Whale shark: ±20% scale
- Use rotateY instead of scaleX for direction changes
- Remove transitions for immediate reactions to events
- Add depth to environment:
  - Use transparent gradient layers in background
  - Animate container with subtle 3D movement
  - Create parallax effect with container animation
- Death animation sequence:
  1. Fish straightens out when shark attacks
  2. When shark moves away, fish flips upside down
  3. After 500ms, transforms to skull (☠️) and starts fading
  4. Completes fade out over next 500ms
- Scale emojis for different creature sizes

## Combat Mechanics
- Shark must be moving towards fish to attack (within 30px range)
- Fish speed increases based on distance to shark using quadratic easing
- Whale shark protects fish by pushing shark away when nearby

## Game Balance
- Base fish speed: 0.5 units (slow peaceful swimming)
- Shark speed: 3 units (fast predator)
- Whale shark speed: 4 units (fast enough to catch shark)
- Fish speed multiplier: gradually increases up to 2x within 200px of shark
- Protection distances:
  - Shark catching fish: 15px (must be within 15 degrees of directly facing fish)
  - Whale shark slaps shark away 250px when within 100px range

## Verifying changes
After every change, run:
```bash
npm run lint && npm run typecheck
```
This will check for lint issues and type errors.
