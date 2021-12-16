import Block from "./block";

export default class ObstacleBlock extends Block {
  constructor(pos: Position) {
    super(pos, [20, 20], "#120074");
  }
}
