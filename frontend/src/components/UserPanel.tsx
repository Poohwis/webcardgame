import UserList from "./UserList";
import UserStatusButton from "./UserStatusButton";
import UserEditButton from "./UserEditButton";
import { Action, User } from "../type";

interface UserPanel {
  users: User[];
  ws : WebSocket | null
  displayName: string;
  order : number
  roomUrl?: string;
  dispatch: React.Dispatch<Action>;
  handleSendNameChange: () => void;
}
export default function UserPanel({
  users,
  ws,
  displayName,
  order,
  roomUrl,
  dispatch,
  handleSendNameChange,
}: UserPanel) {
  return (
    <div className="font-nippo relative flex flex-row w-full justify-center ">
      <UserEditButton
        roomUrl={roomUrl}
        order={order}
        displayName={displayName}
        dispatch={dispatch}
        handleSendNameChange={handleSendNameChange}
      />
      <UserList users={users} />
      <UserStatusButton users={users} ws={ws}  />
    </div>
  );
}
