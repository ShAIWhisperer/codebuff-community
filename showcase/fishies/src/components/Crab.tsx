import { CSSProperties } from "react";

interface CrabProps {
  x: number;
  y: number;
  size?: number;
}

export const Crab: React.FC<CrabProps> = ({ x, y, size = 40 }) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    fontSize: `${size}px`,
    zIndex: 0,
    animation: "crab-walk 4s linear infinite",
  };

  return <div style={style}>🦀</div>;
};
