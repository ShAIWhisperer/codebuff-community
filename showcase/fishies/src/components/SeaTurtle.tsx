import { CSSProperties } from "react";

interface SeaTurtleProps {
  x: number;
  y: number;
  size?: number;
}

export const SeaTurtle: React.FC<SeaTurtleProps> = ({ x, y, size = 50 }) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    fontSize: `${size}px`,
    zIndex: 0,
    animation: "turtle-swim 12s ease-in-out infinite",
  };

  return <div style={style}>🐢</div>;
};
