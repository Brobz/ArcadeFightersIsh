import type Player from "../player";
import type PowerUp from "./power_up";
import PowerUpBlock from "./power_up_block";

export default class ActivePowerUp extends PowerUpBlock implements PowerUp {
  player: Player;
  time: number;

  setValues = (player: Player, time: number) => {
    this.player = player;
    this.time = time;
  }

  turnOnEffectFor = (player: Player, time: number) => {}

  setOriginal = () => {}

  updatePowerUp = () => {
    this.time--;
    if (this.time > 0) {
      return true;
    }
    this.setOriginal()
    return false;
  };
}
