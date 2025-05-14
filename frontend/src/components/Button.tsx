import { motion } from "motion/react";
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
export default function Button({ children, onClick, className }: ButtonProps) {
  return (
      <motion.button
        onClick={onClick}
        whileTap={{ y: 1 }}
        className={`font-nippo px-1 border-2  hover:opacity-80 rounded-sm ${className}`}
      >
        {children}
      </motion.button>
  );
}
