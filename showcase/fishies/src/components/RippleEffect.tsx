import { CSSProperties } from "react";

interface RippleEffectProps {
  x: number;
  y: number;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({ x, y }) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    animation: "water-ripple 1s ease-out forwards",
    zIndex: 0,
  };
  return <div style={style} />;
};
