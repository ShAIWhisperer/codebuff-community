import { CSSProperties } from "react";

interface PlanktonProps {
  x: number;
  y: number;
  size?: number;
  duration?: number;
}

export const Plankton: React.FC<PlanktonProps> = ({
  x,
  y,
  size = 2,
  duration = 6,
}) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    animation: `plankton-drift ${duration}s linear infinite`,
    zIndex: 0,
  };
  return <div style={style} />;
};
