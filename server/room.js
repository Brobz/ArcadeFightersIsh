exports.Room = function(mnS, mxS, wcS, tb, pPos){
  var self = {
    players : [],
    bullets : [],
    blocks : [],
    powerups : [],
    maxSize : mxS,
    minSize : mnS,
    winConditionSize : wcS,
    teamBased : tb,
    player_positions : pPos,
    inGame : false,
    info : "NO ROOM INFO",
    winner : undefined
  }

  self.reset = function(){
    self.bullets = [];
    self.blocks = [];
    self.powerups = [];
    self.winner = undefined;
    for(var i in self.players){
      self.players[i].x = self.player_positions[i][0];
      self.players[i].y = self.player_positions[i][1];
      self.players[i].hp = self.players[i].maxHp;
      self.players[i].alive = true;
      self.players[i].powerUpsTime = [];
      self.players[i].powerUpsActive = [];
      self.players[i].shootingDelay = 8;
      self.players[i].speed = 2;
      self.players[i].hasClusterGun = false;
      self.players[i].bulletSize = 7;
      self.players[i].bulletDmg = 5;
      self.players[i].hasShield = false;
      self.players[i].hasMultigun = false;
    }
  }

  self.updateInfo = function(){
    if (String(self.teamBased).toLowerCase() == "true")
      self.info = "Mode: TDM";
    else
      self.info = "Mode: FFA";

    self.info += "<br> Players: " + self.players.length + " / " + self.maxSize;

    if (self.players.length >= self.minSize)
      self.info += '<br> <span class="text-success"> Game ready to start!</span>';
    else
      self.info += '<br><span class="text-danger">(' + (self.minSize - self.players.length) + ' more player needed for game start)</span>';
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
        self.minSize = 2;
      }else{
        self.minSize = self.maxSize / 2 + 1;
        if(i < self.maxSize / 2){
          self.players[i].team = 1;
        }else self.players[i].team = 2
      }
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
      if(String(self.teamBased).toLowerCase() == "false"){
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
