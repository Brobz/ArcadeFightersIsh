abstract class Block implements Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;

  constructor(pos: Position, size: Dimensions, color: string) {
    [this.x, this.y] = pos;
    [this.width, this.height] = size;
    this.color = color;
  }

  hasCollided = (entity: Entity) => {
    return entity.x < this.x + this.width &&
      entity.x + entity.width > this.x &&
      entity.y < this.y + this.height &&
      entity.y + entity.height > this.y;
  }
}

export default Block;
