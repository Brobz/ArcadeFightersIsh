import Player from './server/player';
import Block from './server/block';
import Bullet from './server/bullet';
import PowerUp from './server/powerup';
import Room from './server/room';

const { MongoClient } = require('mongodb');

const db_uri = process.env.DATABASE_URI;

console.log(">> Connecting to MongoDB...");

var db;
MongoClient.connect(db_uri, {}, (err, client) => {
  if (err) {
    throw error
  }
  db = client.db("AFI_DB");
  console.log(">> Successfully Connected to MongoDB!");
});

console.log(">> Starting Server...");

// Bycript settings
const bcrypt = require('bcrypt');
const saltRounds = 10;

var express = require("express");
var app = express();
var server = require("http").Server(app);

app.get("/", function(req, res){
    res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));

server.listen(process.env.PORT || 5000);

console.log(">> Server Ready!");

var ROOM_COUNT = 0;
var POWERUP_DELAY = 60 * 7;
var TIME_UNTIL_NEXT_POWERUP = POWERUP_DELAY;
var SOCKET_LIST = {};
var PLAYER_LIST = {};
var ROOM_LIST = {};

const DEFAULT_COLOR = "#c61a93";
const TEAM_COLORS = [undefined, "#0096FF", "#ff6961"];
const POWERUP_COLORS = ["Green", "Red", "DarkSlateGrey", "GoldenRod", "CornflowerBlue", "DeepPink", "DarkMagenta"];

function getDefaultRoom(roomName, roomCode){
  return new Room(roomName, roomCode, 2, 4, 1, false, [[20,20], [360,360], [20, 360], [360, 20], [20, 180], [360, 180], [180, 20], [180, 360]]);
}

MAP = function(){
  var blocks = []
  for(var x = 0; x < 20; x++){
    for(var y = 0; y < 20; y++){
      if(!x || !y || x == 19 || y == 19){
        blocks.push(new Block([x * 20, y * 20], [20, 20], "#100074"));
      }
    }
  }

  for(var i = 0; i < 10; i++){
    var x = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    var y = Math.floor(Math.random() * (300 - 100 + 1)) + 100;

    blocks.push(new Block([x, y], [20, 20], "#100074"));
  }

  return blocks;
}

var io = require("socket.io")(server, {});
var p;

io.sockets.on("connection", function(socket){

    socket.on("signUpInfo", function(data){
      var res = db.collection("accounts").find({username:data.username});
      process_signup(data, res, socket);
    });
    socket.on("logInInfo", function(data){
      var res = db.collection("accounts").find({username:data.username});
      process_login_res(data, res, socket);
    });

    socket.on("setName", function(data){p.name = data.name;});

    socket.on("joinRoom", function(data){
      if (data.room == ""){
        socket.emit("roomErrorEmptyNameJoin", {});
        return;
      }
      let roomExists = data.room in ROOM_LIST;

      if (!roomExists){
        for(var i in ROOM_LIST){
          if(ROOM_LIST[i].roomCode == data.room){
            // JOINING BY ROOM CODE
            roomExists = true;
            data.room = ROOM_LIST[i].roomName;
            break;
          }
        }
        if(!roomExists){
          socket.emit("roomError404", {room: data.room});
          return;
        }
      }

      if (ROOM_LIST[data.room].inGame){
        socket.emit("roomErrorInGame", {room: data.room});
        return;
      }

      let currentPlayer = PLAYER_LIST[data.player_id];

      if(ROOM_LIST[data.room].players.length >= ROOM_LIST[data.room].maxSize){
        socket.emit("roomErrorFull", {room: data.room});
        return;
      }

      ROOM_LIST[data.room].addPlayer(currentPlayer);
      emitRoomUpdateSignal();
    });

    socket.on("createRoom", function(data){
        if (data.room == ""){
          socket.emit("roomErrorEmptyNameCreate", {});
          return;
        }
        let roomExists = data.room in ROOM_LIST;
        if(roomExists){
          socket.emit("roomErrorAlreadyExists", {room: data.room});
          return;
        }
        let currentPlayer = PLAYER_LIST[data.player_id];
        ROOM_LIST[data.room] = getDefaultRoom(data.room, "#" + ROOM_COUNT);
        ROOM_LIST[data.room].addPlayer(currentPlayer);
        ROOM_COUNT++;
        emitRoomUpdateSignal();
      });

    socket.on("leaveRoom", function(data){
      let roomExists = data.room in ROOM_LIST;
      if (!roomExists){
        return;
      }
      ROOM_LIST[data.room].removePlayer(PLAYER_LIST[data.player_id]);
      if (ROOM_LIST[data.room].players.length <= 0){
        delete ROOM_LIST[data.room];
      }
      emitRoomUpdateSignal();
    });

    socket.on("callForGameStart", function(data){
      if(ROOM_LIST[data.room].players.length < ROOM_LIST[data.room].minSize)
        return;

      ROOM_LIST[data.room].reset();
      buildMap(MAP, data.room);

      ROOM_LIST[data.room].inGame = true;
      for(var i in ROOM_LIST[data.room].players){
        var s = SOCKET_LIST[ROOM_LIST[data.room].players[i].id];
        s.emit("startGame", {room: data.room});
      }
      emitRoomUpdateSignal();
    });


    socket.on("changeRoomSettings", function(data){changeRoomSettings(data);});

    socket.on("changePlayerAttribute", function(data){changePlayerAttribute(data);});

    socket.on("keyPress", function(data){getKeyInput(socket.id, data);});

    socket.on("disconnect", function(){Disconnected(socket.id)});

});

async function process_login_res(data, res, socket){
  var results = await res.toArray();
  if (results.length <= 0){
    socket.emit("connectionFailed", {msg:"Invalid Username/Password"});
    return;
  }
  var passwordHash = results[0].password;
  bcrypt.compare(data.password, passwordHash, function(err, res) {
    // if res == true, password matched
    // else wrong password
    if(!res){
      socket.emit("connectionFailed", {msg:"Invalid Username/Password"});
      return;
    }
    process_login(data, results, socket);
  });
}

async function process_signup(data, res, socket){
  var results = await res.toArray();
  if(results.length > 0){
    socket.emit("signUpFailed", {msg: "Sign Up failed: Username already taken!"});
    return;
  }else{
    var res = db.collection("accounts").find({ign:data.ign});
    process_signup_helper(data, res, socket);
  }
}

async function process_signup_helper(data, res, socket){
  var results = await res.toArray();
  if(results.length > 0){
    socket.emit("signUpFailed", {msg: "Sign Up failed: in-game-name already taken!"});
    return;
  }else{
    bcrypt.hash(data.password, saltRounds, (err, hash) => {
      // Now we can store the password hash in db.
      db.collection("accounts").insertOne({username: data.username, password: hash, ign: data.ign, color: DEFAULT_COLOR});
    });
    socket.emit("signUpSuccessfull", {msg: "Account Created Successfully!"});
    return;
  }
}

async function process_login(data, results, socket){
  if(data.username in SOCKET_LIST){
    socket.emit("connectionFailed", {msg:"This account is currently logged in elsewhere!"});
    return;
  }

  socket.id = data.username;
  SOCKET_LIST[socket.id] = socket;

  p = new Player(socket.id, results[0].ign, results[0].color);
  PLAYER_LIST[socket.id] = p;

  socket.emit("connected", {
    msg: p.name,
    color: p.color,
    id: socket.id
  });

  socket.emit("roomUpdate", {
    rooms : ROOM_LIST,
  });
}

function Disconnected(id) {
  for(var i in ROOM_LIST){
    if(ROOM_LIST[i].players.indexOf(PLAYER_LIST[id]) >= 0){
      ROOM_LIST[i].removePlayer(PLAYER_LIST[id]);
    }
  }
  emitRoomUpdateSignal();
  delete SOCKET_LIST[id];
  delete PLAYER_LIST[id];

}

function getKeyInput(id, data){
  let playerExists = id in PLAYER_LIST;
  if(!playerExists) return;

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

  if(data.input == "shoot0"){
    PLAYER_LIST[id].isShootingLeft = data.state;

    if(data.state){
      PLAYER_LIST[id].isShootingRight = false;
      PLAYER_LIST[id].isShootingDown = false;
      PLAYER_LIST[id].isShootingUp = false;
    }
  }
  if(data.input == "shoot1"){
    PLAYER_LIST[id].isShootingUp = data.state;

    if(data.state){
      PLAYER_LIST[id].isShootingRight = false;
      PLAYER_LIST[id].isShootingDown = false;
      PLAYER_LIST[id].isShootingLeft = false;
    }
  }
  if(data.input == "shoot2"){
    PLAYER_LIST[id].isShootingRight = data.state;

    if(data.state){
      PLAYER_LIST[id].isShootingLeft = false;
      PLAYER_LIST[id].isShootingDown = false;
      PLAYER_LIST[id].isShootingUp = false;
    }
  }
  if(data.input == "shoot3"){
    PLAYER_LIST[id].isShootingDown = data.state;

    if(data.state){
      PLAYER_LIST[id].isShootingRight = false;
      PLAYER_LIST[id].isShootingLeft = false;
      PLAYER_LIST[id].isShootingUp = false;
    }
  }

}

function buildMap(map, room){
  ROOM_LIST[room].blocks = map();
}

function checkForGameEnd(){
  for(var i in ROOM_LIST){
    if(!ROOM_LIST[i].inGame) continue;
    if(ROOM_LIST[i].checkForWin()){
      ROOM_LIST[i].inGame = false;
      for(var k in ROOM_LIST[i].players){
          s = SOCKET_LIST[ROOM_LIST[i].players[k].id];
          s.emit("drawEndgameText", {winner: ROOM_LIST[i].winner});
      }
      setTimeout(() => {
        for(var k in ROOM_LIST[i].players){
            s = SOCKET_LIST[ROOM_LIST[i].players[k].id];
            s.emit("endGame", {room : ROOM_LIST[i], roomIndex: i});
        }
        ROOM_LIST[i].reset();
        emitRoomUpdateSignal();
      }, 3000);
    }
  }
}

function shoot(player, room){
  let bulletColor = (ROOM_LIST[room].teamBased == "true") ? TEAM_COLORS[player.team] : player.color;
  if(player.isShootingUp){
    pos = [player.x + 7, player.y + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(0, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }
  if(player.isShootingDown){
    pos = [player.x + 7, player.y  + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(1, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }
 if(player.isShootingLeft){
    pos = [player.x + 7, player.y + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(2, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }
 if(player.isShootingRight){
    pos = [player.x + 7, player.y + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(3, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }

  if(player.hasMultigun && (player.isShootingUp || player.isShootingLeft)){
    pos = [player.x + 7, player.y + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(4, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }

  if(player.hasMultigun && (player.isShootingDown || player.isShootingRight)){
    pos = [player.x + 7, player.y + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(5, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }

  if(player.hasMultigun && (player.isShootingUp || player.isShootingRight)){
    pos = [player.x + 7, player.y + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(6, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }

  if(player.hasMultigun && (player.isShootingDown || player.isShootingLeft)){
    pos = [player.x + 7, player.y + 7];
    size = [7, 7];
    ROOM_LIST[room].bullets.push(new Bullet(7, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }

}

function createPowerup(room) {
  var passed = false
  var pUP;
  while(!passed){
    var x = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    var y = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    var type = Math.floor(Math.random() * (POWERUP_COLORS.length));
    pUP = new Powerup([x, y], [15, 15], POWERUP_COLORS[type], type);
    const foundElement = room.blocks.find(pUP.checkForCollision);
    passed = foundElement != null;
  }
  room.powerups.push(pUP);
  TIME_UNTIL_NEXT_POWERUP = POWERUP_DELAY;
}

function processPowerups(room_id){
  TIME_UNTIL_NEXT_POWERUP -= 1;
  const room = ROOM_LIST[room_id];

  if(TIME_UNTIL_NEXT_POWERUP <= 0) {
    createPowerup(room);
  }

  for(var i = room.powerups.length - 1; i > -1; i--){
    for(var k in room.players){
      if(!room.powerups[i]) continue;
      if(room.powerups[i].checkForCollision(room.players[k])){
        room.players[k].powerUp(room.powerups[i].type);
        room.powerups.splice(i, 1);
      }
    }
  }
}

function Update(){
  checkForGameEnd();
  var infoPack = [];
  for(var i in ROOM_LIST){
    if(ROOM_LIST[i].inGame){
      processPowerups(i);
      loop:
      for(var j = ROOM_LIST[i].bullets.length - 1; j > -1; j--){
        ROOM_LIST[i].bullets[j].updatePosition();
        for(var k in ROOM_LIST[i].blocks){
          var collider = ROOM_LIST[i].bullets[j].checkForCollision(ROOM_LIST[i].blocks[k]);
          if(collider == null) continue;
          if(ROOM_LIST[i].bullets[j].isCluster){
            var b = ROOM_LIST[i].bullets[j];
            for(var dir = 0; dir < 8; dir++){
              ROOM_LIST[i].bullets.push(new Bullet(dir, b.dmg / 1.5, [b.x, b.y], [b.width, b.height], b.team, b.color, false, true));
            }
          }
          ROOM_LIST[i].bullets.splice(j, 1);
          continue loop;
        }
        if(ROOM_LIST[i].bullets[j].isChild && !ROOM_LIST[i].bullets[j].hasShrinked)
          ROOM_LIST[i].bullets[j].shrink();
        for(var k  = 0; k < ROOM_LIST[i].players.length; k++){
          if(!ROOM_LIST[i].players[k].alive) continue;
          var collider = ROOM_LIST[i].bullets[j].checkForCollision(ROOM_LIST[i].players[k]);
          if(collider == null) continue;
          if(!collider.hasShield)
            collider.hp -= ROOM_LIST[i].bullets[j].dmg;
            ROOM_LIST[i].bullets.splice(j, 1);
            continue loop;
        }
      }
      for(var k = 0; k < ROOM_LIST[i].players.length; k++){
        p = ROOM_LIST[i].players[k];
        p.updateState();
        p.updatePowerUps();
        if(!p.alive) continue;
        p .updatePosition(ROOM_LIST[i].blocks);
        if(p.updateShooting()){
          shoot(p, i);
        }
        infoPack.push(
          {
            name : p.name,
            x : p.x,
            y : p.y,
            hp : p.hp,
            maxHp : p.maxHp,
            playerPowerups : p.powerUpsActive,
            color : p.color,
            room : i,
            team: p.team,
            teamBased: ROOM_LIST[i].teamBased == "true"
          });
      }
      infoPack.push({
        bullets : ROOM_LIST[i].bullets,
        blocks : ROOM_LIST[i].blocks,
        powerups : ROOM_LIST[i].powerups,
        room : i,
        winner : ROOM_LIST[i].winner
      });
    }
  }

  for(var i in ROOM_LIST){
    if (ROOM_LIST[i].players.length <= 0){
      delete ROOM_LIST[i];
      continue;
    }
    if(ROOM_LIST[i].inGame){
      for(var k = 0; k < ROOM_LIST[i].players.length; k++){
        var s = SOCKET_LIST[ROOM_LIST[i].players[k].id];
        s.emit("update", infoPack);
      }
    }
  }


}

function changePlayerAttribute(data){
  PLAYER_LIST[data.player][data.attribute] = data.value;
  emitRoomUpdateSignal();
  var query = {username: data.player};
  var newValue = {$set: {color:data.value}};
  db.collection("accounts").updateOne(query, newValue, function(err, res){
    if (err) throw err;
  });
}

function changeRoomSettings(data){
  ROOM_LIST[data.room][data.setting] = data.value;
  ROOM_LIST[data.room].updateTeams();
  ROOM_LIST[data.room].updateInfo();
  emitRoomUpdateSignal();
}

function emitRoomUpdateSignal(){
  for(var i in SOCKET_LIST){
    var s = SOCKET_LIST[i];
    s.emit("roomUpdate", {
      rooms : ROOM_LIST,
    });
  }
}

setInterval(Update, 1000/60);
