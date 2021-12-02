var socket;
var id;
var currentRoom;
var waitingToJoinRoom = -1;
var log_sign = document.getElementById("log_sign");
var nameInput = document.getElementById("nameInput");
var passInput = document.getElementById("passInput");
var ignInput = document.getElementById("ignInput");
var connectButton = document.getElementById("connectButton");
var toSignPageButton = document.getElementById("toSignPageButton");
var signButton = document.getElementById("signButton");
var backToLoginButton = document.getElementById("backToLoginButton");
var signedText = document.getElementById("signedText");
var connectedText = document.getElementById("connectedText");
var connectingText = document.getElementById("connectingText");
var actionText = document.getElementById("actionText");
var signUpText = document.getElementById("signUpText");
var roomsDiv = document.getElementById("roomsDiv");
var roomErrorText = document.getElementById("roomErrorText");
var roomNameInput = document.getElementById("roomNameInput");
var currentRoomPlayersText = document.getElementById("currentRoomPlayersText");
var startGameButton = document.getElementById("startGameButton");
var currentRoomTitleText = document.getElementById("currentRoomTitleText");
var createRoomButton = document.getElementById("createRoomButton");
var currentRoomInfo = document.getElementById("currentRoomInfo");
var winnerText = document.getElementById("winnerText");

var canvasElement = document.getElementById("canvas");
var canvas = document.getElementById("canvas").getContext("2d");

canvas.font = "15px Monaco";
canvas.textAlign = 'center';

function joinRoom(){
  roomErrorText.innerHTML = "";
  socket.emit("joinRoom", {room: roomNameInput.value, player_id: id});
  waitingToJoinRoom = roomNameInput.value;;

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
  currentRoom = -1;
}

function startGame(data){
  if(currentRoom == data.room){
    roomsDiv.style.display = "none";
    connectedText.style.display = "none";
    canvasElement.style.display = "";
    winnerText.innerHTML = "";
  }
}

function endGame(data){
  if(!data.room.teamBased){
    for(var i in data.room.players){
      if(data.room.players[i].alive){
        winnerText.innerHTML = data.room.players[i].name + " WON!<br>";
        winnerText.innerHTML += "with " + data.room.players[i].hp + " hp left<br>";
      }
    }

  }else{
    for(var i in data.room.players){
      if(data.room.players[i].alive){
        winnerText.innerHTML = "Team " + data.room.players[i].team + " WON!<br>";
        winnerText.innerHTML += "with " + data.room.players[i].hp + " hp left<br>";
      }
    }
  }
  if(data.roomIndex == currentRoom){
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
    if(waitingToJoinRoom == i){
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
      currentRoomTitleText.innerHTML = '<span style="color:DarkSlateGrey;">' + i + '</span>';
      currentRoom = roomNameInput.value;
      waitingToJoinRoom = -1;
      roomInputDiv.style.display = "none";
    }
    if(currentRoom == i){
      startGameButton.disabled = true;
      currentRoomInfo.innerHTML = data.rooms[i].info;
      for(var k in data.rooms[i].players){
        currentRoomPlayersText.innerHTML += "<br>" + data.rooms[i].players[k].name + " | Team " + data.rooms[i].players[k].team + " |";
        if(k == 0){
          currentRoomPlayersText.innerHTML += "<b> HOST</b> |";
          if (data.rooms[i].players.length >= data.rooms[i].minSize && data.rooms[i].players[k].id == id){
            startGameButton.disabled = false;
          }
        }
      }
    }
  }
}

function connected(data){

  id = data.id;

  document.getElementById("connectedText").innerHTML = data.msg;

  socket.on("update", function(data){update(data)});

  socket.on("startGame", function(data){startGame(data)});

  socket.on("endGame", function(data){endGame(data)});

  log_sign.style.display = "none";
  roomInputDiv.style.display = "";

}

function connectionFailed(data){
  document.getElementById("connectingText").innerHTML = '<span style="color:DarkRed;">' + data.msg + '</span>';
}

backToLoginButton.onclick = function(){
  ignInput.style.display = "none";
  backToLoginButton.style.display = "none";
  connectButton.style.display = "";
  actionText.innerHTML = "Log In"
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
    actionText.innerHTML = "Sign Up"
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

    connectingText.innerHTML = '<span style="color:DarkSlateGrey;"> Connecting... </span>';

    socket.emit("logInInfo", {username:nameInput.value.toLowerCase(), password:passInput.value});

    socket.on("connected", function(data){connected(data)});

    socket.on("connectionFailed", function(data){connectionFailed(data)});

    socket.on("roomUpdate", function(data){roomUpdate(data)});




}

nameInput.onkeypress = passInput.onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      if(connectButton.style.display == "")
        connectButton.onclick();
    }
}

window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);
