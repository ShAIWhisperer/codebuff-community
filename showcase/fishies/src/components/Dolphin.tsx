import { CSSProperties } from "react";

interface DolphinProps {
  x: number;
  y: number;
  size?: number;
}

export const Dolphin: React.FC<DolphinProps> = ({ x, y, size = 40 }) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    fontSize: `${size}px`,
    zIndex: 1,
    transform: `
      translate3d(0, 0, ${Math.sin(Date.now() / 2500) * 150}px)
      rotateY(${Math.random() < 0.5 ? 0 : 180}deg)
    `,
    animation: "dolphin-swim 6s ease-in-out infinite",
  };

  return <div style={style}>🐬</div>;
};
