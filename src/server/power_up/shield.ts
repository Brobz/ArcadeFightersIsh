import type Player from "../player";
import ActivePowerUp from "./active_power_up";
import {PowerUpType} from "./power_up_type";

export default class Shield extends ActivePowerUp{
  constructor(pos: Position) {
    super(pos, 'DarkSlateGrey', PowerUpType.SHIELD);
  }

  turnOnEffectFor = (player: Player, time: number) => {
    this.setValues(player, time);
    player.hasShield = true;
  }

  setOriginal = () => {
    this.player.hasShield = false;
  }
}
