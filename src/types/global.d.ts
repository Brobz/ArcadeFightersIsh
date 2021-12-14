declare type Position = [number, number];
declare type Dimensions = [number, number];
declare type Team = string | null;

declare interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  team: Team;
}

declare enum PowerUpType {
  HEAL,
  SPEED,
  SHIELD,
  INCREASED_FIRE_RATE,
  MULTI_GUN,
  CLUSTER_GUN,
  BIG_BULLETS,
}
