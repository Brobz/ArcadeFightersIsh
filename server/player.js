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
    shootingDelay : 10,
    timeUntilNextShot : 10,
    speed : 3,
    team : null,
    id : id

  }

  self.updatePosition = function(){
    if(self.isMovingUp)
      self.y -= self.speed;
    if(self.isMovingDown)
      self.y += self.speed;
    if(self.isMovingLeft)
      self.x -= self.speed;
    if(self.isMovingRight)
      self.x += self.speed;

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
