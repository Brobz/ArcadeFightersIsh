import Block from './block';
import ObstacleBlock from './obstacle_block';

function isEntityWithTeam(entity: Entity): entity is EntityWithTeam {
  return Object.prototype.hasOwnProperty.call(entity, 'team');
}

export const enum Dir {
  UP = 1,
  DOWN = 2,
  LEFT = 4,
  UP_LEFT = Dir.UP + Dir.LEFT,
  DOWN_LEFT = Dir.DOWN + Dir.LEFT,
  RIGHT = 8,
  UP_RIGHT = Dir.UP + Dir.RIGHT,
  DOWN_RIGHT = Dir.DOWN + Dir.RIGHT,
}

export const directions: Dir[] = [
  Dir.UP, Dir.DOWN, Dir.LEFT, Dir.UP_LEFT, Dir.DOWN_LEFT, Dir.RIGHT, Dir.UP_RIGHT, Dir.DOWN_RIGHT,
]

class Bullet extends Block implements EntityWithTeam {
  speed = 5;
  hasNormalized = false;
  hasShrinked = false;
  trailCounter = 0;
  trailMax = 5;

  dmg: number;
  dir: Dir;
  isCluster: boolean;
  // TODO: Consider create a class that extends bullet but is only
  // for child bullets
  isChild: boolean;
  canPassThroughWalls: boolean;
  lastX: number;
  lastY: number;
  team: Team;

  constructor(
    pos: Position,
    size: Dimensions,
    color: string,
    team: Team,
    dir: Dir,
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
    const isGoingUp = (this.dir & Dir.UP) != 0;
    const isGoingDown = (this.dir & Dir.DOWN) != 0;
    if(isGoingUp){
      this.y -= this.speed;
      if(this.trailCounter >= this.trailMax){
        this.lastY -= this.speed;
      }
    }
    else if (isGoingDown){
      this.y += this.speed;
      if(this.trailCounter >= this.trailMax){
        this.lastY += this.speed;
      }
    }
    const isGoingLeft = (this.dir & Dir.LEFT) != 0;
    const isGoingRight = (this.dir & Dir.RIGHT) != 0;
    if(isGoingLeft){
      this.x -= this.speed;
      if(this.trailCounter >= this.trailMax){
        this.lastX -= this.speed;
      }
    }
    else if(isGoingRight){
      this.x += this.speed;
      if(this.trailCounter >= this.trailMax){
        this.lastX += this.speed;
      }
    }

    const goingDiagonally = (isGoingUp || isGoingDown) && (isGoingLeft || isGoingRight);
    if(goingDiagonally && !this.hasNormalized) {
      this.normalize();
    }

    if(this.trailCounter < this.trailMax) {
      this.trailCounter += 1;
    }
  }

  checkForCollision = <T extends Entity>(entity: T | null) => {
    if(!entity)
      return null;
    if(!this.hasCollided(entity)){
      return null;
    }
    if (this.canPassThroughWalls && entity instanceof ObstacleBlock) {
      return null;
    }
    if (this.team != 0 && isEntityWithTeam(entity) && this.team == entity.team) {
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
