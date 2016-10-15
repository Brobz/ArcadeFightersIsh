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

var Player = function(id){
  var self = {
    x : 250,
    y : 250,
    isMovingLeft : 0,
    isMovingRight : 0,
    isMovingUp : 0,
    isMovingDown : 0,
    speed : 3,
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

    socket.emit("connected", {
      msg: "Connected to Server.",
    });

    socket.on("setName", function(data){p.name = data.name;});

    socket.on("keyPress", function(data){getKeyInput(socket.id, data);});

    socket.on("disconnect", function(){Disconnected(socket.id)});

});

function Disconnected(id) {
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

function Update(){

  var infoPack = [];
  for(var i in PLAYER_LIST){
    var p = PLAYER_LIST[i];
    p.updatePosition();
    infoPack.push(
      {
        name : p.name,
        x : p.x,
        y : p.y

      });
  }

  for(var i in SOCKET_LIST){
    var s = SOCKET_LIST[i];
    s.emit("update", infoPack);
  }


}

setInterval(Update, 1000/45);
