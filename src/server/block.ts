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

  hasCollided = (entity: Entity) => {
    return entity.x < this.x + this.width &&
      entity.x + entity.width > this.width &&
      entity.y < this.y + this.height &&
      entity.y + entity.height > this.y;
  }
}

export default Block;
