import Block from '../block';
import {PowerUpType} from './power_up_type';

class PowerUpBlock extends Block {
  type: PowerUpType;

  constructor(
    pos: Position,
    color: string,
    type: PowerUpType
  ) {
    super(pos, [15, 15], color);
    this.type = type;
  }

  checkForCollision = (entity: Entity) => {
    if(entity == this) return null;
    if(this.hasCollided(entity)){
      return entity;
    }
    return null;
  }
}

export default PowerUpBlock;
