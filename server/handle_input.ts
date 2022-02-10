import {PLAYER_LIST} from "./global_data";
import Player from "./models/player";

enum KeyEvent {
  D = 'd',
  S = 's',
  A = 'a',
  W = 'w',
  SHOOT_0 = 'shoot0',
  SHOOT_1 = 'shoot1',
  SHOOT_2 = 'shoot2',
  SHOOT_3 = 'shoot3',
}

interface Data {
  input: KeyEvent[];
  state: boolean;
}

function handleInput(value: KeyEvent, state: boolean, player: Player) {
  switch(value) {
    case KeyEvent.A:
      player.isMovingLeft = state;
      break;
    case KeyEvent.W:
      player.isMovingUp = state;
      break;
    case KeyEvent.S:
      player.isMovingDown = state;
      break;
    case KeyEvent.D:
      player.isMovingRight = state;
      break;
    case KeyEvent.SHOOT_0:
      player.isShootingLeft = state;
      break;
    case KeyEvent.SHOOT_1:
      player.isShootingUp = state;
      break;
    case KeyEvent.SHOOT_2:
      player.isShootingRight = state;
      break;
    case KeyEvent.SHOOT_3:
      player.isShootingDown = state;
      break;
  }
}

export function getKeyInput(id: string, data: Data){
  const playerExists = id in PLAYER_LIST;
  if(!playerExists) return;

  for (const value of data.input) {
    handleInput(value, data.state, PLAYER_LIST[id]);
  }
}
