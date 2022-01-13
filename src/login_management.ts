import type {Socket} from 'socket.io';
import type {Collection, Document, WithId} from 'mongodb';

import bcrypt from 'bcrypt'
import Player from './server/player'
import {PLAYER_LIST, SOCKET_LIST} from './global_data';

type DbResult = WithId<Document>
interface LoginData {
  username: string;
  password: string;
  ign: string;
}
interface Arguments {
  collection: Collection<Document>,
  data: LoginData;
  socket: Socket;
}

const SALT_ROUNDS = 10;

function generateRandomColor() {
  const generateRandomValue = () => Math.round(Math.random() * 256).toString(16);
  const r = generateRandomValue();
  const g = generateRandomValue();
  const b = generateRandomValue();
  return `#${r}${g}${b}`;
}

async function createUser({collection, data, socket}: Arguments) {
  const hash = await bcrypt.hash(data.password, SALT_ROUNDS)
  const color = generateRandomColor();
  collection.insertOne({
    username: data.username,
    password: hash,
    ign: data.ign,
    color,
  });

  socket.emit("signUpSuccessful", {msg: "Account Created Successfully!"});
}

async function checkIfDuplicateUsername({collection, data: {username}}: Arguments) {
  const results = await collection.find({username}).toArray();
  if (results.length == 0) {
    return;
  }
  throw Error('Sign Up failed: Username already taken!');
}

async function checkIfDuplicateIGN({collection, data: {ign}}: Arguments) {
  const results = await collection.find({ign}).toArray();
  if (results.length == 0) {
    return;
  }
  throw Error('Sign Up failed: in-game-name already taken!');
}

export async function processSignUp(args: Arguments) {
  const {socket} = args;
  try {
    await checkIfDuplicateUsername(args);
    await checkIfDuplicateIGN(args);
  } catch (error) {
    if (error instanceof Error) {
      socket.emit('signUpFailed', {msg: error.message});
    }
    return;
  }
  await createUser(args);
}

async function processLogin(
  data: LoginData,
  socket: Socket,
  result: DbResult,
) {
  const id = data.username;
  socket.data.id = id;
  SOCKET_LIST[id] = socket;

  const player = new Player(id, result.ign, result.color);
  socket.data.player = player;
  PLAYER_LIST[id] = player;

  socket.emit("connected", {
    msg: player.name,
    color: player.color,
    id,
  });
}

function checkIfConnected({data: {username}}: Arguments) {
  if (username in SOCKET_LIST) {
    throw Error('This account is currently logged in elsewhere!');
  }
  return;
}

async function getUser({collection, data: {username, password}}: Arguments) {
  const results = await collection.find({username}).toArray();
  if (results.length == 0) {
    throw Error('Invalid Username/Password');
  }
  const user = results[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw Error('Invalid Username/Password');
  }
  return user;
}

export async function processLoginRes(args: Arguments){
  const {socket} = args;
  let user: DbResult;
  try {
    checkIfConnected(args);
    user = await getUser(args);
  } catch(error) {
    if (error instanceof Error) {
      socket.emit("connectionFailed", {msg: error.message});
    }
    return;
  }
  await processLogin(args.data, socket, user);
}
