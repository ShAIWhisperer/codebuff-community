// src/components/Seashell.tsx
import { CSSProperties } from "react";

interface SeashellProps {
  x: number;
  y: number;
  size?: number;
}

export const Seashell: React.FC<SeashellProps> = ({ x, y, size = 30 }) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    fontSize: `${size}px`,
    zIndex: 0,
  };

  return <div style={style}>🐚</div>;
};
