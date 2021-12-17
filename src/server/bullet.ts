import Block from './block';
import ObstacleBlock from './obstacle_block';

class Bullet extends Block {
  speed = 5;
  hasNormalized = false;
  hasShrinked = false;
  trailCounter = 0;
  trailMax = 5;

  dmg: number;
  // TODO: Maybe make dir an enum so that it can be more explicit
  dir: number;
  isCluster: boolean;
  // TODO: Consider create a class that extends bullet but is only
  // for child bullets
  isChild: boolean;
  canPassThroughWalls: boolean;
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
    child: boolean,
    canPassThroughWalls: boolean,
  ) {
    super(pos, size, color);
    this.dmg = damage;
    this.dir = dir;
    this.isCluster = cluster;
    this.isChild = child;
    this.team = team;
    [this.lastX, this.lastY] = pos;
    this.canPassThroughWalls = canPassThroughWalls;
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
    else if(this.dir == 1 || this.dir == 5 || this.dir == 7){
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
    else if(this.dir == 3 || this.dir == 5 || this.dir == 6){
      this.x += this.speed;
      if(this.trailCounter >= this.trailMax){
        this.lastX += this.speed;
      }
    }

    if(this.dir > 3 && !this.hasNormalized) {
      this.normalize();
    }

    if(this.trailCounter < this.trailMax) {
      this.trailCounter += 1;
    }
  }

  isAlive = () => {
    return this.hp > 0;
  }

  checkForCollision = <T extends Entity>(entity: T | null) => {
    if(!entity)
      return null;
    if(!this.hasCollided(entity) || entity.team == this.team){
      return null;
    }
    if (this.canPassThroughWalls && entity instanceof ObstacleBlock) {
      return null;
    }
    return entity;
  }

  createClusterBullet = (dir: number) => {
    return new Bullet(
      [this.x, this.y],
      [this.width, this.height],
      this.color,
      this.team,
      dir,
      this.dmg / 1.5,
      false,
      true,
      this.canPassThroughWalls,
    );
  }
}

export default Bullet;
