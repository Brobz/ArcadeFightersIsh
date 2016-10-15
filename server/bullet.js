exports.Bullet = function(dir, pos, size, team, color){
  var self = {
    x : pos[0],
    y : pos[1],
    width : size[0],
    height : size[1],
    hp : 1,
    dmg : 5,
    color : color,
    dir : dir,
    speed : 6,
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

  self.isAlive = function(){
    if(self.hp > 0){
      return true;
    }
    return false;
  }

  self.checkForCollision = function(entity){
    if(entity == self) return null;

    if(!(entity.x > self.x + self.width ||  entity.x + entity.width < self.x || entity.y > self.y + self.height || entity.y + entity.height < self.y)){
      return entity;
    }

    return null;
  }

  return self;
}
