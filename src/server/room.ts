import Player from './player';
import Block from './block';
import Bullet from './bullet';
import PowerUp from './powerup';

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
    this.winner = undefined;
    for(const i in this.players){
      this.players[i].x = this.playerPositions[i][0];
      this.players[i].y = this.playerPositions[i][1];
      this.players[i].hp = this.players[i].maxHp;
      this.players[i].alive = true;
      this.players[i].powerUpsTime = [];
      this.players[i].powerUpsActive = [];
      this.players[i].shootingDelay = 8;
      this.players[i].speed = 2;
      this.players[i].hasClusterGun = false;
      this.players[i].bulletSize = 7;
      this.players[i].bulletDmg = 5;
      this.players[i].hasShield = false;
      this.players[i].hasMultigun = false;
    }
  }

  updateInfo = () => {
    if (String(this.teamBased).toLowerCase() == "true")
      this.info = "Mode= TDM";
    else
      this.info = "Mode= FFA";

    this.info += "<br> Players= " + this.players.length + " / " + this.maxSize;

    if (this.players.length >= this.minSize)
      this.info += '<br> <span class="text-success"> Game ready to start!</span>';
    else
      this.info += '<br><span class="text-danger">(' + (this.minSize - this.players.length) + ' more player needed for game start)</span>';
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
    this.minSize = this.maxSize / 2 + 1;
    for(const i in this.players) {
      if(parseInt(i) < this.maxSize / 2){
        this.players[i].team = 1;
      } else {
        this.players[i].team = 2;
      }
    }
  }

  updateFreeForAll = () => {
    this.minSize = 2;
    for(const i in this.players) {
      this.players[i].team = parseInt(i) + 1;
    }
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
    let playersAlive = 0
    let playerName: string;
    for(const player of this.players){
      if (!player.alive) {
        continue;
      }
      playersAlive += 1;
      playerName = player.name;
    }
    if(playersAlive == 1){
      this.winner = playerName;
      return true;
    }
    return false;
  }

  setMaxSize = (maxSize: number) => {
    this.maxSize = maxSize;
  }

  setTeamBased = (teamBased: boolean) => {
    this.teamBased = teamBased;
  }
}
