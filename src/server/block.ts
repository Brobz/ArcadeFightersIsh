exports.Block = function(pos: Position, size: Dimensions, color: string){
  const team: Team = null;
  var self = {
    x : pos[0],
    y : pos[1],
    width : size[0],
    height : size[1],
    alive : true,
    maxHp : 25,
    hp : 25,
    color : color,
    team,
  }

  return self;
}
