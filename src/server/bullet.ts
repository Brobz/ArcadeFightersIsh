import Block from './block';

class Bullet extends Block {
  speed = 5;
  hasNormalized = false;
  hasShrinked = false;
  trailCounter = 0;
  trailMax = 5;

  dmg: number;
  dir: number;
  isCluster: boolean;
  isChild: boolean;
  lastX: number;
  lastY: number;

  constructor(
    pos: Position,
    size: Dimensions,
    color: string,
    team: Team,
    dir: number,
    damage: number,
    cluster: boolean,
    child: boolean
  ) {
    super(pos, size, color);
    this.dmg = damage;
    this.dir = dir;
    this.isCluster = cluster;
    this.isChild = child;
    this.team = team;
    [this.lastX, this.lastY] = pos;
  }

  normalize = () => {
    this.speed *= 1 / Math.sqrt(2);
    this.hasNormalized = true;
  }

  shrink = () => {
    this.width *= 0.5;
    this.height *= 0.5;
    this.hasShrinked = true;
  }

  updatePosition = () => {
    if(this.dir == 0 || this.dir == 4 || this.dir == 6){
      this.y -= this.speed;
      if(this.trailCounter >= this.trailMax){
        this.lastY -= this.speed;
      }
    }
    if(this.dir == 1 || this.dir == 5 || this.dir == 7){
      this.y += this.speed;
      if(this.trailCounter >= this.trailMax){
        this.lastY += this.speed;
      }
    }
    if(this.dir == 2 || this.dir == 4 || this.dir == 7){
      this.x -= this.speed;
      if(this.trailCounter >= this.trailMax){
        this.lastX -= this.speed;
      }
    }
    if(this.dir == 3 || this.dir == 5 || this.dir == 6){
      this.x += this.speed;
      if(this.trailCounter >= this.trailMax){
        this.lastX += this.speed;
      }
    }

    if(this.dir > 3 && !this.hasNormalized)
      this.normalize();

    if(this.trailCounter < this.trailMax)
      this.trailCounter += 1;
  }

  isAlive = () => {
    return this.hp > 0;
  }

  checkForCollision = <T extends Entity>(entity: T | null) => {
    if(!entity)
      return;
    if(!(entity.x >= this.x + this.width ||  entity.x + entity.width <= this.x || entity.y >= this.y + this.height || entity.y + entity.height <= this.y)
        && entity.team != this.team){
      return entity;
    }
    return null;
  }

}

export default Bullet;
