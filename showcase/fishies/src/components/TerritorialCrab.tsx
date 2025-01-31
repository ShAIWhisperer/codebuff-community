import { CSSProperties } from "react";

interface TerritorialCrabProps {
  x: number;
  y: number;
  size?: number;
  intruderNearby?: boolean;
}

export const TerritorialCrab: React.FC<TerritorialCrabProps> = ({
  x,
  y,
  size = 40,
  intruderNearby = false,
}) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    fontSize: `${size}px`,
    zIndex: 0,
    animation: intruderNearby
      ? "crab-walk 2s linear infinite" // faster animation
      : "crab-walk 4s linear infinite",
  };

  return <div style={style}>🦀</div>;
};
