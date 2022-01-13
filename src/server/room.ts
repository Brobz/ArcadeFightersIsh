import type Player from './player';
import type Bullet from './bullet';
import type PowerUp from './power_up/power_up';
import type WallBlock from './wall_block';
import type ObstacleBlock from './obstacle_block';
import {SOCKET_LIST} from '../global_data';

type Block = WallBlock | ObstacleBlock;

export default class Room {
  players: Player[] = [];
  bullets: Bullet[] = [];
  blocks: Block[] = [];
  powerups: PowerUp[] = [];
  inGame = false;
  info = "NO ROOM INFO";
  winner: string | null = null;

  roomName: string;
  roomCode: string;
  minSize: number;
  maxSize: number;
  winConditionSize: number;
  teamBased: boolean;
  playerPositions: Position[];

  constructor(
    roomName: string,
    roomCode: string,
    mnS: number,
    mxS: number,
    wcS: number,
    tb: boolean,
    pPos: Position[]) {
    this.roomName = roomName;
    this.roomCode = roomCode;
    this.minSize = mnS;
    this.maxSize = mxS;
    this.winConditionSize = wcS;
    this.teamBased = tb;
    this.playerPositions = pPos;
  }

  reset = () => {
    this.bullets = [];
    this.blocks = [];
    this.powerups = [];
    this.winner = null;
    this.players.forEach((player, index) => {
      player.reset(this.playerPositions[index])
    })
  }

  updateInfo = () => {
    this.info = `Mode: ${this.teamBased ? "TDM" : "FFA"}<br>`;
    this.info += `Players: ${this.players.length} / ${this.maxSize}<br>`;
    const difference = this.minSize - this.players.length;
    if (difference <= 0) {
      this.info += '<span class="text-success"> Game ready to start!</span>';
    } else {
      this.info += `<span class="text-danger">(${difference} more player needed for game start)</span>`;
    }
  }

  removePlayer = (player: Player) => {
    const index = this.players.indexOf(player);
    this.players.splice(index, 1);
    this.updateTeams();
  }

  addPlayer = (player: Player) => {
    this.players.push(player);
    this.updateTeams();
  }

  updateTeamMatch = () => {
    const pivot = this.maxSize / 2;
    this.minSize = pivot + 1;
    this.players.forEach((player, i) => {
      player.team = i < pivot ? 1 : 2;
    })
  }

  updateFreeForAll = () => {
    this.minSize = 2;
    this.players.forEach((player, i) => player.team = i + 1);
  }

  updateTeams = () => {
    if (this.teamBased) {
      this.updateTeamMatch();
    } else {
      this.updateFreeForAll();
    }
    this.updateInfo();
  }

  checkForWin = () => {
    if(this.players.length <= this.winConditionSize) {
      if(this.winConditionSize == 1) {
        this.winner = this.players[this.players.length - 1].name;
        return true;
      }
      const team = this.players[0].team;
      const otherTeam = this.players.find(player => player.team != team);
      if (otherTeam != null) {
        return false;
      }
      this.winner = "Team " + team;
      return true;
    }
    if (this.teamBased) {
      let team1Alive = 0;
      let team2Alive = 0;
      for(const player of this.players){
        if (!player.alive) {
          continue;
        }
        if(player.team == 1){
          team1Alive += 1;
        } else if (player.team == 2){
          team2Alive += 1;
        }
      }
      if(team2Alive == 0){
        this.winner = "Team 1";
        return true;
      } if(team1Alive == 0){
        this.winner = "Team 2";
        return true;
      }
      return false
    }
    const alivePlayers = this.players.filter(player => player.alive);
    if (alivePlayers.length != 1) {
      return false;
    }
    this.winner = alivePlayers[0].name;
    return true;
  }

  setMaxSize = (maxSize: number) => {
    this.maxSize = maxSize;
  }

  setTeamBased = (teamBased: boolean) => {
    this.teamBased = teamBased;
  }

  setPowerUps = (powerUps: PowerUp[]) => {
    this.powerups = powerUps;
  }

  processPowerUps = () => {
    const newPowerUps = this.powerups.filter(powerUp => {
      const collidedPlayer = this.players.find(powerUp.checkForCollision);
      if (collidedPlayer == null) {
        return true;
      }
      collidedPlayer.powerUp(powerUp);
      return false;
    });
    this.setPowerUps(newPowerUps);
  }

  showEndOfGame = () => {
    this.inGame = false;
    this.players.forEach(player => {
      SOCKET_LIST[player.id].emit("drawEndgameText", {winner: this.winner})
    });
  }

  finishGame = () => {
    this.players.forEach(player => {
      SOCKET_LIST[player.id].emit(
        "endGame", {room: this, roomIndex: this.roomName}
      );
    });
    this.reset();
  }

  collidesWithBlocks = <T extends Entity>(entity: T) => (
    this.blocks.some(entity.hasCollided)
  )

  getObjectCollidedWithBullet = (bullet: Bullet) => {
    return this.blocks.find(bullet.checkForCollision) ??
      this.players.find(bullet.checkForCollision);
  }
}
