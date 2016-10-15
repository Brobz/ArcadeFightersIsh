exports.Player = function(id){
  var self = {
    x : 250,
    y : 250,
    isMovingLeft : 0,
    isMovingRight : 0,
    isMovingUp : 0,
    isMovingDown : 0,
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

  return self;
}
