function draw(data){
  var hasDrawBullets = false;
  var hasDrawnBlocks = false;
  var hasDrawunPUPS = false;
  canvas.clearRect(0, 0, 500, 500);
  for(var i = 0; i < data.length; i++){
    if(data[i].room != currentRoom)
      continue;

    if(data[i].blocks != null){
      for(var k in data[i].powerups){
        canvas.fillStyle = data[i].powerups[k].color;
        canvas.fillRect(data[i].powerups[k].x, data[i].powerups[k].y, data[i].powerups[k].width, data[i].powerups[k].height);
      }


      for(var k in data[i].bullets){
        canvas.fillStyle = data[i].bullets[k].color;
        canvas.fillRect(data[i].bullets[k].x, data[i].bullets[k].y, data[i].bullets[k].width, data[i].bullets[k].height);
      }


      for(var k in data[i].blocks){
        canvas.fillStyle = data[i].blocks[k].color;
        canvas.fillRect(data[i].blocks[k].x, data[i].blocks[k].y, data[i].blocks[k].width, data[i].blocks[k].height);
      }
    }

    for(var k in data[i].playerPowerups){
      if(data[i].playerPowerups[k] == 2){
        canvas.fillStyle = "#000000";
        canvas.fillRect(data[i].x - 5, data[i].y - 5, 30, 30);

      }
    }

    canvas.fillStyle = data[i].color;
    canvas.fillRect(data[i].x, data[i].y, 20, 20);
    canvas.fillText(data[i].name, data[i].x + 10, data[i].y - 15);

    canvas.fillStyle = "#FF0000";
    canvas.fillRect(data[i].x - 10, data[i].y - 10, 40, 5);
    canvas.fillStyle = "#00FF00";
    canvas.fillRect(data[i].x - 10, data[i].y - 10, 40 * (data[i].hp / data[i].maxHp), 5);

  }
}
