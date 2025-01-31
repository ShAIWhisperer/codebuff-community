// src/components/Jellyfish.tsx
import { CSSProperties } from "react";

interface JellyfishProps {
  x: number;
  y: number;
  size?: number;
}

export const Jellyfish: React.FC<JellyfishProps> = ({ x, y, size = 40 }) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    fontSize: `${size}px`,
    // Render behind the fish and predators
    zIndex: 0,
    animation: "jellyfish-float 6s ease-in-out infinite",
  };

  return <div style={style}>🪼</div>;
};
