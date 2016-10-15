var socket;
var id;
var currentRoom;
var nameInput = document.getElementById("nameInput");
var connectButton = document.getElementById("connectButton");
var connectedText = document.getElementById("connectedText");
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

var canvasElement = document.getElementById("canvas");
var canvas = document.getElementById("canvas").getContext("2d");

canvas.font = "15px Monaco";

function joinRoom(index){
  socket.emit("joinRoom", {room:index});
}

function startGame(data){
  if(currentRoom == data.room){
    roomsDiv.style.display = "none";
    canvasElement.style.display = "";
  }
}

function endGame(data){
  if(data.room == currentRoom){
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
    roomTexts[i].innerHTML = "";
    joinRoomButtons[i].style.display = "";
    if(data.rooms[i].inGame || data.rooms[i].players.length >= data.rooms[i].maxSize){
      joinRoomButtons[i].style.display = "none";
    }
    for(var k in data.rooms[i].players){
      if(data.rooms[i].players[0].id == id)
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

  socket.emit("setName", {name:nameInput.value});

  socket.on("update", function(data){update(data)});

  socket.on("startGame", function(data){startGame(data)});

  socket.on("endGame", function(data){endGame(data)});

  nameInput.style.display = "none";
  connectButton.style.display = "none";
  roomsDiv.style.display = "";


}

connectButton.onclick = function(){

    if(nameInput.value == "")
      return;

    connectedText.innerHTML = "Connecting...";

    socket = io();

    socket.on("roomUpdate", function(data){roomUpdate(data)});

    socket.on("connected", function(data){connected(data)});


}
