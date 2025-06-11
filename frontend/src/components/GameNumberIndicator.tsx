import { AnimatePresence, motion } from "motion/react";
import { useGameStateStore } from "../store/gameStateStore";
import { useTableStateStore } from "../store/tableStateStore";
import { useEffect, useState } from "react";

export default function GameNumberIndicator() {
  const { gameNumber, round, endGameScore } = useGameStateStore();
  const { tableState } = useTableStateStore();
  const [isGameNumberShow, setIsGameNumberShow] = useState(false);

  useEffect(() => {
    if (tableState === "start") {
      setIsGameNumberShow(true);
    }
    if (tableState === "initial") {
      setIsGameNumberShow(false);
    }
  }, [tableState]);
  return (
    <motion.div
      className="flex flex-col items-center justify-center absolute top-0 left-[50%] -translate-x-[50%] font-silk 
              text-white/80 transition-transform"
    >
      <motion.div
        initial={{ y: -55 }}
        animate={isGameNumberShow ? { y: -10 } : { y: -55 }}
        className="bg-gray-700 px-4 pt-3 rounded-b-lg w-[240px] h-[55px] flex items-center justify-center"
      >
        <div className="flex flex-col items-center text-sm gap-y-1 -mt-2">
          <div className="flex flex-row justify-around w-full">
            <div className="flex items-center">
              <span>GAME:&nbsp;</span>
            </div>

            <div className="flex items-center w-[2ch] justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={gameNumber}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="inline-block"
                >
                  {gameNumber}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="flex items-center">
              <span>&nbsp;| round:&nbsp;</span>
            </div>

            <div className="flex items-center w-[2ch] justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={round}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="inline-block"
                >
                  {round}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          <div className="text-[12px] bg-lime-200 rounded-full text-gray-800 px-2 h-4 flex flex-row">
            winning score: {endGameScore}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
