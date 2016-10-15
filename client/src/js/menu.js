var socket;
var nameInput = document.getElementById("nameInput");
var connectButton = document.getElementById("connectButton");
var connectedText = document.getElementById("connectedText");
var canvasElement = document.getElementById("canvas");
var canvas = document.getElementById("canvas").getContext("2d");

canvas.font = "15px Monaco";

function connected(data){
  document.getElementById("connectedText").innerHTML = data.msg;

  socket.emit("setName", {name:nameInput.value});

  socket.on("update", function(data){update(data)});

  nameInput.style.display = "none";
  connectButton.style.display = "none";
  canvasElement.style.display = "";


}

connectButton.onclick = function(){

    connectedText.innerHTML = "Connecting...";

    socket = io();

    socket.on("connected", function(data){connected(data)});


}
