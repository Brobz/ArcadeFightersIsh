import type {Db} from 'mongodb';
import {PLAYER_LIST} from './global_data';
import {emitRoomUpdateSignal} from "./socket";

interface PlayerTemplate {
  player: string;
}
interface ChangeColor extends PlayerTemplate {
  attribute: 'color';
  value: string;
}
type ChangePlayerAttribute = ChangeColor;

export async function changePlayerAttribute(
  data: ChangePlayerAttribute,
  db: Db
) {
  const {player, attribute, value} = data
  if (attribute == 'color') {
    PLAYER_LIST[player].setColor(value);
  }
  emitRoomUpdateSignal();
  const query = {username: player};
  const newValue = {$set: {[attribute]: value}};
  await db.collection('accounts').updateOne(query, newValue);
}
