import { AnimatePresence, motion } from "motion/react";
import { User } from "../type";
import { useTableStateStore } from "../store/tableStateStore";
import { useGameStateStore } from "../store/gameStateStore";
import { PCOLOR } from "../constant";
import { useEffect, useState } from "react";
import { useWindowSizeStore } from "../store/windowSizeState";
import {CARDSNAME} from "../constant"

interface RoundPlayedCardIndicatorProps {
  users: User[];
}
export default function RoundPlayedCardIndicator({
  users,
}: RoundPlayedCardIndicatorProps) {
  const {isSmallWindow, cardContainerPosition} =useWindowSizeStore()
  if (isSmallWindow)
    return (
      <div style={{top : cardContainerPosition - 104}} className="fixed right-0 ">
        <RoundPlayedCardContext users={users} isSmallWindow />
      </div>
    );
  return (
    <div className="sm:absolute sm:bottom-16">
      <RoundPlayedCardContext users={users} />
    </div>
  );
}

const RoundPlayedCardContext = ({
  users,
  isSmallWindow = false,
}: {
  users: User[];
  isSmallWindow?: boolean;
}) => {
  const { lastPlayedBy, turn, lastPlayedCardCount, roundPlayCard } =
    useGameStateStore();
  const { tableState } = useTableStateStore();
  const [lastPlayerInfo, setLastPlayerInfo] = useState<{
    displayName: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    const latest = lastPlayedBy.slice(-1)[0];
    const matchedUser = users.find((u) => u.order === latest);
    if (matchedUser) {
      setLastPlayerInfo({
        displayName: matchedUser.displayName,
        color: PCOLOR[matchedUser.order - 1],
      });
    }
  }, [lastPlayedBy, users]);

  const roundPlayedCardShow =
    lastPlayedBy.length > 0 &&
    tableState !== "resultUpdate" &&
    tableState !== "callSuccess" &&
    tableState !== "callFail";
  return (
    <AnimatePresence mode="wait">
      {roundPlayedCardShow && (
        <motion.div
          key={lastPlayerInfo?.displayName}
          initial={
            isSmallWindow ? { x: 200, opacity: 0 } : { x: 10, opacity: 0 }
          }
          animate={isSmallWindow ? { x: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isSmallWindow ? { x: 200, opacity: 0 } : { x: -10, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="font-pixelify text-nowrap font-semibold sm:text-base text-sm opacity-80 transition-colors"
        >
          <div className="text-white/80 bg-gray-700 sm:bg-transparent px-2 sm:px-0 rounded-l-full sm:rounded-none">
            <span style={{ color: lastPlayerInfo?.color }}>
              {lastPlayerInfo?.displayName}
            </span>{" "}
            claims {lastPlayedCardCount} {CARDSNAME[roundPlayCard]}
            {lastPlayedCardCount == 1 ? "" : "S"}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
