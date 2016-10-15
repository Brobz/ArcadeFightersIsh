var colors = ["#000099"]

function draw(data){
  canvas.clearRect(0, 0, 500, 500);
  for(var i = 0; i < data.length; i++){
    if(data[i].room != currentRoom)
      continue;
    if(i < colors.length)
      canvas.fillStyle = colors[i];
    else canvas.fillStyle = "#FF0000";
    canvas.fillText(data[i].name, data[i].x, data[i].y - 5);
    canvas.fillRect(data[i].x, data[i].y, 20, 20);
  }
}
