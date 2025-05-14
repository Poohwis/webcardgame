import { AnimatePresence, motion } from "motion/react";
import { User } from "../type";
import { useTableStateStore } from "../store/tableStateStore";
import { useGameStateStore } from "../store/gameStateStore";
import { PCOLOR } from "../constant";

interface RoundPlayedCardIndicatorProps {
  users: User[];
  isSmallWindow: boolean;
}
export default function RoundPlayedCardIndicator({
  users,
  isSmallWindow,
}: RoundPlayedCardIndicatorProps) {
  if (isSmallWindow)
    return (
      <div className="fixed right-0 top-[50%] -translate-y-[54px]">
          <RoundPlayedCardContext users={users} isSmallWindow/>
      </div>
    );
  return (
    <div className="sm:absolute sm:bottom-16">
      <RoundPlayedCardContext users={users} />
    </div>
  );
}

const RoundPlayedCardContext = ({ users ,isSmallWindow = false }: { users: User[], isSmallWindow? : boolean }) => {
  const { lastPlayedBy, turn, lastPlayedCardCount, roundPlayCard } =
    useGameStateStore();
  const { tableState } = useTableStateStore();
  const cardsName = ["ACE", "JACK", "KING", "QUEEN", "JOKER"];

  const roundPlayedCardShow = lastPlayedBy.length > 0 &&
        tableState !== "resultUpdate" &&
        tableState !== "callSuccess" &&
        tableState !== "callFail"
  return (
    <AnimatePresence mode="wait">
      {roundPlayedCardShow && (
          <motion.div
            key={users[lastPlayedBy.slice(-1)[0] - 1].displayName}
            style={{ color: PCOLOR[turn - 1] }}
            initial={isSmallWindow ? {x:200, opacity : 0}:{ x: 10, opacity: 0 }}
            animate={isSmallWindow? {x : 0 , opacity: 1} : { x: 0, opacity: 1 }}
            exit={isSmallWindow? {x: 200, opacity: 0} : { x: -10, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="font-pixelify text-nowrap font-semibold sm:text-base text-sm opacity-80 transition-colors"
          >
            <div className="text-white/80 bg-gray-700 sm:bg-transparent px-2 sm:px-0 rounded-l-full sm:rounded-none">
              <span style={{ color: PCOLOR[lastPlayedBy.slice(-1)[0] - 1] }}>
                {users[lastPlayedBy.slice(-1)[0] - 1].displayName}
              </span>{" "}
              claims {lastPlayedCardCount} {cardsName[roundPlayCard]}
              {lastPlayedCardCount == 1 ? "" : "S"}
            </div>
          </motion.div>
        )}
    </AnimatePresence>
  );
};
