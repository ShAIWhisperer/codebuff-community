// src/components/Bubble.tsx
import { CSSProperties } from "react";

interface BubbleProps {
  x: number;
  y: number;
  size?: number;
  duration?: number;
}

export const Bubble: React.FC<BubbleProps> = ({
  x,
  y,
  size = 10,
  duration = 4,
}) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: "50%",
    zIndex: 0,
    animation: `bubble-rise ${duration}s linear infinite`,
  };

  return <div style={style}></div>;
};
