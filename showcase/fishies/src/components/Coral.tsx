// src/components/Coral.tsx
import { CSSProperties } from "react";

interface CoralProps {
  x: number;
  y: number;
  size?: number;
}

export const Coral: React.FC<CoralProps> = ({ x, y, size = 40 }) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    fontSize: `${size}px`,
    zIndex: 0,
  };

  return <div style={style}>🪸</div>;
};
