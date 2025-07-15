import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaEquals } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { CardsArt } from "./CardsArt";
import { motion } from "motion/react";
import { cn } from "../utils/cn";
import { PCOLOR } from "../constant";
import crown from "../assets/svg/c.png";

interface HowtoplayModalProps {
  setShowHowtoplayModal: (show: boolean) => void;
}

export default function HowtoplayModal({
  setShowHowtoplayModal,
}: HowtoplayModalProps) {
  const howtoplay = {
    deck: {
      title: "Deck",
      content: ["The game uses 6 cards: Ace, King, Queen, Jack, and 2 Jokers."],
      component: <Deck />,
    },
    gameStart: {
      title: "Game Start",
      content: [
        "Each player gets 5 cards.",
        'One non-Joker card is revealed as the round card (e.g., "King’s Round").',
      ],
      component: <GameStart />,
    },
    playingTurn: {
      title: "Playing a Turn",
      content: [
        "Choose 1–3 cards from your hand.",
        '"Throw Cards" to play and claim they match the round card.',
      ],
      component: <PlayingTurn />,
    },
    playerChoice: {
      title: "Next Player’s Choice",
      content: [
        '"Throw Cards" to continue the claim, or',
        '"Call Liar" to challenge the last play.',
        "If the last player was lying: they lose 1 chance.",
        "If they were honest: the caller loses 1 chance.",
      ],
      component: <NextPlayerChoice />,
    },
    jokerRule: {
      title: "Joker Rules",
      content: [
        "Jokers are wild cards that can match any card.",
        "Example: 2 Kings + 1 Joker = 3 Kings in a King round.",
      ],
      component: <JokerRule />,
    },
    // forceCall: {
    //   title: 'Forced "Call Liar"',
    //   content: [
    //     "If the last player used their final cards and you have no cards, you're forced to Call Liar.",
    //     "If you still have cards, you can either Call Liar or Throw Cards.",
    //     "Throwing cards in this case may force the next player (who also has no cards) to Call Liar.",
    //   ],
    //   component: <></>,
    // },
    winningCondition: {
      title: "Winning the Game",
      content: [
        "When only one player has chances left, they win the round and earn 1 point.",
        "The game resets for the next round and continues until the set number of rounds is reached.",
      ],
      component: <WinningCondition />,
    },
  };
  const [currentStep, setCurrentStep] = useState(0);

  const sections = Object.values(howtoplay);
  const isFirst = currentStep === 0;
  const isLast = currentStep === sections.length - 1;

  const goNext = () => {
    if (!isLast) setCurrentStep((prev) => prev + 1);
  };

  const goPrev = () => {
    if (!isFirst) setCurrentStep((prev) => prev - 1);
  };

  return (
    <>
      <div className="absolute flex items-center justify-center w-full h-full bg-stone-500/80 z-[52] font-nippo">
        <div
          className="relative flex items-center justify-center flex-col sm:w-[510px] sm:h-[440px] w-[400px] h-[440px]
           bg-radial from-white to-lime-300
           z-[53] rounded-3xl text-black shadow-md shadow-gray-800 mx-2"
        >
          <button
            className="absolute right-4 top-4"
            onClick={() => setShowHowtoplayModal(false)}
          >
            <IoClose />
          </button>
          {/* Current Rule Section */}
          <div className="text-center w-full h-full flex flex-col mt-12 px-4">
            <h3
              className={`text-lg font-semibold mb-2 font-silk bg-black self-center
             text-white px-2 rounded-sm border-b-2 border-b-lime-500 border-r-2 border-r-lime-500`}
            >
              {sections[currentStep].title}
            </h3>
            <div className="h-[190px] rounded-lg bg-black/20">
              {sections[currentStep].component}
            </div>
            <ul className="text-black/80 mt-2 list-disc list-inside space-y-1 text-sm text-left">
              {sections[currentStep].content.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-auto mb-2 flex gap-4 w-full justify-between px-4 h-10  items-center">
            <motion.button
              onClick={goPrev}
              whileTap={{y:2}}
              disabled={isFirst}
              className={`${
                isFirst ? "opacity-0 " : ""
              }w-20 justify-center text-sm flex flex-row items-center gap-x-1 hover:bg-darkgreen/80 bg-darkgreen text-white/80 px-2 rounded-lg transition-colors`}
            >
              Previous
            </motion.button>
            <motion.button
              onClick={goNext}
              whileTap={{y:2}}
              disabled={isLast}
              className={`${
                isLast ? "opacity-0 " : ""
              }w-20 justify-center text-sm flex flex-row items-center gap-x-1 hover:bg-darkgreen/80 bg-darkgreen text-white/80 px-2 rounded-lg transition-colors`}
            >
              Next
            </motion.button>
            {isLast && (
              <button
                onClick={() => setShowHowtoplayModal(false)}
                className="w-20 text-sm bg-lime-500 px-2 rounded-lg text-white/80 hover:opacity-80"
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const Deck = () => {
  return (
    <div className="relative flex flex-row w-full h-full">
      <motion.div
        style={{ left: "50%", translateX: "-50%", bottom: 0 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm absolute text-white bg-cyan-500 mb-2 px-2 rounded-full"
      >
        Total 26 cards
      </motion.div>
      <div className="flex flex-col relative">
        <div className="flex flex-row -space-x-[80px] ">
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              style={{ scale: 0.5 }}
              initial={{
                y: 20,
                opacity: 0,
                rotateZ: (index - (4 - 1) / 2) * 4,
              }}
              animate={{
                y: (-Math.abs(index - (4 - 1) / 2) * -20) / (4 - 1) / 2,
                opacity: 100,
              }}
              transition={{ delay: index * 0.05 }}
              key={index}
              className=" border-gray-200 shadow-sm shadow-black border
           items-center justify-center w-[120px] h-[170px] bg-white rounded-lg "
            >
              <CardsArt card={index} />
            </motion.div>
          ))}
        </div>
        <motion.div
          style={{ left: "50%", translateX: "-50%" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="font-pixelify absolute bottom-5 text-lg bg-rose-500
         px-2 text-white rounded-full shadow-sm shadow-black"
        >
          x6
        </motion.div>
      </div>
      <div className="flex w-full justify-center relative">
        <motion.div
          style={{ scale: 0.5 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 100 }}
          className="border-gray-200 shadow-sm shadow-black border
           items-center justify-center w-[120px] h-[170px] bg-white rounded-lg "
        >
          <CardsArt card={4} />
        </motion.div>
        <motion.div
          style={{ left: "50%", translateX: "-50%" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="font-pixelify absolute bottom-5 text-lg bg-rose-500
         px-2 text-white rounded-full shadow-sm shadow-black"
        >
          x2
        </motion.div>
      </div>
    </div>
  );
};

const GameStart = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <motion.div
        style={{ left: "50%", translateX: "-50%", top: "10%" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute  w-[150px] h-[150px] rounded-full bg-darkgreen border-[10px] border-lightgreen"
      />
      <div className="absolute left-1/2 -translate-x-1/2">
        <motion.div
          style={{ scale: 0.5 }}
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 100,
          }}
          className=" border-gray-200 shadow-sm shadow-black border
           items-center justify-center w-[120px] h-[170px] bg-white rounded-lg "
        >
          <CardsArt card={2} />
        </motion.div>
      </div>
      <motion.div
        style={{ left: "50%", translateX: "-50%" }}
        className="text-sm absolute bottom-10 bg-rose-500 shadow-sm shadow-black px-2 text-white rounded-full"
      >
        King’s Round
      </motion.div>
      <div className="flex flex-row -space-x-[80px] absolute left-1/2 -translate-x-1/2 -bottom-[95px] ">
        <HandExample count={5} scale={0.5} />
      </div>
      {/* Left example hand */}
      <div className="flex flex-row -space-x-[100px] absolute">
        <HandExample count={5} scale={0.35} isBackSide />
      </div>
      {/* Rigth example hand */}
      <div className="flex flex-row -space-x-[100px] absolute right-0">
        <HandExample count={5} scale={0.35} isBackSide />
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute bottom-2 right-2 text-sm px-2 bg-cyan-500 rounded-full text-white"
      >
        5 cards for each player
      </motion.div>
    </div>
  );
};

const HandExample = ({
  count,
  scale,
  rotateStep = 4,
  isBackSide,
  pickingIndex,
}: {
  count: number;
  scale: number;
  pickingIndex?: number[];
  rotateStep?: number;
  isBackSide?: boolean;
}) => {
  return (
    // must have parent with flex-row space-x adjusted
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          style={{ scale }}
          initial={{
            y: 20,
            opacity: 0,
            rotateZ: (index - (count - 1) / 2) * rotateStep,
          }}
          animate={{
            y: pickingIndex
              ? pickingIndex.includes(index)
                ? -20
                : (-Math.abs(index - (count - 1) / 2) * -rotateStep * 6) /
                  (count - 1) /
                  2
              : (-Math.abs(index - (count - 1) / 2) * -rotateStep * 6) /
                (count - 1) /
                2,
            opacity: 100,
          }}
          transition={{ delay: index * 0.05 }}
          key={index}
          className=" border-gray-200 shadow-sm shadow-black border
           items-center justify-center w-[120px] h-[170px] p-1 bg-white rounded-lg "
        >
          {isBackSide ? (
            <div className="w-full h-full relative rounded-lg flex items-center justify-center overflow-hidden">
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
            </div>
          ) : (
            <CardsArt card={index} />
          )}
        </motion.div>
      ))}
    </>
  );
};

const getRandomPickingIndexes = () => {
  const all = [0, 1, 2, 3, 4];
  const count = Math.floor(Math.random() * 3) + 1; // 1 to 3
  const shuffled = all.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const PlayingTurn = () => {
  const [pickingIndex, setPickingIndex] = useState<number[]>([]);
  useEffect(() => {
    let isMounted = true;

    const loop = () => {
      if (!isMounted) return;

      // Step 1: Pick random cards
      const picked = getRandomPickingIndexes();
      setPickingIndex(picked);

      // Step 2: Clear after a while, then loop again
      setTimeout(() => {
        if (!isMounted) return;
        setPickingIndex([]);

        setTimeout(loop, 800); // Wait before next round
      }, 1000); // Show cards for 1 sec
    };

    // Start the loop
    loop();

    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <div className="relative flex w-full h-full">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{ left: "50%", translateX: "-50%" }}
        className="top-6 w-[280px] h-[140px] bg-darkgreen border-[10px] border-lightgreen absolute rounded-full"
      />
      <motion.div
        style={{ left: "50%", translateX: "-50%" }}
        className="absolute flex flex-row -space-x-[80px] w-[250px] top-2"
      >
        <HandExample
          count={5}
          scale={0.5}
          rotateStep={0}
          pickingIndex={pickingIndex}
        />
      </motion.div>
      <motion.div
        style={{ left: "50%", translateX: "-50%" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`absolute bottom-4 transition-colors font-silk text-sm px-2 text-white
       rounded-full ${
         pickingIndex.length > 0 ? "bg-lime-500" : "bg-gray-200"
       } flex items-center justify-center shadow-sm shadow-black`}
      >
        Throw card
      </motion.div>
    </div>
  );
};

const NextPlayerChoice = () => {
  return (
    <div className="relative w-full h-full flex">
      <motion.div
        style={{ left: "50%", translateX: "-50%" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 100, y: 0 }}
        className="absolute flex flex-row bg-black/40 px-2 w-[250px] top-3 py-3 space-x-2 rounded-lg"
      >
        <div
          style={{ backgroundColor: PCOLOR[0] }}
          className="text-sm shadow-sm shadow-black
       px-2 py-2 rounded-lg font-pixelify flex flex-row items-center gap-x-2 justify-center"
        >
          <div className="flex flex-row items-center gap-x-1">
            <div className="text-white">Chance</div>
            <div className="flex flex-row gap-x-2">
              <div className="w-2 h-2  bg-white/70" />
              <div className="w-2 h-2  bg-white/70" />
            </div>
          </div>
        </div>
        <div className="text-sm text-white/80 text-start">
          Each player given
          <br />2 chance per round
        </div>
      </motion.div>
      <div className="flex flex-row w-full items-center justify-center gap-x-2 self-end mb-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 100, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm flex flex-col items-center w-[170px] space-y-2 bg-black/40 py-3 rounded-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`transition-colors font-silk text-sm px-2 text-white
       rounded-full w-[115px] bg-deepred flex items-center justify-center shadow-sm shadow-black`}
          >
            Call liar!
          </motion.div>
          <div className="text-balance text-white/80">
            Call if you think last turn was a bluff
          </div>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm"
        >
          OR
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 100, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm flex flex-col items-center w-[170px] space-y-2 bg-black/40 py-3 rounded-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`transition-colors font-silk text-sm px-2 
       rounded-full text-white bg-lime-500 flex items-center justify-center shadow-sm shadow-black`}
          >
            Throw card
          </motion.div>
          <div className="text-balance text-white/80">
            Continue to play
            <br /> your card
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const JokerRule = () => {
  return (
    <div className="w-full h-full flex items-center">
      <div className="flex flex-row gap-x-2 justify-between px-2 w-full">
        <div className="relative bg-black/40 rounded-lg">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="z-10 absolute text-white/80 -right-5 top-1/2 -translate-y-1/2 bg-cyan-500 p-2 rounded-full"
          >
            <FaEquals />
          </motion.div>
          <motion.div
            style={{ scale: 0.5 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 100 }}
            className="border-gray-200 shadow-sm shadow-black border
           items-center justify-center w-[120px] h-[170px] bg-white rounded-lg "
          >
            <CardsArt card={4} />
          </motion.div>
        </div>
        <div className="relative flex flex-row sm:-space-x-[50px] -space-x-[85px] bg-black/40 rounded-lg">
          <HandExample count={4} scale={0.5} rotateStep={0} />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ left: "50%", translateX: "-25%" }}
            className="absolute text-sm bottom-2 bg-cyan-500 text-white/80 px-2 sm:text-nowrap text-balance rounded-full"
          >
            Each Joker can act as any 1 card
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const WinningCondition = () => {
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
      <div className="w-[200px] h-[200px] absolute from-yellow-300 via-yellow-100 to-transparent rounded-full bg-radial" />
      <motion.img
        animate={{ rotateZ: [-10, 0, 10] }}
        transition={{
          repeat: Infinity,
          repeatType: "mirror",
          repeatDelay: 0.3,
        }}
        src={crown}
        alt="crown"
        className=""
      />
    </div>
  );
};
