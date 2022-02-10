import type Player from "../player";
import PowerUpBlock from "./power_up_block";

export default interface PowerUp extends PowerUpBlock {
  turnOnEffectFor: (player: Player, time: number) => void;
}
