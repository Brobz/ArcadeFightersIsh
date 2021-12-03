var socket;
var id;
var currentRoom;
var waitingToJoinRoom = -1;
const login_SignupDiv = document.getElementById("login_SignupDiv");
const nameInput = document.getElementById("nameInput");
const passInput = document.getElementById("passInput");
const ignInput = document.getElementById("ignInput");
const connectButton = document.getElementById("connectButton");
const toSignPageButton = document.getElementById("toSignPageButton");
const signButton = document.getElementById("signButton");
const backToLoginButton = document.getElementById("backToLoginButton");
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
const startGameButton = document.getElementById("startGameButton");
const currentRoomTitleText = document.getElementById("currentRoomTitleText");
const createRoomButton = document.getElementById("createRoomButton");
const currentRoomInfo = document.getElementById("currentRoomInfo");
const winnerText = document.getElementById("winnerText");
const profileInfoDiv = document.getElementById("profileInfoDiv");
const roomHostControlsDiv = document.getElementById("roomHostControlsDiv");
const roomHostControlBlockedText = document.getElementById("roomHostControlBlockedText");
const maxPlayerSettingLabel = document.getElementById("maxPlayerSettingLabel");
const maxPlayerInput = document.getElementById("maxPlayerInput");
const playerColorText = document.getElementById("playerColorText");
const playerColorInput = document.getElementById("playerColorInput");
const canvasElement = document.getElementById("canvas");
const canvas = document.getElementById("canvas").getContext("2d");

canvas.font = "15px Monaco";
canvas.textAlign = 'center';

function joinRoom(){
  roomErrorText.innerHTML = "";
  socket.emit("joinRoom", {room: roomNameInput.value, player_id: id});
  waitingToJoinRoom = roomNameInput.value;

  socket.on("roomError404", function(data){
    roomErrorText.innerHTML = "Room '" + data.room + "' does not currently exist on the server!";
    waitingToJoinRoom = -1;
  });

  socket.on("roomErrorInGame", function(data){
    roomErrorText.innerHTML = "Room '" + data.room + "' is currently in a game!";
    waitingToJoinRoom = -1;
  });

  socket.on("roomErrorFull", function(data){
    roomErrorText.innerHTML = "Room '" + data.room + "' is currently full!";
    waitingToJoinRoom = -1;
  });

  socket.on("roomErrorEmptyNameJoin", function(data){
    roomErrorText.innerHTML = "Invalid input: empty room name!";
    waitingToJoinRoom = -1;
  });
}

function leaveRoom(){
  socket.emit("leaveRoom", {room: currentRoom, player_id: id});
  winnerText.innerHTML = "";
  currentRoom = -1;
}

function startGame(data){
  if(currentRoom == data.room){
    roomsDiv.style.display = "none";
    canvasElement.style.display = "";
    winnerText.innerHTML = "";
    canvasElement.scrollIntoView();
  }
}

function endGame(data){
  if(data.roomIndex == currentRoom){
    if(String(data.room.teamBased).toLowerCase() == "false"){
      for(var i in data.room.players){
        if(data.room.players[i].alive){
          winnerText.innerHTML = data.room.players[i].name + " WON!<br>";
          winnerText.innerHTML += "with " + Math.round(data.room.players[i].hp) + " hp left<br>";
          break;
        }
      }

    }else{
      for(var i in data.room.players){
        if(data.room.players[i].alive){
          winnerText.innerHTML = "Team " + data.room.players[i].team + " WON!<br>";
          break;
        }
      }
    }

    connectedText.style.display = "";
    roomsDiv.style.display = "";
    canvasElement.style.display = "none";
  }
}

function callForGameStart(){
  socket.emit("callForGameStart", {room: currentRoom});
}

function createRoom(){
  roomErrorText.innerHTML = "";
  socket.emit("createRoom", {room: roomNameInput.value, player_id:id});
  waitingToJoinRoom = roomNameInput.value;

  socket.on("roomErrorAlreadyExists", function(data){
    roomErrorText.innerHTML = "Room '" + data.room + "' already exists on this server!";
    waitingToJoinRoom = -1;
  });

  socket.on("roomErrorEmptyNameCreate", function(data){
    roomErrorText.innerHTML = "Invalid input: empty room name!";
    waitingToJoinRoom = -1;
  });
}

function roomUpdate(data){
  currentRoomPlayersText.innerHTML = ""
  if (currentRoom == -1){
    roomInputDiv.style.display = "";
    roomsDiv.style.display = "none";
  }
  for(var i in data.rooms){
    if(waitingToJoinRoom == i || waitingToJoinRoom == data.rooms[i].roomCode){
      let inRoom = false;
      for(var k in data.rooms[i].players){
        if(data.rooms[i].players[k].id == id){
          inRoom = true;
        }
      }
      if (!inRoom){
        continue;
      }
      roomsDiv.style.display = "";
      currentRoomTitleText.innerHTML = i;
      currentRoomCodeText.innerHTML = "Room " + data.rooms[i].roomCode;
      if (waitingToJoinRoom == i)
        currentRoom = waitingToJoinRoom;
      else
        currentRoom = i;
      waitingToJoinRoom = -1;
      roomInputDiv.style.display = "none";
    }
    if(currentRoom == i){
      roomHostControlsDiv.style.display = "none";
      roomHostControlBlockedText.style.display = "";
      startGameButton.disabled = true;
      currentRoomInfo.innerHTML = data.rooms[i].info;
      maxPlayerRoomSettingLabel.innerHTML = "Max Players : " + data.rooms[i].maxSize;
      maxPlayerInput.value = data.rooms[i].maxSize;
      maxPlayerInput.min = data.rooms[i].players.length;
      maxPlayerInput.step = (data.rooms[i].teamBased == "true") ? 2 : 1;
      gameModeRoomSettingInput.value = data.rooms[i].teamBased;
      for(var k in data.rooms[i].players){
        currentRoomPlayersText.innerHTML += '<br><span style="color:' + data.rooms[i].players[k].color + ';">' + data.rooms[i].players[k].name + " | Team " + data.rooms[i].players[k].team + "</span>";
        if(k == 0){
          let playerIsHost = data.rooms[i].players[k].id == id;
          if(playerIsHost){
            roomHostControlsDiv.style.display = "";
            roomHostControlBlockedText.style.display = "none";
          }
          currentRoomPlayersText.innerHTML += '<span style="color:' + data.rooms[i].players[k].color + ';">' + "<b> | HOST |</b>";
          if (data.rooms[i].players.length >= data.rooms[i].minSize && playerIsHost){
            startGameButton.disabled = false;
          }
        }
      }
    }
  }
}

function connected(data){

  id = data.id;

  connectedText.innerHTML = data.msg;
  playerColorText.innerHTML = data.color;
  playerColorText.style.color = data.color;
  playerColorInput.value = data.color;

  socket.on("update", function(data){update(data)});

  socket.on("startGame", function(data){startGame(data)});

  socket.on("endGame", function(data){endGame(data)});

  login_SignupDiv.style.display = "none";
  roomInputDiv.style.display = "";
  profileInfoDiv.style.display = "";
}

function connectionFailed(data){
  document.getElementById("connectingText").innerHTML = '<span style="color:DarkRed;">' + data.msg + '</span>';
}

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
signButton.onclick = function(){

    if(nameInput.value == ""){
      signedText.innerHTML = '<span style="color:DarkRed;">Invalid input: empty username!</span>';;
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

    socket.on("signUpSuccessfull", function(data){
      signedText.innerHTML = '<span style="color:DarkGreen;">' + data.msg + '</span>';
    });

    socket.on("signUpFailed", function(data){
      signedText.innerHTML = '<span style="color:DarkRed;">' + data.msg + '</span>';
    });
}

connectButton.onclick = function(){

    socket = io();

    connectingText.innerHTML = 'Connecting...';

    socket.emit("logInInfo", {username:nameInput.value.toLowerCase(), password:passInput.value});

    socket.on("connected", function(data){connected(data)});

    socket.on("connectionFailed", function(data){connectionFailed(data)});

    socket.on("roomUpdate", function(data){roomUpdate(data)});

    socket.on("drawEndgameText", function(data){drawEndgameText(data)});

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

function updateGameModeRoomSetting(){
  socket.emit("changeRoomSettings", {room: currentRoom, setting: "teamBased", value: gameModeRoomSettingInput.value});
  if(gameModeRoomSettingInput.value == "true"){
    if(parseInt(maxPlayerInput.value) % 2){
      maxPlayerInput.value = Math.min(6, parseInt(maxPlayerInput.value) + 1);
    }
    maxPlayerInput.step = 2;
    updateMaxPlayerRoomSetting();
  }else{
    maxPlayerInput.step = 1;
  }
}

function changePlayerColor(){
  playerColorText.innerHTML = playerColorInput.value;
  playerColorText.style.color = playerColorInput.value;
  socket.emit("changePlayerAttribute", {player:id, attribute:"color", value:playerColorInput.value});
}

window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);
