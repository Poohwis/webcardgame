import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { motion } from "motion/react";
import { MdEdit } from "react-icons/md";
import { useKeyboardStore } from "../store/keyboardStore";
import { PCOLOR } from "../constant";
import { Action } from "../type";

interface UserEditButtonProps {
  roomUrl?: string;
  displayName: string;
  order: number;
  dispatch: React.Dispatch<Action>;
  handleSendNameChange: () => void;
}
export default function UserEditButton({
  roomUrl,
  displayName,
  order,
  dispatch,
  handleSendNameChange,
}: UserEditButtonProps) {
  //TODO : change to use environment url
  const { setNameEditMode, setChatMode } = useKeyboardStore();
  const inviteUrl = `http://localhost:5173/ws/${roomUrl}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const inviteRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isNameEdit, setIsNameEdit] = useState(false);
  const [prevDisplayName, setPrevDisplayName] = useState(displayName);
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
    if (isNameEdit && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, inputRef.current.value.length);
    }
  }, [isNameEdit]);

  useEffect(() => {
    if (!isCopied) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (inviteRef.current && inviteRef.current.contains(e.target as Node)) {
        return;
      }
      setIsCopied(false);
    };
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key) {
        setIsCopied(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isCopied]);

  const handleSetName = () => {
    if (displayName.trim().length === 0) {
      dispatch({ type: "SET_DISPLAYNAME", payload: prevDisplayName });
    } else if (displayName !== prevDisplayName) {
      setPrevDisplayName(displayName);
      handleSendNameChange();
    }
    setIsNameEdit(false);
    setChatMode();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSetName();
    }
    if (e.key === "Escape") {
      dispatch({ type: "SET_DISPLAYNAME", payload: prevDisplayName });
      setIsNameEdit(false);
      setChatMode();
    }
  };
  const onBlur = () => {
    console.log("onBlur");
    handleSetName();
  };
  return (
    <div className="text-sm flex-1 flex-col bg-red- items-start sm:flex hidden">
      <Button
        onClick={handleCopyUrl}
        className="z-20 border-orange bg-orange text-white/80"
      >
        {isCopied ? "Url Copied!" : "Invite friend +"}
      </Button>
      <motion.div
        ref={inviteRef}
        className={`z-10 py-1 absolute border-2 border-orange rounded-md text-white/80 px-2 transition bg-orange ${
          isCopied ? " -translate-y-10 opacity-100" : " opacity-0"
        }`}
      >
        {inviteUrl}
        <span
          className="ml-2 hover:cursor-pointer text-white/80"
          onClick={() => setIsCopied(false)}
        >
          x
        </span>
        <div className="absolute left-4 -z-10 -bottom-[7px]  w-3 h-3  border-r-2 border-b-2 rotate-45 bg-orange border-orange rounded-sm" />
      </motion.div>
      <div className="pl-1 flex flex-row items-center gap-x-1">
        <span className="font-semibold text-orange">Your name: </span>
        {isNameEdit ? (
          <div className="flex flex-row items-center gap-x-1 relative">
            <input
              ref={inputRef}
              type="text"
              className="outline-none bg-transparent h-4 font-semibold"
              style={{ color: PCOLOR[order - 1] }}
              minLength={1}
              maxLength={15}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              value={displayName}
              onChange={(e) =>
                dispatch({ type: "SET_DISPLAYNAME", payload: e.target.value })
              }
            />
            <div className="absolute -bottom-6 text-sm text-lightgray sm:block hidden">
              <span className="border-[1px] border-lightgray rounded-[4px] px-1 mr-1">
                Enter
              </span>
              to confirm
            </div>
          </div>
        ) : (
          <div className="flex flex-row font-semibold items-center gap-x-1">
            <span style={{ color: PCOLOR[order - 1] }}>{displayName}</span>
            <div
              onClick={() => {
                setNameEditMode();
                setIsNameEdit(true);
              }}
              className="hover:cursor-pointer hover:bg-accent transition-colors rounded-full "
            >
              <MdEdit size={14} color={"gray"} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
