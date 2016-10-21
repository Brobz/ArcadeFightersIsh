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
    shootingDelay : 8,
    timeUntilNextShot : 8,
    powerUpsActive : [],
    powerUpsTime : [],
    hasShield : false,
    hasMultigun : false,
    hasClusterGun : false,
    bulletSize : 7,
    bulletDmg : 5,
    speed : 2,
    team : null,
    id : id

  }

  self.powerUp = function(type, value){
    if(type == 0){
      self.hp = self.maxHp;
    }
    else if(type == 1){
      if(self.powerUpsActive.indexOf(type) == -1){
        self.speed *= 1.5;
        self.powerUpsActive.push(type);
        self.powerUpsTime.push(60 * 4);
      }
    }
    else if(type == 2){
      if(self.powerUpsActive.indexOf(type) == -1){
        self.hasShield = true;
        self.powerUpsActive.push(type);
        self.powerUpsTime.push(60 * 3);
      }
    }
    else if(type == 3){
      if(self.powerUpsActive.indexOf(type) == -1){
        self.shootingDelay = 3;
        self.powerUpsActive.push(type);
        self.powerUpsTime.push(60 * 3);
      }
    }

    else if(type == 4){
      if(self.powerUpsActive.indexOf(type) == -1){
        self.hasMultigun = true;
        self.powerUpsActive.push(type);
        self.powerUpsTime.push(60 * 3);
      }
    }

    else if(type == 5){
      if(self.powerUpsActive.indexOf(type) == -1){
        self.hasClusterGun = true;
        self.powerUpsActive.push(type);
        self.powerUpsTime.push(60 * 3);
      }
    }

    else if(type == 6){
      if(self.powerUpsActive.indexOf(type) == -1){
        self.bulletSize = 10;
        self.bulletDmg = 8;
        self.powerUpsActive.push(type);
        self.powerUpsTime.push(60 * 4);
      }
    }
  }

  self.updatePowerUps = function(){
    for(i in self.powerUpsTime){
      self.powerUpsTime[i] -= 1;
      if(self.powerUpsTime[i] <= 0){
        if(self.powerUpsActive[i] == 1){
          self.speed = self.speed / 1.5;
        }
        else if(self.powerUpsActive[i] == 2){
          self.hasShield = false;
        }
        else if(self.powerUpsActive[i] == 3){
          self.shootingDelay = 8;
        }
        else if(self.powerUpsActive[i] == 4){
          self.hasMultigun = false;
        }
        else if(self.powerUpsActive[i] == 5){
          self.hasClusterGun = false;
        }
        else if(self.powerUpsActive[i] == 6){
          self.bulletSize = 7;
          self.bulletDmg = 5;
        }

        self.powerUpsTime.splice(i, 1);
        self.powerUpsActive.splice(i, 1);
      }
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
    if(self.hp <= 0){
      self.alive = false;
    }
  }

  self.updateShooting = function(){
    self.timeUntilNextShot -= 1;
    if (self.timeUntilNextShot <= 0 && (self.isShootingUp || self.isShootingDown || self.isShootingLeft || self.isShootingRight)) {
      self.timeUntilNextShot = self.shootingDelay;
      return true;
    }
    return false;
  }

  return self;
}
