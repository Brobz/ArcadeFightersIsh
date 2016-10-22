exports.Bullet = function(dir, damage, pos, size, team, color, cluster, child){
  var self = {
    x : pos[0],
    y : pos[1],
    width : size[0],
    height : size[1],
    hp : 1,
    dmg : damage,
    color : color,
    dir : dir,
    speed : 5,
    hasNormalized : false,
    hasShrinked : false,
    isCluster : cluster,
    isChild : child,
    team : team,
    trailCounter : 0,
    trailMax : 5,
    lastX : pos[0],
    lastY : pos[1]
  }

  self.normalize = function(){
    self.speed *= 1 / Math.sqrt(2);
    self.hasNormalized = true;
  }

  self.shrink = function(){
    self.width *= 0.5;
    self.height *= 0.5;
    self.hasShrinked = true;
  }

  self.updatePosition = function(){
    if(self.dir == 0 || self.dir == 4 || self.dir == 6){
      self.y -= self.speed;
      if(self.trailCounter >= self.trailMax){
        self.lastY -= self.speed;
      }
    }
    if(self.dir == 1 || self.dir == 5 || self.dir == 7){
      self.y += self.speed;
      if(self.trailCounter >= self.trailMax){
        self.lastY += self.speed;
      }
    }
    if(self.dir == 2 || self.dir == 4 || self.dir == 7){
      self.x -= self.speed;
      if(self.trailCounter >= self.trailMax){
        self.lastX -= self.speed;
      }
    }
    if(self.dir == 3 || self.dir == 5 || self.dir == 6){
      self.x += self.speed;
      if(self.trailCounter >= self.trailMax){
        self.lastX += self.speed;
      }
    }


    if(self.dir > 3 && !self.hasNormalized)
      self.normalize();

    if(self.trailCounter < self.trailMax)
      self.trailCounter += 1;


  }
  self.isAlive = function(){
    if(self.hp > 0){
      return true;
    }
    return false;
  }

  self.checkForCollision = function(entity){
    if(!entity)
      return;

    if(!(entity.x >= self.x + self.width ||  entity.x + entity.width <= self.x || entity.y >= self.y + self.height || entity.y + entity.height <= self.y)
        && entity.team != self.team){

      /*
      if(dir == 0){
        self.y = entity.y + entity.height;
      }

      if(dir == 1){
        self.y = entity.y - self.height;
      }

      if(dir == 2){
        self.x = entity.x + entity.width;
      }

      if(dir == 3){
        self.x = entity.x - self.width;
      }
      */

      return entity;
    }
    /*

    */
    return null;
  }

  return self;
}
