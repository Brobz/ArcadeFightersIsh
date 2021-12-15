import type {Socket} from 'socket.io';
import type {Db, Document, FindCursor, WithId} from 'mongodb';

import bcrypt from 'bcrypt'
import Player from './server/player'
import {PLAYER_LIST, ROOM_LIST, SOCKET_LIST} from './global_data';

type DbResult = WithId<Document>
type DbResponse = FindCursor<DbResult>;
interface LoginData {
  username: string;
  password: string;
  ign: string;
}
interface Arguments {
  data: LoginData;
  db: Db
  res: DbResponse;
  socket: Socket;
}

const SALT_ROUNDS = 10;
const DEFAULT_COLOR = "#c61a93";

async function processSignUpHelper({data, db, res, socket}: Arguments) {
  const results = await res.toArray();
  if(results.length > 0){
    socket.emit("signUpFailed", {msg: "Sign Up failed: in-game-name already taken!"});
    return;
  }
  const hash = await bcrypt.hash(data.password, SALT_ROUNDS)
  db.collection("accounts").insertOne({
    username: data.username,
    password: hash,
    ign: data.ign,
    color: DEFAULT_COLOR,
  });

  socket.emit("signUpSuccessful", {msg: "Account Created Successfully!"});
}

export async function processSignUp(args: Arguments) {
  const {data, db, socket} = args;
  const results = await args.res.toArray();
  if(results.length > 0) {
    socket.emit("signUpFailed", {msg: "Sign Up failed: Username already taken!"});
    return;
  }
  const res = db.collection("accounts").find({ign:data.ign});
  await processSignUpHelper(args);
}

async function processLogin(
  data: LoginData,
  socket: Socket,
  results: DbResult[],
) {
  if(data.username in SOCKET_LIST){
    socket.emit("connectionFailed", {msg:"This account is currently logged in elsewhere!"});
    return;
  }

  const id = data.username;
  socket.data.id = id;
  SOCKET_LIST[id] = socket;

  const player = new Player(id, results[0].ign, results[0].color);
  socket.data.player = player;
  PLAYER_LIST[id] = player;

  socket.emit("connected", {
    msg: player.name,
    color: player.color,
    id,
  });

  socket.emit("roomUpdate", {
    rooms: ROOM_LIST,
  });
}

export async function processLoginRes(args: Arguments){
  const results = await args.res.toArray();
  const {data, socket} = args;
  if (results.length <= 0){
    socket.emit("connectionFailed", {msg:"Invalid Username/Password"});
    return;
  }
  const valid = await bcrypt.compare(data.password, results[0].password);
  if(!valid){
    socket.emit("connectionFailed", {msg:"Invalid Username/Password"});
    return;
  }
  await processLogin(data, socket, results);
}
