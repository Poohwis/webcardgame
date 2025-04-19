import { motion, MotionValue, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "../utils/cn";

interface CardProps {
  cardX: MotionValue<number>;
  cardY: MotionValue<number>;
  index: number;
  handleSelectCard: (index: number) => void;
  isFlipped: boolean;
  card: number;
  removedCard: number | null;
}

export const CARD_WIDTH = 120;
export const CARD_HEIGHT = 170;

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

  // Track mouse position within the card
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Map mouse movement to rotation (-10 to 10 degrees)
  const tiltY = useTransform(rotateX, [-CARD_WIDTH / 2, CARD_WIDTH / 2], [20, -20]);
  const tiltX = useTransform(rotateY, [-CARD_HEIGHT / 2, CARD_HEIGHT / 2], [-20, 20]);

  const smoothTiltX = useSpring(tiltX, { stiffness: 150, damping: 15 });
  const smoothTiltY = useSpring(tiltY, { stiffness: 150, damping: 15 });

  // Handle Mouse Movement
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    rotateX.set(x);
    rotateY.set(y);
  };

  // Reset on Mouse Leave
  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      style={{
        y: cardY,
        x: cardX,
        perspective: 1000,
      }}
      onClick={() => handleSelectCard(index)}
      className={cn("absolute cursor-pointer w-[120px] h-[170px]")}
    >
      <motion.div
        className="relative w-full h-full rounded-lg flex items-center justify-center font-silkbold"
        style={{
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        // whileHover={{ rotateX: 60 }}
      >
        {/* Card Tilt Effect */}
        <motion.div
          className="absolute w-full h-full bg-white border-gray-200 border-[1px] rounded-lg flex pt-1 pl-2"
          style={{
            backfaceVisibility: "hidden",
            rotateX: smoothTiltX,
            rotateY: smoothTiltY,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="sm:text-3xl text-2xl font-bold vertical-writing tracking-[-11px]">
            {card !== -1
              ? card === 4
                ? cardsName[card]
                : cardsName[card][0]
              : removedCard !== null
              ? cardsName[removedCard][0]
              : ""}
          </div>
        </motion.div>

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
