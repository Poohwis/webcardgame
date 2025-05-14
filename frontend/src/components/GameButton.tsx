import { motion } from "motion/react";
import { AnnounceType, useAnnounceStore } from "../store/announceStore";
import { useTableStateStore } from "../store/tableStateStore";
interface GameButtonProps {
  onClick: () => void;
  isSending: boolean;
  disabled: boolean;
  title: string;
  activeColor: string;
  type: "call" | "throw";
  turn: number;
  order: number;
  showDelaySecond : number
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
  showDelaySecond
}: GameButtonProps) {
  const { setAnnounce, resetAnnounce } = useAnnounceStore();
  const { tableState } = useTableStateStore();
  return (
    <motion.button
      initial={{scale : 0}}
      animate={tableState === "boardSetupOne" && {scale : 1}}
      transition={{delay : showDelaySecond}}
      onClick={onClick}
      whileTap={{ y: 2 }}
      onTap={() => {
        if (!disabled) {
          return resetAnnounce();
        }
        if (turn !== order) return;
        if (type === "call") {
          return setAnnounce(AnnounceType.NoCallAllowed);
        }
        if (type === "throw") {
          return setAnnounce(AnnounceType.CardNotSelect);
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
