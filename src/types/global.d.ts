declare type Position = [number, number];
declare type Dimensions = [number, number];
declare type Team = number | null;

declare interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  // TODO: Check if we can remove these attributes
  team: Team;
  hp: number;
  maxHp: number;
  alive: boolean;

  hasCollided: (entity: Entity) => boolean;
}
