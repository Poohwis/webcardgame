import UserList from "./UserList";
import UserNameEditButton from "./UserNameEditButton";
import { Action, User } from "../type";

interface UserPanel {
  users: User[];
  displayName: string;
  order : number
  dispatch: React.Dispatch<Action>;
  handleSendNameChange: () => void;
}
export default function UserPanel({
  users,
  displayName,
  order,
  dispatch,
  handleSendNameChange,
}: UserPanel) {
  return (
    <div className="font-nippo relative flex flex-row w-full justify-center bg-red-500">
      <UserNameEditButton
        order={order}
        displayName={displayName}
        dispatch={dispatch}
        handleSendNameChange={handleSendNameChange}
      />
      <UserList users={users} />
      <div className="flex-1 sm:flex hidden"></div>
      {/* <UserStatusButton users={users} ws={ws}  /> */}
    </div>
  );
}
