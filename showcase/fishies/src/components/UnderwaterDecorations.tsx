// src/components/UnderwaterDecorations.tsx
import { useState } from "react";
import { Jellyfish } from "./Jellyfish";
import { Bubble } from "./Bubble";
import { Coral } from "./Coral";
import { Seashell } from "./Seashell";
import { Seaweed } from "./Seaweed";

export const UnderwaterDecorations: React.FC = () => {
  // Randomly position a few jellyfish near the top half
  const [jellyfish] = useState(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth * 0.9,
      y: Math.random() * window.innerHeight * 0.5,
      size: 40 + Math.random() * 20,
    }))
  );

  // Create several bubbles that start near the bottom and animate upward
  const [bubbles] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight - Math.random() * 100,
      size: 5 + Math.random() * 10,
      duration: 3 + Math.random() * 3,
    }))
  );

  // Place a few corals along the bottom
  const [corals] = useState(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * (window.innerWidth - 80),
      y: window.innerHeight - 80,
      size: 40 + Math.random() * 20,
    }))
  );

  // And a few seashells at the bottom
  const [seashells] = useState(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: Math.random() * (window.innerWidth - 60),
      y: window.innerHeight - 60,
      size: 30 + Math.random() * 10,
    }))
  );

  // Add some seaweed that gently sways
  const [seaweeds] = useState(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: Math.random() * (window.innerWidth - 80),
      y: window.innerHeight - 120,
      size: 50 + Math.random() * 20,
    }))
  );

  return (
    <>
      {jellyfish.map((j) => (
        <Jellyfish key={`jelly-${j.id}`} x={j.x} y={j.y} size={j.size} />
      ))}
      {bubbles.map((b) => (
        <Bubble
          key={`bubble-${b.id}`}
          x={b.x}
          y={b.y}
          size={b.size}
          duration={b.duration}
        />
      ))}
      {corals.map((c) => (
        <Coral key={`coral-${c.id}`} x={c.x} y={c.y} size={c.size} />
      ))}
      {seashells.map((s) => (
        <Seashell key={`seashell-${s.id}`} x={s.x} y={s.y} size={s.size} />
      ))}
      {seaweeds.map((sw) => (
        <Seaweed key={`seaweed-${sw.id}`} x={sw.x} y={sw.y} size={sw.size} />
      ))}
    </>
  );
};
