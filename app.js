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

class Player{
  constructor(id){
    this.x = 250;
    this.y = 250;
    this.isMovingLeft = 0;
    this.isMovingRight = 0;
    this.isMovingUp = 0;
    this.isMovingDown = 0;
    this.speed = 3;
    this.id = id;

  }
  
  updatePosition(){

    if(this.isMovingUp)
      this.y -= this.speed;
    if(this.isMovingDown)
      this.y += this.speed;
    if(this.isMovingLeft)
      this.x -= this.speed;
    if(this.isMovingRight)
      this.x += this.speed;

  }
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
