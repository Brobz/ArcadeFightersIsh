import Block from "./block";

const INITIAL_SPEED = 2;
const INITIAL_SHOOTING_DELAY = 8;
const INITIAL_BULLET_SIZE = 5;
const INITIAL_BULLET_DMG = 5;

class Player extends Block {
  maxHp = 40;
  hp = 40;
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
  bulletSize = INITIAL_BULLET_SIZE;
  bulletDmg = INITIAL_BULLET_DMG;
  speed = INITIAL_SPEED;

  powerUpsActive: PowerUpType[] = [];
  powerUpsTime: number[] = [];

  id: string;
  name: string;

  constructor(id: string, name: string, color: string) {
    super([250, 250], [20, 20], color)
    this.id = id;
    this.name = name;
  }

  powerUp = (type: PowerUpType) => {
    const value = Math.random();
    if(type == PowerUpType.HEAL){
      this.hp = this.maxHp;
      return;
    }
    const isActive = this.powerUpsActive.indexOf(type) != -1;
    if (isActive) {
      return;
    }
    if(type == PowerUpType.SPEED){
      const speedIncrease = value;
      this.speed *= (1 + speedIncrease);
      this.powerUpsActive.push(type);
      this.powerUpsTime.push(60 * 4);
    }
    else if(type == PowerUpType.SHIELD){
      this.hasShield = true;
      this.powerUpsActive.push(type);
      this.powerUpsTime.push(60 * 3);
    }
    else if(type == PowerUpType.INCREASED_FIRE_RATE){
      const reducedDelay = (value * 2) + 4;
      this.shootingDelay -= reducedDelay; // Range of values: (2, 4)
      this.powerUpsActive.push(type);
      this.powerUpsTime.push(60 * 3);
    }
    else if(type == PowerUpType.MULTI_GUN){
      this.hasMultigun = true;
      this.powerUpsActive.push(type);
      this.powerUpsTime.push(60 * 3);
    }
    else if(type == PowerUpType.CLUSTER_GUN){
      this.hasClusterGun = true;
      this.powerUpsActive.push(type);
      this.powerUpsTime.push(60 * 3);
    }
    else if(type == PowerUpType.BIG_BULLETS){
      this.bulletSize = 10;
      const increasedDamage = (value * 2) + 3;
      this.bulletDmg += increasedDamage; // Range of values: (7, 9)
      this.powerUpsActive.push(type);
      this.powerUpsTime.push(60 * 4);
    }
  }

  updatePowerUps = () => {
    for(let i in this.powerUpsTime){
      this.powerUpsTime[i] -= 1;
      const powerUpIsActive = this.powerUpsTime[i] > 0;
      if (powerUpIsActive) {
        continue;
      }
      switch (this.powerUpsActive[i]) {
        case PowerUpType.SPEED:
          this.speed = INITIAL_SPEED;
          break;
        case PowerUpType.SHIELD:
          this.hasShield = false;
          break;
        case PowerUpType.INCREASED_FIRE_RATE:
          this.shootingDelay = INITIAL_SHOOTING_DELAY;
          break;
        case PowerUpType.MULTI_GUN:
          this.hasMultigun = false;
          break;
        case PowerUpType.CLUSTER_GUN:
          this.hasClusterGun = false;
          break;
        case PowerUpType.BIG_BULLETS:
          this.bulletSize = INITIAL_BULLET_SIZE;
          this.bulletDmg = INITIAL_BULLET_DMG;
          break;
      }
      const index = parseInt(i);

      this.powerUpsTime.splice(index, 1);
      this.powerUpsActive.splice(index, 1);
    }
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
      if(y < 0){
        this.y = entity.y + entity.height;
      } else {
        this.y = entity.y - this.height;
      }
      if(x < 0){
        this.x = entity.x + entity.width;
      } else {
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
  }

  updateShooting = () => {
    this.timeUntilNextShot -= 1;
    const canShoot = this.timeUntilNextShot <= 0;
    const isShooting = this.isShootingUp || this.isShootingDown || this.isShootingLeft || this.isShootingRight;
    if (canShoot && isShooting) {
      this.timeUntilNextShot = this.shootingDelay;
      return true;
    }
    return false;
  }

  setColor = (color: string) => {
    this.color = color;
  }
}

export default Player;
