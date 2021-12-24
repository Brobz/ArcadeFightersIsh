import Block from "./block";

export default class WallBlock extends Block {
  constructor(pos: Position) {
    super(pos, [20, 20], "#100074");
  }
}
