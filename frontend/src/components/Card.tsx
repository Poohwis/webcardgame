import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "../utils/cn";
import { CardsArt } from "./CardsArt";
import { useState } from "react";

interface CardProps {
  cardX: MotionValue<number>;
  cardY: MotionValue<number>;
  index: number;
  handleSelectCard: (index: number) => void;
  isFlipped: boolean;
  card: number;
  memoCard: number;
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
  memoCard,
}: CardProps) {
  const cardsName = ["ACE", "JACK", "KING", "QUEEN", "JOKER"];
  const [hover, setHover] =useState(false)

  // Track mouse position within the card
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Map mouse movement to rotation (-10 to 10 degrees)
  const tiltY = useTransform(
    rotateX,
    [-CARD_WIDTH / 2, CARD_WIDTH / 2],
    [20, -20]
  );
  const tiltX = useTransform(
    rotateY,
    [-CARD_HEIGHT / 2, CARD_HEIGHT / 2],
    [-20, 20]
  );

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
  const name =
    card !== -1
      ? card === 4
        ? "JK"
        : cardsName[card][0]
      : memoCard !== 4
      ? cardsName[memoCard][0]
      : "JK";
  return (
    <motion.div
      style={{
        y: cardY,
        x: cardX,
        perspective: 1000,
      }}
      onClick={() => handleSelectCard(index)}
      className={cn("absolute cursor-pointer w-[120px] h-[170px] group")}
    >
      <motion.div
        className="relative w-full h-full rounded-lg flex items-center justify-center font-silkbold"
        style={{
          transformStyle: "preserve-3d",
        }}
        onHoverStart={()=>setHover(true)}
        onHoverEnd={()=>setHover(false)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Card Tilt Effect */}
        <motion.div
          className="absolute w-full h-full bg-white hover:sm:bg-gray-100 border-gray-200 border-[1px] rounded-lg flex"
          style={{
            backfaceVisibility: "hidden",
            rotateX: smoothTiltX,
            rotateY: smoothTiltY,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* <div className="group-hover:opacity-100 opacity-0  w-[95%] h-[95%] top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] border-2 border-gray-200 absolute rounded-lg" /> */}

          <CardsArt card={memoCard} isHover={hover} />
          <div className="sm:text-3xl text-2xl font-bold tracking-[-12px] pl-2 pt-1">
            {name}
          </div>
        </motion.div>

        {/* Back Side */}
        <div
          className="absolute bg-white w-full h-full p-1 text-white rounded-lg "
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="flex flex-col relative items-center justify-center text-xl w-full h-full bg-red-800 rounded-lg overflow-hidden">
          <div className="z-10 w-[90px] self-start absolute top-1 left-1  text-sm text-white leading-3">liar's card</div>
          <div className="z-10 w-[90px] self-end rotate-180 absolute bottom-1 right-1 text-sm text-white leading-3">liar's card</div>
            {Array.from({ length: 20 }).map((_, index) => (
              <div
              key={index}
                style={{ width: 200 - index*10, height: 200 -index*10, }}
                className={ cn( "absolute rounded-full", index % 2 === 0 ? "bg-red-800" : "bg-red-900"  )}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
