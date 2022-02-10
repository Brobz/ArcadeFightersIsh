import type Player from './models/player';
import type Room from './models/room';
import type {Socket} from 'socket.io';

interface List<T> {
  [id: string]: T;
}

type SocketList = List<Socket>
type PlayerList = List<Player>
type RoomList = List<Room>

export let SOCKET_LIST: SocketList = {};
export let PLAYER_LIST: PlayerList = {};
export let ROOM_LIST: RoomList = {};
