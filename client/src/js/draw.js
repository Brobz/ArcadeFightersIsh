canvas.scale(1.25, 1.25);
var powerupBlur = 0;
var dPupBlur = 1;
var pupMax = 60;
var pupRate = 1;

function draw(data){
  canvas.clearRect(0, 0, 500, 500);
  canvas.strokeStyle = "#000000";
  for(var i = data.length - 1; i > -1; i--){
    if(data[i].room != currentRoom)
      continue;

    if(data[i].blocks != null){

      if(powerupBlur == 0)
        dPupBlur = 1;
      if(powerupBlur == pupMax)
        dPupBlur = -1;

      powerupBlur += pupRate * dPupBlur;

      //canvas.drawImage(ring_borders_img, 0, 0);
      for(var k in data[i].powerups){
        canvas.shadowBlur = powerupBlur;
        canvas.shadowColor = data[i].powerups[k].color;
        canvas.fillStyle = data[i].powerups[k].color;
        canvas.fillRect(data[i].powerups[k].x, data[i].powerups[k].y, data[i].powerups[k].width, data[i].powerups[k].height);
        canvas.strokeRect(data[i].powerups[k].x, data[i].powerups[k].y, data[i].powerups[k].width, data[i].powerups[k].height);
      }

      canvas.shadowBlur = 0;


      for(var k in data[i].bullets){
        canvas.fillStyle = data[i].bullets[k].color;
        canvas.strokeStyle = data[i].bullets[k].color;
        canvas.globalAlpha = 0.3;
        canvas.lineWidth = data[i].bullets[k].width;
        canvas.beginPath();
        canvas.moveTo(data[i].bullets[k].lastX + data[i].bullets[k].width / 2, data[i].bullets[k].lastY + data[i].bullets[k].height / 2);
        canvas.lineTo(data[i].bullets[k].x + data[i].bullets[k].width / 2, data[i].bullets[k].y + data[i].bullets[k].height / 2);
        canvas.stroke();
        canvas.globalAlpha = 1;
        canvas.lineWidth = 1;
        canvas.strokeStyle = "black";
        canvas.fillRect(data[i].bullets[k].x, data[i].bullets[k].y, data[i].bullets[k].width, data[i].bullets[k].height);
        canvas.strokeRect(data[i].bullets[k].x, data[i].bullets[k].y, data[i].bullets[k].width, data[i].bullets[k].height);
      }

      for(var k = 0; k < data[i].blocks.length; k++){
        //canvas.drawImage(block_img, data[i].blocks[k].x, data[i].blocks[k].y);

        canvas.fillStyle = data[i].blocks[k].color;
        canvas.lineWidth = 3;
        canvas.fillRect(data[i].blocks[k].x, data[i].blocks[k].y, 20, 20);
        canvas.strokeRect(data[i].blocks[k].x, data[i].blocks[k].y, 20, 20);
        canvas.lineWidth = 1;
      }
    }

    for(var k in data[i].playerPowerups){
      if(data[i].playerPowerups[k] == 2){
        canvas.fillStyle = "DarkSlateGrey";
        canvas.fillRect(data[i].x - 5, data[i].y - 5, 30, 30);
      }
    }

    canvas.fillStyle = data[i].color;
    canvas.fillRect(data[i].x, data[i].y, 20, 20);
    canvas.fillText(data[i].name, data[i].x + 10, data[i].y - 15);
    canvas.strokeRect(data[i].x, data[i].y, 20, 20);

    canvas.fillStyle = "#FF0000";
    canvas.strokeStyle = "#000000";
    canvas.fillRect(data[i].x - 10, data[i].y - 10, 40, 5);
    canvas.strokeRect(data[i].x - 10, data[i].y - 10, 40, 5);
    canvas.fillStyle = "#00FF00";
    canvas.fillRect(data[i].x - 10, data[i].y - 10, 40 * (data[i].hp / data[i].maxHp), 5);
    canvas.strokeRect(data[i].x - 10, data[i].y - 10, 40 * (data[i].hp / data[i].maxHp), 5);

  }
}
