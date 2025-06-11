import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type ErrorType = "errClosedRoom" | "errRoomFull";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const { type }: { type?: ErrorType } = location.state || {};

  const errorMessages: Record<ErrorType, string> = {
    errClosedRoom:
      "The room has already started or is not accepting new players.",
    errRoomFull:
      "The room is full. Please try again later or create a new one.",
  };

  const defaultMessage = "The page or room you're looking for does not exist.";
  const ref = useRef<HTMLHeadingElement>(null);
  const [textBoxHeight, setTextBoxHeight] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        const height = ref.current.getBoundingClientRect().height;
        setTextBoxHeight(height);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="px-10 overflow-hidden w-screen h-screen bg-radial from-primary via-cyan-200 to-rose-500 flex items-center justify-center flex-col text-center">
      <div
        className="z-50 font-silk flex flex-col items-center space-y-10 
       "
      >
        <div className="relative flex">
          <motion.div
            animate={{ height: textBoxHeight }}
            className="w-full  bg-black absolute top-3 -right-3 rounded-sm"
          />
          <h1
            ref={ref}
            className="z-20  text-xl mb-4 bg-red-800 text-white/80 px-2 py-2 rounded-sm"
          >
            {type ? errorMessages[type] : defaultMessage}
          </h1>
        </div>
        <motion.button
          onClick={() => navigate("/")}
          whileTap={{ y: 2 }}
          whileHover={{ scale: 1.02 }}
          className="flex-shrink hover:cursor-pointer bg-black text-white/80 hover:brightness-125 px-2 rounded-sm py-1"
        >
          Go back to home
        </motion.button>
      </div>
    </div>
  );
}
