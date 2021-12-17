import type Room from './server/room';

import {AVAILABLE_POWER_UPS} from './server/power_up';
import {emitRoomUpdateSignal} from './socket';
import {ROOM_LIST, SOCKET_LIST} from './global_data';
import Player from './server/player';

const POWER_UP_DELAY = 60 * 7;
const TEAM_COLORS = [undefined, "#0096FF", "#ff6961"];

let TIME_UNTIL_NEXT_POWER_UP = POWER_UP_DELAY;

function finishGameForRoom(room: Room) {
  room.showEndOfGame();
  setTimeout(() => {
    room.finishGame();
    emitRoomUpdateSignal();
  }, 3000);
}

function checkForGameEnd(){
  for (const room of Object.values(ROOM_LIST)) {
    if(!room.inGame) {
      continue
    };
    const thereIsAWinner = room.checkForWin();
    if (!thereIsAWinner) {
      continue;
    }
    finishGameForRoom(room);
  }
}

function shoot(player: Player, room: Room){
  if (!player.isShooting()) {
    return;
  }
  const bulletColor = room.teamBased ?
    TEAM_COLORS[player.team]:
    player.color;
  room.bullets.push(player.createBullet(bulletColor));
  if (!player.hasMultigun) {
    return;
  }

  const createBullet = (dir: number) => player.createBullet(bulletColor, dir);
  if(player.isShootingUp || player.isShootingLeft){
    room.bullets.push(createBullet(4));
  }
  else {
    room.bullets.push(createBullet(5));
  }
  if(player.isShootingUp || player.isShootingRight){
    room.bullets.push(createBullet(6));
  }
  else {
    room.bullets.push(createBullet(7));
  }
}

function createPowerUp(room: Room) {
  let pUP;
  do {
    const x = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    const y = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    const type = Math.floor(Math.random() * (AVAILABLE_POWER_UPS.length));
    pUP = new AVAILABLE_POWER_UPS[type]([x, y])
  } while (!room.collidesWithBlocks(pUP));
  room.powerups.push(pUP);
  TIME_UNTIL_NEXT_POWER_UP = POWER_UP_DELAY;
}

function processPowerUps(room: Room){
  TIME_UNTIL_NEXT_POWER_UP -= 1;

  if(TIME_UNTIL_NEXT_POWER_UP <= 0) {
    createPowerUp(room);
  }
  room.processPowerUps();
}

function updateRoomBullets(room: Room) {
  for(let j = room.bullets.length - 1; j > -1; j--){
    const b = room.bullets[j];
    b.updatePosition();
    if(b.isChild && !b.hasShrinked) {
      b.shrink();
    }
    const objectCollided = room.getObjectCollidedWithBullet(b);
    if (objectCollided == null) {
      continue;
    }
    if (objectCollided instanceof Player && !objectCollided.hasShield) {
      objectCollided.hp -= b.dmg;
    } else if (b.isCluster) {
      for(let dir = 0; dir < 8; dir++) {
        room.bullets.push(b.createClusterBullet(dir));
      }
    }
    room.bullets.splice(j, 1);
  }
}

function updateGame() {
  for(const i in ROOM_LIST) {
    const room = ROOM_LIST[i];
    if (room.players.length <= 0){
      delete ROOM_LIST[i];
      continue;
    }
    if (!room.inGame) {
      continue;
    }
    processPowerUps(room);
    updateRoomBullets(room);
    const playersData = [];
    for(const p of room.players){
      p.updateState();
      p.updatePowerUps();
      if(!p.alive) continue;
      p.updatePosition(room.blocks);
      shoot(p, room);
      playersData.push({
        name: p.name,
        x: p.x,
        y: p.y,
        hp: p.hp,
        maxHp: p.maxHp,
        color: p.color,
        team: p.team,
        teamBased: room.teamBased,
        hasShield: p.hasShield,
      });
    }
    const information = {
      bullets: room.bullets,
      blocks: room.blocks,
      powerups: room.powerups,
      winner: room.winner,
      playersData,
    };
    for(const player of room.players){
      SOCKET_LIST[player.id].emit("update", information);
    }
  }
}

export default function update(){
  checkForGameEnd();
  updateGame();
}
