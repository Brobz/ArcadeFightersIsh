import type Player from "../player";
import ActivePowerUp from "./active_power_up";
import {PowerUpType} from "./power_up_type";

export default class ClusterGun extends ActivePowerUp{
  constructor(pos: Position) {
    super(pos, 'DeepPink', PowerUpType.CLUSTER_GUN);
  }

  turnOnEffectFor = (player: Player, time: number) => {
    super.turnOnEffectFor(player, time);
    player.hasClusterGun = true;
  }

  setOriginal = () => {
    this.player.hasClusterGun = false;
  }
}
