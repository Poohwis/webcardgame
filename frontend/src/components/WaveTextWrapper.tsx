"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import wait from "../utils/wait";

interface WaveTextWrapperProps {
  children: string;
  textTrigger: boolean;
  onWaveEnd: () => void;
}

export default function WaveTextWrapper({
  children,
  textTrigger,
  onWaveEnd,
}: WaveTextWrapperProps) {
  const [isWaving, setIsWaving] = useState(false);

  useEffect(() => {
    if (textTrigger && !isWaving) {
      setIsWaving(true);
    }
  }, [textTrigger, isWaving]);

  const letters = children.split("").concat(" ");

  return (
    <div className="inline-block">
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0 }}
          animate={
            isWaving
              ? {
                  y: [0, -50, 0],
                  scale: [1, 2, 1],
                  opacity: 1,
                  transition: {
                    delay: i * 0.05,
                    duration: i === letters.length - 1 ? 2 : 0.2,
                    ease: "easeInOut",
                  },
                }
              : {}
          }
          onAnimationComplete={async() => {
            if (i === letters.length - 1) {
              await wait(1500)
            console.log("end")
              setIsWaving(false);
              onWaveEnd();
            }
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}
