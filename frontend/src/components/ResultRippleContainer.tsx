import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTableStateStore } from "../store/tableStateStore";
import { PCOLOR } from "../constant";
import { useGameStateStore } from "../store/gameStateStore";
import chroma from "chroma-js";
import { cn } from "../utils/cn";

interface ResultRippleContainerProps {
  width: number;
  height: number;
}
export default function ResultRippleContainer({
  width,
  height,
}: ResultRippleContainerProps) {
  const [animateRipple, setAnimateRipple] = useState(false);
  const { tableState } = useTableStateStore();
  const { turn } = useGameStateStore();

  useEffect(() => {
    if (tableState === "resultUpdate") {
      setAnimateRipple(true);
    } else {
      setAnimateRipple(false);
    }
  }, [tableState]);

  const handleResetRippleAnimation = () => {
    setAnimateRipple(false);
  };

  //for test animation TODO: DELETE
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "t") {
        setAnimateRipple((prev) => !prev);
        console.log("here");
      }
    };
    window.addEventListener("keypress", handleKeyPress);

    return () => window.removeEventListener("keypress", handleKeyPress);
  }, []);

  if (turn == -1) return;
  const expandScale = 1.6;
  const reduceScaleStep = 0.3;

  return (
    <motion.div
     style={{ width, height, visibility : tableState === "resultUpdate" ? "visible" : 'hidden' }} className="fixed w-full h-full">
      <Ripple
        expandScale={expandScale}
        animate={animateRipple}
        delay={0}
        duration={0.4}
        zIndex={10}
        tintRatio={0.2}
      />
      <Ripple
        expandScale={expandScale }
        animate={animateRipple}
        delay={0.15}
        duration={0.4}
        zIndex={20}
        foreground
      />
      <Ripple
        expandScale={expandScale - reduceScaleStep}
        animate={animateRipple}
        delay={0.2}
        duration={0.15}
        zIndex={30}
        tintRatio={0.4}
      />
      <Ripple
        expandScale={expandScale  - reduceScaleStep}
        animate={animateRipple}
        delay={0.3}
        duration={0.5}
        zIndex={40}
        foreground
        handleResetRippleAnimation={handleResetRippleAnimation}
      />
    </motion.div>
  );
}

const Ripple = ({
  expandScale,
  animate,
  delay,
  duration,
  foreground = false,
  zIndex,
  tintRatio,
  handleResetRippleAnimation,
}: {
  expandScale: number;
  animate: boolean;
  delay: number;
  duration: number;
  foreground?: boolean;
  zIndex: number;
  tintRatio?: number;
  handleResetRippleAnimation?: () => void;
}) => {
  const { isCallSuccess, turn } = useGameStateStore();
  return (
    <>
      <motion.div
        style={{
          backgroundColor: foreground
            ? "#fef9e1"
            : chroma
                .mix(
                  isCallSuccess ? PCOLOR[turn - 1] : "#374151",
                  "white",
                  tintRatio
                )
                .hex(),
        }}
        animate={
          animate
            ? { scale: expandScale, opacity: 1 }
            : { scale: 1, opacity: 1 }
        }
        transition={animate ? { scale: { delay, duration } } : { duration: 0 }}
        className={cn("w-full h-full rounded-full absolute", `z-[${zIndex}]`)}
        onAnimationComplete={handleResetRippleAnimation}
      />
    </>
  );
};
