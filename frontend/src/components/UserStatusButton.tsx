// may not use this component TODO : Delete
import { User } from "../type";
import { AnimatePresence, motion } from "framer-motion";
import { sendStartMessageToServer } from "../utils/sendToServerGameMessage";
import { useGameStateStore } from "../store/gameStateStore";

interface UserStatusButtonProps {
  users: User[];
  ws: WebSocket | null;
}

export default function UserStatusButton({ users, ws }: UserStatusButtonProps) {
  const {currentState} = useGameStateStore()
  const isGameStart = currentState == "start" 
  return (
    <div className="text-sm flex-col sm:flex hidden flex-1 items-end">
      <AnimatePresence mode="wait">
        {users.length < 4 && (
          <motion.button
            key="waiting"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ x: -5 }}
            exit={{ y: 20, opacity: 0 }}
            className="border-orange border-2 rounded-md text-orange bg- w-[200px] h-full"
          >
            Waiting for people to join the room... {users.length}/4
          </motion.button>
        )}
        {( users.length == 4 && currentState == "initial" ) &&  (
          <motion.button
            key="start"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y:isGameStart ? 20 :0, x: isGameStart ? 0 : 20, opacity: 0 }}
            whileHover={{ opacity: 0.8 }}
            whileTap={{ y: 1 }}
            onClick={() => sendStartMessageToServer(ws, 2)}
            className="border-orange border-2 rounded-md text-white/80 bg-orange w-[200px] h-full"
          >
            Start !!
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
