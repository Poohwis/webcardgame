import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { useWindowSizeStore } from "../store/windowSizeStateStore";

interface InviteButtonProps {
  roomUrl?: string;
  position: number;
}
export default function InviteButton({ roomUrl, position }: InviteButtonProps) {
  //TODO use environment link
  const inviteUrl = `http://localhost:5173/ws/${roomUrl}`;
  const [isCopied, setIsCopied] = useState(false);
  const { isSmallWindow } = useWindowSizeStore();

  const handleCopyUrl = async () => {
    if (isCopied) {
      setIsCopied(false);
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
    } catch (error) {
      console.log("Failed to copy:", error);
    }
  };

  useEffect(() => {
    if (!isCopied) return;
    const timeout = setTimeout(() => {
      setIsCopied(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isCopied]);

  return (
    <motion.button
      onClick={handleCopyUrl}
      whileTap={{ y: 2 }}
      style={isSmallWindow ? { top: position + 20 } : { top: position + 20 }}
      exit={{ scale: 0 }}
      transition={{ scale: { delay: 0.8 } }}
      animate={{ width: isCopied ? 125 : 150 }}
      className={cn(
        "z-10 absolute px-2 font-silk items-center justify-center text-center text-nowrap hover:cursor-pointer transition-colors flex flex-row  w-auto",
        isCopied
          ? "bg-lime-800 text-lime-200 rounded-full"
          : "bg-black text-white/80 rounded-sm"
      )}
    >
      {isCopied ? (
        "URL Copied"
      ) : (
        <div className="flex flex-row items-center justify-center gap-x-1">
          Invite Friend
        </div>
      )}
      <AnimatePresence>
        {isCopied && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 40 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bg-lime-800 bottom-1 font-mono font-bold px-2 rounded-sm text-lime-200"
          >
            {inviteUrl}
            <div className="w-3 h-3 -top-[6px] left-1/2 -translate-x-1/2 bg-[#475350] -z-10 rounded-tl-sm rotate-45 absolute" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
