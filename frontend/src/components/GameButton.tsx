import { motion } from "motion/react";
interface GameButtonProps {
  onClick: () => void;
  isSending: boolean;
  disabled: boolean;
  title: string;
  activeColor: string;
}
export default function GameButton({
  onClick,
  isSending,
  disabled,
  title,
  activeColor,
}: GameButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ y: 2 }}
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
