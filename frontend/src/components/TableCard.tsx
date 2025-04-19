import { motion, Transition } from "motion/react";
import {
  ONTABLECARD_HEIGHT,
  ONTABLECARD_WIDTH,
  playedCardStack,
} from "./TableContainer";

interface TableCardProps {
  card: playedCardStack;
  transition: Transition;
  isSmallWindow : boolean
}
export default function TableCard({ card, transition }: TableCardProps) {
  return (
    <motion.div
      key={card.id}
      initial={{
        y: card.startY,
        x: card.startX,
        rotateZ: card.startRotateZ,
        scale: card.startScale,
      }}
      animate={{
        y: card.endY,
        x: card.endX,
        rotateY: card.rotateY,
        rotateZ: card.endRotateZ,
        scale: card.endScale,
      }}
      whileTap={{
        rotateY : 0
      }}
      transition={transition}
      style={{
        width: ONTABLECARD_WIDTH,
        height: ONTABLECARD_HEIGHT,
        zIndex: card.zIndex,
        transformStyle: "preserve-3d",
        position: card.isFixed ? "fixed" : "absolute",
      }}
      className="absolute hover:cursor-default bg-white rounded-lg  border-[1px]
               border-gray-200 font-silkbold text-white"
    >
      {/* Front Side */}
      <div
        className="absolute w-full h-full bg-white rounded-lg flex pt-[3.3px] pl-[6.6px]"
        style={{
          transform: "rotateY(180deg)",
          backfaceVisibility: "hidden",
        }}
      >
        <div className="text-2xl font-bold text-black vertical-writing -ml-1 tracking-[-8px]">
          {card.card === "JOKER" ? card.card : card.card[0]}
        </div>
      </div>

      {/* Back Side */}
      <div
        className="absolute bg-white w-full h-full p-1 text-white rounded-lg "
        style={{
          backfaceVisibility: "hidden",
        }}
      >
        <div className="flex items-center justify-center flex-col text-xl w-full h-full bg-red-800 rounded-lg">
          <div>{card.id}</div>
          <div>{card.zIndex}</div>
          <div>{card.dealToOrder}</div>
          <div>{card.isRoundPlayCard ? "rpc": ""}</div>
        </div>
      </div>
    </motion.div>
  );
}
