import { motion } from "motion/react";
import { InGameAnnounceType, useInGameAnnounceStore } from "../store/inGameAnnounceStore";
import { useTableStateStore } from "../store/tableStateStore";
import { useEffect, useState } from "react";
interface GameButtonProps {
  onClick: () => void;
  isSending: boolean;
  disabled: boolean;
  title: string;
  activeColor: string;
  type: "call" | "throw";
  turn: number;
  order: number;
  showDelaySecond: number;
}
export default function GameButton({
  onClick,
  isSending,
  disabled,
  title,
  activeColor,
  type,
  turn,
  order,
  showDelaySecond,
}: GameButtonProps) {
  const { setAnnounce, resetAnnounce } = useInGameAnnounceStore();
  const { tableState } = useTableStateStore();
  const [isButtonShow, setIsButtonShow] = useState(false);

  useEffect(()=> {
    if(tableState === "boardSetupOne") {
      setIsButtonShow(true)
    }
    if(tableState === "initial") {
      setIsButtonShow(false)
    }

  },[tableState])

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={isButtonShow ? { scale: 1 } : {scale : 0}}
      transition={{ delay: showDelaySecond }}
      onClick={onClick}
      whileTap={{ y: 2 }}
      onTap={() => {
        if (!disabled) {
          return resetAnnounce();
        }
        if (turn !== order) return;
        if (type === "call") {
          return setAnnounce(InGameAnnounceType.NoCallAllowed);
        }
        if (type === "throw") {
          return setAnnounce(InGameAnnounceType.CardNotSelect);
        }
      }}
      className="
            hover:cursor-pointer relative h-[40px] overflow-hidden bg-gray-500 text-white/80 font-silk 
            rounded-full  min-w-[140px]"
      disabled={disabled || isSending}
    >
      <motion.p
        initial={{ y: 0 }}
        animate={!disabled ? { y: -46 } : { y: 0 }}
        className="h-full flex items-center justify-center bg-gray-500 "
      >
        {title}
      </motion.p>
      <motion.div
        initial={{ y: 0 }}
        animate={!disabled ? { y: -46 } : { y: 0 }}
        className={`w-full h-[50px] ${activeColor} absolute flex items-center justify-center hover:opacity-80`}
      >
        {title}
      </motion.div>
    </motion.button>
  );
}
