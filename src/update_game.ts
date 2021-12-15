import {ROOM_LIST, SOCKET_LIST} from './global_data';
import Bullet from './server/bullet';
import Player from './server/player';
import PowerUp from './server/powerup';
import Room from './server/room';
import {emitRoomUpdateSignal} from './socket';

const POWERUP_DELAY = 60 * 7;
const TEAM_COLORS = [undefined, "#0096FF", "#ff6961"];
const POWERUP_COLORS = ["Green", "Red", "DarkSlateGrey", "GoldenRod", "CornflowerBlue", "DeepPink", "DarkMagenta"];

let TIME_UNTIL_NEXT_POWERUP = POWERUP_DELAY;

function finishGameForRoom(room: Room, i: string) {
  room.inGame = false;
  for(const player of room.players) {
    SOCKET_LIST[player.id].emit("drawEndgameText", {winner: room.winner});
  }
  setTimeout(() => {
    for(const player of room.players){
      SOCKET_LIST[player.id].emit("endGame", {room : room, roomIndex: i});
    }
    room.reset();
    emitRoomUpdateSignal();
  }, 3000);
}

function checkForGameEnd(){
  const currentRooms = Object.values(ROOM_LIST);
  for (const i in currentRooms) {
    const room = currentRooms[i];
    if(!room.inGame) continue;
    const thereIsAWinner = room.checkForWin();
    if (!thereIsAWinner) {
      continue;
    }
    finishGameForRoom(room, i);
  }
}

function getShootingDir(player: Player) {
  if (player.isShootingUp) {
    return 0;
  } if (player.isShootingDown) {
    return 1;
  } if (player.isShootingLeft) {
    return 2;
  } if (player.isShootingRight) {
    return 3;
  }
  return null;
}

function shoot(player: Player, room_id: string){
  const room = ROOM_LIST[room_id];
  const bulletColor = room.teamBased ?
    TEAM_COLORS[player.team] :
    player.color;
  const size: Dimensions = [player.bulletSize, player.bulletSize];
  const pos: Position = [player.x + 7, player.y + 7];
  const dir = getShootingDir(player);
  if (dir == null) {
    return;
  }
  const createBullet = (dir: number) => new Bullet(
    pos,
    size,
    bulletColor,
    player.team,
    dir,
    player.bulletDmg,
    player.hasClusterGun,
    false
  )
  room.bullets.push(createBullet(dir));
  if (!player.hasMultigun) {
    return;
  }

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

function createPowerup(room: Room) {
  let passed = false
  let pUP;
  while(!passed){
    var x = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    var y = Math.floor(Math.random() * (300 - 100 + 1)) + 100;
    var type = Math.floor(Math.random() * (POWERUP_COLORS.length));
    pUP = new PowerUp([x, y], [15, 15], POWERUP_COLORS[type], type);
    const foundElement = room.blocks.find(pUP.checkForCollision);
    passed = foundElement != null;
  }
  room.powerups.push(pUP);
  TIME_UNTIL_NEXT_POWERUP = POWERUP_DELAY;
}

function processPowerups(room_id: string){
  TIME_UNTIL_NEXT_POWERUP -= 1;
  const room = ROOM_LIST[room_id];

  if(TIME_UNTIL_NEXT_POWERUP <= 0) {
    createPowerup(room);
  }

  for(let i = room.powerups.length - 1; i > -1; i--){
    for(let player of room.players) {
      if(!room.powerups[i]) continue;
      if(room.powerups[i].checkForCollision(player)) {
        player.powerUp(room.powerups[i].type);
        room.powerups.splice(i, 1);
      }
    }
  }
}

function updateGame() {
  const infoPack = [];
  for(let i in ROOM_LIST) {
    const room = ROOM_LIST[i];
    if (!room.inGame) {
      continue;
    }
    processPowerups(i);
    loop:
      for(let j = room.bullets.length - 1; j > -1; j--){
      const b = room.bullets[j];
      b.updatePosition();
      for(const k in room.blocks){
        const collider = b.checkForCollision(room.blocks[k]);
        if(collider == null) continue;
        if(b.isCluster) {
          for(let dir = 0; dir < 8; dir++){
            room.bullets.push(new Bullet(
              [b.x, b.y],
              [b.width, b.height],
              b.color,
              b.team,
              dir,
              b.dmg / 1.5,
              false,
              true
            ));
          }
        }
        room.bullets.splice(j, 1);
        continue loop;
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
        continue loop;
      }
    }
    for(const p of room.players){
      p.updateState();
      p.updatePowerUps();
      if(!p.alive) continue;
      p .updatePosition(room.blocks);
      if(p.updateShooting()){
        shoot(p, i);
      }
      infoPack.push({
        name : p.name,
        x : p.x,
        y : p.y,
        hp : p.hp,
        maxHp : p.maxHp,
        playerPowerups : p.powerUpsActive,
        color : p.color,
        room : i,
        team: p.team,
        teamBased: room.teamBased
      });
    }
    infoPack.push({
      bullets : room.bullets,
      blocks : room.blocks,
      powerups : room.powerups,
      room : i,
      winner : room.winner
    });
  }
  return infoPack;
}

export default function update(){
  checkForGameEnd();
  const infoPack = updateGame();
  for(const i in ROOM_LIST){
    const room =  ROOM_LIST[i];
    if (room.players.length <= 0){
      delete ROOM_LIST[i];
      continue;
    }
    if(!room.inGame){
      continue
    }
    for(const player of room.players){
      SOCKET_LIST[player.id].emit("update", infoPack);
    }
  }
}
