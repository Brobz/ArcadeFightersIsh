exports.Room = function(mnS, mxS, wcS, tb, pPos, colors){
  var self = {
    players : [],
    bullets : [],
    blocks : [],
    powerups : [],
    maxSize : mxS,
    minSize : mnS,
    winConditionSize : wcS,
    teamBased : tb,
    colors : colors,
    player_positions : pPos,
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

      self.players[i].color = self.colors[i];
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
    }else{
      if(!self.teamBased){
        var playersAlive = 0;
        for(var i in self.players){
          if (self.players[i].alive)
            playersAlive += 1;
        }
        if(playersAlive <= 1){
          return true;
        }
        return false;
      }else{
        var team1Alive = team2Alive = 0;
        for(var i in self.players){
          if (self.players[i].alive)
            if(self.players[i].team == 1){
              team1Alive += 1;
            }else if (self.players[i].team == 2){
              team2Alive += 1;
            }
        }

        if(team2Alive == 0 || team1Alive == 0){
          return true;
        }
        return false

      }
    }
    return false;
  }

  return self;

}
