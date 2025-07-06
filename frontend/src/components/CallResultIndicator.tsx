import { AnimatePresence, motion } from "motion/react";
import { PCOLOR } from "../constant";
import { useGameStateStore } from "../store/gameStateStore";
import { useTableStateStore } from "../store/tableStateStore";
import { User } from "../type";
import { useWindowSizeStore } from "../store/windowSizeStateStore";

interface CallResultIndicatorProps {
  users: User[];
}
export default function CallResultIndicator({
  users,
}: CallResultIndicatorProps) {
  const { lastPlayedBy, isCallSuccess, turn } = useGameStateStore();
  const { tableState } = useTableStateStore();
  const { isSmallWindow, cardContainerPosition } = useWindowSizeStore();

  const callerIndex = users.findIndex((user) => user.order === turn);
  const callerName = users[callerIndex]
    ? users[callerIndex].displayName.length > 10
      ? users[callerIndex].displayName.slice(0, 9) + "..."
      : users[callerIndex].displayName
    : "none";
  const calledIndex = users.findIndex(
    (user) => user.order === lastPlayedBy.slice(-1)[0]
  );
  const calledName = users[calledIndex]
    ? users[calledIndex].displayName.length > 10
      ? users[calledIndex].displayName.slice(0, 9) + "..."
      : users[calledIndex].displayName
    : "none";
  return (
    <div>
      <AnimatePresence mode="wait">
        {tableState === "resultUpdate" &&
          users[calledIndex] &&
          users[callerIndex] && (
            <motion.div
              style={
                isSmallWindow
                  ? { right: 0, top: cardContainerPosition - 60 }
                  : { left: "50%", translateX: "-50%" }
              }
              initial={
                isSmallWindow ? { opacity: 0, x: 200 } : { opacity: 0, y: 10 }
              }
              whileInView={
                isSmallWindow ? { opacity: 1, x: 25 } : { opacity: 1, y: 0 }
              }
              exit={
                isSmallWindow ? { opacity: 0, x: 200 } : { opacity: 0, y: -10 }
              }
              className="text-sm sm:absolute sm:bottom-10 bottom-auto text-nowrap fixed whitespace-pre-line font-semibold text-white/80 text-center
            font-pixelify"
            >
              {isCallSuccess ? (
                <div className="pr-8 inline-flex sm:flex-col flex-row items-center text-center sm:bg-transparent bg-gray-700 px-2 rounded-l-full sm:space-x-0 space-x-1 ">
                  <span
                    style={{
                      color: PCOLOR[users[callerIndex].order - 1] || "white",
                    }}
                  >
                    {callerName + "'s "}
                    <span className="text-white/80">call on</span>
                  </span>
                  <span
                    style={{
                      color: PCOLOR[users[calledIndex].order - 1] || "white",
                    }}
                  >
                    {calledName + `\n`}
                  </span>
                  <div className="pl-2 pr-1 sm:px-2  sm:bg-lime-500 bg-transparent sm:text-white/80 text-lime-500 rounded-full">
                    successfull
                  </div>
                </div>
              ) : (
                <div className="pr-8 inline-flex sm:flex-col flex-row items-center text-center sm:bg-transparent bg-gray-700 px-2 rounded-l-full sm:space-x-0 space-x-1">
                  <span
                    style={{
                      color: PCOLOR[users[callerIndex].order - 1] || "white",
                    }}
                  >
                    {callerName + "'s "}
                    <span className="text-white">call on</span>
                  </span>
                  <span
                    style={{
                      color: PCOLOR[users[calledIndex].order - 1] || "white",
                    }}
                  >
                    {calledName + `\n`}
                  </span>
                  <div className="pl-2 pr-1 sm:px-2 sm:bg-rose-500 bg-transparent sm:text-white/80 text-rose-500  rounded-full ">
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
