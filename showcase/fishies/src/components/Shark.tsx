import { CSSProperties } from 'react'

interface SharkProps {
  x: number
  y: number
  direction: number
}

export const Shark: React.FC<SharkProps> = ({ x, y, direction }) => {
  const style: CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: `
      translate3d(0, 0, ${Math.sin(Date.now() / 1200) * 300}px)
      rotateY(${direction > 0 ? 0 : 180}deg)
      scale(${1 + Math.sin(Date.now() / 1200) * 0.15})
    `,
    transition: 'all 0.3s ease-in-out',
    fontSize: '40px', // Bigger than fish
  }

  return <div style={style}>🦈</div>
}
