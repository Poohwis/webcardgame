import { AnimatePresence, motion } from "motion/react";
import { User } from "../type";
import { useGameStateStore } from "../store/gameStateStore";
import { PCOLOR } from "../constant";
import { sendStartMessageToServer } from "../utils/sendToServerGameMessage";
import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { useTableStateStore } from "../store/tableStateStore";
import { GoLink } from "react-icons/go";
import InviteButton from "./InviteButton";
import { CLIENT_LINK } from "../link";
interface StartGameMenuProps {
  users: User[];
  ws: WebSocket | null;
  roomUrl?: string;
}
export default function StartGameMenu({
  users,
  ws,
  roomUrl,
}: StartGameMenuProps) {
  const { currentState } = useGameStateStore();
  const inviteUrl = `${CLIENT_LINK}room/${roomUrl}`;
  const [isUrlCopied, setIsUrlCopied] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState("");
  const [endGameScore, setEndGameScore] = useState(2);
  const { setTableState } = useTableStateStore();
  useEffect(() => {
    // if (!isUrlCopied ) return;
    const timeout = setTimeout(() => {
      setIsUrlCopied(false);
      setIsCodeCopied(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isUrlCopied, isCodeCopied]);

  const handleCopyUrl = async () => {
    setCopiedMessage("Url");
    if (isUrlCopied) {
      setIsUrlCopied(false);
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsUrlCopied(true);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  const handleCopyCode = async () => {
    setCopiedMessage("Code");
    if (isCodeCopied) {
      setIsCodeCopied(false);
      return;
    }
    try {
      await navigator.clipboard.writeText(roomUrl!);
      setIsCodeCopied(true);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const [isGoRight, setIsGoRight] = useState(false);
  const handleIncreaseWinScore = () => {
    if (endGameScore >= 10) return;
    setIsGoRight(false);
    setEndGameScore(endGameScore + 1);
  };
  const handleDecreaseWinScore = () => {
    if (endGameScore <= 2) return;
    setIsGoRight(true);
    setEndGameScore(endGameScore - 1);
  };
  const ref = useRef<HTMLDivElement>(null);

  const [bottom, setBottom] = useState(0);
  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setBottom(rect.bottom);
    }
  });
  return (
    <>
      <AnimatePresence>
        {currentState === "initial" && (
          <>
            <motion.div
              ref={ref}
              style={{ translateY: "-3%" }}
              exit={{ scale: 0 }}
              onAnimationComplete={() => setTableState("boardSetupOne")}
              transition={{ delay: 1 }}
              className="fixed translate-x-[50%] font-silk z-[51] flex flex-col items-end gap-y-1 overflow-hidden bg-gray-900/70 shadow-md shadow-black px-4 py-4 rounded-md"
            >
              {/* Gamebanner */}
              <motion.div
                // exit={{ x: 250 }}
                className="relative flex items-center justify-center overflow-hidden bg-red-800 px-1 py-4 text-2xl w-[220px]
            rounded-md text-white h-20"
              >
                {Array.from({ length: 23 }).map((_, index) => (
                  <motion.div
                    key={index}
                    animate={{ width: 230 - index * 10, height: 230 - index * 10, }}
                    transition={{ delay: 0.04 * index }}
                    className={cn(
                      "absolute rounded-full",
                      index % 2 === 0 ? "bg-red-800" : "bg-red-900"
                    )}
                  />
                ))}
                <motion.h1 className="z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-nowrap">
                  Liar's card
                </motion.h1>
              </motion.div>

              {/* Separator */}
              <motion.div
                // exit={{ x: 250 }}
                transition={{ delay: 0.4 }}
                onAnimationComplete={() => setTableState("boardSetupOne")}
                className="h-[2px] w-full bg-gray-700 mt-5"
              />

              {/* Url notice */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={
                  isUrlCopied || isCodeCopied
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 10 }
                }
                className="text-[12px] bg-lime-200 text-black px-1 -z-10"
              >
                {copiedMessage} copied!
              </motion.div>

              {/* Joined symbol */}
              <motion.div
                // exit={{ x: -250 }}
                transition={{ delay: 0.1 }}
                className="flex flex-row justify-between w-full -mb-2"
              >
                <div className="flex flex-row gap-x-1 items-center">
                  <AnimatePresence mode="popLayout">
                    {users.map((user, index) => (
                      <motion.div
                        key={user.displayName ?? index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        // exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ backgroundColor: PCOLOR[user.order - 1] }}
                        className="w-2 h-2"
                      />
                    ))}
                  </AnimatePresence>
                </div>
                <div className="text-sm font-mono text-white/60 flex flex-row items-center gap-x-1">
                  Join code:
                  <button
                    onClick={handleCopyCode}
                    className="text-white hover:underline"
                  >
                    {roomUrl}
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    className="bg-red-800 hover:opacity-80 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <GoLink color="white" />
                  </button>
                </div>
              </motion.div>
              <motion.div
                // exit={{ x: -250 }}
                transition={{ delay: 0.2 }}
                className=" text-white text-sm w-[220px] bg-"
              >
                {users.length}/4 players in the room
              </motion.div>

              <div className="flex flex-row justify-between items-center w-full text-white/60">
                <motion.div
                  // exit={{ x: -250 }}
                  className="relative h-6 mt-3 flex flex-row "
                >
                  <div className="font-silk w-14 text-[12px] leading-3 text-start">
                    winning score
                  </div>
                  <button
                    onClick={handleDecreaseWinScore}
                    className="w-4 h-6 hover:bg-lime-200 ml-2"
                  >
                    {"<"}
                  </button>
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={endGameScore}
                      initial={{ x: isGoRight ? -10 : 10, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      // exit={{ scale: 0 }}
                      className="text-center w-6 text-white"
                    >
                      {endGameScore}
                    </motion.div>
                  </AnimatePresence>
                  <button
                    onClick={handleIncreaseWinScore}
                    className="w-4 h-6 hover:bg-lime-200"
                  >
                    {">"}
                  </button>
                </motion.div>
                <motion.button
                  whileTap={{ y: 2 }}
                  onClick={() => sendStartMessageToServer(ws, endGameScore)}
                  disabled={users.length <= 1}
                  // exit={{ x: 250 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black px-2 mt-3 text-white/80 group hover:cursor-pointer relative w-[72px] h-6 flex flex-row overflow-hidden rounded-sm"
                >
                  <div className="z-20">start</div>
                  <div className="bg-deepred h-6 w-[72px] absolute -right-[72px] z-10 group-hover:-translate-x-[72px] transition-transform" />
                </motion.button>
              </div>

              {/* how to play button */}
              <motion.button
                whileTap={{ y: 2 }}
                // exit={{ x: 250 }}
                transition={{ delay: 0.3 }}
                className="bg-black px-2 text-white/80 group hover:cursor-pointer relative w-[140px] h-6 flex flex-row overflow-hidden rounded-sm"
              >
                <div className="z-20">how to play</div>
                <div className="bg-cyan-500 h-6 w-[140px] absolute -right-[140px] z-10 group-hover:-translate-x-[140px] transition-transform" />
              </motion.button>
            </motion.div>
            <InviteButton
              key={"inviteurl"}
              roomUrl={roomUrl}
              position={bottom}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
