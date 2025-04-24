//use different animation implement approch from card container, and i think this is easy to specify card position of many //but need manual manuver for laping of each animation (not desirable)
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useGameStateStore } from "../store/gameStateStore";
import wait from "../utils/wait";
import { useTableAnimationStore } from "../store/tableAnimationStore";
import {
  CardAnimationMode,
  useCardAnimationStore,
} from "../store/cardAnimationStore";
import { Transition } from "motion/react";
import TableCard from "./TableCard";
import Indicator from "./Indicator";
import { useTableStateStore } from "../store/tableStateStore";
import RoundPlayCardIndicator from "./RoundPlayCardIndicator";
import { User } from "../type";
import { PCOLOR } from "../constant";
import PlayerTurnIndicator from "./PlayerTurnIndicator";
import CallResultIndicator from "./CallResultIndicator";

export const ONTABLECARD_WIDTH = 100;
export const ONTABLECARD_HEIGHT = 142;
export const TABLE_SIZE = 400;
interface TableContainerProps {
  playerOrder: number;
  users: User[];
  handleRequestNextTable: () => void;
}
export type playedCardStack = {
  id: number;
  zIndex: number;
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
  dealToOrder: number;
  card: string;
};

type AnimationMode =
  | "default"
  | "dealing"
  | "shuffle"
  | "throw"
  | "down"
  | "explode"
  | "call"
  | "jump";

const tableCardAnimationVariants: Record<
  AnimationMode,
  { transition: Transition }
> = {
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
  explode: { transition: { duration: 0.6, ease: "easeOut" } },
  call: { transition: { delay: 1, duration: 0.5, type: "spring" } },
  jump: { transition: { duration: 0 } },
};

export default function TableContainer({
  playerOrder,
  users,
  handleRequestNextTable,
}: TableContainerProps) {
  const cardsName = ["ACE", "JACK", "KING", "QUEEN", "JOKER"];
  const [playedCardStack, setPlayedCardStack] = useState<playedCardStack[]>([]);
  const [lastPlayOrder, setLastPlayOrder] = useState(-1);
  const [animationMode, setAnimationMode] = useState<AnimationMode>("default");
  const { tableState, setTableState } = useTableStateStore();

  const { currentState, roundPlayCard, isCallSuccess, playersChance, turn } =
    useGameStateStore();
  const { lastPlayedBy, lastPlayedCardCount, calledCards, cards } =
    useGameStateStore();
  const { returnCardAnimation, dealCardAnimation, addToQueue } =
    useCardAnimationStore();
  const { addToTableQueue, tableProcessNext, tableCurrentQueue } =
    useTableAnimationStore();

  useEffect(() => {
    const tableStartAnimation = [
      "inCard",
      "dealCardToHand",
      "dealCard",
      "reveal",
      "explode",
    ];
    const nextRoundAnimation = ["dealCard", "reveal", "explode"];
    const callCardRevealAnimationQueue = ["callCheck", "scatter"];
    const callAction = async () => {
      const delay = 5000;
      addToTableQueue(callCardRevealAnimationQueue);
      await wait(delay);

      if (cards.length !== 0) {
        returnCardAnimation();
      }
      await wait(500);

      addToTableQueue(["gather", "overhandShuffle"]);
      await wait(1500);

      handleRequestNextTable();
    };
    switch (currentState) {
      case "start":
        if (tableState !== "initial") return;
        addToTableQueue(tableStartAnimation);
        break;
      case "toNextRound":
        const nextRoundCallResult = isCallSuccess ? "callSuccess" : "callFail";
        if (nextRoundCallResult === "callSuccess") {
          callAction();
        } else {
          callAction();
        }
        setTableState(nextRoundCallResult);
        break;
      case "nextRound":
        if (cards.length !== 0) {
          addToTableQueue(["dealCardToHand"]);
        }
        addToTableQueue(nextRoundAnimation);
        setTableState("nextRound");
        break;
      case "nextGame":
        if (cards.length !== 0) {
          addToTableQueue(["dealCardToHand"]);
        }
        addToTableQueue(nextRoundAnimation);
        setTableState("nextGame");
        break;
      case "toNextGame":
        const nextGameCallResult = isCallSuccess ? "callSuccess" : "callFail";
        if (nextGameCallResult === "callSuccess") {
          callAction();
        } else {
          callAction();
        }
        setTableState(nextGameCallResult);
        break;
    }
  }, [currentState]);

  //Play card listener
  useEffect(() => {
    const lastPlay = lastPlayedBy.slice(-1)[0];
    if (
      lastPlayedCardCount &&
      lastPlayedBy.length > 0 &&
      lastPlayOrder !== lastPlay
    ) {
      throwCard(lastPlay, lastPlayedCardCount);
      setLastPlayOrder(lastPlay);
    }
  }, [lastPlayedBy]);

  //Animation control
  useEffect(() => {
    if (tableCurrentQueue === "default") return;
    switch (tableCurrentQueue) {
      case "reveal":
        roundPlayCardReveal();
        break;
      case "explode":
        explode();
        setTableState("start");
        break;
      case "dealCard":
        dealCardFromStack();
        break;
      case "inCard":
        inCard();
        break;
      case "callCheck":
        callCheck();
        break;
      case "testCallCheck":
        testCallCheck(3);
        break;
      case "scatter":
        scatter();
        break;
      case "gather":
        gatherCard();
        break;
      case "reset":
        resetCard();
        break;
      case "overhandShuffle":
        overhandShuffle();
        break;
      case "dealCardToHand":
        dealCardToHand();
        break;
    }
  }, [tableCurrentQueue]);

  const roundPlayCardReveal = async () => {
    setAnimationMode("default");
    const getTopCard = (stack: typeof playedCardStack) =>
      [...stack]
        .sort((a, b) => b.zIndex - a.zIndex)
        .find((c) => c.dealToOrder === -1);
    setPlayedCardStack((prev) => {
      const topCard = getTopCard(prev);
      return prev.map((c) =>
        c.zIndex === topCard?.zIndex
          ? {
              ...c,
              endScale: 2.5 * (isSmallWindow ? 0.75 : 1),
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
              endX: Math.random() * 20 - 10,
              endY: Math.random() * 20 - 10,
              endRotateZ: Math.random() * 40 - 20,
            }
          : c
      );
    });
    tableProcessNext();
  };

  const explode = async () => {
    setAnimationMode("explode");
    setPlayedCardStack((prev) => {
      return prev.map((c) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + TABLE_SIZE;
        const rotateZ = Math.random() * 500;
        const explodedX = Math.cos(angle) * distance;
        const explodedY = Math.sin(angle) * distance;
        return c.dealToOrder === -1 && !c.isRoundPlayCard
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
    tableProcessNext();
    addToQueue([CardAnimationMode.ClickableOn]);
    await wait(1000);
    setAnimationMode("default");
  };

  const callCheck = async () => {
    setAnimationMode("call");
    const calledCardStack = [...playedCardStack]
      .sort((a, b) => b.zIndex - a.zIndex)
      .slice(0, lastPlayedCardCount);

    //First: Show called card
    for (const card of calledCardStack) {
      const index = calledCardStack.findIndex((t) => t.zIndex === card.zIndex);
      const position = (calledCardStack.length - 1) / 2 - index;
      const a = Math.random() * 50 + 10;
      const endY = a * Math.pow(position, 2);
      const endRotateZ = position * -15 + (Math.random() * 15 - 7.5);
      setPlayedCardStack((prev) =>
        prev.map((c) =>
          c.zIndex === card.zIndex
            ? {
                ...c,
                endScale: 2.5 * (isSmallWindow ? 0.75 : 1),
                endX: position * 200 * (isSmallWindow ? 0.25 : 1),
                endY: endY,
                endRotateZ: endRotateZ,
                isFixed: true,
                rotateY: 180,
                card: cardsName[calledCards[index]] || "temp",
              }
            : c
        )
      );
      await wait(100);
    }
    await wait(3000);

    //Second: reset round play card
    setPlayedCardStack((prev) =>
      prev.map((c) =>
        c.isRoundPlayCard === true ? { ...c, isRoundPlayCard: false } : c
      )
    );

    //Third: Down card
    setAnimationMode("down");
    setTableState("resultUpdate");
    for (const card of calledCardStack) {
      const index = calledCardStack.findIndex((t) => t.zIndex === card.zIndex);
      const position = (calledCardStack.length - 1) / 2 - index;
      setPlayedCardStack((prev) =>
        prev.map((c) =>
          c.zIndex === card.zIndex
            ? {
                ...c,
                endScale: 1,
                endX: position * 40,
                endY: c.endY - 25,
                isRoundPlayCard: true,
              }
            : c
        )
      );
    }
    await wait(200);

    //Forth: Jitter down card
    for (const card of calledCardStack) {
      const index = calledCardStack.findIndex((t) => t.zIndex === card.zIndex);
      const position = (calledCardStack.length - 1) / 2 - index;
      setPlayedCardStack((prev) =>
        prev.map((c) =>
          c.zIndex === card.zIndex
            ? {
                ...c,
                endX: c.endX + (Math.random() * 5 - 2.5),
                endY: c.endY + (Math.random() * 5 - 2.5),
                endRotateZ: Math.random() * 20 - 10 + position * -15,
              }
            : c
        )
      );
    }

    setAnimationMode("default");
    tableProcessNext();
  };

  const scatter = async () => {
    setAnimationMode("explode");
    setPlayedCardStack((prev) => {
      return prev.map((c) => {
        if (c.dealToOrder === -1 && !c.isRoundPlayCard) {
          const distance = Math.random() * 100 + TABLE_SIZE;

          const dirX = c.endX;
          const dirY = c.endY;

          const magnitude = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
          const normX = dirX / magnitude;
          const normY = dirY / magnitude;

          const dx = normX * distance;
          const dy = normY * distance;

          const rotateZ = Math.random() * 500;

          return {
            ...c,
            endX: c.endX + dx,
            endY: c.endY + dy,
            endRotateZ: rotateZ,
            isFixed: false,
          };
        }
        return c;
      });
    });

    await wait(1000);

    setAnimationMode("default");
    tableProcessNext();
  };

  const inCard = async () => {
    setAnimationMode("default");
    for (let i = 0; i <= 25; i++) {
      setPlayedCardStack((prev) => [
        ...prev,
        {
          id: prev.length,
          zIndex: prev.length,
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
          dealToOrder: -1,
          card: "",
        },
      ]);
      await wait(40);
    }

    await wait(200);
    tableProcessNext();
  };

  const throwCard = (lastPlayedBy: number, lastPlayCount: number) => {
    setAnimationMode("default");
    const diffPosition = ((4 + lastPlayedBy - playerOrder) % 4) + 1;
    for (let i = 0; i < lastPlayCount; i++) {
      setPlayedCardStack((prev) => {
        const target = prev.find((c) => c.dealToOrder === diffPosition)?.zIndex;
        if (!target) {
          return prev;
        }
        const randomOffset = (range: number, fix: number) =>
          Math.random() * range - fix;
        const maxZIndex = Math.max(...prev.map((c) => c.zIndex), 0);
        return prev.map((c) =>
          c.zIndex === target
            ? {
                ...c,
                endX: randomOffset(30, 10),
                endY: randomOffset(30, 10),
                endRotateZ: randomOffset(21, 10) + c.endRotateZ,
                dealToOrder: -1,
                zIndex: maxZIndex + 1,
              }
            : c
        );
      });
    }
  };

  const resetCard = (
    type: "default" | "shuffle" = "default",
    isAnimationJump = false
  ) => {
    setAnimationMode(isAnimationJump ? "jump" : "default");
    setPlayedCardStack((prev) =>
      prev.map((c) => ({
        ...c,
        endX: type == "default" ? c.id : c.zIndex,
        endY: type == "default" ? -c.id : -c.zIndex,
        zIndex: type == "default" ? c.id : c.zIndex,
        endRotateZ: 0,
        dealToOrder: -1,
        rotateY: 0,
        endScale: 1,
        isRoundPlayCard: false,
      }))
    );
  };

  const testCallCheck = async (input: number = 1) => {
    setAnimationMode("call");
    const tempTarget = [...playedCardStack]
      .sort((a, b) => b.zIndex - a.zIndex)
      .slice(0, input);

    //First: Show called card
    for (const card of tempTarget) {
      const index = tempTarget.findIndex((t) => t.zIndex === card.zIndex);
      const position = (tempTarget.length - 1) / 2 - index;
      const a = Math.random() * 50 + 10;
      const endY = a * Math.pow(position, 2);
      const endRotateZ = position * -15 + (Math.random() * 15 - 7.5);
      setPlayedCardStack((prev) =>
        prev.map((c) =>
          c.zIndex === card.zIndex
            ? {
                ...c,
                endScale: 2.5 * (isSmallWindow ? 0.75 : 1),
                endX: position * 200,
                endY: endY,
                endRotateZ: endRotateZ,
                isFixed: true,
                rotateY: 180,
                card: cardsName[calledCards[index]] || "temp",
              }
            : c
        )
      );
      await wait(100);
    }
    await wait(3000);

    //Second: reset round play card
    setPlayedCardStack((prev) =>
      prev.map((c) =>
        c.isRoundPlayCard ? { ...c, isRoundPlayCard: false } : c
      )
    );

    //Third: Down card
    setAnimationMode("down");
    for (const card of tempTarget) {
      const index = tempTarget.findIndex((t) => t.zIndex === card.zIndex);
      const position = (tempTarget.length - 1) / 2 - index;
      setPlayedCardStack((prev) =>
        prev.map((c) =>
          c.zIndex === card.zIndex
            ? {
                ...c,
                endScale: 1,
                endX: position * 40,
                endY: c.endY - 25,
                isRoundPlayCard: true,
              }
            : c
        )
      );
    }
    await wait(200);

    //Forth: Jitter down card
    for (const card of tempTarget) {
      const index = tempTarget.findIndex((t) => t.zIndex === card.zIndex);
      const position = (tempTarget.length - 1) / 2 - index;
      setPlayedCardStack((prev) =>
        prev.map((c) =>
          c.zIndex === card.zIndex
            ? {
                ...c,
                endX: c.endX + (Math.random() * 5 - 2.5),
                endY: c.endY + (Math.random() * 5 - 2.5),
                endRotateZ: Math.random() * 20 - 10 + position * -15,
              }
            : c
        )
      );
    }

    setAnimationMode("default");
    tableProcessNext();
  };

  const gatherCard = async () => {
    setAnimationMode("default");
    setPlayedCardStack((prev) =>
      prev.map((c) =>
        c.isRoundPlayCard
          ? {
              ...c,
              endX: c.endX + 200 * (isSmallWindow ? 0.75 : 1),
              endScale: 2 * (isSmallWindow ? 0.75 : 1),
              rotateY: Math.random() * 30 + 150,
            }
          : c
      )
    );
    const stack = [...playedCardStack].sort((a, b) => a.zIndex - b.zIndex);

    for (let i = 0; i < stack.length; i++) {
      const card = stack[i];
      setPlayedCardStack((prev) =>
        prev.map((c) =>
          c.zIndex === card.zIndex
            ? {
                ...c,
                endX: i,
                endY: -i,
                endRotateZ: 0,
                dealToOrder: -1,
                rotateY: 0,
                zIndex: i,
                isRoundPlayCard: false,
                endScale: 1,
              }
            : c
        )
      );

      await wait(50);
    }
    await wait(500);
    tableProcessNext();
  };

  const shuffleCard = () => {
    setAnimationMode("default");
    setPlayedCardStack((prev) =>
      prev.map((c) => ({
        ...c,
        endX: Math.floor(Math.random() * (TABLE_SIZE / 2)) - TABLE_SIZE / 4,
        endY: Math.floor(Math.random() * (TABLE_SIZE / 2)) - TABLE_SIZE / 4,
        endRotateZ: Math.floor(Math.random() * 360),
      }))
    );
  };

  const dealCardToHand = async () => {
    await wait(200);
    dealCardAnimation();
    tableProcessNext();
  };

  //TODO : add skip chance0 player
  const dealCardFromStack = async () => {
    const direction = [
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, 0],
    ];
    setAnimationMode("dealing");
    let skipPosition = playersChance;

    while (skipPosition.length < 4) {
      skipPosition.push(0);
    }

    skipPosition = skipPosition
      .map((value, index) => (value === 0 ? index : -1))
      .filter((index) => index !== -1)
      .map((value) => (value - (playerOrder - 1) + 4) % 4);

    for (let j = 0; j <= 3; j++) {
      if (skipPosition.includes(j)) continue;
      for (let i = 0; i <= 4; i++) {
        //hard coded number of cards for now TODO://Change to recieve the value from server
        setPlayedCardStack((prev) => {
          const firstUnDealedIndex = [...prev]
            .sort((a, b) => b.zIndex - a.zIndex)
            .find((c) => c.dealToOrder === -1)?.zIndex;

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
                  dealToOrder: j + 1,
                  isFixed: false,
                }
              : c
          );
        });
        await wait(50);
      }
    }
    setAnimationMode("default");
    await wait(2000);

    tableProcessNext();
  };

  const overhandShuffle = async () => {
    setAnimationMode("shuffle");
    const stackSize = Math.floor(Math.random() * 10) + 10;
    for (let i = 0; i < 3; i++) {
      setPlayedCardStack((prev) =>
        prev.map((c) =>
          c.zIndex <= stackSize
            ? { ...c, endY: ONTABLECARD_HEIGHT + 100 - c.id, isFixed: false }
            : {
                ...c,
                endY: c.endY - stackSize,
                endX: c.endX - stackSize,
                isFixed: false,
              }
        )
      );
      await wait(150);
      setPlayedCardStack((prev) =>
        prev.map((c) =>
          c.zIndex <= stackSize
            ? { ...c, zIndex: c.zIndex + (25 - stackSize) }
            : { ...c, zIndex: c.zIndex - (stackSize + 1) }
        )
      );
      resetCard("shuffle");
      await wait(150);
    }
    setAnimationMode("default");
    await wait(300);
    tableProcessNext();
  };

  const [isSmallWindow, setIsSmallWindow] = useState(
    () => window.innerWidth < 640
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setIsSmallWindow(window.innerWidth < 640);
      } else {
        setIsSmallWindow(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const [tableSize, setTableSize] = useState(400);
  useEffect(() => {
    const largeTableDimension = 400;
    const smallTableDimension = 250;
    if (isSmallWindow) {
      setTableSize(smallTableDimension);
    } else {
      setTableSize(largeTableDimension);
    }
  }, [isSmallWindow]);

  return (
    <>
      <div className="w-full h-full flex items-center justify-center relative mt-12">
        <RoundPlayCardIndicator
          radius={156}
          size={
            tableState === "start" ||
            tableState === "callFail" ||
            tableState === "callSuccess"
              ? 500
              : 400
          }
          text={
            cardsName[roundPlayCard]
              ? cardsName[roundPlayCard] + "'S TABLE"
              : ""
          }
          textColor="#065f46"
        />
        {/* outer indicator */}
        <Indicator playerOrder={playerOrder} tableSize={tableSize} />
        {/* table */}
        <motion.div
          style={{ width: tableSize, height: tableSize }}
          animate={
            tableState !== "initial"
              ? { width: tableSize + 25, height: tableSize + 25 }
              : {}
          }
          className="overflow-hidden bg-transparent rounded-full relative
        flex items-center justify-center"
        >
          <div className="flex items-center justify-center bg-darkgreen rounded-full sm:w-[400px] sm:h-[400px] w-[250px] h-[250px]" />
          <PlayerTurnIndicator users={users} />
          <CallResultIndicator users={users} />
          {playedCardStack.map((card, index) => (
            <TableCard
              key={index}
              card={card}
              isSmallWindow={isSmallWindow}
              transition={tableCardAnimationVariants[animationMode].transition}
            />
          ))}
        </motion.div>
      </div>
    </>
  );
}

{
  /* temp for test animation TODO:DELETE */
}
// <div className="z-50 absolute left-[50%] flex flex-col font-pixelify items-start w-[150px]">
//   <div>tableState: {tableState}</div>
//   <div>aniMode: {animationMode}</div>
//   <button className="hover:cursor-pointer" onClick={() => setShow(!show)}>
//     {show ? "show" : "hide"}
//   </button>
//   <button className="hover:cursor-pointer" onClick={() => resetCard()}>
//     resetPosition
//   </button>
//   <button className="hover:cursor-pointer" onClick={shuffleCard}>
//     shuffleCard
//   </button>
//   <button className="hover:cursor-pointer" onClick={dealCardFromStack}>
//     deal
//   </button>
//   <button className="hover:cursor-pointer" onClick={roundPlayCardReveal}>
//     reveal
//   </button>
//   <button className="hover:cursor-pointer" onClick={explode}>
//     explode
//   </button>
//   <button className="hover:cursor-pointer" onClick={scatter}>
//     scatter
//   </button>
//   <button className="hover:cursor-pointer" onClick={gatherCard}>
//     gatherCard
//   </button>
//   <button className="hover:cursor-pointer" onClick={overhandShuffle}>
//     overhandShuffle
//   </button>
//   <div className="flex flex-row gap-x-1 justify-between w-full">
//     {Array.from({ length: 3 }).map((_, i) => (
//       <button
//         key={i}
//         className="hover:cursor-pointer"
//         onClick={() => testCallCheck(i + 1)}
//       >
//         c{i + 1}
//       </button>
//     ))}
//   </div>
//   <div className="flex flex-row gap-x-1 justify-between w-full">
//     {Array.from({ length: 4 }).map((_, i) => (
//       <button
//         key={i}
//         className="hover:cursor-pointer"
//         onClick={() =>
//           throwCard(i + 1, Math.floor(Math.random() * 2) + 1)
//         }
//       >
//         {i + 1}
//       </button>
//     ))}
//   </div>
//   <button
//     className="hover:cursor-pointer"
//     onClick={() => addToTableQueue(["testCallCheck", "scatter"])}
//   >
//     testCallCheck
//   </button>
// </div>

// const [showList, setShowList] = useState(true);
// inside main div
// <div className="text-sm absolute flex flex-col z-50  h-full w-auto left-[150px]">
//   <button onClick={() => setShowList(!showList)}>
//     {showList ? "show" : "hide"}
//   </button>
//   {playedCardStack.map((c) => (
//     <div
//       key={c.id}
//       style={{ visibility: showList ? "hidden" : "visible" }}
//     >
//       id:{c.id} rpc:{c.isRoundPlayCard ? "✅" : ""} zIndex:{c.zIndex}{" "}
//       to:{c.dealToOrder} rotateZ: {c.endRotateZ.toFixed(0)} x:{" "}
//       {c.endX.toFixed(0)} y: {c.endY.toFixed(0)}
//     </div>
//   ))}
// </div>
