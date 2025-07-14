import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useWindowSizeStore } from "../store/windowSizeStateStore";
import { useTableStateStore } from "../store/tableStateStore";
import { useGameStateStore } from "../store/gameStateStore";
import chroma from "chroma-js";
import { PCOLOR } from "../constant";
import { PlayCallRippleSound } from "../utils/sound";

export default function CallRipple() {
  const [animateRipple, setAnimateRipple] = useState(true);
  const { tableState } = useTableStateStore();
  const { turn} = useGameStateStore();

  useEffect(() => {
    if (tableState === "resultUpdate") {
      setAnimateRipple(true);
      PlayCallRippleSound()
    } else {
      setAnimateRipple(false);
    }
  }, [tableState]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimateRipple(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [animateRipple]);

  if (turn === -1) return;
  return (
    <>
      <div className="flex items-center justify-center absolute top-1/2 left-1/2">
        <>
          <Ripple
            scale={2}
            animateRipple={animateRipple}
            colorRatio={0.6}
            delay={0}
          />
          <Ripple
            scale={1.9}
            animateRipple={animateRipple}
            colorRatio={0.3}
            delay={0.3}
          />
          <Ripple
            scale={1.7}
            animateRipple={animateRipple}
            colorRatio={0.1}
            delay={0.4}
          />
        </>
      </div>
    </>
  );
}

const Ripple = ({
  scale,
  animateRipple,
  colorRatio,
  delay,
}: {
  scale: number;
  animateRipple: boolean;
  colorRatio: number;
  delay: number;
}) => {
  const { isSmallWindow } = useWindowSizeStore();
  const { isCallSuccess, turn } = useGameStateStore();

  const borderColor = chroma
    .mix(isCallSuccess ? PCOLOR[turn - 1] : "#374151", "white", colorRatio)
    .hex();

  return (
    <motion.div
      style={
        isSmallWindow
          ? { width: 250, height: 250, borderColor: borderColor }
          : { width: 400, height: 400, borderColor: borderColor }
      }
      initial={{ opacity: 0 }}
      animate={
        animateRipple
          ? {
              opacity: [1, 0],
              scale,
              transition: {
                ease: [0, 0, 0.2, 1],
                duration: 0.8,
                delay,
              },
            }
          : { opacity: 0, transition: { duration: 0 } }
      }
      className="border-[60px] rounded-full absolute "
    />
  );
};
