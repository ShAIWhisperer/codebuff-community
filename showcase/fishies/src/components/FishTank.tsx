// src/components/FishTank.tsx
import { useEffect, useState, useCallback } from "react";
import { Fish } from "./Fish";
import { Shark } from "./Shark";
import { WhaleShark } from "./WhaleShark";
import { UnderwaterDecorations } from "./UnderwaterDecorations";

interface Position {
  x: number;
  y: number;
}

interface FishState extends Position {
  id: number;
  direction: number;
  color: string;
  speedX: number;
  speedY: number;
  isDying?: boolean;
  dyingStartTime?: number;
  isBeingEaten?: boolean;
}

interface PredatorState extends Position {
  direction: number;
  speed: number;
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"];
const SHARK_SPEED = 3;
const WHALE_SHARK_SPEED = 4;
const BASE_FISH_SPEED = 0.5;
const MAX_FISH_SPEED_MULTIPLIER = 1.5;

export const FishTank: React.FC = () => {
  const [fishes, setFishes] = useState<FishState[]>(() =>
    Array.from({ length: 10 }, (_, i) => ({
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

  const findNearestFish = useCallback(
    (shark: Position, fishes: Position[]): Position | null => {
      if (fishes.length === 0) return null;
      return fishes.reduce((nearest, current) => {
        const distToCurrent = Math.hypot(
          current.x - shark.x,
          current.y - shark.y
        );
        const distToNearest = Math.hypot(
          nearest.x - shark.x,
          nearest.y - shark.y
        );
        return distToCurrent < distToNearest ? current : nearest;
      });
    },
    []
  );

  const moveTowards = (
    predator: PredatorState,
    target: Position
  ): PredatorState => {
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
    (
      whaleShark: Position,
      shark: PredatorState,
      fishes: FishState[]
    ): PredatorState => {
      const nearestFish = findNearestFish(shark, fishes);
      if (!nearestFish) return shark;
      const sharkToFish = Math.hypot(
        nearestFish.x - shark.x,
        nearestFish.y - shark.y
      );
      const whaleToShark = Math.hypot(
        whaleShark.x - shark.x,
        whaleShark.y - shark.y
      );
      if (sharkToFish < 150 && whaleToShark < 100) {
        const angle = Math.atan2(
          shark.y - whaleShark.y,
          shark.x - whaleShark.x
        );
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
      setFishes((prevFishes) =>
        prevFishes.map((fish) => {
          if (fish.isDying) return fish;
          let newX = fish.x + fish.speedX;
          let newY = fish.y + fish.speedY;
          let newDirection = fish.direction;
          const newXConstrained = Math.max(
            0,
            Math.min(newX, window.innerWidth - 40)
          );
          const newYConstrained = Math.max(
            0,
            Math.min(newY, window.innerHeight - 40)
          );
          if (newXConstrained !== newX) {
            newDirection *= -1;
          }
          newX = newXConstrained;
          newY = newYConstrained;
          const distToShark = Math.hypot(shark.x - newX, shark.y - newY);
          let speedMultiplier = 1;
          if (distToShark < 200) {
            const normalizedDist = distToShark / 200;
            const easeOutQuad = 1 - normalizedDist * normalizedDist;
            speedMultiplier = 1 + (MAX_FISH_SPEED_MULTIPLIER - 1) * easeOutQuad;
          }
          const adjustedSpeedX =
            (fish.speedX / Math.abs(fish.speedX)) *
            BASE_FISH_SPEED *
            speedMultiplier;
          const adjustedSpeedY =
            (fish.speedY / Math.abs(fish.speedY || 1)) *
            BASE_FISH_SPEED *
            0.5 *
            speedMultiplier;
          return {
            ...fish,
            x: newX,
            y: newY,
            direction: newDirection,
            speedX: adjustedSpeedX,
            speedY: adjustedSpeedY,
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
        return {
          ...newShark,
          x: Math.max(0, Math.min(newShark.x, window.innerWidth - 60)),
          y: Math.max(0, Math.min(newShark.y, window.innerHeight - 60)),
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
        return {
          ...newWhaleShark,
          x: Math.max(0, Math.min(newWhaleShark.x, window.innerWidth - 80)),
          y: Math.max(0, Math.min(newWhaleShark.y, window.innerHeight - 80)),
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
  }, [fishes, shark, whaleShark, protectFish, findNearestFish]);

  return (
    <div className="fish-tank">
      {/* Render the extra underwater decorations behind the fish */}
      <UnderwaterDecorations />
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
    </div>
  );
};
