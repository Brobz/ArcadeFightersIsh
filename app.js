console.log("Starting Server...");

var express = require("express");
var app = express();
var server = require("http").Server(app);

app.get("/", function(req, res){
    res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));

server.listen(process.env.PORT || 2000);

console.log("Server Ready!");

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var Room = function(mnS, mxS, wcS, tb){
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
        player.team = 1;
      }else player.team = 0
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

var ROOM_LIST = [Room(2, 4, 1, false), Room(4, 4, 2, true), Room(6, 6, 3, true)];

var Player = function(id){
  var self = {
    x : 250,
    y : 250,
    isMovingLeft : 0,
    isMovingRight : 0,
    isMovingUp : 0,
    isMovingDown : 0,
    speed : 3,
    alive : true,
    team : null,
    id : id

  }

  self.updatePosition = function(){

    if(self.isMovingUp)
      self.y -= self.speed;
    if(self.isMovingDown)
      self.y += self.speed;
    if(self.isMovingLeft)
      self.x -= self.speed;
    if(self.isMovingRight)
      self.x += self.speed;

  }

  return self;
}

var io = require("socket.io")(server, {});
io.sockets.on("connection", function(socket){

    socket.id = Math.random();
    var p = Player(socket.id);
    PLAYER_LIST[socket.id] = p;

    SOCKET_LIST[socket.id] = socket;

    socket.emit("roomUpdate", {
      rooms : ROOM_LIST,
    });

    socket.emit("connected", {
      msg: "Connected to Server",
      id: socket.id
    });

    socket.on("setName", function(data){p.name = data.name;});

    socket.on("joinRoom", function(data){
      if(ROOM_LIST[data.room].players.length >= ROOM_LIST[data.room].maxSize || ROOM_LIST[data.room].inGame)
        return;

      for(var i in ROOM_LIST){

        if(ROOM_LIST[i].players.indexOf(p) >= 0){
          ROOM_LIST[i].removePlayer(p);
        }

      }
      ROOM_LIST[data.room].addPlayer(p);

      for(var i in SOCKET_LIST){
        var s = SOCKET_LIST[i];
        s.emit("roomUpdate", {
          rooms : ROOM_LIST,
        });
      }


    });

    socket.on("leaveRoom", function(data){
      for(var i in ROOM_LIST){
        if(ROOM_LIST[i].players.indexOf(p) >= 0){
          ROOM_LIST[i].removePlayer(p);
        }
      }
      for(var i in SOCKET_LIST){
        var s = SOCKET_LIST[i];
        s.emit("roomUpdate", {
          rooms : ROOM_LIST,
        });
      }
    });

    socket.on("callForGameStart", function(data){
      if(ROOM_LIST[data.room].players.length < ROOM_LIST[data.room].minSize)
        return;


      ROOM_LIST[data.room].inGame = true;
      for(var i in ROOM_LIST[data.room].players){
        var s = SOCKET_LIST[ROOM_LIST[data.room].players[i].id];
        s.emit("startGame", {room: data.room});
      }
      for(var i in SOCKET_LIST){
        var s = SOCKET_LIST[i];
        s.emit("roomUpdate", {
          rooms : ROOM_LIST,
        });
      }
    });

    socket.on("keyPress", function(data){getKeyInput(socket.id, data);});

    socket.on("disconnect", function(){Disconnected(socket.id)});

});

function Disconnected(id) {
  for(var i in ROOM_LIST){
    if(ROOM_LIST[i].players.indexOf(PLAYER_LIST[id]) >= 0){
      ROOM_LIST[i].removePlayer(PLAYER_LIST[id]);
    }
  }
  delete SOCKET_LIST[id];
  delete PLAYER_LIST[id];

}

function getKeyInput(id, data){
  if(data.input == "d"){
    PLAYER_LIST[id].isMovingRight = data.state;
  }
  if(data.input == "s"){
    PLAYER_LIST[id].isMovingDown = data.state;
  }
  if(data.input == "a"){
    PLAYER_LIST[id].isMovingLeft = data.state;
  }
  if(data.input == "w"){
    PLAYER_LIST[id].isMovingUp = data.state;
  }

}

function checkForGameEnd(){
  for(var i in ROOM_LIST){
    if(!ROOM_LIST[i].inGame) continue;
    if(ROOM_LIST[i].checkForWin()){
      ROOM_LIST[i].inGame = false;
      for(var k in ROOM_LIST[i].players){
          s = SOCKET_LIST[ROOM_LIST[i].players[k].id];
          s.emit("endGame", {room: i});
          s.emit("roomUpdate", {
            rooms : ROOM_LIST,
          });
      }
    }
  }
}

function Update(){
  checkForGameEnd();
  var infoPack = [];
  for(var i in ROOM_LIST){
    if(ROOM_LIST[i].inGame){
      for(var k in ROOM_LIST[i].players){
        p = ROOM_LIST[i].players[k];
        p.updatePosition();
        infoPack.push(
          {
            name : p.name,
            x : p.x,
            y : p.y,
            room : i

          });
      }
    }
  }

  for(var i in ROOM_LIST){
    if(ROOM_LIST[i].inGame){
      for(var k in ROOM_LIST[i].players){
        var s = SOCKET_LIST[ROOM_LIST[i].players[k].id];
        s.emit("update", infoPack);
      }
    }
  }


}

setInterval(Update, 1000/45);
