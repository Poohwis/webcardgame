import { FaVolumeDown, FaVolumeMute } from "react-icons/fa";
import { useBgmStore } from "../store/bgmStore";
import { motion } from "motion/react";
import { useGameStateStore } from "../store/gameStateStore";
import { useEffect } from "react";

export default function BgmSetting() {
  const { muted, toggle, play } = useBgmStore();
  const {currentState} =useGameStateStore()

  useEffect(()=> {
    if(currentState === "start") {
      play()
    }
    
  }, [currentState])

  return (
    <>
    <motion.button
      onClick={toggle}
      className="z-[100] absolute sm:right-10 sm:top-6 right-4 top-4 flex flex-col bg-gray-800/20 rounded-full p-2 hover:opacity-80 shadow-sm shadow-black"
    >
      <div>
        {!muted ? (
          <FaVolumeDown className="text-lime-500" />
        ) : (
          <FaVolumeMute className="text-gray-400" />
        )}
      </div>
    </motion.button>
    </>
  );
}
