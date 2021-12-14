import Block from './block';

class PowerUp extends Block {
  type: PowerUpType;

  constructor(
    pos: Position,
    size: Dimensions,
    color: string,
    type: PowerUpType
  ) {
    super(pos, size, color);
    this.type = type;
  }

  checkForCollision = (entity: Entity) => {
    if(entity == this) return null;
    if(!(entity.x > this.x + this.width ||  entity.x + entity.width < this.x || entity.y > this.y + this.height || entity.y + entity.height < this.y)){
      return entity;
    }
    return null;
  }
}

export default PowerUp;
