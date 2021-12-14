const POWERUP_TYPES = {
  HEAL: 0,
  SPEED: 1,
  SHIELD: 2,
  INCREASED_FIRE_RATE: 3,
  MULTI_GUN: 4,
  CLUSTER_GUN: 5,
  BIG_BULLETS: 6,
}

const INITIAL_SPEED = 2;
const INITIAL_SHOOTING_DELAY = 8;
const INITIAL_BULLET_SIZE = 5;
const INITIAL_BULLET_DMG = 5;

exports.Player = function(id, name, color){
  var self = {
    x : 250,
    y : 250,
    width : 20,
    height : 20,
    alive : true,
    name : name,
    maxHp : 40,
    hp : 40,
    color : color,
    isMovingLeft : 0,
    isMovingRight : 0,
    isMovingUp : 0,
    isMovingDown : 0,
    isShootingLeft : 0,
    isShootingRight : 0,
    isShootingUp : 0,
    isShootingDown : 0,
    shootingDelay : INITIAL_SHOOTING_DELAY,
    timeUntilNextShot : 8,
    powerUpsActive : [],
    powerUpsTime : [],
    hasShield : false,
    hasMultigun : false,
    hasClusterGun : false,
    bulletSize : INITIAL_BULLET_SIZE,
    bulletDmg : INITIAL_BULLET_DMG,
    speed : INITIAL_SPEED,
    team : null,
    id : id

  }

  self.powerUp = function(type){
    const value = Math.random();
    if(type == POWERUP_TYPES.HEAL){
      self.hp = self.maxHp;
      return;
    }
    const isActive = self.powerUpsActive.indexOf(type) != -1;
    if (isActive) {
      return;
    }
    if(type == POWERUP_TYPES.SPEED){
      const speedIncrease = value;
      self.speed *= (1 + speedIncrease);
      self.powerUpsActive.push(type);
      self.powerUpsTime.push(60 * 4);
    }
    else if(type == POWERUP_TYPES.SHIELD){
      self.hasShield = true;
      self.powerUpsActive.push(type);
      self.powerUpsTime.push(60 * 3);
    }
    else if(type == POWERUP_TYPES.INCREASED_FIRE_RATE){
      const reducedDelay = (value * 2) + 4;
      self.shootingDelay -= reducedDelay; // Range of values: (2, 4)
      self.powerUpsActive.push(type);
      self.powerUpsTime.push(60 * 3);
    }
    else if(type == POWERUP_TYPES.MULTI_GUN){
      self.hasMultigun = true;
      self.powerUpsActive.push(type);
      self.powerUpsTime.push(60 * 3);
    }
    else if(type == POWERUP_TYPES.CLUSTER_GUN){
      self.hasClusterGun = true;
      self.powerUpsActive.push(type);
      self.powerUpsTime.push(60 * 3);
    }
    else if(type == POWERUP_TYPES.BIG_BULLETS){
      self.bulletSize = 10;
      const increasedDamage = (value * 2) + 3;
      self.bulletDmg += increasedDamage; // Range of values: (7, 9)
      self.powerUpsActive.push(type);
      self.powerUpsTime.push(60 * 4);
    }
  }

  self.updatePowerUps = function(){
    for(let i in self.powerUpsTime){
      self.powerUpsTime[i] -= 1;
      const powerUpIsActive = self.powerUpsTime[i] > 0;
      if (powerUpIsActive) {
        continue;
      }
      if(self.powerUpsActive[i] == 1){
        self.speed = INITIAL_SPEED;
      }
      else if(self.powerUpsActive[i] == 2){
        self.hasShield = false;
      }
      else if(self.powerUpsActive[i] == 3){
        self.shootingDelay = INITIAL_SHOOTING_DELAY;
      }
      else if(self.powerUpsActive[i] == 4){
        self.hasMultigun = false;
      }
      else if(self.powerUpsActive[i] == 5){
        self.hasClusterGun = false;
      }
      else if(self.powerUpsActive[i] == 6){
        self.bulletSize = INITIAL_BULLET_SIZE;
        self.bulletDmg = INITIAL_BULLET_DMG;
      }

      self.powerUpsTime.splice(i, 1);
      self.powerUpsActive.splice(i, 1);
      }
  }

  self.checkForCollision = function(entities, x, y){
    for(var i in entities){
      if(!(entities[i].x >= self.x + self.width ||  entities[i].x + entities[i].width <= self.x || entities[i].y >= self.y + self.height || entities[i].y + entities[i].height <= self.y)){
        if(y < 0){
          self.y = entities[i].y + entities[i].height;
        }
        if(y > 0){
          self.y = entities[i].y - self.height;
        }
        if(x < 0){
          self.x = entities[i].x + entities[i].width;
        }
        if(x > 0){
          self.x = entities[i].x - self.width;
        }
      }
    }
  }

  self.move = function(x, y, blocks){
    self.x += x;
    self.y += y;

    self.checkForCollision(blocks, x, y);
  }

  self.updatePosition = function(blocks){
    if(self.isMovingUp)
      self.move(0, -self.speed, blocks);
    if(self.isMovingDown)
      self.move(0, self.speed, blocks);
    if(self.isMovingLeft)
      self.move(-self.speed, 0, blocks);
    if(self.isMovingRight)
      self.move(self.speed, 0, blocks);
  }

  self.updateState = function(){
    self.alive = self.hp <= 0;
  }

  self.updateShooting = function(){
    self.timeUntilNextShot -= 1;
    const canShoot = self.timeUntilNextShot <= 0;
    const isShooting = self.isShootingUp || self.isShootingDown || self.isShootingLeft || self.isShootingRight;
    if (canShoot && isShooting) {
      self.timeUntilNextShot = self.shootingDelay;
      return true;
    }
    return false;
  }

  return self;
}
