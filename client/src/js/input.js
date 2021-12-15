function handleKeyEvents(event, state) {
  if(socket == null) return;

  const input = [];
  if(event.keyCode == 68)
    input.push("d");
  if(event.keyCode == 83)
    input.push("s");
  if(event.keyCode == 65)
    input.push("a");
  if(event.keyCode == 87)
    input.push("w");

  if(event.keyCode == 37){
    input.push("shoot0");
  } else if(event.keyCode == 38) {
    input.push("shoot1");
  } else if(event.keyCode == 39) {
    input.push("shoot2");
  } else if(event.keyCode == 40) {
    input.push("shoot3");
  }

  socket.emit("keyPress", {input: input, state: state});
}

document.onkeydown = function(event){
  handleKeyEvents(event, true);
}

document.onkeyup = function(event){
  handleKeyEvents(event, false);
}
