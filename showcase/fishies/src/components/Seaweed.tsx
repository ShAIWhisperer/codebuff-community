// src/components/Seaweed.tsx
import { CSSProperties } from "react";

interface SeaweedProps {
  x: number;
  y: number;
  size?: number;
}

export const Seaweed: React.FC<SeaweedProps> = ({ x, y, size = 50 }) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    fontSize: `${size}px`,
    zIndex: 0,
    animation: "sway 4s ease-in-out infinite",
  };

  return <div style={style}>🌿</div>;
};
