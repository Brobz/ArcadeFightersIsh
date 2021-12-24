declare type Position = [number, number];
declare type Dimensions = [number, number];
declare type Team = number;

declare interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;

  hasCollided: (entity: Entity) => boolean;
}

declare interface EntityWithTeam extends Entity {
  team: Team
}
