import { motion } from "motion/react";
import { User } from "../type";
import { PCOLOR } from "../constant";

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

const UserButton = ({ name, color }: { name: string; color: string }) => {
  return (
    <div
      key={name}
      className="flex flex-col flex-1 items-center gap-x-4 hover:cursor-default transition-transform"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ background: color, borderColor: color }}
        className="sm:hidden border-2 text-white/80 rounded-full px-2 w-8 h-8 flex items-center justify-center text-center text-nowrap"
      >
        {name.split("")[0]}
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ background: color, borderColor: color }}
        className={`hidden sm:flex border-2 text-white/80 rounded-full px-2 text-center text-nowrap`}
      >
        {name}
      </motion.div>
    </div>
  );
};
