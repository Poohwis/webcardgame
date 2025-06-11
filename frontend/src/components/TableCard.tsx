import { motion, Transition } from "motion/react";
import {
  ONTABLECARD_HEIGHT,
  ONTABLECARD_WIDTH,
  playedCardStack,
} from "./TableContainer";
import { CardsArt } from "./CardsArt";
import { cn } from "../utils/cn";
import {CARDSNAME} from "../constant"

interface TableCardProps {
  cardName: playedCardStack;
  transition: Transition;
}

export default function TableCard({ cardName, transition }: TableCardProps) {
  return (
    <motion.div
      key={cardName.id}
      initial={{
        y: cardName.startY,
        x: cardName.startX,
        rotateZ: cardName.startRotateZ,
        scale: cardName.startScale,
      }}
      animate={{
        y: cardName.endY,
        x: cardName.endX,
        rotateY: cardName.rotateY,
        rotateZ: cardName.endRotateZ,
        scale: cardName.endScale,
      }}
      transition={transition}
      style={{
        width: ONTABLECARD_WIDTH,
        height: ONTABLECARD_HEIGHT,
        zIndex: cardName.zIndex,
        transformStyle: "preserve-3d",
        position: cardName.isFixed ? "fixed" : "absolute",
      }}
      className="absolute hover:cursor-default bg-white rounded-lg  border-[1px]
               border-gray-200 font-silkbold text-white"
    >
      {/* Front Side */}
      <motion.div
        className="absolute w-full h-full bg-white rounded-lg flex pt-[3.3px] pl-[6.6px]"
        style={{
          transform: "rotateY(180deg)",
          backfaceVisibility: "hidden",
        }}
      >
        <CardsArt
          card={CARDSNAME.findIndex((name) => name === cardName.card)}
          sm
        />
        <div className="text-2xl font-bold text-black -ml-1 tracking-[-12px]">
          {cardName.card === "JOKER" ? "JK" : cardName.card[0]}
        </div>
      </motion.div>

      {/* Back Side */}
      <div
        className="absolute bg-white w-full h-full p-1 text-white rounded-lg "
        style={{
          backfaceVisibility: "hidden",
        }}
      >
        <div className="flex flex-col relative items-center justify-center text-xl w-full h-full bg-red-800 rounded-lg overflow-hidden">
          <div className="z-10 w-[90px] self-start absolute top-1 left-1 text-[11.6px] text-white leading-3">
            liar's card
          </div>
          <div className="z-10 w-[90px] self-end rotate-180 absolute bottom-1 right-1 text-[11.6px] text-white leading-3">
            liar's card
          </div>
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              style={{ width: 200 - index * 8.3, height: 200 - index * 8.3 }}
              className={cn(
                "absolute rounded-full",
                index % 2 === 0 ? "bg-red-800" : "bg-red-900"
              )}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
