import { AnimatePresence, motion } from "motion/react";
import { User } from "../type";
import { useGameStateStore } from "../store/gameStateStore";
import { PCOLOR } from "../constant";
import { sendStartMessageToServer } from "../utils/sendToServerGameMessage";
import { PiCopy } from "react-icons/pi";
import { useEffect, useState } from "react";
interface StartButtonProps {
  users: User[];
  ws: WebSocket | null;
  roomUrl?: string;
}
export default function StartButton({ users, ws, roomUrl }: StartButtonProps) {
  const { currentState } = useGameStateStore();
  const inviteUrl = `http://localhost:5173/ws/${roomUrl}`;
  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (!isCopied) return;
    const timeout = setTimeout(() => {
      setIsCopied(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isCopied]);

  const handleCopyUrl = async () => {
    if (isCopied) {
      setIsCopied(false);
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
    } catch (error) {
      console.log("Failed to copy:", error);
    }
  };
  return (
    <div className="font-silk absolute z-[51] -translate-y-1/2 flex flex-col items-end gap-y-1 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={isCopied ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
        className="text-[12px] bg-black text-white px-1"
      >
        url copied!
      </motion.div>
      <div className="flex flex-row justify-between w-full bg--500 -mb-2">
        <div className="flex flex-row gap-x-1 items-center">
          <AnimatePresence mode="popLayout">
            {users.map((user, index) => (
              <motion.div
                key={user.displayName ?? index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
                style={{ backgroundColor: PCOLOR[user.order - 1] }}
                className="w-2 h-2"
              />
            ))}
          </AnimatePresence>
        </div>
        <div className="text-sm font-mono text-gray-400 flex flex-row items-center gap-x-1">
          Join code: {roomUrl}
          <button onClick={handleCopyUrl}>
            <PiCopy color="black" className="hover:bg-gray-400 rounded-full" />
          </button>
        </div>
      </div>

      <div className=" text-gray-700 text-sm w-[220px]">
        {users.length}/4 players in the room
      </div>
      <motion.button
        whileTap={{ y: 2 }}
        onClick={() => sendStartMessageToServer(ws)}
        disabled={users.length <= 1}
        className="bg-black px-2 mt-3 text-white/80 group hover:cursor-pointer relative w-[72px] h-6 flex flex-row overflow-hidden rounded-sm"
      >
        <div className="z-20">start</div>
        <div className="bg-deepred h-6 w-[72px] absolute -right-[72px] z-10 group-hover:-translate-x-[72px] transition-transform" />
      </motion.button>
      <motion.button
        whileTap={{ y: 2 }}
        className="bg-black px-2 text-white/80 group hover:cursor-pointer relative w-[140px] h-6 flex flex-row overflow-hidden rounded-sm"
      >
        <div className="z-20">how to play</div>
        <div className="bg-cyan-500 h-6 w-[140px] absolute -right-[140px] z-10 group-hover:-translate-x-[140px] transition-transform" />
      </motion.button>
    </div>
  );
}
