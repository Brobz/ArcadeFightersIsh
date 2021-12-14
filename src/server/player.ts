enum PowerUpType {
  HEAL,
  SPEED,
  SHIELD,
  INCREASED_FIRE_RATE,
  MULTI_GUN,
  CLUSTER_GUN,
  BIG_BULLETS,
}

const INITIAL_SPEED = 2;
const INITIAL_SHOOTING_DELAY = 8;
const INITIAL_BULLET_SIZE = 5;
const INITIAL_BULLET_DMG = 5;

exports.Player = function(id: string, name: string, color: string){
  const team: Team = null;
  const powerUpsActive: PowerUpType[] = []
  const powerUpsTime: number[] = []
  const powerUp = function(type: PowerUpType){
    const value = Math.random();
    if(type == PowerUpType.HEAL){
      self.hp = self.maxHp;
      return;
    }
    const isActive = self.powerUpsActive.indexOf(type) != -1;
    if (isActive) {
      return;
    }
    if(type == PowerUpType.SPEED){
      const speedIncrease = value;
      self.speed *= (1 + speedIncrease);
      self.powerUpsActive.push(type);
      self.powerUpsTime.push(60 * 4);
    }
    else if(type == PowerUpType.SHIELD){
      self.hasShield = true;
      self.powerUpsActive.push(type);
      self.powerUpsTime.push(60 * 3);
    }
    else if(type == PowerUpType.INCREASED_FIRE_RATE){
      const reducedDelay = (value * 2) + 4;
      self.shootingDelay -= reducedDelay; // Range of values: (2, 4)
      self.powerUpsActive.push(type);
      self.powerUpsTime.push(60 * 3);
    }
    else if(type == PowerUpType.MULTI_GUN){
      self.hasMultigun = true;
      self.powerUpsActive.push(type);
      self.powerUpsTime.push(60 * 3);
    }
    else if(type == PowerUpType.CLUSTER_GUN){
      self.hasClusterGun = true;
      self.powerUpsActive.push(type);
      self.powerUpsTime.push(60 * 3);
    }
    else if(type == PowerUpType.BIG_BULLETS){
      self.bulletSize = 10;
      const increasedDamage = (value * 2) + 3;
      self.bulletDmg += increasedDamage; // Range of values: (7, 9)
      self.powerUpsActive.push(type);
      self.powerUpsTime.push(60 * 4);
    }
  }

  const updatePowerUps = function(){
    for(let i in self.powerUpsTime){
      self.powerUpsTime[i] -= 1;
      const powerUpIsActive = self.powerUpsTime[i] > 0;
      if (powerUpIsActive) {
        continue;
      }
      switch (self.powerUpsActive[i]) {
        case PowerUpType.SPEED:
          self.speed = INITIAL_SPEED;
          break;
        case PowerUpType.SHIELD:
          self.hasShield = false;
          break;
        case PowerUpType.INCREASED_FIRE_RATE:
          self.shootingDelay = INITIAL_SHOOTING_DELAY;
          break;
        case PowerUpType.MULTI_GUN:
          self.hasMultigun = false;
          break;
        case PowerUpType.CLUSTER_GUN:
          self.hasClusterGun = false;
          break;
        case PowerUpType.BIG_BULLETS:
          self.bulletSize = INITIAL_BULLET_SIZE;
          self.bulletDmg = INITIAL_BULLET_DMG;
          break;
      }
      const index = parseInt(i);

      self.powerUpsTime.splice(index, 1);
      self.powerUpsActive.splice(index, 1);
    }
  }

  const checkForCollision = function(
    entities: Entity[],
    x: number,
    y: number
  ) {
    for(const entity of entities) {
      if(!(entity.x >= self.x + self.width || entity.x + entity.width <= self.x || entity.y >= self.y + self.height || entity.y + entity.height <= self.y)){
        if(y < 0){
          self.y = entity.y + entity.height;
        }
        if(y > 0){
          self.y = entity.y - self.height;
        }
        if(x < 0){
          self.x = entity.x + entity.width;
        }
        if(x > 0){
          self.x = entity.x - self.width;
        }
      }
    }
  }

  const move = function(x: number, y: number, blocks: Entity[]){
    self.x += x;
    self.y += y;

    self.checkForCollision(blocks, x, y);
  }

  const updatePosition = function(blocks: Entity[]){
    if(self.isMovingUp)
      self.move(0, -self.speed, blocks);
    if(self.isMovingDown)
      self.move(0, self.speed, blocks);
    if(self.isMovingLeft)
      self.move(-self.speed, 0, blocks);
    if(self.isMovingRight)
      self.move(self.speed, 0, blocks);
  }

  const updateState = function(){
    self.alive = self.hp <= 0;
  }

  const updateShooting = function(){
    self.timeUntilNextShot -= 1;
    const canShoot = self.timeUntilNextShot <= 0;
    const isShooting = self.isShootingUp || self.isShootingDown || self.isShootingLeft || self.isShootingRight;
    if (canShoot && isShooting) {
      self.timeUntilNextShot = self.shootingDelay;
      return true;
    }
    return false;
  }

  let self = {
    x: 250,
    y: 250,
    width: 20,
    height: 20,
    alive: true,
    name: name,
    maxHp: 40,
    hp: 40,
    color,
    isMovingLeft: 0,
    isMovingRight: 0,
    isMovingUp: 0,
    isMovingDown: 0,
    isShootingLeft: 0,
    isShootingRight: 0,
    isShootingUp: 0,
    isShootingDown: 0,
    shootingDelay: INITIAL_SHOOTING_DELAY,
    timeUntilNextShot: 8,
    powerUpsActive,
    powerUpsTime,
    hasShield: false,
    hasMultigun: false,
    hasClusterGun: false,
    bulletSize: INITIAL_BULLET_SIZE,
    bulletDmg: INITIAL_BULLET_DMG,
    speed: INITIAL_SPEED,
    team,
    id,
    powerUp,
    updatePowerUps,
    checkForCollision,
    move,
    updateState,
    updateShooting,
  }

  return self;
}
