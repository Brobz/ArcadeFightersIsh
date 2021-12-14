exports.Bullet = function(
  dir: number,
  damage: number,
  pos: Position,
  size: Dimensions,
  team: Team,
  color: string,
  cluster: boolean,
  child: boolean
){
  const normalize = function(){
    self.speed *= 1 / Math.sqrt(2);
    self.hasNormalized = true;
  }

  const shrink = function(){
    self.width *= 0.5;
    self.height *= 0.5;
    self.hasShrinked = true;
  }

  const updatePosition = function(){
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

  const isAlive = function(){
    return self.hp > 0;
  }

  const checkForCollision = function(entity: Entity | null){
    if(!entity)
      return;
    if(!(entity.x >= self.x + self.width ||  entity.x + entity.width <= self.x || entity.y >= self.y + self.height || entity.y + entity.height <= self.y)
        && entity.team != self.team){
      return entity;
    }
    return null;
  }

  let self = {
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
    team,
    trailCounter : 0,
    trailMax : 5,
    lastX : pos[0],
    lastY : pos[1],
    normalize,
    shrink,
    updatePosition,
    isAlive,
    checkForCollision
  }


  return self;
}
