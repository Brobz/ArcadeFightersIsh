import type Player from "../player";
import ActivePowerUp from "./active_power_up";
import {PowerUpType} from "./power_up_type";

export default class AvoidBlocks extends ActivePowerUp{
  originalSpeed: number;

  constructor(pos: Position) {
    super(pos, 'Orange', PowerUpType.AVOID_BLOCKS);
  }

  turnOnEffectFor = (player: Player, time: number) => {
    this.setValues(player, time);
    player.shootThroughBlocks = true;
  }

  setOriginal = () => {
    this.player.shootThroughBlocks = false;
  }
}
