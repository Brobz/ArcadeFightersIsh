import type Player from "../player";
import ActivePowerUp from "./active_power_up";
import {PowerUpType} from "./power_up_type";

export default class Speed extends ActivePowerUp{
  originalSpeed: number;

  constructor(pos: Position) {
    super(pos, 'Red', PowerUpType.SPEED);
  }

  turnOnEffectFor = (player: Player, time: number) => {
    this.setValues(player, time);
    this.originalSpeed = player.speed;
    player.speed *= (1 + Math.random());
  }

  setOriginal = () => {
    this.player.speed = this.originalSpeed;
  }
}
