import UserList from "./UserList";
import UserNameEditButton from "./UserNameEditButton";
import { User } from "../type";

interface UserPanel {
  users: User[];
  displayName: string;
  order : number
  handleSendNameChange: () => void;
}
export default function UserPanel({
  users,
  displayName,
  order,
  handleSendNameChange,
}: UserPanel) {
  return (
    <div className="font-nippo relative flex flex-row w-full justify-center bg-red-500">
      <UserNameEditButton
        order={order}
        displayName={displayName}
        handleSendNameChange={handleSendNameChange}
      />
      <UserList users={users} />
      <div className="flex-1 sm:flex hidden"></div>
      {/* <UserStatusButton users={users} ws={ws}  /> */}
    </div>
  );
}
