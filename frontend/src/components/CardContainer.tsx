import { animate, motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  CardAnimationMode,
  useCardAnimationStore,
} from "../store/cardAnimationStore";
import Card, { CARD_WIDTH } from "./Card";

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
  const { currentMode, processNext, queue, addToQueue } =
    useCardAnimationStore();
  const cardX = Array.from({ length: 5 }, () => useMotionValue(0));
  const cardY = Array.from({ length: 5 }, () => useMotionValue(0));
  const ref = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [removedCards, setRemovedCards] = useState<(number | null)[]>(cards);
  const [isCardSelectable, setIsCardSelectable] = useState(false);

  useEffect(() => {
    setRemovedCards((prev) =>
      cards.map((card, index) => (card !== -1 ? card : prev[index]))
    );
  }, [cards]);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        setWindowWidth(ref.current.offsetWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call to set the width
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
      const foldedOffset = 20
      const remainingHand = cards.filter((card) => card !== -1);
      const centerX = windowWidth / 2 - ((CARD_WIDTH ) + (foldedOffset * 4))/2 
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
      const handWidth =
        remainingHand.length * 120 - (remainingHand.length - 1) * (120 - 100);
      const centerX = windowWidth / 2 - handWidth / 2;

      let count = 0;
      let completedAnimations = 0;
      const totalToAnimate = remainingHand.length;

      for (let i = 0; i < cards.length; i++) {
        if (cards[i] !== -1) {
          animate(cardX[i], centerX + count * 100, {
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

  //TODO : DELETE show/hide control panel
  const [show, setShow] = useState(false);
  const toggleShow = () => {
    setShow((p) => !p);
  };
  const [showAni, setShowAni] = useState(true);

  return (
    <div
      ref={ref}
      className={`flex flex-row h-[300px] bg-darkgreen w-[1000px] rounded-2xl 
        border-lightgreen border-4
        ${show ? "" : "overflow-hidden"}`}
    >
      {/* temp panel */}
      <button
        onClick={() => setShowAni(!showAni)}
        className="text-sm font-pixelify absolute top-0"
      >
        animation control
      </button>
      <button
        onClick={toggleShow}
        className="text-sm font-pixelify absolute top-4"
      >
        {show ? "hide" : "show"}
      </button>
      <div
        className={`absolute flex flex-col font-pixelify -mt-[350px] ${
          showAni ? "" : "hidden"
        }`}
      >
        {Object.values(CardAnimationMode).map((b) => (
          <button
            key={b}
            className="text-white bg-black rounded-full mb-1 w-[100px]"
            onClick={() => addToQueue([b])}
          >
            {b}
          </button>
        ))}
        <div className="flex flex-row gap-x-1">
          {queue.map((q, i) => (
            <div key={i}>{q}</div>
          ))}
        </div>
      </div>
      <motion.div style={{ y: -300 }}>
        {cards.map((card, index) => (
          <Card
            key={index}
            cardX={cardX[index]}
            cardY={cardY[index]}
            index={index}
            handleSelectCard={handleSelectCard}
            isFlipped={flippedCards[index]}
            card={card}
            removedCard={removedCards[index] || null}
          />
        ))}
      </motion.div>
    </div>
  );
}
