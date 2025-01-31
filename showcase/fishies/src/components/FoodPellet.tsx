import { CSSProperties } from "react";

interface FoodPelletProps {
  x: number;
  y: number;
  size?: number;
}

export const FoodPellet: React.FC<FoodPelletProps> = ({
  x,
  y,
  size = 16,
}) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x - size / 2}px`,
    top: `${y - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    zIndex: 1,
    fontSize: `${size}px`,
    animation: "food-pulse 2s ease-in-out infinite",
  };

  return <div style={style}>🍤</div>;
};
