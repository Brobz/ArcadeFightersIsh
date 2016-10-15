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
    self.updateTeams();
  }

  self.addPlayer = function(player){
    self.players.push(player);
    self.updateTeams();
  }

  self.updateTeams = function(){
    for(var i in self.players){
      if(!self.teamBased){
        self.players[i].team = parseInt(i) + 1;
      }else{
        if(i < self.maxSize / 2){
          self.players[i].team = 1;
        }else self.players[i].team = 2
      }
    }
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
