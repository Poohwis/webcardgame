import { User } from "../type";
import { PCOLOR } from "../constant";
import UserButton from "./UserButton";

interface UserListProps {
  users: User[];
}
export default function UserList({ users }: UserListProps) {
  return (
    <div className="text-sm flex flex-row space-x-4">
      {users
        .sort((a, b) => a.order - b.order)
        .map((item) => (
          <UserButton
            name={item.displayName}
            color={PCOLOR[item.order - 1]}
            key={item.displayName}
          />
        ))}
    </div>
  );
}
