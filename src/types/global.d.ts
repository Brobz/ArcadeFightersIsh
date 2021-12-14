declare type Position = [number, number];
declare type Dimensions = [number, number];
declare type Team = string | null;

declare interface Entity {
  x: number,
  y: number,
  width: number,
  height: number,
  team: Team
}
