import { useEffect, useState, useCallback, useRef } from "react";
import { Fish } from "./Fish";
import { Shark } from "./Shark";
import { WhaleShark } from "./WhaleShark";
import { UnderwaterDecorations } from "./UnderwaterDecorations";
import { Bubble } from "./Bubble";
import { FoodPellet } from "./FoodPellet";
import { RippleEffect } from "./RippleEffect";
import { SeaSparkle } from "./SeaSparkle";

interface Position {
  x: number;
  y: number;
}

export interface FishState extends Position {
  id: number;
  direction: number;
  color: string;
  speedX: number;
  speedY: number;
  isDying?: boolean;
  dyingStartTime?: number;
  isBeingEaten?: boolean;
  isHiding?: boolean;
}

interface PredatorState extends Position {
  direction: number;
  speed: number;
}

interface InteractiveBubble {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

interface RippleState {
  id: number;
  x: number;
  y: number;
}

interface FoodPelletState {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

interface InteractiveSparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"];
const SHARK_SPEED = 3;
const WHALE_SHARK_SPEED = 4;
const BASE_FISH_SPEED = 0.5;
const MAX_FISH_SPEED_MULTIPLIER = 1.5;
const COMPETITION_DISTANCE = 50;
const COMPETITION_REPULSION = 0.1;
const DANGER_DISTANCE = 100;

// Define safe zones near decorations
const SAFE_ZONES: Position[] = [
  { x: 80, y: window.innerHeight - 100 },
  { x: 300, y: window.innerHeight - 120 },
  { x: 600, y: window.innerHeight - 90 },
  { x: 800, y: window.innerHeight - 110 },
];

const findNearestSafeZone = (fish: Position): Position | null => {
  if (SAFE_ZONES.length === 0) return null;
  return SAFE_ZONES.reduce((closest, zone) => {
    const dZone = Math.hypot(zone.x - fish.x, zone.y - fish.y);
    const dClosest = Math.hypot(closest.x - fish.x, closest.y - fish.y);
    return dZone < dClosest ? zone : closest;
  }, SAFE_ZONES[0]);
};

export const FishTank: React.FC = () => {
  const [fishes, setFishes] = useState<FishState[]>(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth * 0.8,
      y: Math.random() * window.innerHeight * 0.8,
      direction: Math.random() < 0.5 ? -1 : 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speedX:
        (Math.random() * BASE_FISH_SPEED + BASE_FISH_SPEED) *
        (Math.random() < 0.5 ? -1 : 1),
      speedY: (Math.random() - 0.5) * BASE_FISH_SPEED,
    }))
  );

  const [shark, setShark] = useState<PredatorState>(() => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    direction: 1,
    speed: SHARK_SPEED,
  }));

  const [whaleShark, setWhaleShark] = useState<PredatorState>(() => ({
    x: window.innerWidth * 0.8,
    y: window.innerHeight * 0.8,
    direction: -1,
    speed: WHALE_SHARK_SPEED,
  }));

  const [interactiveBubbles, setInteractiveBubbles] = useState<InteractiveBubble[]>([]);
  const [foodPellets, setFoodPellets] = useState<FoodPelletState[]>([]);
  const [ripples, setRipples] = useState<RippleState[]>([]);
  const [interactiveSparkles, setInteractiveSparkles] = useState<InteractiveSparkle[]>([]);

  // Refs to throttle ripple effects for predators
  const sharkRippleTimeRef = useRef<number>(0);
  const whaleSharkRippleTimeRef = useRef<number>(0);

  const handleTankClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    // If user holds Ctrl (or Command) key, spawn interactive "sea sparkles"
    if (e.ctrlKey || e.metaKey) {
      const sparkleCount = 3 + Math.floor(Math.random() * 3);
      const newSparkles = Array.from({ length: sparkleCount }, () => ({
        id: Date.now() + Math.random(),
        x: e.clientX - rect.left + (Math.random() - 0.5) * 20,
        y: e.clientY - rect.top + (Math.random() - 0.5) * 20,
        size: 12 + Math.random() * 8,
        duration: 1 + Math.random(),
      }));
      setInteractiveSparkles((prev) => [...prev, ...newSparkles]);
      newSparkles.forEach((sparkle) => {
        setTimeout(() => {
          setInteractiveSparkles((prev) =>
            prev.filter((s) => s.id !== sparkle.id)
          );
        }, sparkle.duration * 1000);
      });
      return;
    }

    // Create a ripple effect unless it's a food pellet drop
    if (!e.shiftKey) {
      const ripple = {
        id: Date.now() + Math.random(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setRipples((prev) => [...prev, ripple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, 1000);
    }

    if (e.shiftKey) {
      const pellet = {
        id: Date.now() + Math.random(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        size: 16,
        duration: 10000,
      };
      setFoodPellets((prev) => [...prev, pellet]);
      setTimeout(() => {
        setFoodPellets((prev) => prev.filter((p) => p.id !== pellet.id));
      }, pellet.duration);
    } else {
      const bubbleCount = 3 + Math.floor(Math.random() * 3);
      const newBubbles = Array.from({ length: bubbleCount }, () => ({
        id: Date.now() + Math.random(),
        x: e.clientX - rect.left + (Math.random() - 0.5) * 20,
        y: e.clientY - rect.top + (Math.random() - 0.5) * 20,
        size: 8 + Math.random() * 12,
        duration: 2 + Math.random() * 2,
      }));

      setInteractiveBubbles((prev) => [...prev, ...newBubbles]);

      newBubbles.forEach((bubble) => {
        setTimeout(() => {
          setInteractiveBubbles((prev) =>
            prev.filter((b) => b.id !== bubble.id)
          );
        }, bubble.duration * 1000);
      });
    }
  };

  const findNearestFish = useCallback(
    (predator: Position, fishes: Position[]): Position | null => {
      if (fishes.length === 0) return null;
      return fishes.reduce((nearest, current) => {
        const distToCurrent = Math.hypot(current.x - predator.x, current.y - predator.y);
        const distToNearest = Math.hypot(nearest.x - predator.x, nearest.y - predator.y);
        return distToCurrent < distToNearest ? current : nearest;
      });
    },
    []
  );

  const moveTowards = (predator: PredatorState, target: Position): PredatorState => {
    const dx = target.x - predator.x;
    const dy = target.y - predator.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 1) return predator;
    return {
      x: predator.x + (dx / distance) * predator.speed,
      y: predator.y + (dy / distance) * predator.speed,
      direction: dx > 0 ? 1 : -1,
      speed: predator.speed,
    };
  };

  const protectFish = useCallback(
    (whaleShark: Position, shark: PredatorState, fishes: FishState[]): PredatorState => {
      const nearestFish = findNearestFish(shark, fishes);
      if (!nearestFish) return shark;
      const sharkToFish = Math.hypot(nearestFish.x - shark.x, nearestFish.y - shark.y);
      const whaleToShark = Math.hypot(whaleShark.x - shark.x, whaleShark.y - shark.y);
      if (sharkToFish < 150 && whaleToShark < 100) {
        const angle = Math.atan2(shark.y - whaleShark.y, shark.x - whaleShark.x);
        return {
          ...shark,
          x: shark.x + Math.cos(angle) * 250,
          y: shark.y + Math.sin(angle) * 250,
          direction: Math.cos(angle) > 0 ? 1 : -1,
          speed: shark.speed,
        };
      }
      return shark;
    },
    [findNearestFish]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      // Global subtle current offsets (very gentle drift)
      const currentX = Math.sin(Date.now() / 2000) * 0.5;
      const currentY = Math.cos(Date.now() / 2000) * 0.5;

      setFishes((prevFishes) =>
        prevFishes.map((fish) => {
          if (fish.isDying) return fish;
          let newSpeedX = fish.speedX;
          let newSpeedY = fish.speedY;

          // Check for nearby predators and seek safety
          // Check for predator proximity
          const distToPredators = {
            shark: Math.hypot(fish.x - shark.x, fish.y - shark.y),
            whaleShark: Math.hypot(fish.x - whaleShark.x, fish.y - whaleShark.y)
          };
          
          if (distToPredators.shark < DANGER_DISTANCE || distToPredators.whaleShark < DANGER_DISTANCE) {
            const safeZone = findNearestSafeZone(fish);
            if (safeZone) {
              const dirX = safeZone.x - fish.x;
              const dirY = safeZone.y - fish.y;
              const norm = Math.hypot(dirX, dirY) || 1;
              newSpeedX = (dirX / norm) * BASE_FISH_SPEED * 2; // Faster when seeking safety
              newSpeedY = (dirY / norm) * BASE_FISH_SPEED * 2;
              fish.isHiding = true;
            }
          } else {
            fish.isHiding = false;
          }

          // Food attraction behavior
          if (foodPellets.length) {
            const nearestPellet = foodPellets.reduce((closest: FoodPelletState | null, pellet) => {
              if (!closest) return pellet;
              return Math.hypot(fish.x - pellet.x, fish.y - pellet.y) <
                Math.hypot(fish.x - closest.x, fish.y - closest.y)
                ? pellet
                : closest;
            }, null);

            if (nearestPellet) {
              const dx = nearestPellet.x - fish.x;
              const dy = nearestPellet.y - fish.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 0) {
                const boostFactor = 1.5;
                newSpeedX = (dx / dist) * (BASE_FISH_SPEED * boostFactor);
                newSpeedY = (dy / dist) * (BASE_FISH_SPEED * boostFactor);
              }
              if (dist < 20) {
                setFoodPellets((prev) =>
                  prev.filter((p) => p.id !== nearestPellet.id)
                );
              }
            }
          }

          // Add a slight random jitter for natural movement
          newSpeedX += (Math.random() - 0.5) * 0.05;
          newSpeedY += (Math.random() - 0.5) * 0.05;

          // Calculate new position with global current offsets added
          let newX = fish.x + newSpeedX + currentX;
          let newY = fish.y + newSpeedY + currentY;
          let newDirection = fish.direction;
          const newXConstrained = Math.max(0, Math.min(newX, window.innerWidth - 40));
          const newYConstrained = Math.max(0, Math.min(newY, window.innerHeight - 40));
          if (newXConstrained !== newX) {
            newDirection *= -1;
          }
          newX = newXConstrained;
          newY = newYConstrained;

          // Schooling behavior: look for neighbors
          const neighbors = prevFishes.filter(
            (other) =>
              other.id !== fish.id &&
              Math.hypot(other.x - fish.x, other.y - fish.y) < 100
          );

          if (neighbors.length > 0) {
            // Alignment: average nearby velocities
            const avgSpeedX = neighbors.reduce((sum, n) => sum + n.speedX, 0) / neighbors.length;
            const avgSpeedY = neighbors.reduce((sum, n) => sum + n.speedY, 0) / neighbors.length;
            
            // Blend current speed with average (small factor)
            const alignmentFactor = 0.1;
            newSpeedX = newSpeedX + (avgSpeedX - newSpeedX) * alignmentFactor;
            newSpeedY = newSpeedY + (avgSpeedY - newSpeedY) * alignmentFactor;

            // Separation: push away from very close neighbors
            neighbors.forEach((n) => {
              const d = Math.hypot(n.x - fish.x, n.y - fish.y);
              if (d < 30 && d > 0) {
                newSpeedX -= ((n.x - fish.x) / d) * 0.05;
                newSpeedY -= ((n.y - fish.y) / d) * 0.05;
              }
            });
          }

          // Retain existing predator avoidance logic
          const distToShark = Math.hypot(shark.x - newX, shark.y - newY);
          let speedMultiplier = 1;
          if (distToShark < 200) {
            const normalizedDist = distToShark / 200;
            const easeOutQuad = 1 - normalizedDist * normalizedDist;
            speedMultiplier = 1 + (MAX_FISH_SPEED_MULTIPLIER - 1) * easeOutQuad;
          }
          newSpeedX =
            (newSpeedX / Math.abs(newSpeedX || 1)) *
            BASE_FISH_SPEED *
            speedMultiplier;
          newSpeedY =
            (newSpeedY / Math.abs(newSpeedY || 1)) *
            BASE_FISH_SPEED *
            0.5 *
            speedMultiplier;

          return {
            ...fish,
            x: newX,
            y: newY,
            direction: newDirection,
            speedX: newSpeedX,
            speedY: newSpeedY,
          };
        })
      );

      setShark((prevShark) => {
        const nearestFish = findNearestFish(prevShark, fishes);
        let newShark = prevShark;
        if (nearestFish) {
          newShark = moveTowards(prevShark, nearestFish);
        }
        newShark = protectFish(whaleShark, newShark, fishes);

        // Add competition repulsion
        const dx = newShark.x - whaleShark.x;
        const dy = newShark.y - whaleShark.y;
        const dist = Math.hypot(dx, dy);
        if (dist < COMPETITION_DISTANCE) {
          newShark = {
            ...newShark,
            x: newShark.x + (dx / dist) * COMPETITION_REPULSION * SHARK_SPEED,
            y: newShark.y + (dy / dist) * COMPETITION_REPULSION * SHARK_SPEED,
          };
        }

        return {
          ...newShark,
          x: Math.max(0, Math.min(newShark.x + currentX, window.innerWidth - 60)),
          y: Math.max(0, Math.min(newShark.y + currentY, window.innerHeight - 60)),
        };
      });

      setWhaleShark((prevWhaleShark) => {
        const nearestFish = findNearestFish(shark, fishes);
        let newWhaleShark = prevWhaleShark;
        if (
          nearestFish &&
          Math.hypot(nearestFish.x - shark.x, nearestFish.y - shark.y) < 150
        ) {
          newWhaleShark = moveTowards(prevWhaleShark, shark);
        } else {
          newWhaleShark = {
            ...prevWhaleShark,
            x: prevWhaleShark.x + Math.cos(Date.now() / 2000) * 2,
            y: prevWhaleShark.y + Math.sin(Date.now() / 1500) * 2,
            direction: Math.cos(Date.now() / 2000) > 0 ? 1 : -1,
          };
        }

        // Add competition repulsion
        const dx = newWhaleShark.x - shark.x;
        const dy = newWhaleShark.y - shark.y;
        const dist = Math.hypot(dx, dy);
        if (dist < COMPETITION_DISTANCE) {
          newWhaleShark = {
            ...newWhaleShark,
            x: newWhaleShark.x + (dx / dist) * COMPETITION_REPULSION * WHALE_SHARK_SPEED,
            y: newWhaleShark.y + (dy / dist) * COMPETITION_REPULSION * WHALE_SHARK_SPEED,
          };
        }

        return {
          ...newWhaleShark,
          x: Math.max(0, Math.min(newWhaleShark.x + currentX, window.innerWidth - 80)),
          y: Math.max(0, Math.min(newWhaleShark.y + currentY, window.innerHeight - 80)),
        };
      });

      setFishes((prevFishes) => {
        const updatedFishes = prevFishes.map((fish) => {
          if (fish.isDying) return fish;
          const dx = fish.x - shark.x;
          const dy = fish.y - shark.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 30) {
            const sharkMovingTowardsFish =
              (dx > 0 && shark.direction > 0) ||
              (dx < 0 && shark.direction < 0);
            if (sharkMovingTowardsFish) {
              return { ...fish, isBeingEaten: true };
            }
          } else if (fish.isBeingEaten) {
            return {
              ...fish,
              isBeingEaten: false,
              isDying: true,
              dyingStartTime: Date.now(),
            };
          }
          return fish;
        });
        return updatedFishes.filter((fish) => {
          if (!fish.isDying) return true;
          const timeSinceDeath = Date.now() - fish.dyingStartTime!;
          return timeSinceDeath < 1000;
        });
      });
    }, 50);

    return () => clearInterval(interval);
  }, [fishes, shark, whaleShark, protectFish, findNearestFish, foodPellets]);

  // Ripple effect for fast-moving predators
  useEffect(() => {
    const now = Date.now();
    if (now - sharkRippleTimeRef.current > 500) {
      setRipples((prev) => [...prev, { id: now + Math.random(), x: shark.x, y: shark.y }]);
      sharkRippleTimeRef.current = now;
    }
  }, [shark.x, shark.y]);

  useEffect(() => {
    const now = Date.now();
    if (now - whaleSharkRippleTimeRef.current > 500) {
      setRipples((prev) => [...prev, { id: now + Math.random(), x: whaleShark.x, y: whaleShark.y }]);
      whaleSharkRippleTimeRef.current = now;
    }
  }, [whaleShark.x, whaleShark.y]);

  return (
    <div className="fish-tank" onClick={handleTankClick}>
      <div className="ambient-light" />
      <div className="caustics-overlay" />
      {ripples.map((r) => (
        <RippleEffect key={`ripple-${r.id}`} x={r.x} y={r.y} />
      ))}
      <UnderwaterDecorations fishes={fishes} />
      {fishes.map((fish) => (
        <Fish
          key={fish.id}
          x={fish.x}
          y={fish.y}
          direction={fish.direction}
          color={fish.color}
          isDying={fish.isDying}
          isBeingEaten={fish.isBeingEaten}
        />
      ))}
      <Shark x={shark.x} y={shark.y} direction={shark.direction} />
      <WhaleShark
        x={whaleShark.x}
        y={whaleShark.y}
        direction={whaleShark.direction}
      />
      {interactiveBubbles.map((b) => (
        <Bubble
          key={`interactive-${b.id}`}
          x={b.x}
          y={b.y}
          size={b.size}
          duration={b.duration}
        />
      ))}
      {foodPellets.map((p) => (
        <FoodPellet
          key={`food-${p.id}`}
          x={p.x}
          y={p.y}
          size={p.size}
        />
      ))}
      {interactiveSparkles.map((s) => (
        <SeaSparkle
          key={`sparkle-${s.id}`}
          x={s.x}
          y={s.y}
          size={s.size}
          duration={s.duration}
        />
      ))}
    </div>
  );
};
