import { useEffect, useState, useRef } from "react";
import Card from "./components/Card_old";
import { motion, useMotionValue, useSpring } from "motion/react";
import { CARD } from "./constant";

function Board() {
  const symbol = ["Ace", "King", "Queen", "Jack", "Joker"];
  const [cards, setCards] = useState<number[]>([]);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number[]>([]);
  const cardX = Array.from({ length: 5 }, () => useMotionValue(0));
  const cardY = Array.from({ length: 5 }, () => useMotionValue(0));
  const x = cardX.map((value) =>
    useSpring(value, { bounce: 0, duration: 600 })
  );
  const y = cardY.map((value) =>
    useSpring(value, { bounce: 0.5, duration: 300 })
  );
  const handPosX = useMotionValue(0);
  const handX = useSpring(handPosX, { bounce: 0, duration: 600 });

  const ref = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
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

  useEffect(() => {
    //temporaty setup cards
    //TODO : receive cards from server
    setCards([0, 1, 2, 3, 4]);
    cardX.forEach((value, index) => value.set(index * CARD.OFFSET));
  }, []);

  useEffect(() => {
    //set start of hands
    const remainingHand = cards.filter((card) => card !== -1);
    const handWidth =
      remainingHand.length * CARD.WIDTH -
      (remainingHand.length - 1) * (CARD.WIDTH - CARD.OFFSET);
    const centerX = windowWidth / 2 - handWidth / 2;
    handX.set(centerX);

    //update cards positionX
    let count = 0;
    for (let i = 0; i < cards.length; i++) {
      if (cards[i] !== -1) {
        cardX[i].set(count * CARD.OFFSET);
        count += 1;
      } else {
        cardY[i].set(-500);
      }
    }
  }, [cards, windowWidth]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        //TODO : send playcard event to server
        setCards((prevCards) =>
          prevCards.map((card, index) =>
            selectedCardIdx.includes(index) ? -1 : card
          )
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCardIdx]);

  const handleSelectCard = (index: number) => {
    setSelectedCardIdx((prev) => {
      if (prev.includes(index)) {
        cardY[index].set(0);
        return prev.filter((i) => i !== index);
      } else {
        cardY[index].set(-20);
        return [...prev, index];
      }
    });
  };

  return (
    <div className="w-screen h-screen bg-stone-300 flex justify-center">
      <div ref={ref} className="max-w-screen-xl w-full h-full relative">
        <div className="absolute flex">
          {cards.map((item) => (
            <div>{item}</div>
          ))}
        </div>
        <div className="absolute flex right-10">
          {selectedCardIdx.map((item) => (
            <div>{item}</div>
          ))}
        </div>
        <motion.div
          className="absolute"
          style={{ y: windowHeight - CARD.HEIGHT - 100, x: handX }}
        >
          {cards.map((card, index) => (
            <Card
              key={index}
              name={card == -1 ? "Joker" : symbol[card]}
              index={index}
              isSelected={selectedCardIdx.includes(index)}
              x={x[index]}
              y={y[index]}
              onClick={handleSelectCard}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default Board;
