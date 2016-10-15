exports.Player = function(id, color){
  var self = {
    x : 250,
    y : 250,
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
    alive : true,
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

  self.updateShooting = function(){
    self.timeUntilNextShot -= 1;
    if (self.timeUntilNextShot <= 0) {
      self.timeUntilNextShot = self.shootingDelay;
      return true;
    }
    return false;
  }

  return self;
}
