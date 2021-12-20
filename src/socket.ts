import type {Db} from 'mongodb';
import type {Server as HTTPServer} from 'http';
import type {Socket} from 'socket.io';

import {Server} from 'socket.io';
import {processLoginRes, processSignUp} from './login_management';
import {PLAYER_LIST, ROOM_LIST, SOCKET_LIST} from './global_data';
import {changeRoomSettings} from './update_room_properties';
import {changePlayerAttribute} from './update_player_properties';
import {getKeyInput} from './handle_input';
import WallBlock from './server/wall_block';
import ObstacleBlock from './server/obstacle_block';
import {createRoom, emitRoomUpdateSignal, joinRoom, leaveRoom} from './room_management';

function generateRandomBlocks() {
  const blocks = []
  for(let x = 0; x < 20; x++) {
    if (x == 0 || x == 19) {
      continue;
    }
    for(let y = 0; y < 20; y++) {
      if (y == 0 || y == 19) {
        continue;
      }
      blocks.push(new WallBlock([x * 20, y * 20]));
    }
  }
  for(let i = 0; i < 10; i++) {
    var x = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    var y = Math.floor(Math.random() * (300 - 100 + 1)) + 100;

    blocks.push(new ObstacleBlock([x, y]));
  }
  return blocks;
}

function onDisconnect(id: string) {
  const player = PLAYER_LIST[id];
  const room = Object.values(ROOM_LIST).find(
    room => room.players.indexOf(player) >= 0
  );
  if (room == null) {
    return;
  }
  room.removePlayer(player);
  emitRoomUpdateSignal()
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

  socket.on("callForGameStart", function(data){
    const room = ROOM_LIST[data.room];
    if (room == null) {
      return;
    }
    if(room.players.length < room.minSize)
      return;

    room.reset();
    room.blocks = generateRandomBlocks();
    room.inGame = true;

    room.players.forEach(
      player => SOCKET_LIST[player.id].emit('startGame', {room: data.room})
    );
    emitRoomUpdateSignal();
  });

  socket.on("setName", data => socket.data.player.name = data.name);
  socket.on("joinRoom", data => joinRoom(data, socket));
  socket.on("createRoom", data => createRoom(data, socket));
  socket.on("leaveRoom", data => leaveRoom(data));
  socket.on("changeRoomSettings", changeRoomSettings);
  socket.on("changePlayerAttribute", data => changePlayerAttribute(data, db));
  socket.on("keyPress", data => getKeyInput(socket.data.id, data));
  socket.on("disconnect", () => onDisconnect(socket.data.id));
}

export default function createIOSocket(server: HTTPServer, db: Db) {
  // TODO: Update for better typescript support
  const io = new Server(server);
  const handleConnection = (socket: Socket) => onConnection(socket, db);
  io.sockets.on('connection', handleConnection);
}
