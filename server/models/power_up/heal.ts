import type Player from "../player";
import type PowerUp from "./power_up";
import PowerUpBlock from "./power_up_block";
import {PowerUpType} from "./power_up_type";

export default class Heal extends PowerUpBlock implements PowerUp {
  constructor(pos: Position) {
    super(pos, 'Green', PowerUpType.HEAL);
  }

  turnOnEffectFor = (player: Player, _: number) => {
    player.hp = player.maxHp
  }
}
