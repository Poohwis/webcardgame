import { useEffect, useState } from "react";
import { PCOLOR } from "../constant";
import c from "../assets/svg/c.png";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useGameStateStore } from "../store/gameStateStore";
import { sendResetMessageToServer } from "../utils/sendToServerGameMessage";
import { User } from "../type";

interface GameEndModalProps {
  ws: WebSocket | null;
  users: User[];
}
interface ResultList {
  displayName: string;
  order: number;
  score: number;
}
type ModalMode = "closed" | "showGameResult" | "showDisconnected";
export default function GameEndModal({ ws, users }: GameEndModalProps) {
  const navigate = useNavigate();
  const { gameResult } = useGameStateStore();
  const { currentState } = useGameStateStore();
  const [resultList, setResultList] = useState<ResultList[]>([]);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");

  useEffect(() => {
    if (currentState === "initial") {
      setModalMode("closed");
      return;
    }
    if (modalMode === "showGameResult") return;
    if (gameResult[0] === -1) {
      setModalMode("showDisconnected");
      return;
    }
    if (gameResult.length > 1) {
      setModalMode("showGameResult");
      const list = users.map((user) => ({
        displayName: user.displayName,
        score: gameResult[user.order - 1] || 0,
        order: user.order,
      }));
      list.sort((a, b) => b.score - a.score);
      setResultList(list);
    } else {
      setModalMode("closed");
      setResultList([]);
    }
  }, [gameResult]);

  return (
    <>
      {modalMode !== "closed" && (
        <div className="absolute flex items-center justify-center w-full h-full bg-stone-500/80 z-[52]">
          <div
            className="flex items-center justify-center flex-col w-[400px] h-[340px] bg-gradient-to-t from-lime-200 to-darkgreen
           z-[53] rounded-3xl text-black shadow-md shadow-gray-800 mx-2"
          >
            <div className="relative">
              <motion.div
                initial={{ y: 20, scale: 2 }}
                whileInView={{ y: 0, scale: 1 }}
                className="relative font-silk text-2xl bg-black text-white px-2 rounded-sm"
              >
                Game Ended
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="absolute w-full h-8 bg-darkgreen top-2 -z-10 left-2 rounded-sm"
              />
            </div>
            {modalMode === "showGameResult" && (
              <div className=" font-pixelify flex flex-col w-[70%] h-[124px]  text-lg mt-8 relative gap-y-1">
                {resultList.map((player, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.15 }}
                    className="flex justify-between flex-row w-full items-center text-white/80"
                  >
                    <div className="flex flex-row items-center gap-x-1">
                      <div
                        style={{ backgroundColor: PCOLOR[player.order - 1] }}
                        className="w-3 h-3  border-white/50 border-2 rounded-sm"
                      />
                      {player.displayName}
                    </div>
                    <div className="flex flex-row">{player.score} pt.</div>
                    {index == 0 && (
                      <img
                        src={c}
                        alt="winner"
                        className="absolute w-[20px] -right-7"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
            {modalMode === "showDisconnected" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="h-[124px] flex items-center font-pixelify
                text-white/80 text-balance text-center mt-8  w-[70%] rounded-md"
              >
                All other players have disconnected.
              </motion.div>
            )}

            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-row justify-evenly w-[70%] font-pixelify text-lg mt-10"
            >
              <motion.button
                whileTap={{ y: 2 }}
                onClick={() => {
                  sendResetMessageToServer(ws);
                }}
                className="hover:brightness-125 bg-black px-2 rounded-md text-white/80 flex flex-row items-center gap-x-1"
              >
                Play again
              </motion.button>
              <motion.button
                onClick={() => {
                  navigate("/");
                }}
                whileTap={{ y: 2 }}
                className="hover:brightness-125 bg-black px-2 rounded-md text-white/80 w-28"
              >
                Exit
              </motion.button>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}
