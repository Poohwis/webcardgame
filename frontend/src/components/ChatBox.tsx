import { useEffect, useRef } from "react";
import { Action, Chat } from "../type";
import ChatItem from "./ChatItem";

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
    //TODO : add that if the user manually scroll disable auto scroll and active again when reach bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats]);
  return (
    <div className="font-nippo w-full h-[160px] flex flex-col m-4 bg-transparent border-2 border-accent rounded-md px-2 pb-2 ">
      <div className="flex flex-row justify-between">
        <div className="font-semibold text-sm text-orange">Message box</div>
        <div className="text-gray hover:cursor-pointer">-</div>
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
          className="font-nippo pl-1 rounded-md w-full bg-accent focus:outline-none caret-gray-400 text-lightgray text-sm py-[2px]"
          value={chatInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleMessageSend("chat");
            }
          }}
          onChange={(e) =>
            dispatch({ type: "SET_CHAT", payload: e.target.value })
          }
        />
      </div>
    </div>
  );
}

