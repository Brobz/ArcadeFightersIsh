exports.Bullet = function(dir, pos, team, color){
  var self = {
    x : pos[0],
    y : pos[1],
    color : color,
    dir : dir,
    speed : 5,
    team : team
  }

  self.updatePosition = function(){

    if(self.dir == 0)
      self.y -= self.speed;
    if(self.dir == 1)
      self.y += self.speed;
    if(self.dir == 2)
      self.x -= self.speed;
    if(self.dir == 3)
      self.x += self.speed;

  }

  return self;
}
