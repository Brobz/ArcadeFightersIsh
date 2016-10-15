function draw(data){
  var hasDrawBullets = false;
  canvas.clearRect(0, 0, 500, 500);
  for(var i = 0; i < data.length; i++){
    if(data[i].room != currentRoom)
      continue;



    for(var k in data[i].bullets){
      if(!hasDrawBullets){
        canvas.fillStyle = data[i].bullets[k].color;
        canvas.fillRect(data[i].bullets[k].x, data[i].bullets[k].y, 7, 7);
      }
    }

    hasDrawBullets = true;
    
    canvas.fillStyle = data[i].color;
    canvas.fillRect(data[i].x, data[i].y, 20, 20);
    canvas.fillText(data[i].name, data[i].x, data[i].y - 5);

  }
}
