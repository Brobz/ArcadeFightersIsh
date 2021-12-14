exports.Powerup = function(
  pos: Position,
  size: Dimensions,
  color: string,
  type: PowerUpType
) {
  const team: Team = null;

  const checkForCollision = function(entity: Entity){
    if(entity == self) return null;
    if(!(entity.x > self.x + self.width ||  entity.x + entity.width < self.x || entity.y > self.y + self.height || entity.y + entity.height < self.y)){
      return entity;
    }
    return null;
  }

  let self = {
    x: pos[0],
    y: pos[1],
    width: size[0],
    height: size[1],
    alive: true,
    maxHp: 25,
    hp: 25,
    color,
    team,
    type,
    checkForCollision
  }

  return self;
}
