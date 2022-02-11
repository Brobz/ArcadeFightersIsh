import type {Socket} from 'socket.io';
import type {Collection, Document, WithId} from 'mongodb';

import bcrypt from 'bcrypt'
import Player from './models/player'
import {PLAYER_LIST, SOCKET_LIST} from './global_data';

type DbResult = WithId<Document>
interface LoginData {
  username: string;
  password: string;
  ign: string;
  color: string;
}
interface Arguments {
  collection: Collection<Document>,
  data: LoginData;
  socket: Socket;
}

const SALT_ROUNDS = 10;

async function generateRandomColor({collection, data, socket}: Arguments) {
  let colorTaken = true;
  let newColor = "#"
  while (colorTaken){
    let generateRandomValue = () => Math.round(Math.random() * 256).toString(16);
    let r = generateRandomValue();
    let g = generateRandomValue();
    let b = generateRandomValue();
    newColor = `#${r}${g}${b}`;
    data.color = newColor;
    colorTaken = await colorIsTaken({collection, data, socket});
  }
  return newColor;
}

async function createUser({collection, data, socket}: Arguments) {
  const hash = await bcrypt.hash(data.password, SALT_ROUNDS)
  const color = await generateRandomColor({collection, data, socket});
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

export async function getColor({collection, data: {color}, socket}: Arguments){
  const query = { color: color };
  const options = {
    projection: { _id: 0, ign: 1, color: 1 },
  };
  const player = await collection.findOne(query, options);
  if (player == null){
    // no player with that color in the server!
    socket.emit("freeColor", {color: color});
  }
  else{
    // color already taken!
    socket.emit("takenColor", {ign: player.ign, color: color});
  }
}

export async function colorIsTaken({collection, data: {color}, socket}: Arguments){
  const query = { color: color };
  const options = {
    projection: { _id: 0, ign: 1, color: 1 },
  };
  const player = await collection.findOne(query, options);
  if (player == null){
    // no player with that color in the server!
    return false;
  }
  else{
    // color already taken!
    return true;
  }
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
