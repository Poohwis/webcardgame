import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useGameStateStore } from "../store/gameStateStore";

const TABLE_SIZE = 500;
const ONTABLECARD_WIDTH = 100;
const ONTABLECARD_HEIGHT = 142;
const direction = [
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 0],
];
interface TableContainerProps {
  playerOrder: number;
}
type playedCardStack = {
  id: number;
  startRotateZ: number;
  endRotateZ: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};
export default function TableContainer({ playerOrder }: TableContainerProps) {
  const [playedCardStack, setPlayedCardStack] = useState<playedCardStack[]>([]);
  const { lastPlayedBy, lastPlayedCardCount } = useGameStateStore();

  useEffect(() => {
    if (lastPlayedCardCount) {
      for (let i = 0; i < lastPlayedCardCount; i++) {
        addCard(lastPlayedBy.slice(-1)[0]);
      }
    }
  }, [lastPlayedBy]);
  const addCard = (lastPlayedBy: number) => {
    const diffPosition = (4 + lastPlayedBy - playerOrder) % 4;
    const startPosition = direction[diffPosition];
    const startRotateZ = 90 * diffPosition;
    const endRotateZ = Math.floor(Math.random() * 21) - 10 + startRotateZ;
    const startX = startPosition[0] * (TABLE_SIZE - ONTABLECARD_HEIGHT);
    const startY = startPosition[1] * (TABLE_SIZE - ONTABLECARD_HEIGHT);
    const endX = Math.floor(Math.random() * 30) - 10;
    const endY = Math.floor(Math.random() * 30) - 10;
    setPlayedCardStack((prev) => {
      return [
        ...prev,
        {
          id: prev.length,
          startRotateZ,
          endRotateZ,
          startX,
          startY,
          endX,
          endY,
        },
      ];
    });
  };

  const resetCard = () => {
    setPlayedCardStack([]);
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <motion.div
        style={{ width: TABLE_SIZE, height: TABLE_SIZE }}
        className="overflow-hidden bg-darkgreen border-4 border-lightgreen rounded-full relative flex items-center justify-center"
      >
        {playedCardStack.map(
          ({ id, startRotateZ, endRotateZ, startX, startY, endY, endX }) => (
            <motion.div
              key={id}
              initial={{ y: startY, x: startX, rotateZ: startRotateZ }}
              animate={{ y: endY, x: endX, rotateZ: endRotateZ }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              style={{ width: ONTABLECARD_WIDTH, height: ONTABLECARD_HEIGHT }}
              className="hover:cursor-default bg-white rounded-lg absolute border-[1px] border-gray-200 font-silkbold text-white p-1 "
            >
              <div className="w-full h-full  bg-red-800 flex items-center justify-center rounded-lg">
                back
              </div>
            </motion.div>
          )
        )}
      </motion.div>
    </div>
  );
}
