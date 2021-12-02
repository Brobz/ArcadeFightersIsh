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
    inGame : false,
    info : "NO ROOM INFO",
    winner : undefined
  }

  self.updateInfo = function(){
    self.info = "Players: " + self.players.length + " / " + self.maxSize
    if (self.players.length >= self.minSize)
      self.info += "<br> Game ready to start!";
    else
      self.info += "<br> (" + (self.minSize - self.players.length) + " more needed for game start)";
    if (String(self.teamBased).toLowerCase() == "true")
      self.info += "<br> Mode: TDM";
    else
      self.info += "<br> Mode: FFA";
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
      if(String(self.teamBased).toLowerCase() == "false"){
        self.players[i].team = parseInt(i) + 1;
      }else{
        if(i < self.maxSize / 2){
          self.players[i].team = 1;
        }else self.players[i].team = 2
      }

      self.players[i].color = self.colors[i];
    }
    self.updateInfo();
  }

  self.checkForWin = function(){
    if(self.players.length <= self.winConditionSize){
      if(self.winConditionSize == 1){
        for(var player in self.players){
          self.winner = self.players[player].name;
        }
        return true;
      }else{
        var team = self.players[0].team;
        for(var i in self.players){
          var cTeam = self.players[i].team;
          if(cTeam != team)
            return false
        }
        self.winner = "Team " + team;
        return true;
      }
    }else{
      if(String(self.teamBased).toLowerCase() == "fa.se"){
        var playerName = "";
        var playersAlive = 0;
        for(var i in self.players){
          if (self.players[i].alive){
            playersAlive += 1;
            playerName = self.players[i].name;
          }
        }
        if(playersAlive <= 1){
          self.winner = playerName;
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

        if(team2Alive == 0){
          self.winner = "Team 1";
          return true;
        }else if(team1Alive == 0){
          self.winner = "Team 2";
          return true;
        }
        return false

      }
    }
    return false;
  }

  return self;

}
