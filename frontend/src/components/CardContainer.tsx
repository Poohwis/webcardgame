import { animate, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface CardContainerProps {
  cards: number[];
  selectCardIndices: number[];
  handleSelectCard: (index: number) => void;
}

enum cardAnimationMode {
  Hide = "hide",
  Show = "show",
  Fan = "fan",
  Reposition = "reposition",
  PlayCard = "playcard",
  Fold = "fold",
  Flip = "flip",
  Fall = "fall"
}
export default function CardContainer({
  cards,
  selectCardIndices,
  handleSelectCard,
}: CardContainerProps) {
  const cardsName = ["ACE", "JACK", "KING", "QUEEN", "JOKER"];
  const cardX = Array.from({ length: 5 }, () => useMotionValue(0));
  const cardY = Array.from({ length: 5 }, () => useMotionValue(0));
  const x = cardX.map((value) =>
    useSpring(value, { bounce: 0, duration: 600 })
  );
  const y = cardY.map((value) =>
    useSpring(value, { bounce: 0.5, duration: 600 })
  );
  const ref = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const handPosX = useMotionValue(0);
  const handX = useSpring(handPosX, { bounce: 0, duration: 600 });

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

  const [mode, setMode] = useState<cardAnimationMode>(cardAnimationMode.Hide);
  //handle card animation
  useEffect(() => {
    const cardSelectY = () => {
      cards.forEach((value, i) => {
        if (selectCardIndices.includes(i)) {
          animate(cardY[i],365-20, {duration: 0.5, type: "spring", bounce: 0.5})
        } else if (value !== -1) {
          animate(cardY[i],365, {duration: 0.5, type: "spring", bounce: 0.5})
        }
      });
    };

    const repositionX = () => {
      const remainingHand = cards.filter((card) => card !== -1);
      const handWidth =
        remainingHand.length * 120 - (remainingHand.length - 1) * (120 - 100);
      const centerX = windowWidth / 2 - handWidth / 2;

      handX.set(centerX);
    };

    const cardFallY = () => {
      for (let i = 0; i < cards.length; i++) {
        setTimeout(() => 
          // cardY[i].set(300 + 65)
          animate(cardY[i], 300 + 65, {duration : 0.3, type: 'spring', bounce : 0})
        , i * 100)
      }
    };

    const cardFoldX = () => {
      for (let i = 0; i < cards.length; i++) {
        if (cards[i] !== -1) {
          animate(cardX[i], i * 20, {duration: 0.5, type: "spring", bounce: 0})
        }
      }
    };

    const cardHideY = () => {
    };
    const cardShowY = () => {
    };

    const cardFanoutX = () => {
      let count = 0;
      for (let i = 0; i < cards.length; i++) {
        if (cards[i] !== -1) {
          animate(cardX[i], count * 100, {duration : 0.5, type: "spring", bounce : 0})
          count += 1;
        }
      }
    };
    const cardPlayedY = () => {
      for (let i = 0; i < cards.length; i++) {
        if (cards[i] == -1) {
          animate(cardY[i], -300, {duration : 0.5, type: "spring", bounce : 0})
        }
      }
    };
    const updateCardPosition = async () => {
      cardPlayedY();
      await new Promise((r) => setTimeout(r, 300));
      cardFanoutX();
      repositionX();
    };
    // updateCardPosition();
    cardSelectY();
    cardPlayedY()
    switch (mode) {
      case cardAnimationMode.Fold:
        cardFoldX();
        break;
      case cardAnimationMode.Fan:
        cardFanoutX();
        break;
      case cardAnimationMode.Reposition:
        repositionX();
        break;
      case cardAnimationMode.Flip:
        flipAll();
        break;
      case cardAnimationMode.Hide:
        cardHideY();
        break;
      case cardAnimationMode.Show:
        cardShowY();
        break;
      case cardAnimationMode.Fall:
        cardFallY();
        break;
      default:
        break;
    }
    //TODO : check if i need to destroy when unmounting
  }, [cards, windowWidth, selectCardIndices, mode]);

  //flip
  const flip = Array.from({ length: 5 }, () => true);
  const [flippedCards, setFlippedCards] = useState<boolean[]>(flip);
  const toggleCardFlip = (index: number) => {
    setFlippedCards((prev) => {
      const newFlips = [...prev];
      newFlips[index] = !newFlips[index];
      return newFlips;
    });
  };
  const flipAll = () => {
    for (let i = 0; i < flip.length; i++) {
      setTimeout(() => {
        setFlippedCards((prev) => {
          const newFlips = [...prev];
          newFlips[i] = !newFlips[i];
          return newFlips;
        });
      }, i * 100);
    }
  };

  const [show, setShow] =useState(true)
  const toggleShow = () => {
    setShow((p)=>!p)
  }
  return (
    <div
      ref={ref}
      className={`flex flex-row h-[300px] bg-darkgreen w-[1000px] rounded-full ${show ? "" : "overflow-hidden"}`}
    >
      <div className="absolute flex flex-col font-pixelify">
        <div>current mode: {mode}</div>
        <button onClick={flipAll}>flipall</button>
        <button onClick={toggleShow}>{show ? "hide" : "show"}</button>
        {Object.values(cardAnimationMode).map((b)=>(
          <button className="text-white bg-black rounded-full mb-1" onClick={()=>setMode(b)}>{b}</button>
        ))}
      </div>
      <motion.div style={{ x: handX, y: -300 }}>
        {cards.map((card, index) => (
          <motion.div
            key={index}
            style={{ y: cardY[index], x: cardX[index], perspective: 1000 }}
            onClick={() => handleSelectCard(index)}
            className="absolute w-[120px] h-[170px] cursor-pointer "
          >
            <motion.div
              className="relative w-full h-full rounded-lg border-[1px] border-gray-200 flex items-center justify-center font-nippo"
              animate={{ rotateY: flippedCards[index] ? 180 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front Side */}
              <div
                className="absolute w-full h-full bg-white rounded-lg flex pt-1 pl-2"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div
                  className="text-3xl font-bold"
                >
                  {card !== -1 ? cardsName[card][0] : ""}
                </div>
              </div>

              {/* Back Side */}
              <div
                className="absolute w-full h-full bg-gray-800 text-white rounded-lg flex items-center justify-center text-xl font-bold"
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                }}
              >
                Back
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
