document.onkeydown = function(event){

  if(socket == null) return;

  if(event.keyCode == 68)
    socket.emit("keyPress", {input:"d", state:1});
  if(event.keyCode == 83)
    socket.emit("keyPress", {input:"s", state:1});
  if(event.keyCode == 65)
    socket.emit("keyPress", {input:"a", state:1});
  if(event.keyCode == 87)
    socket.emit("keyPress", {input:"w", state:1});
}


document.onkeyup = function(event){
  if(socket == null) return;

  if(event.keyCode == 68)
    socket.emit("keyPress", {input:"d", state:0});
  if(event.keyCode == 83)
    socket.emit("keyPress", {input:"s", state:0});
  if(event.keyCode == 65)
    socket.emit("keyPress", {input:"a", state:0});
  if(event.keyCode == 87)
    socket.emit("keyPress", {input:"w", state:0});
}
