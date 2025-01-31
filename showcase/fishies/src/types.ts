export interface Position {
  x: number;
  y: number;
}

export interface FishState extends Position {
  id: number;
  direction: number;
  color: string;
  speedX: number;
  speedY: number;
  isDying?: boolean;
  dyingStartTime?: number;
  isBeingEaten?: boolean;
  isHiding?: boolean;
}
