import { AnimatePresence, motion } from "motion/react";
import { PCOLOR } from "../constant";
import { useGameStateStore } from "../store/gameStateStore";
import { useTableStateStore } from "../store/tableStateStore";
import { User } from "../type";

interface CallResultIndicatorProps {
  users: User[];
}
export default function CallResultIndicator({
  users,
}: CallResultIndicatorProps) {
  const { lastPlayedBy, isCallSuccess, turn } = useGameStateStore();
  const { tableState } = useTableStateStore();
  return (
    <AnimatePresence mode="wait">
      {tableState === "resultUpdate" &&
        users[lastPlayedBy.slice(-1)[0] - 1] && (
          <motion.div
            style={{ left: "50%", translateX: "-50%" }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-10 whitespace-pre-line text-white/80 text-center font-pixelify"
          >
            {isCallSuccess ? (
              <div className="inline-flex flex-col items-center text-center">
                <span style={{ color: PCOLOR[turn - 1] }}>
                  {users[turn - 1].displayName + "'s "}
                  <span className="text-white/80">call on</span>
                </span>
                <span style={{ color: PCOLOR[lastPlayedBy.slice(-1)[0] - 1] }}>
                  {users[lastPlayedBy.slice(-1)[0] - 1].displayName + `\n`}
                </span>
                <div className="px-2 bg-lime-500 rounded-full text-lime-200 ">
                  successfull !
                </div>
              </div>
            ) : (
              <div className="inline-flex flex-col items-center text-center">
                <span style={{ color: PCOLOR[turn - 1] }}>
                  {users[turn - 1].displayName + "'s "}
                  <span className="text-white">call on</span>
                </span>
                <span style={{ color: PCOLOR[lastPlayedBy.slice(-1)[0] - 1] }}>
                  {users[lastPlayedBy.slice(-1)[0] - 1].displayName + `\n`}
                </span>
                <div className="px-2 bg-rose-500 rounded-full text-rose-200">
                  failed !
                </div>
              </div>
            )}
            {/* {`Player1\nsuccessfully called\nPlayer2 !`}
            {`Player1's call on\nPlayer2\n failed.`}  */}
          </motion.div>
        )}
    </AnimatePresence>
  );
}
