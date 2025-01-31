import { CSSProperties } from "react";

interface SeaSparkleProps {
  x: number;
  y: number;
  size?: number;
  duration?: number;
}

export const SeaSparkle: React.FC<SeaSparkleProps> = ({
  x,
  y,
  size = 12,
  duration = 1,
}) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size}px`,
    pointerEvents: "none",
    animation: `sparkle-fade ${duration}s ease-out forwards`,
    zIndex: 2,
  };

  return <div style={style}>✨</div>;
};
