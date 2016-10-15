function draw(data){
  var hasDrawBullets = false;
  var hasDrawnBlocks = false;
  canvas.clearRect(0, 0, 500, 500);
  for(var i = 0; i < data.length; i++){
    if(data[i].room != currentRoom)
      continue;



    for(var k in data[i].bullets){
      if(!hasDrawBullets){
        canvas.fillStyle = data[i].bullets[k].color;
        canvas.fillRect(data[i].bullets[k].x, data[i].bullets[k].y, data[i].bullets[k].width, data[i].bullets[k].height);
      }
    }

    hasDrawBullets = true;

    for(var k in data[i].blocks){
      if(!hasDrawnBlocks){
        canvas.fillStyle = data[i].blocks[k].color;
        canvas.fillRect(data[i].blocks[k].x, data[i].blocks[k].y, data[i].blocks[k].width, data[i].blocks[k].height);
      }
    }

    hasDrawnBlocks = true;

    canvas.fillStyle = data[i].color;
    canvas.fillRect(data[i].x, data[i].y, 20, 20);
    canvas.fillText(data[i].name, data[i].x, data[i].y - 5);

  }
}
