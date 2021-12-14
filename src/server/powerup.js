exports.Powerup = function(pos, size, color, type){
  var self = {
    x : pos[0],
    y : pos[1],
    width : size[0],
    height : size[1],
    alive : true,
    maxHp : 25,
    hp : 25,
    color : color,
    team : null,
    type : type,
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
