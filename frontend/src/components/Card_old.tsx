import { motion, MotionValue } from "motion/react";

interface CardProps {
  name: string;
  index: number;
  isSelected: boolean;
  x : MotionValue
  y : MotionValue
  onClick: (index: number) => void;
}

export default function Card({ name, onClick, index, isSelected, x, y }: CardProps) {
  const firstLetter = name.split("")[0] 
  const restLetter = name.slice(1) ;
  return (
      <motion.div
        onClick={() => onClick(index)}
        style={{
          x: x, y: y
        }}
        className="absolute bg-white w-[150px] h-[200px] hover:cursor-pointer 
         rounded-lg border-[1px] border-gray-300 flex items-start flex-col justify-between font-nippo"
      >
        <div className="text-3xl font-bold pt-1 pl-2 flex items-center justify-center">
          {firstLetter}
          <span className="text-gray-400">{restLetter}</span>
        </div>
        <div className="text-3xl font-bold pb-1 pl-2 flex items-center justify-center self-end rotate-180">
          {firstLetter}
          <span className="text-gray-400">{restLetter}</span>
        </div>
      </motion.div>
  );
}
