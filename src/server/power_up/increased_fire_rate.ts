import type Player from "../player";
import ActivePowerUp from "./active_power_up";
import {PowerUpType} from "./power_up_type";

export default class IncreasedFireRate extends ActivePowerUp{
  originalShootingDelay: number;

  constructor(pos: Position) {
    super(pos, 'GoldenRod', PowerUpType.INCREASED_FIRE_RATE);
  }

  turnOnEffectFor = (player: Player, time: number) => {
    this.setValues(player, time);
    this.originalShootingDelay = player.shootingDelay
    const reducedDelay = (Math.random() * 2) + 4;
    player.shootingDelay -= reducedDelay; // Range of values: (2, 4)
  }

  setOriginal = () => {
    this.player.shootingDelay = this.originalShootingDelay;
  }
}
