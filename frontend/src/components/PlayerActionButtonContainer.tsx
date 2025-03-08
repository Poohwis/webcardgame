import { motion } from "motion/react";
interface PlayerActionContainerProps {
  handleCallAction: () => void;
  handlePlayCardAction: () => void;
  turn: number;
  order: number;
  isSending: boolean;
  lastPlayedBy: number[];
  selectCardIndices: number[];
}
export default function PlayerActionContainer({
  handleCallAction,
  handlePlayCardAction,
  turn,
  order,
  isSending,
  lastPlayedBy,
  selectCardIndices,
}: PlayerActionContainerProps) {
  const isCanThrowCard = order == turn && selectCardIndices.length > 0;
  const isCanCall = order == turn && lastPlayedBy.length !== 0;
  return (
    <div className="flex flex-row font-nippo space-x-4">
      <motion.button
        onClick={handleCallAction}
        whileTap={isCanCall ? { y: 2 } : { x: [-5, 5, 0] }}
        className={`${
          isCanCall
            ? "bg-red-500  hover:opacity-90 hover:cursor-pointer text-white/80"
            : "bg-lightgray text-white/50"
        } transition-colors p-4  rounded-md border-b-4 border-b-gray-700`}
        disabled={!isCanCall || isSending}
      >
        CALL LIAR
      </motion.button>
      <motion.button
        onClick={handlePlayCardAction}
        whileTap={isCanThrowCard ? { y: 2 } : { x: [-5, 5, 0] }}
        className={`${
          isCanThrowCard
            ? "bg-blue-500 hover:opacity-90 hover:cursor-pointer text-white/80"
            : "bg-lightgray text-white/50"
        } transition-colors p-4 rounded-md border-b-4 border-b-gray-700`}
        disabled={!isCanThrowCard || isSending}
      >
        <div className="drop-shadow-2xl">THROW CARD</div>
      </motion.button>
    </div>
  );
}
