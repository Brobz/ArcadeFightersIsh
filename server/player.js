exports.Player = function(id, color){
  var self = {
    x : 250,
    y : 250,
    width : 20,
    height : 20,
    alive : true,
    maxHp : 25,
    hp : 25,
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
    speed : 2,
    team : null,
    id : id

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
