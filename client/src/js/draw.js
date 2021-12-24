const canvas = canvasElement.getContext("2d");
canvas.font = "15px Monaco";
canvas.textAlign = 'center';
canvas.scale(1.25, 1.25);
let powerupBlur = 0;
var dPupBlur = 1;
var pupMax = 60;
var pupRate = 1;

function drawEndgameText(data){
  if (data.winner == "Team 1") canvas.fillStyle = "#0096FF";
  else canvas.fillStyle = "#ff6961";
  canvas.font = "25px monospace";
  canvas.fillText(data.winner + " is victorious!", 200, 200);
}

function drawPowerUps(data) {
  if(powerupBlur == 0)
    dPupBlur = 1;
  if(powerupBlur == pupMax)
    dPupBlur = -1;
  powerupBlur += pupRate * dPupBlur;

  for(const powerUp of data.powerups) {
    canvas.shadowBlur = powerupBlur;
    canvas.shadowColor = powerUp.color;
    canvas.fillStyle = powerUp.color;
    canvas.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    canvas.strokeRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
  }

  canvas.shadowBlur = 0;
}

function drawBullets(data) {
  for(const bullet of data.bullets){
    canvas.fillStyle = bullet.color;
    canvas.strokeStyle = bullet.color;
    canvas.globalAlpha = 0.3;
    canvas.lineWidth = bullet.width;
    canvas.beginPath();
    canvas.moveTo(bullet.lastX + bullet.width / 2, bullet.lastY + bullet.height / 2);
    canvas.lineTo(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
    canvas.stroke();
    canvas.globalAlpha = 1;
    canvas.lineWidth = 1;
    canvas.strokeStyle = "black";
    canvas.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    canvas.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

function drawBlocks(data) {
  for(const block of data.blocks){
    canvas.fillStyle = block.color;
    canvas.lineWidth = 3;
    canvas.fillRect(block.x, block.y, block.width, block.height);
    canvas.strokeRect(block.x, block.y, block.width, block.height);
    canvas.lineWidth = 1;
  }
}

function drawPlayer(data) {
  if(data.hasShield) {
    canvas.fillStyle = "DarkSlateGrey";
    canvas.fillRect(data.x - 5, data.y - 5, data.width + 10, data.height + 10);
  }
  canvas.fillStyle = data.color;
  canvas.fillRect(data.x, data.y, data.width, data.height);
  canvas.fillText(data.name, data.x + 10, data.y - 15);
  canvas.strokeRect(data.x, data.y, data.width, data.height);

  if(data.teamBased){
    canvas.fillStyle = TEAM_COLORS[data.team];
    canvas.fillRect(data.x + 4, data.y + 4, 12, 12);
    canvas.strokeRect(data.x + 4, data.y + 4, 12, 12);
  }

  canvas.fillStyle = "#FF0000";
  canvas.strokeStyle = "#000000";
  canvas.fillRect(data.x - 10, data.y - 10, 40, 5);
  canvas.strokeRect(data.x - 10, data.y - 10, 40, 5);
  canvas.fillStyle = "#00FF00";
  canvas.fillRect(data.x - 10, data.y - 10, 40 * (data.hp / data.maxHp), 5);
  canvas.strokeRect(data.x - 10, data.y - 10, 40 * (data.hp / data.maxHp), 5);
}

function draw(data) {
  canvas.font = "10px monospace";
  canvas.clearRect(0, 0, 500, 500);
  canvas.strokeStyle = "#000000";
  drawPowerUps(data);
  drawBullets(data);
  drawBlocks(data);
  data.playersData.forEach(drawPlayer);
}
