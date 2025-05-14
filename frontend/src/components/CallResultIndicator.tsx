import { AnimatePresence, motion } from "motion/react";
import { PCOLOR } from "../constant";
import { useGameStateStore } from "../store/gameStateStore";
import { useTableStateStore } from "../store/tableStateStore";
import { User } from "../type";

interface CallResultIndicatorProps {
  users: User[];
  isSmallWindow: boolean;
}
export default function CallResultIndicator({
  users,
  isSmallWindow,
}: CallResultIndicatorProps) {
  const { lastPlayedBy, isCallSuccess, turn } = useGameStateStore();
  const { tableState } = useTableStateStore();
  const callerName = users[lastPlayedBy.slice(-1)[0] - 1]
    ? users[turn - 1].displayName.length > 10
      ? users[turn - 1].displayName.slice(0, 9) + "..."
      : users[turn - 1].displayName
    : "";
  const calledName = users[lastPlayedBy.slice(-1)[0] - 1]
    ? users[lastPlayedBy.slice(-1)[0] - 1].displayName.length > 10
      ? users[lastPlayedBy.slice(-1)[0] - 1].displayName.slice(0, 9) + "..."
      : users[lastPlayedBy.slice(-1)[0] - 1].displayName
    : "";
  return (
    <div>
      <AnimatePresence mode="wait">
        {tableState === "resultUpdate" &&
          users[lastPlayedBy.slice(-1)[0] - 1] && (
            <motion.div
              style={
                isSmallWindow
                  ? { right: 0, translateY: 127 }
                  : { left: "50%", translateX: "-50%" }
              }
              initial={
                isSmallWindow ? { opacity: 0, x: 200 } : { opacity: 0, y: 10 }
              }
              whileInView={
                isSmallWindow ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }
              }
              exit={
                isSmallWindow ? { opacity: 0, x: 200 } : { opacity: 0, y: -10 }
              }
              className="sm:absolute sm:bottom-10 bottom-auto text-nowrap fixed whitespace-pre-line font-semibold text-white/80 text-center
            font-pixelify"
            >
              {isCallSuccess ? (
                <div className="inline-flex sm:flex-col flex-row items-center text-center sm:bg-transparent bg-gray-700 px-2 rounded-l-full sm:space-x-0 space-x-1">
                  <span style={{ color: PCOLOR[turn - 1] }}>
                    {callerName + "'s "}
                    <span className="text-white/80">call on</span>
                  </span>
                  <span
                    style={{ color: PCOLOR[lastPlayedBy.slice(-1)[0] - 1] }}
                  >
                    {calledName + `\n`}
                  </span>
                  <div className="pl-2 pr-1 sm:bg-lime-500 bg-transparent sm:text-white/80 text-lime-500 rounded-full">
                    successfull
                  </div>
                </div>
              ) : (
                <div className="inline-flex sm:flex-col flex-row items-center text-center sm:bg-transparent bg-gray-700 px-2 rounded-l-full sm:space-x-0 space-x-1">
                  <span style={{ color: PCOLOR[turn - 1] }}>
                    {callerName + "'s "}
                    <span className="text-white">call on</span>
                  </span>
                  <span
                    style={{ color: PCOLOR[lastPlayedBy.slice(-1)[0] - 1] }}
                  >
                    {calledName + `\n`}
                  </span>
                  <div className="pl-2 pr-1 sm:bg-rose-500 bg-transparent sm:text-white/80 text-rose-500  rounded-full ">
                    failed
                  </div>
                </div>
              )}
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
