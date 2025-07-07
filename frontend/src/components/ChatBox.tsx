import { useEffect, useRef } from "react";
import { Action, Chat } from "../type";
import ChatItem from "./ChatItem";
import { cn } from "../utils/cn";
import { motion } from "motion/react";

interface ChatBoxProps {
  chats: Chat[];
  chatInput: string;
  handleMessageSend: (type: string) => void;
  dispatch: React.Dispatch<Action>;
}
export default function ChatBox({
  chats,
  chatInput,
  handleMessageSend,
  dispatch,
}: ChatBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   const handleKeyDown = () => {
  //     if (inputRef.current && mode === "chat") {
  //       inputRef.current.focus();
  //     }
  //   };
  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [mode]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats]);
  return (
    <>
      <motion.div
        style={{ width: "19vw" }}
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className={cn(
          "font-nippo sm:h-[150px] lg:flex hidden flex-col m-4",
          "bg-gray-900/70 shadow-md shadow-gray-800",
          "rounded-md px-2 pb-2 "
        )}
      >
        <div className="flex flex-row justify-between">
          <div className="text-sm text-white/80 px-2 mt-2">Message box</div>
        </div>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-1 my-1 scrollbar"
        >
          <ChatItem chats={chats} />
        </div>
        <div className="flex items-center flex-row ">
          <input
            ref={inputRef}
            type="text"
            className="font-nippo pl-1 rounded-md w-full bg-gray-800 focus:outline-none caret-gray-400 text-white/80 text-sm py-[2px]"
            value={chatInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (chatInput.trim() === "") return;
                handleMessageSend("chat");
              }
            }}
            onChange={(e) =>
              dispatch({ type: "SET_CHAT", payload: e.target.value })
            }
          />
        </div>
      </motion.div>
    </>
  );
}
