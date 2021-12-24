import type Player from "../player";
import ActivePowerUp from "./active_power_up";
import {PowerUpType} from "./power_up_type";

export default class MultiGun extends ActivePowerUp{
  constructor(pos: Position) {
    super(pos, 'CornflowerBlue', PowerUpType.MULTI_GUN);
  }

  turnOnEffectFor = (player: Player, time: number) => {
    this.setValues(player, time);
    player.hasMultigun = true;
  }

  setOriginal = () => {
    this.player.hasMultigun = false;
  }
}
