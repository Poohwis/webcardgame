import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useState, useEffect, useMemo } from "react";
import { CardsArt } from "./CardsArt";
import { cn } from "../utils/cn";
import { CARD_WIDTH, CARD_HEIGHT } from "./Card";
export default function HomeCard() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  return (
    <>
      {Array.from({ length: 30 }).map((_, index) => (
        <FloatingCard
          key={index}
          index={index}
          height={windowSize.height}
          width={windowSize.width}
        />
      ))}
    </>
  );
}

const FloatingCard = ({
  width,
  height,
  index,
}: {
  width: number;
  height: number;
  index: number;
}) => {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
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

  const isMainCard = index < 5;
  const randScale = useMemo(() => {
    if (isMainCard) return 1 - Math.random() * 0.1;
    return Math.random() - 0.2;
  }, []);
  const randX = useMemo(() => Math.random(), []);
  const randY = useMemo(() => Math.random(), []);
  const zIndex = useMemo(() => Math.floor(randScale * 50), []);
  const blurLevel: "high" | "mid" | "none" = useMemo(() => {
    if (isMainCard) return "none";
    if (randScale > 0.5) return "mid";
    return "high";
  }, []);
  const floatX = randX > 0.5 ? randX * -50 : randX * 50;
  const floatY = randY > 0.5 ? randY * -50 : randY * 50;
  const showFront = useMemo(() => Math.random() < 0.7, []);
  return (
    <motion.div
      drag
      initial={{
        // rotateZ: Math.random() * 180 -90,
        zIndex,
        top: 0,
        right: 0,
        scale: randScale * 1 + 0.8,
        rotateX: Math.random() * 90 - 45,
        rotateY: Math.random() * 20 - 10,
        // translateX: randX * width,
        // translateY: randY * height,
      }}
      style={{
        rotateX: smoothTiltX,
        rotateY: smoothTiltY,
      }}
      animate={{
        scale: [randScale * 1 + 0.8, randScale * 1 + 1, randScale * 1 + 0.8],
        x: [randX * width, randX * width + floatX, randX * width],
        y: [randY * height, randY * height + floatY, randY * height],
      }}
      transition={{
        duration: 8,
        delay: Math.random() * index,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
      onMouseMove={handleMouseMove}
      // onMouseLeave={handleMouseLeave}
      className={cn(
        "absolute px-1 py-1 w-[120px] h-[170px] rounded-lg bg-gray-100 left-0 brightness-[1]",
        blurLevel === "none"
          ? ""
          : blurLevel === "mid"
          ? "blur-[0.8px] brightness-[0.97]"
          : "blur-[4px] brightness-[0.94]"
      )}
    >
      <div className="font-silk flex flex-col relative items-center justify-center text-xl w-full h-full bg-gray-100 rounded-lg overflow-hidden">
        {isMainCard ? (
          <CardsArt card={index % 5} fillColor />
        ) : showFront ? (
          <CardsArt card={index % 5} fillColor />
        ) : (
          <BackSideArt />
        )}
      </div>
    </motion.div>
  );
};

//alternative art
const BackSideArt = () => {
  return (
    <>
      <div className="z-10 w-[90px] self-start absolute top-1 left-1  text-sm text-white leading-3">
        liar's card
      </div>
      <div className="z-10 w-[90px] self-end rotate-180 absolute bottom-1 right-1 text-sm text-white leading-3">
        liar's card
      </div>
      {Array.from({ length: 20 }).map((_, index) => (
        <div
          key={index}
          style={{ width: 200 - index * 10, height: 200 - index * 10 }}
          className={cn(
            "absolute rounded-full",
            index % 2 === 0 ? "bg-red-800" : "bg-red-900"
          )}
        />
      ))}
    </>
  );
};
