var socket;
var id;
var currentRoom;
var waitingToJoinRoom = false;

// Labels and other elements without listeners
const login_SignupDiv = document.getElementById("login_SignupDiv");
const nameInput = document.getElementById("nameInput");
const passInput = document.getElementById("passInput");
const ignInput = document.getElementById("ignInput");
const signedText = document.getElementById("signedText");
const connectedText = document.getElementById("connectedText");
const connectingText = document.getElementById("connectingText");
const landingPageActionText = document.getElementById("landingPageActionText");
const signUpText = document.getElementById("signUpText");
const roomsDiv = document.getElementById("roomsDiv");
const roomErrorText = document.getElementById("roomErrorText");
const roomNameInput = document.getElementById("roomNameInput");
const currentRoomPlayersText = document.getElementById("currentRoomPlayersText");
const currentRoomCodeText = document.getElementById("currentRoomCodeText");
const winnerText = document.getElementById("winnerText");
const profileInfoDiv = document.getElementById("profileInfoDiv");
const roomHostControlsDiv = document.getElementById("roomHostControlsDiv");
const roomHostControlBlockedText = document.getElementById("roomHostControlBlockedText");
const maxPlayerRoomSettingLabel = document.getElementById("maxPlayerRoomSettingLabel");
const maxPlayerInput = document.getElementById("maxPlayerInput");
const playerColorText = document.getElementById("playerColorText");
const currentRoomTitleText = document.getElementById("currentRoomTitleText");
const currentRoomInfo = document.getElementById("currentRoomInfo");
const roomInputDiv = document.getElementById('roomInputDiv');

// Buttons and other elements with listeners
const connectButton = document.getElementById("connectButton");
connectButton.onclick = function(){
  socket = io();
  connectingText.innerHTML = 'Connecting...';
  socket.emit("logInInfo", {username:nameInput.value.toLowerCase(), password:passInput.value});
  socket.on("connected", connected);
  socket.on("connectionFailed", connectionFailed);
  socket.on("roomUpdate", roomUpdate);
  socket.on("drawEndgameText", drawEndgameText);
}
const signButton = document.getElementById("signButton");
signButton.onclick = function(){
  if(nameInput.value == ""){
    signedText.innerHTML = '<span style="color:DarkRed;">Invalid input: empty username!</span>';
    return;
  }
  if(passInput.value == ""){
    signedText.innerHTML = '<span style="color:DarkRed;">Invalid input: empty password!</span>';
    return;
  }
  if(ignInput.value == ""){
    signedText.innerHTML = '<span style="color:DarkRed;">Invalid input: empty in-game-name!</span>';
    return;
  }
  socket = io();
  signedText.innerHTML = "Signing Up...";
  socket.emit("signUpInfo", {username:nameInput.value.toLowerCase(), password:passInput.value, ign:ignInput.value});
  socket.on("signUpSuccessful", function(data){
    signedText.innerHTML = '<span style="color:DarkGreen;">' + data.msg + '</span>';
  });
  socket.on("signUpFailed", function(data){
    signedText.innerHTML = '<span style="color:DarkRed;">' + data.msg + '</span>';
  });
}
const backToLoginButton = document.getElementById("backToLoginButton");
backToLoginButton.onclick = function(){
  ignInput.style.display = "none";
  backToLoginButton.style.display = "none";
  connectButton.style.display = "";
  landingPageActionText.innerHTML = "Log In"
  signUpText.style.display = "";
  signedText.innerHTML = "";
  toSignPageButton.style.display = "";
  signButton.style.display = "none";
  connectedText.innerHTML = "";
  nameInput.value = "";
  passInput.value = "";
  ignInput.value = "";
}
const toSignPageButton = document.getElementById("toSignPageButton");
toSignPageButton.onclick = function(){
  nameInput.value = "";
  passInput.value = "";
  ignInput.value = "";
  ignInput.style.display = "";
  backToLoginButton.style.display = "";
  connectButton.style.display = "none";
  landingPageActionText.innerHTML = "Sign Up"
  signUpText.style.display = "none";
  signButton.style.display = "";
  connectingText.innerHTML = "";
  toSignPageButton.style.display = "none";
}
const startGameButton = document.getElementById("startGameButton");
function callForGameStart(){
  socket.emit("callForGameStart", {room: currentRoom});
}
startGameButton.onclick = callForGameStart;
const createRoomButton = document.getElementById("createRoomButton");
function createRoom(){
  roomErrorText.innerHTML = "";
  socket.emit("createRoom", {room: roomNameInput.value, player_id:id});
  waitingToJoinRoom = true;

  socket.on("roomErrorAlreadyExists", function(data){
    roomErrorText.innerHTML = "Room '" + data.room + "' already exists on this server!";
    waitingToJoinRoom = false;
  });

  socket.on("roomErrorEmptyNameCreate", function(){
    roomErrorText.innerHTML = "Invalid input: empty room name!";
    waitingToJoinRoom = false;
  });
}
createRoomButton.onclick = createRoom;
function joinRoom(){
  roomErrorText.innerHTML = "";
  socket.emit("joinRoom", {room: roomNameInput.value, player_id: id});
  waitingToJoinRoom = true;

  socket.on("roomError404", function(data){
    roomErrorText.innerHTML = "Room '" + data.room + "' does not currently exist on the server!";
    waitingToJoinRoom = false;
  });

  socket.on("roomErrorInGame", function(data){
    roomErrorText.innerHTML = "Room '" + data.room + "' is currently in a game!";
    waitingToJoinRoom = false;
  });

  socket.on("roomErrorFull", function(data){
    roomErrorText.innerHTML = "Room '" + data.room + "' is currently full!";
    waitingToJoinRoom = false;
  });

  socket.on("roomErrorEmptyNameJoin", function(){
    roomErrorText.innerHTML = "Invalid input: empty room name!";
    waitingToJoinRoom = false;
  });
}
document.getElementById('joinRoomButton').onclick = joinRoom
function leaveRoom(){
  socket.emit("leaveRoom", {room: currentRoom, player_id: id});
  winnerText.innerHTML = "";
  currentRoom = "";
  roomInputDiv.style.display = "";
  roomsDiv.style.display = "none";
}
document.getElementById('leaveRoomButton').onclick = leaveRoom
const gameModeRoomSettingInput = document.getElementById('gameModeRoomSettingInput')
function updateGameModeRoomSetting(){
  socket.emit("changeRoomSettings", {room: currentRoom, setting: "teamBased", value: gameModeRoomSettingInput.value == "true"});
  if(gameModeRoomSettingInput.value){
    if(parseInt(maxPlayerInput.value) % 2){
      maxPlayerInput.value = Math.min(8, parseInt(maxPlayerInput.value) + 1);
    }
    updateMaxPlayerRoomSetting();
    maxPlayerInput.step = 2;
  }else{
    maxPlayerInput.step = 1;
  }
}
gameModeRoomSettingInput.onchange = updateGameModeRoomSetting;
const playerColorInput = document.getElementById('playerColorInput');
function changePlayerColor(){
  playerColorText.innerHTML = playerColorInput.value;
  playerColorText.style.color = playerColorInput.value;
  socket.emit("changePlayerAttribute", {player:id, attribute:"color", value:playerColorInput.value});
}
playerColorInput.onchange = changePlayerColor;

const canvasElement = document.getElementById("canvas");

const TEAM_COLORS = [undefined, "#0096FF", "#ff6961"];

function startGame(data){
  if (currentRoom != data.room) {
    return
  }
  roomsDiv.style.display = "none";
  canvasElement.style.display = "";
  winnerText.innerHTML = "";
  canvasElement.scrollIntoView();
}

function endGame(data){
  if (data.roomIndex != currentRoom)
    return;

  if (!data.teamBased)
    winnerText.innerHTML = data.winner + " WON!<br>";
  else
    winnerText.innerHTML = data.winner + " WON!<br>";

  connectedText.style.display = "";
  roomsDiv.style.display = "";
  canvasElement.style.display = "none";
}

function updateSingleRoomPerPlayer(room, player, k) {
  if(room.teamBased){
    currentRoomPlayersText.innerHTML += '<br><span style="color:' + player.color + ';">' + player.name + '</span><span style="color:' + TEAM_COLORS[player.team] + ';"> | Team ' + player.team + "</span>";
  } else {
    currentRoomPlayersText.innerHTML += '<br><span style="color:' + player.color + ';">' + player.name + " | Team " + player.team + "</span>";
  }
  if (k != 0) {
    return;
  }
  currentRoomPlayersText.innerHTML += '<span style="color:' + player.color + ';">' + "<b> | HOST |</b>";
  const playerIsHost = player.id == id;
  if (!playerIsHost) {
    return;
  }
  roomHostControlsDiv.style.display = "";
  roomHostControlBlockedText.style.display = "none";
  startGameButton.disabled = !room.canStartGame;
}

function updateSingleRoom(room) {
  if(waitingToJoinRoom){
    const canJoinRoom = room.players.find(player => player.id == id) != null;
    if (!canJoinRoom) {
      return;
    }
    roomsDiv.style.display = "";
    currentRoomTitleText.innerHTML = room.roomName;
    currentRoom = room.roomName;
    currentRoomCodeText.innerHTML = "Room " + room.roomCode;
    waitingToJoinRoom = false;
    roomInputDiv.style.display = "none";
  }
  roomHostControlsDiv.style.display = "none";
  roomHostControlBlockedText.style.display = "";
  startGameButton.disabled = true;
  currentRoomInfo.innerHTML = room.info;
  maxPlayerRoomSettingLabel.innerHTML = "Max Players : " + room.maxSize;
  maxPlayerInput.value = room.maxSize;
  if (room.teamBased && room.players.length % 2 == 1) {
    maxPlayerInput.min = room.players.length + 1;
  } else {
    // Disallow maxPlayer = 1... its just counter intuitive
    maxPlayerInput.min = Math.max(room.players.length, 2);
  }
  maxPlayerInput.step = room.teamBased ? 2 : 1;
  gameModeRoomSettingInput.value = room.teamBased;
  room.players.forEach(
    (player, k) => updateSingleRoomPerPlayer(room, player, k)
  );
}

function roomUpdate(data){
  currentRoomPlayersText.innerHTML = ""
  updateSingleRoom(data.room);
}

function connected(data){
  id = data.id;

  connectedText.innerHTML = data.msg;
  playerColorText.innerHTML = data.color;
  playerColorText.style.color = data.color;
  playerColorInput.value = data.color;

  socket.on("update", draw);

  socket.on("startGame", startGame);

  socket.on("endGame", endGame);

  login_SignupDiv.style.display = "none";
  roomInputDiv.style.display = "";
  profileInfoDiv.style.display = "";
}

function connectionFailed(data){
  document.getElementById("connectingText").innerHTML = '<span style="color:DarkRed;">' + data.msg + '</span>';
}

nameInput.onkeypress = passInput.onkeypress = function(e){
  if (!e) e = window.event;
  var keyCode = e.keyCode || e.which;
  if (keyCode == '13'){
    if(connectButton.style.display == "")
      connectButton.onclick();
  }
}

function updateMaxPlayerRoomSetting(){
  socket.emit("changeRoomSettings", {room: currentRoom, setting: "maxSize", value: parseInt(maxPlayerInput.value)});
}

window.addEventListener("keydown", function(e) {
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
    e.preventDefault();
  }
}, false);
