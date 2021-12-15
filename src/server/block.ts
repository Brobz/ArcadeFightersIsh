class Block implements Entity {
  alive = true;
  maxHp = 25;
  hp = 25;

  x: number;
  y: number;
  width: number;
  height: number;
  color: string;

  team: Team = null;

  constructor(pos: Position, size: Dimensions, color: string) {
    [this.x, this.y] = pos;
    [this.width, this.height] = size;
    this.color = color;
  }
}

export default Block;
