// src/components/Fish.tsx
import { CSSProperties } from "react";

interface FishProps {
  x: number;
  y: number;
  direction: number;
  color: string;
  isDying?: boolean;
  dyingStartTime?: number;
  isBeingEaten?: boolean;
}

export const Fish: React.FC<FishProps> = ({
  x,
  y,
  direction,
  color,
  isDying,
  dyingStartTime,
  isBeingEaten,
}) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    // Ensure fish (and later, predators) are rendered above decorations
    zIndex: 1,
    transform: `
      translate3d(0, 0, ${Math.sin(Date.now() / 1000) * 200}px)
      rotateY(${direction > 0 ? 0 : 180}deg)
      ${
        isDying
          ? "rotateZ(180deg)"
          : isBeingEaten
          ? "rotateZ(0deg)"
          : "rotateZ(-15deg)"
      }
      scale(${1 + Math.sin(Date.now() / 1000) * 0.1})
    `,
    transition: isDying ? "opacity 1s ease-out" : "none",
    fontSize: "24px",
    color,
    opacity: isDying ? (Date.now() - dyingStartTime! > 500 ? 0 : 1) : 1,
  };

  return (
    <div style={style}>
      {isDying && Date.now() - dyingStartTime! > 500 ? "☠️" : "🐠"}
    </div>
  );
};
