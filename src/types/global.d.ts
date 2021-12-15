declare type Position = [number, number];
declare type Dimensions = [number, number];
declare type Team = number | null;

declare interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  team: Team;
  hp: number;
  maxHp: number;
  alive: boolean;
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
