// src/components/WhaleShark.tsx
import { CSSProperties } from "react";

interface WhaleSharkProps {
  x: number;
  y: number;
  direction: number;
}

export const WhaleShark: React.FC<WhaleSharkProps> = ({ x, y, direction }) => {
  const style: CSSProperties = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    zIndex: 1,
    transform: `
      translate3d(0, 0, ${Math.sin(Date.now() / 1500) * 400}px)
      rotateY(${direction > 0 ? 0 : 180}deg)
      scale(${1 + Math.sin(Date.now() / 1500) * 0.2})
    `,
    transition: "all 0.3s ease-in-out",
    fontSize: "64px", // Much bigger than shark
  };

  return <div style={style}>🐋</div>;
};
