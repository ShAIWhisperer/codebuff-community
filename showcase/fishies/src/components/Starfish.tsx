import { CSSProperties } from "react";

interface StarfishProps {
  x: number;
  y: number;
  size?: number;
}

export const Starfish: React.FC<StarfishProps> = ({ x, y, size = 30 }) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    fontSize: `${size}px`,
    zIndex: 0,
    transformOrigin: "center",
    animation: "starfish-rotate 5s ease-in-out infinite alternate",
  };

  return <div style={style}>⭐</div>;
};
