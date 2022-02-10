import {ROOM_LIST} from "./global_data";
import {emitRoomUpdateSignal} from "./room_management";

interface RoomTemplate {
  room: string;
}
interface ChangeRoomMaxSize extends RoomTemplate {
  setting: 'maxSize';
  value: number;
}
interface ChangeRoomTeamBase extends RoomTemplate {
  setting: 'teamBased';
  value: boolean;
}
type ChangeRoomSettingsData = ChangeRoomMaxSize | ChangeRoomTeamBase;

export function changeRoomSettings(data: ChangeRoomSettingsData){
  const room = ROOM_LIST[data.room]

  if (data.setting == 'maxSize')
    room.setMaxSize(data.value);
  else if (data.setting == 'teamBased')
    room.setTeamBased(data.value);

  room.updateTeams();
  room.updateInfo();
  emitRoomUpdateSignal();
}
