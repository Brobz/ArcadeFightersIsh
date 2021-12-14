type Position = [number, number];
type Dimensions = [number, number];
type Team = string | null;

interface Entity {
  x: number,
  y: number,
  width: number,
  height: number,
  team: Team
}
