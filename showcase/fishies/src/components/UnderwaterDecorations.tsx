import { useState, useEffect } from "react";
import { type FishState } from "./FishTank";
import { Jellyfish } from "./Jellyfish";
import { Bubble } from "./Bubble";
import { Coral } from "./Coral";
import { Seashell } from "./Seashell";
import { Seaweed } from "./Seaweed";
import { Starfish } from "./Starfish";
import { TerritorialCrab } from "./TerritorialCrab";
import { SeaTurtle } from "./SeaTurtle";
import { Plankton } from "./Plankton";
import { Dolphin } from "./Dolphin";

interface UnderwaterDecorationsProps {
  fishes: FishState[];
}

export const UnderwaterDecorations: React.FC<UnderwaterDecorationsProps> = ({ fishes }) => {
  // Randomly position jellyfish near the top half
  const [jellyfish, setJellyfish] = useState(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth * 0.9,
      y: Math.random() * window.innerHeight * 0.5,
      size: 40 + Math.random() * 20,
      isPlayful: false,
    }))
  );

  // Simulate playful interactions every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setJellyfish((prev) =>
        prev.map((j) => ({
          ...j,
          isPlayful: Math.random() < 0.3, // 30% chance to be playful
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Create several bubbles that start near the bottom
  const [bubbles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight - Math.random() * 100,
      size: 5 + Math.random() * 10,
      duration: 3 + Math.random() * 3,
    }))
  );

  // Place corals along the bottom
  const [corals] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * (window.innerWidth - 80),
      y: window.innerHeight - 80,
      size: 40 + Math.random() * 20,
    }))
  );

  // Seashells at the bottom
  const [seashells] = useState(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: Math.random() * (window.innerWidth - 60),
      y: window.innerHeight - 60,
      size: 30 + Math.random() * 10,
    }))
  );

  // Seaweed that gently sways
  const [seaweeds] = useState(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * (window.innerWidth - 80),
      y: window.innerHeight - 120,
      size: 50 + Math.random() * 20,
    }))
  );

  // Add starfish along the bottom
  const [starfish] = useState(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: Math.random() * (window.innerWidth - 50),
      y: window.innerHeight - 150 + Math.random() * 50,
      size: 30 + Math.random() * 10,
    }))
  );

  // Add crabs that walk along the bottom
  const [crabs] = useState(() =>
    Array.from({ length: 2 }, (_, i) => ({
      id: i,
      x: Math.random() * (window.innerWidth - 60),
      y: window.innerHeight - 70,
      size: 25 + Math.random() * 10,
    }))
  );

  // Add sea turtles in the middle area
  const [seaTurtles] = useState(() =>
    Array.from({ length: 2 }, (_, i) => ({
      id: i,
      x: Math.random() * (window.innerWidth - 100),
      y: window.innerHeight * 0.3 + Math.random() * 50,
      size: 50 + Math.random() * 20,
    }))
  );

  // Add plankton particles
  const [planktons] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 2 + Math.random() * 2,
      duration: 4 + Math.random() * 4,
    }))
  );

  // Add dolphins near the top/middle
  const [dolphins] = useState(() =>
    Array.from({ length: 2 }, (_, i) => ({
      id: i,
      x: Math.random() * (window.innerWidth * 0.7),
      y: Math.random() * (window.innerHeight * 0.3),
      size: 30 + Math.random() * 20,
    }))
  );

  return (
    <>
      {planktons.map((p) => (
        <Plankton
          key={`plankton-${p.id}`}
          x={p.x}
          y={p.y}
          size={p.size}
          duration={p.duration}
        />
      ))}
      {jellyfish.map((j) => (
        <Jellyfish
          key={`jelly-${j.id}`}
          x={j.x}
          y={j.y}
          size={j.size}
          isPlayful={j.isPlayful}
        />
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
      {starfish.map((s) => (
        <Starfish key={`starfish-${s.id}`} x={s.x} y={s.y} size={s.size} />
      ))}
      {crabs.map((c) => {
        // Check if any fish are near this crab's territory
        const hasNearbyFish = fishes.some(
          fish => Math.hypot(fish.x - c.x, fish.y - c.y) < 50
        );
        return (
          <TerritorialCrab
            key={`crab-${c.id}`}
            x={c.x}
            y={c.y}
            size={c.size}
            intruderNearby={hasNearbyFish}
          />
        );
      })}
      {seaTurtles.map((t) => (
        <SeaTurtle key={`turtle-${t.id}`} x={t.x} y={t.y} size={t.size} />
      ))}
      {dolphins.map((d) => (
        <Dolphin key={`dolphin-${d.id}`} x={d.x} y={d.y} size={d.size} />
      ))}
    </>
  );
};
