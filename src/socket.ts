import type {Db} from 'mongodb';
import type {Server as HTTPServer} from 'http';
import type {Socket} from 'socket.io';

import {Server} from 'socket.io';
import {processLoginRes, processSignUp} from './login_management';
import {PLAYER_LIST, ROOM_LIST, SOCKET_LIST} from './global_data';
import Room from './server/room';
import Block from './server/block';
import {changeRoomSettings} from './update_room_properties';
import {changePlayerAttribute} from './update_player_properties';
import {getKeyInput} from './handle_input';

export function emitRoomUpdateSignal(){
  for (const socket of Object.values(SOCKET_LIST)) {
    socket.emit('roomUpdate', {rooms: ROOM_LIST});
  }
}

function getDefaultRoom(roomName: string, roomCode: string){
  return new Room(
    roomName,
    roomCode,
    2,
    4,
    1,
    false,
    [[20,20], [360,360], [20, 360], [360, 20], [20, 180], [360, 180], [180, 20], [180, 360]]
  );
}

const generateRandomBlocks = function(){
  const blocks = []
  for(let x = 0; x < 20; x++){
    for(let y = 0; y < 20; y++){
      if(!x || !y || x == 19 || y == 19){
        blocks.push(new Block([x * 20, y * 20], [20, 20], "#100074"));
      }
    }
  }

  for(let i = 0; i < 10; i++){
    var x = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    var y = Math.floor(Math.random() * (300 - 100 + 1)) + 100;

    blocks.push(new Block([x, y], [20, 20], "#100074"));
  }

  return blocks;
}

function buildMap(room_id: string){
  ROOM_LIST[room_id].blocks = generateRandomBlocks();
}

function onDisconnect(id: string) {
  for(var i in ROOM_LIST){
    if(ROOM_LIST[i].players.indexOf(PLAYER_LIST[id]) >= 0){
      ROOM_LIST[i].removePlayer(PLAYER_LIST[id]);
    }
  }
  emitRoomUpdateSignal();
  delete SOCKET_LIST[id];
  delete PLAYER_LIST[id];

}

function onConnection(socket: Socket, db: Db) {
  socket.on("signUpInfo", async function(data){
    const res = db.collection("accounts").find({username:data.username});
    await processSignUp({data, db, res, socket});
  });

  socket.on("logInInfo", function(data){
    var res = db.collection("accounts").find({username:data.username});
    processLoginRes({data, db, res, socket});
  });

  socket.on("setName", (data) => socket.data.player.name = data.name);

  socket.on("joinRoom", function(data){
    if (data.room == ""){
      socket.emit("roomErrorEmptyNameJoin", {});
      return;
    }
    let roomExists = data.room in ROOM_LIST;

    if (!roomExists) {
      const foundRoom = Object.values(ROOM_LIST).find(room => room.roomCode == data.room);
      if (foundRoom == null) {
        socket.emit("roomError404", {room: data.room});
        return;
      }
      data.room = foundRoom.roomName;
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
    const roomCount = Object.keys(ROOM_LIST).length;
    ROOM_LIST[data.room] = getDefaultRoom(data.room, "#" + roomCount);
    ROOM_LIST[data.room].addPlayer(currentPlayer);
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
    buildMap(data.room);

    ROOM_LIST[data.room].inGame = true;
    for(var i in ROOM_LIST[data.room].players){
      var s = SOCKET_LIST[ROOM_LIST[data.room].players[i].id];
      s.emit("startGame", {room: data.room});
    }
    emitRoomUpdateSignal();
  });

  socket.on("changeRoomSettings", changeRoomSettings);

  socket.on("changePlayerAttribute", (data) => changePlayerAttribute(data, db));

  socket.on("keyPress", (data) => getKeyInput(socket.data.id, data));

  socket.on("disconnect", () => onDisconnect(socket.data.id));
}

export default function createIOSocket(server: HTTPServer, db: Db) {
  const io = new Server(server);
  const handleConnection = (socket: Socket) => onConnection(socket, db);
  io.sockets.on('connection', handleConnection);
}
