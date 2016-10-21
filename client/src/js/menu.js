var socket;
var id;
var currentRoom;
var log_sign = document.getElementById("log_sign");
var nameInput = document.getElementById("nameInput");
var passInput = document.getElementById("passInput");
var ignInput = document.getElementById("ignInput");
var connectButton = document.getElementById("connectButton");
var signButton = document.getElementById("signButton");
var backToLoginButton = document.getElementById("backToLoginButton");
var signedText = document.getElementById("signedText");
var connectedText = document.getElementById("connectedText");
var actionText = document.getElementById("actionText");
var signUpText = document.getElementById("signUpText");
var roomsDiv = document.getElementById("roomsDiv");

var room1Text = document.getElementById("room1PlayersText");
var room2Text = document.getElementById("room2PlayersText");
var room3Text = document.getElementById("room3PlayersText");
var roomTexts = [room1Text, room2Text, room3Text];

var startGame1 = document.getElementById("startGame1");
var startGame2 = document.getElementById("startGame2");
var startGame3 = document.getElementById("startGame3");
var startGameButtons = [startGame1, startGame2, startGame3];

var joinRoom1Button = document.getElementById("joinRoom1Button");
var joinRoom2Button = document.getElementById("joinRoom2Button");
var joinRoom3Button = document.getElementById("joinRoom3Button");
var joinRoomButtons = [joinRoom1Button, joinRoom2Button, joinRoom3Button];

var winners = ["", "", ""]

var canvasElement = document.getElementById("canvas");
var canvas = document.getElementById("canvas").getContext("2d");

canvas.font = "15px Monaco";
canvas.textAlign = 'center';

function joinRoom(index){
  socket.emit("joinRoom", {room:index});
}

function startGame(data){
  if(currentRoom == data.room){
    roomsDiv.style.display = "none";
    connectedText.style.display = "none";
    canvasElement.style.display = "";
  }
}

function endGame(data){
  if(!data.room.teamBased){
    for(var i in data.room.players){
      if(data.room.players[i].alive){
        winners[data.roomIndex] = data.room.players[i].name + " Won!!!<br>";
      }
    }

  }else{
    for(var i in data.room.players){
      if(data.room.players[i].alive){
        winners[data.roomIndex] = "Team " + data.room.players[i].team + " Won!!!<br>";
      }
    }
  }
  if(data.roomIndex == currentRoom){
    connectedText.style.display = "";
    roomsDiv.style.display = "";
    canvasElement.style.display = "none";
  }
}

function callForGameStart(index){
  socket.emit("callForGameStart", {room: index});
}

function roomUpdate(data){
  currentRoom = -1;
  for(var i in data.rooms){
    startGameButtons[i].style.display = "none";
    roomTexts[i].innerHTML = "<br>" + winners[i];
    joinRoomButtons[i].style.display = "";
    if(data.rooms[i].inGame || data.rooms[i].players.length >= data.rooms[i].maxSize){
      joinRoomButtons[i].style.display = "none";
    }
    for(var k in data.rooms[i].players){
      if(data.rooms[i].players[0].id == id && data.rooms[i].players.length >= data.rooms[i].minSize)
        startGameButtons[i].style.display = "";
      if(data.rooms[i].players[k].id == id){
        currentRoom = i;
        joinRoomButtons[i].style.display = "none";
      }
      roomTexts[i].innerHTML += "<br>" + data.rooms[i].players[k].name + " | Team " + data.rooms[i].players[k].team;
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
  roomsDiv.style.display = "";


}

function connectionFailed(data){
  document.getElementById("connectedText").innerHTML = data.msg;
}

backToLoginButton.onclick = function(){
  ignInput.style.display = "none";
  backToLoginButton.style.display = "none";
  connectButton.style.display = "";
  actionText.innerHTML = "Log In"
  signUpText.style.display = "";
  signedText.innerHTML = "";
  connectedText.innerHTML = "";
  nameInput.value = "";
  passInput.value = "";
  ignInput.value = "";
}

signButton.onclick = function(){
  if(ignInput.style.display == "none"){

    nameInput.value = "";
    passInput.value = "";
    ignInput.value = "";

    ignInput.style.display = "";
    backToLoginButton.style.display = "";
    connectButton.style.display = "none";
    actionText.innerHTML = "Sign Up"
    signUpText.style.display = "none";
    connectedText.innerHTML = "";

  }else{

    if(nameInput.value == "" || passInput.value == "" || ignInput.value == "")
      return;

    socket = io();

    signedText.innerHTML = "Signing Up...";

    socket.emit("signUpInfo", {username:nameInput.value.toLowerCase(), password:passInput.value, ign:ignInput.value});

    socket.on("signUpSuccessfull", function(data){
      signedText.innerHTML = data.msg;
    });

    socket.on("signUpFailed", function(data){
      signedText.innerHTML = data.msg;
    });
  }
}

connectButton.onclick = function(){

    socket = io();

    connectedText.innerHTML = "Connecting...";

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
