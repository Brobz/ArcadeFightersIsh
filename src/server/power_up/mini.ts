import type Player from "../player";
import ActivePowerUp from "./active_power_up";
import {PowerUpType} from "./power_up_type";

export default class Mini extends ActivePowerUp{
  originalWidth: number;
  originalHeight: number;

  constructor(pos: Position) {
    super(pos, 'Brown', PowerUpType.SPEED);
  }

  turnOnEffectFor = (player: Player, time: number) => {
    this.setValues(player, time);
    this.originalWidth = player.width;
    this.originalHeight = player.height;
    const factor = 1 - Math.random() / 2 // (0.5, 1)
    player.width *= factor;
    player.height *= factor;
  }

  setOriginal = () => {
    this.player.width = this.originalWidth;
    this.player.height = this.originalHeight;
  }
}
