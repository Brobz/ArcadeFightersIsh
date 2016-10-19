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
    speed : 5,
    team : team
  }

  self.updatePosition = function(){

    if(self.dir == 0 || self.dir == 4 || self.dir == 6)
      self.y -= self.speed;
    if(self.dir == 1 || self.dir == 5 || self.dir = 7)
      self.y += self.speed;
    if(self.dir == 2 || self.dir == 4 || self.dir == 7)
      self.x -= self.speed;
    if(self.dir == 3 || self.dir == 5 || self.dir == 6)
      self.x += self.speed;

  }

  self.isAlive = function(){
    if(self.hp > 0){
      return true;
    }
    return false;
  }

  self.checkForCollision = function(entity){
    if(entity)

    if(!(entity.x > self.x + self.width ||  entity.x + entity.width < self.x || entity.y > self.y + self.height || entity.y + entity.height < self.y)){
      return entity;
    }

    return null;
  }

  return self;
}
