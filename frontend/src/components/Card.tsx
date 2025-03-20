import { motion, MotionValue } from "motion/react";
interface CardProps {
  cardX: MotionValue<number>;
  cardY: MotionValue<number>;
  index: number;
  handleSelectCard: (index: number) => void;
  isFlipped: boolean;
  card: number;
  removedCard: number | null;
}
const CARD_WIDTH = 120;
const CARD_HEIGHT = 170;
export default function Card({
  cardX,
  cardY,
  index,
  handleSelectCard,
  isFlipped,
  card,
  removedCard,
}: CardProps) {
  const cardsName = ["ACE", "JACK", "KING", "QUEEN", "JOKER"];
  return (
    <motion.div
      style={{
        y: cardY,
        x: cardX,
        perspective: 1000,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      }}
      onClick={() => handleSelectCard(index)}
      className="absolute cursor-pointer "
    >
      <motion.div
        className="relative w-full h-full rounded-lg border-[1px] border-gray-200 flex items-center
              justify-center font-silkbold"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side */}
        <div
          className="absolute w-full h-full bg-white rounded-lg flex pt-1 pl-2"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-3xl font-bold vertical-writing tracking-[-11px]">
            {card !== -1
              ? card === 4
                ? cardsName[card]
                : cardsName[card][0]
              : removedCard !== null
              ? cardsName[removedCard][0]
              : ""}
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute bg-white w-full h-full p-1 text-white rounded-lg"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="flex items-center justify-center text-xl w-full h-full bg-red-800 rounded-lg">
            Back
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
