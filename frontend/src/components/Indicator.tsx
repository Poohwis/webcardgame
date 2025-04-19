import {
  AnimationControls,
  motion,
  TargetAndTransition,
  Transition,
  VariantLabels,
} from "motion/react";
import { useEffect, useMemo, useState } from "react";
import wait from "../utils/wait";
import { useGameStateStore } from "../store/gameStateStore";
import { PointerMode, RingMode, useTableStateStore } from "../store/tableStateStore";
interface IndicatorProps {
  playerOrder: number;
  tableSize: number;
}

type Animate =
  | boolean
  | VariantLabels
  | AnimationControls
  | TargetAndTransition
  | undefined;

type AnimationConfig<T extends string> = Record<
  T,
  { animate?: Animate; transition?: Transition }
>;

type RingAnimation = AnimationConfig<RingMode>;
type PointerAnimation = AnimationConfig<PointerMode>;

export default function Indicator({ playerOrder, tableSize }: IndicatorProps) {
  const { turn } = useGameStateStore();
  const { tableState, pointerState, setPointerState, ringState, setRingState } =
    useTableStateStore();
  const [pointerStartPosition, setPointerStartPosition] = useState(0);
  const [rotateIncrement, setRotateIncrement] = useState(0);
  const ringAnimation: RingAnimation = useMemo(
    () => ({
      initial: {},
      start: {
        animate: {
          width: tableSize + 25,
          height: tableSize + 25,
        },
        transition: { type: "spring", duration: 0.4, bounce: 0.5 },
      },
    }),
    [tableSize]
  );

  const pointerAnimation: PointerAnimation = useMemo(
    () => ({
      initial: {},
      pointing: { animate: { y: tableSize / 2 - tableSize / 4 / 4 } },
    }),
    [tableSize]
  );

  useEffect(() => {
    if (tableState === "start") {
      setRingState("start");
      setPointerStartPosition(turn - playerOrder);
      setRotateIncrement(0);
      // console.log("turn-playerOrder:", turn - playerOrder);

      (async () => {
        await wait(1500);
        setPointerState("pointing");
      })();
    } else {
      setPointerState("initial");
    }
  }, [tableState]);

  const [prevTurn, setPrevTurn] = useState<number[]>([]);
  useEffect(() => {
    if (turn === prevTurn.slice(-1)[0]) return;
    setPrevTurn((prev) => [...prev, turn]);
    console.log("TurnChange");
  }, [turn]);

  const [temp, setTemp] = useState(0);
  useEffect(() => {
    const prev = prevTurn.slice(-2)[0];
    if (prev === -1 || turn === -1) return;
    if (temp === prev) return;
    const increment = turn > prev ? turn - prev : 4 - (prev - turn);
    setRotateIncrement(rotateIncrement + increment);
    setTemp(prev);
    console.log("PrevTurnChange");
  }, [prevTurn]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "g") {
        setRotateIncrement((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <motion.div
        style={{
          width: tableSize,
          height: tableSize,
        }}
        animate={ringAnimation[ringState].animate}
        transition={ringAnimation[ringState].transition}
        className="absolute bg-lightgreen rounded-full flex justify-center items-center"
      >
        <motion.div
          style={{
            width: tableSize,
            height: tableSize,
          }}
          animate={{ rotateZ: (pointerStartPosition + rotateIncrement) * 90 }}
          transition={{ delay: 1 }}
          className="bg-transparent flex items-center justify-center"
        >
          {/* pointer */}
          <motion.div
            style={{
              width: tableSize / 5,
              height: tableSize / 5,
              rotateZ: 45,
            }}
            initial={{ y: 0 }}
            animate={pointerAnimation[pointerState].animate}
            className=" bg-darkgreen absolute rounded-lg "
          />
        </motion.div>
      </motion.div>
    </>
  );
}
