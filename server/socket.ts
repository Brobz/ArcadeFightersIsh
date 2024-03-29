import type {Db} from 'mongodb';
import type {Server as HTTPServer} from 'http';
import type {Socket} from 'socket.io';

import {Server} from 'socket.io';
import {processLoginRes, processSignUp, getColor} from './login_management';
import {PLAYER_LIST, ROOM_LIST, SOCKET_LIST} from './global_data';
import {changeRoomSettings} from './update_room_properties';
import {changePlayerAttribute} from './update_player_properties';
import {getKeyInput} from './handle_input';
import WallBlock from './models/wall_block';
import ObstacleBlock from './models/obstacle_block';
import {createRoom, emitRoomUpdateSignal, joinRoom, leaveRoom} from './room_management';

function buildWall() {
  const blocks = []
  for(let x = 0; x < 20; x++) {
    const invalidX = x != 0 && x != 19;
    for(let y = 0; y < 20; y++) {
      const invalidY = y != 0 && y != 19
      if (invalidX && invalidY) {
        continue;
      }
      blocks.push(new WallBlock([x * 20, y * 20]));
    }
  }
  return blocks;
}

function generateRandomBlocks() {
  const blocks: ObstacleBlock[] = [];
  while (blocks.length < 10) {
    const x = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    const y = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    const block = new ObstacleBlock([x, y]);

    if (blocks.some(block.hasCollided)) {
      continue;
    }

    blocks.push(block);
  }
  return blocks;
}

function generateMap () {
  const map: (WallBlock | ObstacleBlock)[] = buildWall();
  let obstacleBlocks = generateRandomBlocks();
  return map.concat(obstacleBlocks);
}

function onDisconnect(id: string) {
  const player = PLAYER_LIST[id];
  const room = Object.values(ROOM_LIST).find(
    room => room.players.indexOf(player) >= 0
  );

  if (room != null){
    room.removePlayer(player);
    emitRoomUpdateSignal();
  }

  delete SOCKET_LIST[id];
  delete PLAYER_LIST[id];
}

function onConnection(socket: Socket, db: Db) {
  const collection = db.collection('accounts');
  socket.on("signUpInfo", async function(data){
    await processSignUp({collection, data, socket});
  });

  socket.on("logInInfo", async function(data){
    await processLoginRes({collection, data, socket});
  });

  socket.on("getColor", async function(data){
    await getColor({collection, data, socket});
  });

  socket.on("callForGameStart", function(data){
    const room = ROOM_LIST[data.room];
    if (room == null) {
      return;
    }
    if(room.players.length < room.minSize)
      return;

    room.reset();
    room.blocks = generateMap();
    room.inGame = true;

    room.players.forEach(
      player => SOCKET_LIST[player.id].emit('startGame', {room: data.room})
    );
    emitRoomUpdateSignal();
  });

  socket.on("joinRoom", data => joinRoom(data, socket));
  socket.on("createRoom", data => createRoom(data, socket));
  socket.on("leaveRoom", data => leaveRoom(data));
  socket.on("changeRoomSettings", changeRoomSettings);
  socket.on("changePlayerAttribute", data => changePlayerAttribute(data, db));
  socket.on("keyPress", data => getKeyInput(socket.data.id, data));
  socket.on("disconnect", () => onDisconnect(socket.data.id));
}

export default function createIOSocket(server: HTTPServer, db: Db) {
  const io = new Server(server);
  const handleConnection = (socket: Socket) => onConnection(socket, db);
  io.sockets.on('connection', handleConnection);
}
