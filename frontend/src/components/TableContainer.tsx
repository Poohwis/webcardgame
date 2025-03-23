import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useGameStateStore } from "../store/gameStateStore";
import wait from "../utils/wait";

const TABLE_SIZE = 400;
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
  zIndex: number;
  isDealed: boolean;
  rotateY: number;
  startRotateZ: number;
  endRotateZ: number;
  startScale: number;
  endScale: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isFixed: boolean;
  isRoundPlayCard: boolean;
  card: string;
};
const cardAnimationVariants = {
  default: {
    transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
  },
  dealing: {
    transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] },
  },
  shuffle: {
    transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
  },
  throw: {
    transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
  },
  down: { transition: { duration: 0.2 } },
};
export default function TableContainer({ playerOrder }: TableContainerProps) {
  const cardsName = ["ACE", "JACK", "KING", "QUEEN", "JOKER"];
  const { currentState, roundPlayCard } = useGameStateStore();
  const [playedCardStack, setPlayedCardStack] = useState<playedCardStack[]>([]);
  const { lastPlayedBy, lastPlayedCardCount } = useGameStateStore();

  const [animationMode, setAnimationMode] =
    useState<keyof typeof cardAnimationVariants>("default");


  useEffect(() => {
    const isResetTable =
      currentState === "toNextRound" || currentState === "toNextGame";
    if (isResetTable) {
      gatherCard();
    } else if (lastPlayedCardCount && lastPlayedBy.length > 0) {
      for (let i = 0; i < lastPlayedCardCount; i++) {
        throwCard(lastPlayedBy.slice(-1)[0]);
      }
    }
  }, [lastPlayedBy, currentState]);

  const roundPlayCardReveal = async () => {
    const getTopCard = (stack: typeof playedCardStack) =>
      [...stack].sort((a, b) => b.zIndex - a.zIndex).find((c) => !c.isDealed);

    setPlayedCardStack((prev) => {
      const topCard = getTopCard(prev);
      return prev.map((c) =>
        c.zIndex === topCard?.zIndex
          ? {
              ...c,
              endScale: 2.5,
              endX: 0,
              endY: 0,
              rotateY: 180,
              isFixed: true,
              isRoundPlayCard: true,
              card: cardsName[roundPlayCard],
            }
          : c
      );
    });

    await wait(1000);
    setAnimationMode("down");

    setPlayedCardStack((prev) => {
      const topCard = getTopCard(prev);
      return prev.map((c) =>
        c.zIndex === topCard?.zIndex
          ? { ...c, endScale: 1, endX: 0, endY: 0, isFixed: false }
          : c
      );
    });

    await wait(200);
    setAnimationMode("default");

    setPlayedCardStack((prev) => {
      const topCard = getTopCard(prev);
      return prev.map((c) =>
        c.zIndex === topCard?.zIndex
          ? {
              ...c,
              endScale: 1,
              endX: Math.random() * 20 - 10,
              endY: Math.random() * 20 - 10,
              rotateY: 180,
              endRotateZ: Math.random() * 40 - 20,
            }
          : c
      );
    });

    explode();
  };

  const explode = () => {
    setPlayedCardStack((prev) => {
      return prev.map((c) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 70 + 200;
        const rotateZ = Math.random() * 500;
        const explodedX = Math.cos(angle) * distance;
        const explodedY = Math.sin(angle) * distance;
        return !c.isDealed && !c.isRoundPlayCard
          ? {
              ...c,
              endX: explodedX,
              endY: explodedY,
              endRotateZ: rotateZ,
              isFixed: false,
            }
          : c;
      });
    });
  };

  const inCard = async () => {
    for (let i = 0; i <= 25; i++) {
      setPlayedCardStack((prev) => [
        ...prev,
        {
          id: prev.length,
          zIndex: prev.length,
          isDealed: false,
          rotateY: 0,
          startRotateZ: 0,
          endRotateZ: 0,
          startX: prev.length + 100,
          startY: -prev.length - 100,
          endX: prev.length,
          endY: -prev.length,
          startScale: 2,
          endScale: 1,
          isFixed: true,
          isRoundPlayCard: false,
          card: "",
        },
      ]);
      await wait(40);
    }
  };

  const throwCard = (lastPlayedBy: number) => {
    setAnimationMode("throw");
    const diffPosition = (4 + lastPlayedBy - playerOrder) % 4;
    const startPosition = direction[diffPosition];
    const startRotateZ = 90 * diffPosition;
    const endRotateZ = Math.floor(Math.random() * 21) - 10 + startRotateZ;
    const startX = startPosition[0] * (TABLE_SIZE - ONTABLECARD_HEIGHT + 50);
    const startY = startPosition[1] * (TABLE_SIZE - ONTABLECARD_HEIGHT + 50);
    const endX = Math.floor(Math.random() * 30) - 10;
    const endY = Math.floor(Math.random() * 30) - 10;
    setPlayedCardStack((prev) => {
      return [
        ...prev,
        {
          id: prev.length,
          zIndex: prev.length,
          isDealed: false,
          rotateY: 0,
          startRotateZ,
          endRotateZ,
          startX,
          startY,
          endX,
          endY,
          startScale: 1,
          endScale: 1,
          isFixed: false,
          isRoundPlayCard: false,
          card: "",
        },
      ];
    });
    setAnimationMode("default");
  };

  const removeCard = () => {
    setPlayedCardStack([]);
  };
  const gatherCard = () => {
    setPlayedCardStack((prev) =>
      prev.map((c) => ({
        ...c,
        endX: c.zIndex,
        endY: -c.zIndex,
        endRotateZ: 0,
        isDealed: false,
        rotateY: 0,
      }))
    );
  };
  const shuffleCard = () => {
    setPlayedCardStack((prev) =>
      prev.map((c) => ({
        ...c,
        endX: Math.floor(Math.random() * (TABLE_SIZE / 2)) - TABLE_SIZE / 4,
        endY: Math.floor(Math.random() * (TABLE_SIZE / 2)) - TABLE_SIZE / 4,
        endRotateZ: Math.floor(Math.random() * 360),
      }))
    );
  };

  //TODO : add skip chance0 player
  const dealCardFromStack = async () => {
    setAnimationMode("dealing");
    for (let j = 0; j <= 3; j++) {
      for (let i = 0; i <= 4; i++) {
        setPlayedCardStack((prev) => {
          const firstUnDealedIndex = [...prev]
            .sort((a, b) => b.zIndex - a.zIndex)
            .find((c) => !c.isDealed)?.zIndex;

          if (firstUnDealedIndex === undefined) return prev;

          return prev.map((c) =>
            c.zIndex === firstUnDealedIndex
              ? {
                  ...c,
                  endX:
                    direction[j][0] * (TABLE_SIZE - ONTABLECARD_HEIGHT + 50),
                  endY:
                    direction[j][1] * (TABLE_SIZE - ONTABLECARD_HEIGHT + 50),
                  endRotateZ: 90 * j,
                  isDealed: true,
                  isFixed: false,
                }
              : c
          );
        });
        await wait(50);
      }
    }
    setAnimationMode("default");
  };

  const overhandShuffle = async () => {
    setAnimationMode("shuffle");
    const stackSize = Math.floor(Math.random() * 10) + 10;
    for (let i = 0; i < 3; i++) {
      setPlayedCardStack((prev) =>
        prev.map((c) =>
          c.zIndex <= stackSize
            ? { ...c, endY: ONTABLECARD_HEIGHT + 20 - c.id }
            : { ...c, endY: c.endY - stackSize, endX: c.endX - stackSize }
        )
      );
      await wait(300);
      setPlayedCardStack((prev) =>
        prev.map((c) =>
          c.zIndex <= stackSize
            ? { ...c, zIndex: c.zIndex + (25 - stackSize) }
            : { ...c, zIndex: c.zIndex - (stackSize + 1) }
        )
      );
      gatherCard();
      await wait(350);
    }
    setAnimationMode("default");
  };

  const [show, setShow] = useState(false);
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <motion.div
        style={{
          width: TABLE_SIZE,
          height: TABLE_SIZE,
          overflow: show ? "visible" : "hidden",
        }}
        className="overflow-hi bg-darkgreen border-4 border-lightgreen rounded-full relative 
        flex items-center justify-center"
      >
        <div className="absolute top-0 z-30 flex flex-col">
          <button onClick={() => setShow(!show)}>
            {animationMode}: {show ? "show" : "hide"}
          </button>
          <button className="" onClick={() => removeCard()}>
            remove
          </button>
          <button className="" onClick={() => gatherCard()}>
            gather
          </button>
          <button
            className=""
            onClick={() => {
              for (let i = 0; i <= 25; i++) {
                throwCard(Math.floor(Math.random() * 5));
              }
            }}
          >
            throw
          </button>
          <button
            className=""
            onClick={() => {
              throwCard(4);
            }}
          >
            throw0
          </button>
          <button className="" onClick={() => shuffleCard()}>
            shuffle
          </button>
          <button className="" onClick={() => overhandShuffle()}>
            overhand
          </button>
          <button className="" onClick={() => dealCardFromStack()}>
            dealCard
          </button>
          <button className="" onClick={() => inCard()}>
            inCard
          </button>
          <button className="" onClick={() => explode()}>
            explode
          </button>
          <button className="" onClick={() => roundPlayCardReveal()}>
            reveal
          </button>
        </div>

        {playedCardStack.map(
          ({
            id,
            rotateY,
            startRotateZ,
            endRotateZ,
            startX,
            startY,
            endY,
            endX,
            zIndex,
            startScale,
            endScale,
            isFixed,
            card,
          }) => (
            <motion.div
              key={id}
              initial={{
                y: startY,
                x: startX,
                rotateZ: startRotateZ,
                scale: startScale,
              }}
              animate={{
                y: endY,
                x: endX,
                rotateY,
                rotateZ: endRotateZ,
                scale: endScale,
              }}
              whileTap={{
                rotateY: 180,
                scale: 2.5,
                x: 0,
                y: 0,
                position: "fixed",
              }}
              transition={cardAnimationVariants[animationMode].transition}
              style={{
                width: ONTABLECARD_WIDTH,
                height: ONTABLECARD_HEIGHT,
                zIndex: zIndex,
                transformStyle: "preserve-3d",
                position: isFixed ? "fixed" : "absolute",
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
                <div className="text-2xl font-bold  text-black">{card[0]}</div>
              </div>

              {/* Back Side */}
              <div
                className="absolute bg-white w-full h-full p-1 text-white rounded-lg"
                style={{
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="flex items-center justify-center flex-col text-xl w-full h-full bg-red-800 rounded-lg">
                  <div>{id}</div>
                  <div>{isFixed ? "fixed" : "ab"}</div>
                </div>
              </div>
            </motion.div>
          )
        )}
      </motion.div>
    </div>
  );
}
