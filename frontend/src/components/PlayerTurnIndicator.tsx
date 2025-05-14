import { AnimatePresence, motion } from "motion/react";
import { User } from "../type";
import { useTableStateStore } from "../store/tableStateStore";
import { useGameStateStore } from "../store/gameStateStore";
import { PCOLOR } from "../constant";

interface PlayerTurnIndicatorProps {
  users: User[];
  isSmallWindow: boolean
}
export default function PlayerTurnIndicator({
  users,
  isSmallWindow
}: PlayerTurnIndicatorProps) {
  const { turn } = useGameStateStore();
  const { tableState } = useTableStateStore();
  return (
    <div className="fixed sm:absolute sm:bottom-2 sm:top-auto top-[50%] right-0 sm:right-auto -translate-y-8">
      <AnimatePresence mode="wait">
        {users[turn - 1] && tableState === "start" && (
          <motion.div
            key={users[turn - 1].displayName}
            style={{ color: PCOLOR[turn - 1] }}
            initial={{ x:isSmallWindow ? 100: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x:isSmallWindow ? 100 : -10, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className=" bg-gray-700 px-2 text-sm sm:text-base sm:rounded-full rounded-l-full font-pixelify font-semibold opacity-80 transition-colors"
          >
            {users[turn - 1].displayName}
            <span className="text-white/80"> Turn</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
