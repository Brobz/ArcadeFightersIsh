import {ROOM_LIST, SOCKET_LIST} from './global_data';
import Player from './server/player';
import {AVAILABLE_POWER_UPS} from './server/power_up';
import Room from './server/room';
import {emitRoomUpdateSignal} from './socket';

const POWERUP_DELAY = 60 * 7;
const TEAM_COLORS = [undefined, "#0096FF", "#ff6961"];

let TIME_UNTIL_NEXT_POWERUP = POWERUP_DELAY;

function finishGameForRoom(room: Room, i: string) {
  room.inGame = false;
  for(const player of room.players) {
    SOCKET_LIST[player.id].emit("drawEndgameText", {winner: room.winner});
  }
  setTimeout(() => {
    for(const player of room.players){
      SOCKET_LIST[player.id].emit("endGame", {room: room, roomIndex: i});
    }
    room.reset();
    emitRoomUpdateSignal();
  }, 3000);
}

function checkForGameEnd(){
  for (const i in ROOM_LIST) {
    const room = ROOM_LIST[i];
    if(!room.inGame) {
      continue
    };
    const thereIsAWinner = room.checkForWin();
    if (!thereIsAWinner) {
      continue;
    }
    finishGameForRoom(room, i);
  }
}

function getShootingDir(player: Player) {
}

function shoot(player: Player, room_id: string){
  const room = ROOM_LIST[room_id];
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
  if(player.isShootingDown || player.isShootingRight){
    room.bullets.push(createBullet(5));
  }
  if(player.isShootingUp || player.isShootingRight){
    room.bullets.push(createBullet(6));
  }
  if(player.isShootingDown || player.isShootingLeft){
    room.bullets.push(createBullet(7));
  }
}

function createPowerUp(room: Room) {
  let passed = false
  let pUP;
  while(!passed){
    const x = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    const y = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    const type = Math.floor(Math.random() * (AVAILABLE_POWER_UPS.length));
    pUP = new AVAILABLE_POWER_UPS[type]([x, y])
    const foundElement = room.blocks.find(pUP.checkForCollision);
    passed = foundElement == null;
  }
  room.powerups.push(pUP);
  TIME_UNTIL_NEXT_POWERUP = POWERUP_DELAY;
}

function processPowerUps(room_id: string){
  TIME_UNTIL_NEXT_POWERUP -= 1;
  const room = ROOM_LIST[room_id];

  if(TIME_UNTIL_NEXT_POWERUP <= 0) {
    createPowerUp(room);
  }
  room.processPowerUps();
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
    processPowerUps(i);
    for(let j = room.bullets.length - 1; j > -1; j--){
      const b = room.bullets[j];
      b.updatePosition();
      for(const k in room.blocks){
        const collider = b.checkForCollision(room.blocks[k]);
        if(collider == null) continue;
        if(b.isCluster) {
          for(let dir = 0; dir < 8; dir++) {
            room.bullets.push(b.createClusterBullet(dir));
          }
        }
        room.bullets.splice(j, 1);
        continue;
      }
      if(b.isChild && !b.hasShrinked) {
        b.shrink();
      }
      for (const player of room.players) {
        if(!player.alive) {
          continue
        }
        const collider = b.checkForCollision(player);
        if(collider == null) continue;
        if(!collider.hasShield) {
          collider.hp -= b.dmg;
        }
        room.bullets.splice(j, 1);
        continue;
      }
    }
    const playersData = [];
    for(const p of room.players){
      p.updateState();
      p.updatePowerUps();
      if(!p.alive) continue;
      p.updatePosition(room.blocks);
      if(p.updateShooting()){
        shoot(p, i);
      }
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
