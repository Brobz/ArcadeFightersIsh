import Block from "./block";
import Bullet from "./bullet";
import ActivePowerUp from "./power_up/active_power_up";
import PowerUp from "./power_up/power_up";

const INITIAL_SPEED = 2;
const INITIAL_SHOOTING_DELAY = 8;
const INITIAL_BULLET_SIZE = 5;
const INITIAL_BULLET_DMG = 5;

class Player extends Block implements EntityWithTeam {
  maxHp = 40;
  hp = 40;
  alive = true;
  isMovingLeft = false;
  isMovingRight = false;
  isMovingUp = false;
  isMovingDown = false;
  isShootingLeft = false;
  isShootingRight = false;
  isShootingUp = false;
  isShootingDown = false;
  shootingDelay = INITIAL_SHOOTING_DELAY;
  timeUntilNextShot = 8;
  hasShield = false;
  hasMultigun = false;
  hasClusterGun = false;
  shootThroughBlocks = false;
  bulletSize = INITIAL_BULLET_SIZE;
  bulletDmg = INITIAL_BULLET_DMG;
  speed = INITIAL_SPEED;

  powerUps: ActivePowerUp[] = [];
  team: Team = 0;

  id: string;
  name: string;

  constructor(id: string, name: string, color: string) {
    super([250, 250], [20, 20], color)
    this.id = id;
    this.name = name;
  }

  reset = (pos: Position) => {
    [this.x, this.y] = pos;
    this.hp = this.maxHp;
    this.alive = true;
    this.powerUps = [];
    this.shootingDelay = INITIAL_SHOOTING_DELAY;
    this.speed = INITIAL_SPEED;
    this.bulletSize = INITIAL_BULLET_SIZE;
    this.bulletDmg = INITIAL_BULLET_DMG;
    this.hasClusterGun = false;
    this.hasShield = false
    this.hasMultigun = false;
    this.shootThroughBlocks = false;
  }

  powerUp = (powerUp: PowerUp) => {
    const time = 60 * (Math.random() * 3 + 1) // (60, 240)
    powerUp.turnOnEffectFor(this, time);
    if (!(powerUp instanceof ActivePowerUp)) {
      return;
    }
    this.powerUps.push(powerUp);
  }

  updatePowerUps = () => {
    this.powerUps = this.powerUps.filter(powerUp => powerUp.updatePowerUp());
  }

  move = (x: number, y: number, blocks: Entity[]) => {
    this.x += x;
    this.y += y;

    this.checkForCollision(blocks, x, y);
  }

  checkForCollision = (
    entities: Entity[],
    x: number,
    y: number
  ) => {
    for(const entity of entities) {
      if(!this.hasCollided(entity)) {
        continue;
      }
      if (y < 0){
        this.y = entity.y + entity.height;
      } else if (y > 0) {
        this.y = entity.y - this.height;
      }
      if (x < 0){
        this.x = entity.x + entity.width;
      } else if (x > 0) {
        this.x = entity.x - this.width;
      }
    }
  }

  updatePosition = (blocks: Entity[]) => {
    if(this.isMovingUp)
      this.move(0, -this.speed, blocks);
    if(this.isMovingDown)
      this.move(0, this.speed, blocks);
    if(this.isMovingLeft)
      this.move(-this.speed, 0, blocks);
    if(this.isMovingRight)
      this.move(this.speed, 0, blocks);
  }

  updateState = () => {
    this.alive = this.hp > 0;
    if (!this.alive) {
      return false;
    }
    this.updatePowerUps();
    return true;
  }

  isShooting = () => {
    this.timeUntilNextShot -= 1;
    const canShoot = this.timeUntilNextShot <= 0;
    const isShooting = this.isShootingUp || this.isShootingDown || this.isShootingLeft || this.isShootingRight;
    if (canShoot && isShooting) {
      this.timeUntilNextShot = this.shootingDelay;
      return true;
    }
    return false;
  }

  getShootingDir = () => {
    if (this.isShootingUp) {
      return 0;
    } if (this.isShootingDown) {
      return 1;
    } if (this.isShootingLeft) {
      return 2;
    } return 3;
  }

  createBullet = (color: string, dir?: number) => {
    dir ??= this.getShootingDir();
    return new Bullet(
      [this.x + 7, this.y + 7],
      [this.bulletSize, this.bulletSize],
      color,
      this.team,
      dir,
      this.bulletDmg,
      this.hasClusterGun,
      false,
      this.shootThroughBlocks,
    )
  }

  setColor = (color: string) => {
    this.color = color;
  }
}

export default Player;
