exports.Room = function(mnS, mxS, wcS, tb){
  var self = {
    players : [],
    maxSize : mxS,
    minSize : mnS,
    winConditionSize : wcS,
    teamBased : tb,
    inGame : false
  }

  self.removePlayer = function(player){
    index = self.players.indexOf(player);
    self.players.splice(index, 1);
  }

  self.addPlayer = function(player){
    if(!self.teamBased){
      player.team = self.players.length;
    }else{
      if(self.players.length < self.maxSize / 2){
        player.team = 0;
      }else player.team = 1
    }
    self.players.push(player);

  }

  self.checkForWin = function(){
    if(self.players.length <= self.winConditionSize){
      if(self.winConditionSize == 1){
        return true;
      }else{
        var team = self.players[0].team;
        for(var i in self.players){
          var cTeam = self.players[i].team;
          if(cTeam != team)
            return false
        }

        return true;
      }
    }
    return false;
  }

  return self;

}
