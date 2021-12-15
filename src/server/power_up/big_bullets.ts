import type Player from "../player";
import ActivePowerUp from "./active_power_up";
import {PowerUpType} from "./power_up_type";

export default class BigBullets extends ActivePowerUp {
  originalBulletDmg: number;
  originalBulletSize: number;

  constructor(pos: Position) {
    super(pos, 'DarkMagenta', PowerUpType.BIG_BULLETS);
  }

  turnOnEffectFor = (player: Player, time: number) => {
    super.turnOnEffectFor(player, time);
    this.originalBulletDmg = player.bulletDmg;
    this.originalBulletSize = player.bulletSize;
    player.bulletSize = 10;
    const increasedDamage = (Math.random() * 2) + 3;
    player.bulletDmg += increasedDamage; // Range of values: (7, 9)
  }

  setOriginal = () => {
    this.player.bulletSize = this.originalBulletSize;
    this.player.bulletDmg = this.originalBulletDmg;
  }
}
