import { AnimatePresence, motion } from "motion/react";
import { User } from "../type";
import { useTableStateStore } from "../store/tableStateStore";
import { useGameStateStore } from "../store/gameStateStore";
import { PCOLOR } from "../constant";

interface PlayerTurnIndicatorProps {
  users: User[];
}
export default function PlayerTurnIndicator({
  users,
}: PlayerTurnIndicatorProps) {
  const { turn } = useGameStateStore();
  const { tableState } = useTableStateStore();
  return (
    <AnimatePresence mode="wait">
      {users[turn - 1] && tableState === "start" && (
        <motion.div
          key={users[turn - 1].displayName} 
          style={{ color: PCOLOR[turn - 1] }}
          initial={{ x: 10, opacity: 0, translateX: "-50%", left: "50%" }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -10, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="absolute bottom-10 font-pixelify font-bold opacity-80 transition-colors"
        >
          {users[turn - 1].displayName}
          <span className="text-white/80"> Turn</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
