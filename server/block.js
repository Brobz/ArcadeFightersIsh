exports.Block = function(pos, size, color){
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
  }
  
  return self;
}
