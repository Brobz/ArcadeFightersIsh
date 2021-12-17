import type {Socket} from 'socket.io';
import {PLAYER_LIST, ROOM_LIST, SOCKET_LIST} from './global_data';
import Room from './server/room';

interface RoomEventsData {
  room: string;
  player_id: string;
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

export function emitRoomUpdateSignal(){
  // TODO: Update roomUpdate so that it only sends the information of
  // the desired room, not every single one of them
  for (const socket of Object.values(SOCKET_LIST)) {
    socket.emit('roomUpdate', {rooms: ROOM_LIST});
  }
}

export function joinRoom(data: RoomEventsData, socket: Socket) {
  if (data.room == ""){
    socket.emit("roomErrorEmptyNameJoin", {});
    return;
  }
  if (!(data.room in ROOM_LIST)) {
    const foundRoom = Object.values(ROOM_LIST).find(room => room.roomCode == data.room);
    if (foundRoom == null) {
      socket.emit("roomError404", {room: data.room});
      return;
    }
    data.room = foundRoom.roomName;
  }
  const room = ROOM_LIST[data.room];
  if (room.inGame){
    socket.emit("roomErrorInGame", {room: data.room});
    return;
  }
  const currentPlayer = PLAYER_LIST[data.player_id];
  if(room.players.length >= room.maxSize){
    socket.emit("roomErrorFull", {room: data.room});
    return;
  }
  room.addPlayer(currentPlayer);
  emitRoomUpdateSignal();
}

export function createRoom(data: RoomEventsData, socket: Socket) {
  if (data.room == ""){
    socket.emit("roomErrorEmptyNameCreate", {});
    return;
  }
  const roomExists = data.room in ROOM_LIST;
  if(roomExists){
    socket.emit("roomErrorAlreadyExists", {room: data.room});
    return;
  }
  const currentPlayer = PLAYER_LIST[data.player_id];
  const roomCount = Object.keys(ROOM_LIST).length;
  ROOM_LIST[data.room] = getDefaultRoom(data.room, "#" + roomCount);
  ROOM_LIST[data.room].addPlayer(currentPlayer);
  emitRoomUpdateSignal();
}

export function leaveRoom(data: RoomEventsData) {
  const roomExists = data.room in ROOM_LIST;
  if (!roomExists){
    return;
  }
  ROOM_LIST[data.room].removePlayer(PLAYER_LIST[data.player_id]);
  if (ROOM_LIST[data.room].players.length <= 0){
    delete ROOM_LIST[data.room];
  }
  emitRoomUpdateSignal();
}
