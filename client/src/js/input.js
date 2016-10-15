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


  if(event.keyCode == 37)
    socket.emit("keyPress", {input:"shoot0", state:1});
  if(event.keyCode == 38)
    socket.emit("keyPress", {input:"shoot1", state:1});
  if(event.keyCode == 39)
    socket.emit("keyPress", {input:"shoot2", state:1});
  if(event.keyCode == 40)
    socket.emit("keyPress", {input:"shoot3", state:1});
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

  if(event.keyCode == 37)
    socket.emit("keyPress", {input:"shoot0", state:0});
  if(event.keyCode == 38)
    socket.emit("keyPress", {input:"shoot1", state:0});
  if(event.keyCode == 39)
    socket.emit("keyPress", {input:"shoot2", state:0});
  if(event.keyCode == 40)
    socket.emit("keyPress", {input:"shoot3", state:0});
}
