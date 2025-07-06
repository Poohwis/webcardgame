import { AnimatePresence, motion } from "motion/react";
import { User } from "../type";
import { useTableStateStore } from "../store/tableStateStore";
import { useGameStateStore } from "../store/gameStateStore";
import { PCOLOR } from "../constant";
import { useWindowSizeStore } from "../store/windowSizeStateStore";

interface PlayerTurnIndicatorProps {
  users: User[];
}
export default function PlayerTurnIndicator({
  users,
}: PlayerTurnIndicatorProps) {
  const { turn } = useGameStateStore();
  const { tableState } = useTableStateStore();
  const { isSmallWindow, cardContainerPosition } = useWindowSizeStore();

  const currentPlayerIndex = users.findIndex((user) => user.order === turn);
  return (
    <div
      style={{ top: isSmallWindow ? cardContainerPosition - 82 : "" }}
      className="fixed sm:absolute sm:bottom-2 sm:top-auto right-0 sm:right-auto sm:-translate-y-8"
    >
      <AnimatePresence mode="wait">
        {users[currentPlayerIndex] && tableState === "start" && (
          <motion.div
            key={users[currentPlayerIndex].displayName}
            style={{ color: PCOLOR[users[currentPlayerIndex].order - 1] }}
            initial={{ x: isSmallWindow ? 100 : 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isSmallWindow ? 100 : -10, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className=" bg-gray-700 px-2 text-sm sm:text-base sm:rounded-full rounded-l-full font-pixelify font-semibold opacity-80 transition-colors"
          >
            {users[currentPlayerIndex].displayName}
            <span className="text-white/80"> Turn</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
