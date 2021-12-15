import Player from './server/player';
import Block from './server/block';
import Bullet from './server/bullet';
import PowerUp from './server/powerup';
import Room from './server/room';
import connectToDatabase from './database';
import createServer from './server';
import createIOSocket from './socket';

const db = await connectToDatabase();
const server = createServer();
createIOSocket(server, db);

const POWERUP_DELAY = 60 * 7;
const TEAM_COLORS = [undefined, "#0096FF", "#ff6961"];
const POWERUP_COLORS = ["Green", "Red", "DarkSlateGrey", "GoldenRod", "CornflowerBlue", "DeepPink", "DarkMagenta"];

let TIME_UNTIL_NEXT_POWERUP = POWERUP_DELAY;

function checkForGameEnd(){
  for(var i in ROOM_LIST){
    if(!ROOM_LIST[i].inGame) continue;
    if(ROOM_LIST[i].checkForWin()){
      ROOM_LIST[i].inGame = false;
      for(var k in ROOM_LIST[i].players){
          s = SOCKET_LIST[ROOM_LIST[i].players[k].id];
          s.emit("drawEndgameText", {winner: ROOM_LIST[i].winner});
      }
      setTimeout(() => {
        for(var k in ROOM_LIST[i].players){
            s = SOCKET_LIST[ROOM_LIST[i].players[k].id];
            s.emit("endGame", {room : ROOM_LIST[i], roomIndex: i});
        }
        ROOM_LIST[i].reset();
        emitRoomUpdateSignal();
      }, 3000);
    }
  }
}

function shoot(player, room){
  let bulletColor = (ROOM_LIST[room].teamBased == "true") ? TEAM_COLORS[player.team] : player.color;
  if(player.isShootingUp){
    pos = [player.x + 7, player.y + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(0, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }
  if(player.isShootingDown){
    pos = [player.x + 7, player.y  + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(1, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }
 if(player.isShootingLeft){
    pos = [player.x + 7, player.y + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(2, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }
 if(player.isShootingRight){
    pos = [player.x + 7, player.y + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(3, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }

  if(player.hasMultigun && (player.isShootingUp || player.isShootingLeft)){
    pos = [player.x + 7, player.y + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(4, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }

  if(player.hasMultigun && (player.isShootingDown || player.isShootingRight)){
    pos = [player.x + 7, player.y + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(5, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }

  if(player.hasMultigun && (player.isShootingUp || player.isShootingRight)){
    pos = [player.x + 7, player.y + 7];
    size = [player.bulletSize, player.bulletSize];
    ROOM_LIST[room].bullets.push(new Bullet(6, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }

  if(player.hasMultigun && (player.isShootingDown || player.isShootingLeft)){
    pos = [player.x + 7, player.y + 7];
    size = [7, 7];
    ROOM_LIST[room].bullets.push(new Bullet(7, player.bulletDmg, pos, size, player.team, bulletColor, player.hasClusterGun, false));
  }

}

function createPowerup(room) {
  var passed = false
  var pUP;
  while(!passed){
    var x = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    var y = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    var type = Math.floor(Math.random() * (POWERUP_COLORS.length));
    pUP = new Powerup([x, y], [15, 15], POWERUP_COLORS[type], type);
    const foundElement = room.blocks.find(pUP.checkForCollision);
    passed = foundElement != null;
  }
  room.powerups.push(pUP);
  TIME_UNTIL_NEXT_POWERUP = POWERUP_DELAY;
}

function processPowerups(room_id){
  TIME_UNTIL_NEXT_POWERUP -= 1;
  const room = ROOM_LIST[room_id];

  if(TIME_UNTIL_NEXT_POWERUP <= 0) {
    createPowerup(room);
  }

  for(var i = room.powerups.length - 1; i > -1; i--){
    for(var k in room.players){
      if(!room.powerups[i]) continue;
      if(room.powerups[i].checkForCollision(room.players[k])){
        room.players[k].powerUp(room.powerups[i].type);
        room.powerups.splice(i, 1);
      }
    }
  }
}

function Update(){
  checkForGameEnd();
  var infoPack = [];
  for(var i in ROOM_LIST){
    if(ROOM_LIST[i].inGame){
      processPowerups(i);
      loop:
      for(var j = ROOM_LIST[i].bullets.length - 1; j > -1; j--){
        ROOM_LIST[i].bullets[j].updatePosition();
        for(var k in ROOM_LIST[i].blocks){
          var collider = ROOM_LIST[i].bullets[j].checkForCollision(ROOM_LIST[i].blocks[k]);
          if(collider == null) continue;
          if(ROOM_LIST[i].bullets[j].isCluster){
            var b = ROOM_LIST[i].bullets[j];
            for(var dir = 0; dir < 8; dir++){
              ROOM_LIST[i].bullets.push(new Bullet(dir, b.dmg / 1.5, [b.x, b.y], [b.width, b.height], b.team, b.color, false, true));
            }
          }
          ROOM_LIST[i].bullets.splice(j, 1);
          continue loop;
        }
        if(ROOM_LIST[i].bullets[j].isChild && !ROOM_LIST[i].bullets[j].hasShrinked)
          ROOM_LIST[i].bullets[j].shrink();
        for(var k  = 0; k < ROOM_LIST[i].players.length; k++){
          if(!ROOM_LIST[i].players[k].alive) continue;
          var collider = ROOM_LIST[i].bullets[j].checkForCollision(ROOM_LIST[i].players[k]);
          if(collider == null) continue;
          if(!collider.hasShield)
            collider.hp -= ROOM_LIST[i].bullets[j].dmg;
            ROOM_LIST[i].bullets.splice(j, 1);
            continue loop;
        }
      }
      for(var k = 0; k < ROOM_LIST[i].players.length; k++){
        p = ROOM_LIST[i].players[k];
        p.updateState();
        p.updatePowerUps();
        if(!p.alive) continue;
        p .updatePosition(ROOM_LIST[i].blocks);
        if(p.updateShooting()){
          shoot(p, i);
        }
        infoPack.push(
          {
            name : p.name,
            x : p.x,
            y : p.y,
            hp : p.hp,
            maxHp : p.maxHp,
            playerPowerups : p.powerUpsActive,
            color : p.color,
            room : i,
            team: p.team,
            teamBased: ROOM_LIST[i].teamBased == "true"
          });
      }
      infoPack.push({
        bullets : ROOM_LIST[i].bullets,
        blocks : ROOM_LIST[i].blocks,
        powerups : ROOM_LIST[i].powerups,
        room : i,
        winner : ROOM_LIST[i].winner
      });
    }
  }

  for(var i in ROOM_LIST){
    if (ROOM_LIST[i].players.length <= 0){
      delete ROOM_LIST[i];
      continue;
    }
    if(ROOM_LIST[i].inGame){
      for(var k = 0; k < ROOM_LIST[i].players.length; k++){
        var s = SOCKET_LIST[ROOM_LIST[i].players[k].id];
        s.emit("update", infoPack);
      }
    }
  }


}

setInterval(Update, 1000/60);
