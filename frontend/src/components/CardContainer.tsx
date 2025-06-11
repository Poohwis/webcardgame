import { animate, AnimatePresence, motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  CardAnimationMode,
  useCardAnimationStore,
} from "../store/cardAnimationStore";
import Card, { CARD_WIDTH } from "./Card";
import { cn } from "../utils/cn";
import { InGameAnnounceMessages, useInGameAnnounceStore } from "../store/inGameAnnounceStore";
import { useTableStateStore } from "../store/tableStateStore";
import { useWindowSizeStore } from "../store/windowSizeState";

interface CardContainerProps {
  cards: number[];
  selectCardIndices: number[];
  handleSelectCard: (index: number) => void;
}

export default function CardContainer({
  cards,
  selectCardIndices,
  handleSelectCard,
}: CardContainerProps) {
  const { currentMode, processNext } = useCardAnimationStore();
  const cardX = Array.from({ length: 5 }, () => useMotionValue(0));
  const cardY = Array.from({ length: 5 }, () => useMotionValue(0));
  const ref = useRef<HTMLDivElement>(null);
  const [memoCards, setMemoCards] = useState<number[]>(cards);
  const [isCardSelectable, setIsCardSelectable] = useState(false);
  const [isPlayable, setIsPlayable] = useState(false);
  const { tableState } = useTableStateStore();
  const {
    setWindowWidth,
    setIsSmallWindow,
    isSmallWindow,
    windowWidth,
    setCardContainerPosition,
  } = useWindowSizeStore();

  useEffect(() => {
    setMemoCards((prev) =>
      cards.map((card, index) => {
        return card !== -1 ? card : prev[index];
      })
    );
  }, [cards]);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setWindowWidth(ref.current.offsetWidth);
        setCardContainerPosition(ref.current.getBoundingClientRect().top);
        if (ref.current.offsetWidth < 640) {
          setIsSmallWindow(true);
        } else {
          setIsSmallWindow(false);
        }
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call to set the width
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const reposition = () => {
      const remainingHand = cards.filter((card) => card !== -1);
      const overlapOffset = isSmallWindow ? 50 : 100;
      const handWidth =
        remainingHand.length * CARD_WIDTH -
        (remainingHand.length - 1) * (CARD_WIDTH - overlapOffset);
      const centerX = windowWidth / 2 - handWidth / 2;

      let count = 0;
      for (let i = 0; i < cards.length; i++) {
        if (cards[i] !== -1) {
          animate(cardX[i], centerX + count * overlapOffset);
          count++;
        }
      }
    };
    reposition();
  }, [windowWidth]);

  //handle card animation
  useEffect(() => {
    const cardSelectY = () => {
      cards.forEach((value, i) => {
        if (selectCardIndices.includes(i)) {
          animate(cardY[i], 365 - 20, {
            duration: 0.5,
            type: "spring",
            bounce: 0.5,
          });
        } else if (value !== -1) {
          animate(cardY[i], 365, {
            duration: 0.5,
            type: "spring",
            bounce: 0.5,
          });
        }
      });
    };

    const cardFallY = () => {
      for (let i = 0; i < cards.length; i++) {
        animate(cardY[i], 300 + 65, {
          duration: 0.3,
          type: "spring",
          bounce: 0,
          delay: i * 0.1,
          onComplete: () => {
            if (cards.length == i + 1) {
              processNext();
            }
          },
        });
      }
    };

    const cardUpY = () => {
      for (let i = 0; i < cards.length; i++) {
        animate(cardY[i], 0, {
          duration: 0.3,
          type: "spring",
          bounce: 0,
          delay: i * 0.1,
          onComplete: () => {
            if (cards.length - 1 === i) {
              processNext();
            }
          },
        });
      }
    };

    const cardFoldX = () => {
      const foldedOffset = 20;
      const remainingHand = cards.filter((card) => card !== -1);
      const centerX = windowWidth / 2 - (CARD_WIDTH + foldedOffset * 4) / 2;
      let completedAnimations = 0;
      const totalToAnimate = remainingHand.length;
      for (let i = 0; i < cards.length; i++) {
        if (cards[i] !== -1) {
          animate(cardX[i], centerX + i * 20, {
            duration: 0.5,
            type: "spring",
            bounce: 0,
            onComplete: () => {
              completedAnimations++;
              if (completedAnimations === totalToAnimate) {
                processNext();
              }
            },
          });
        }
      }
    };

    const cardFanoutX = () => {
      const remainingHand = cards.filter((card) => card !== -1);
      const overlapOffset = isSmallWindow ? 50 : 100;
      const handWidth =
        remainingHand.length * CARD_WIDTH -
        (remainingHand.length - 1) * (CARD_WIDTH - overlapOffset);
      const centerX = windowWidth / 2 - handWidth / 2;

      let count = 0;
      let completedAnimations = 0;
      const totalToAnimate = remainingHand.length;

      for (let i = 0; i < cards.length; i++) {
        if (cards[i] !== -1) {
          animate(cardX[i], centerX + count * overlapOffset, {
            duration: 0.6,
            type: "spring",
            bounce: 0,
            onComplete: () => {
              completedAnimations++;
              if (completedAnimations === totalToAnimate) {
                processNext();
              }
            },
          });
          count++;
        }
      }
    };

    const cardPlayedY = () => {
      let count = 0;
      const cardToAnimate = cards.filter((card) => card === -1).length;
      if (cardToAnimate === 0) {
        return;
      }
      for (let i = 0; i < cards.length; i++) {
        if (cards[i] == -1) {
          animate(cardY[i], 0, {
            duration: 0.5,
            type: "spring",
            bounce: 0,
            onComplete: () => {
              count++;
              if (count === cardToAnimate) {
                processNext();
              }
            },
          });
        }
      }
    };

    const flipTo = (to: "front" | "back") => {
      for (let i = 0; i < flip.length; i++) {
        setTimeout(() => {
          setFlippedCards((prev) => {
            const newFlips = [...prev];
            newFlips[i] =
              to === "back" ? true : to === "front" ? false : newFlips[i];
            return newFlips;
          });
          if (flip.length - 1 === i) {
            processNext();
          }
        }, i * 100);
      }
    };

    const wait = (duration: number) => {
      animate(0, 1, { duration, onComplete: () => processNext() });
    };

    const flipSelectedToBack = () => {
      cards.forEach((_, i) => {
        if (selectCardIndices.includes(i)) {
          setFlippedCards((prev) => {
            const newFlips = [...prev];
            newFlips[i] = true;
            return newFlips;
          });
        }
      });
      setTimeout(processNext, 300);
    };

    switch (currentMode) {
      //test
      case CardAnimationMode.SelectableOn:
        setIsCardSelectable(true);
        processNext();
        break;
      case CardAnimationMode.SelectableOff:
        setIsCardSelectable(false);
        processNext();
        break;
      case CardAnimationMode.Fold:
        cardFoldX();
        break;
      case CardAnimationMode.Fan:
        cardFanoutX();
        break;
      case CardAnimationMode.FlipToBack:
        flipTo("back");
        break;
      case CardAnimationMode.FlipToFront:
        flipTo("front");
        break;
      case CardAnimationMode.Fall:
        cardFallY();
        break;
      case CardAnimationMode.Up:
        cardUpY();
        break;
      case CardAnimationMode.PlayCard:
        // setIsCardSelectable(false)
        cardPlayedY();
        break;
      //use
      case CardAnimationMode.Ready:
        break;
      case CardAnimationMode.Wait:
        wait(1);
        break;
      case CardAnimationMode.FlipS:
        flipSelectedToBack();
        break;
      case CardAnimationMode.ClickableOn:
        setIsPlayable(true);
        processNext();
        break;
      case CardAnimationMode.ClickableOff:
        setIsPlayable(false);
        processNext();
        break;
      default:
        break;
    }
    if (currentMode === CardAnimationMode.Ready && isCardSelectable) {
      cardSelectY();
    }

    //TODO : check if i need to destroy animation when unmounting? /not sure how it work
  }, [cards, windowWidth, selectCardIndices, currentMode]);

  //flip
  const flip = Array.from({ length: 5 }, () => true);
  const [flippedCards, setFlippedCards] = useState<boolean[]>(flip);

  const { announceState, resetAnnounce } = useInGameAnnounceStore();

  useEffect(() => {
    if (announceState) {
      const timeout = setTimeout(() => {
        resetAnnounce();
      }, 2000); 

      return () => clearTimeout(timeout);
    }
  }, [announceState]);

  const [isCardContainerShow, setIsCardContainerShow] = useState(false);
  useEffect(() => {
    if (tableState === "boardSetupOne") {
      setIsCardContainerShow(true);
    }
    if (tableState === "initial") {
      //reset the position and selectable of card state
      cardY.forEach((y) => y.set(0));
      setIsCardSelectable(false);

      setIsCardContainerShow(false);
    }
  }, [tableState]);

  return (
    <>
      <div
        ref={ref}
        style={{ pointerEvents: isPlayable ? "auto" : "none" }}
        className={cn(
          "overflow-hidden relative items-center flex flex-row",
           "sm:h-[300px] h-[250px] max-w-[640px] w-full sm:rounded-full rounded-3xl"
        )}
      >
        <motion.div
          initial={{ width: 0, height: 0 }}
          animate={
            isCardContainerShow
              ? {
                  width: "100%",
                  height: isSmallWindow ? 250 : 300,
                  borderWidth: 10,
                }
              : { width: 0, height: 0 }
          }
          className="absolute left-[50%] -translate-x-[50%] 
       bg-darkgreen  sm:rounded-full rounded-3xl border-lightgreen "
        />
        <AnimatePresence mode="wait">
          {announceState && (
            <motion.div
              initial={{ opacity: 0, y: 10, left: "50%", translateX: "-50%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute  bottom-8
       font-pixelify text-sm px-1 text-white/80 rounded-full text-nowrap"
            >
              {InGameAnnounceMessages[announceState]}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div style={{ y: -450 }}>
          {cards.map((card, index) => (
            <Card
              key={index}
              cardX={cardX[index]}
              cardY={cardY[index]}
              index={index}
              handleSelectCard={handleSelectCard}
              isFlipped={flippedCards[index]}
              card={card}
              memoCard={memoCards[index]}
            />
          ))}
        </motion.div>
      </div>
    </>
  );
}
// const toggleShow = () => {
//   setShow((p) => !p);
// };
// const [showAni, setShowAni] = useState(true);

// {/* temp panel */}
// <button
//   onClick={() => setShowAni(!showAni)}
//   className="text-sm font-pixelify absolute top-0"
// >
//   animation control
// </button>
// <button
//   onClick={toggleShow}
//   className="text-sm font-pixelify absolute top-4"
// >
//   {show ? "hide" : "show"}
// </button>
// <div
//   className={`absolute flex flex-col font-pixelify -mt-[350px] ${
//     showAni ? "" : "hidden"
//   }`}
// >
//   {Object.values(CardAnimationMode).map((b) => (
//     <button
//       key={b}
//       className="text-white bg-black rounded-full mb-1 w-[100px]"
//       onClick={() => addToQueue([b])}
//     >
//       {b}
//     </button>
//   ))}
//   <div className="flex flex-row gap-x-1">
//     {queue.map((q, i) => (
//       <div key={i}>{q}</div>
//     ))}
//   </div>
// </div>
