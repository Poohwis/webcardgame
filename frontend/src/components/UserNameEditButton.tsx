import { useEffect, useRef, useState } from "react";
import { MdEdit } from "react-icons/md";
import { useKeyboardStore } from "../store/keyboardStore";
import { PCOLOR } from "../constant";
import { AnimatePresence, motion } from "motion/react";
import {
  GeneralAnnounceMessage,
  GeneralAnnounceType,
  useGeneralAnnounceStore,
} from "../store/generalAnnounceStore";
import { AutoLangInput } from "./AutoLangInput";

interface UserNameEditButtonProps {
  displayName: string;
  order: number;
  handleSendNameChange: (newName: string) => void;
}
export default function UserNameEditButton({
  displayName,
  order,
  handleSendNameChange,
}: UserNameEditButtonProps) {
  //TODO : change to use environment url
  const { setNameEditMode, setChatMode } = useKeyboardStore();
  const { generalAnnounceState, resetGeneralAnnounce } =
    useGeneralAnnounceStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isNameEdit, setIsNameEdit] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    setNameInput(displayName);
  }, [displayName]);

  useEffect(() => {
    if (isNameEdit && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, inputRef.current.value.length);
    }
  }, [isNameEdit]);

  const handleSetName = () => {
    if (nameInput.trim().length === 0) {
      setNameInput(displayName);
    } else if (nameInput !== displayName) {
      handleSendNameChange(nameInput);
    }
    setIsNameEdit(false);
    setChatMode();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSetName();
    }
    if (e.key === "Escape") {
      setNameInput(displayName);
      setIsNameEdit(false);
      setChatMode();
    }
  };

  useEffect(() => {
    if (generalAnnounceState) {
      if (generalAnnounceState === GeneralAnnounceType.RejectNameChange) {
        setNameInput(displayName);
      }
      const timeout = setTimeout(() => {
        resetGeneralAnnounce();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [generalAnnounceState]);

  return (
    <>
      {isNameEdit ? (
        <motion.div
          className="w-auto font-nippo text-sm flex-1 flex-col items-start flex text-nowrap
        bg-gray-900/50 px-2 py-2 rounded-lg shadow-sm shadow-black space-y-1"
        >
          <div className="flex flex-row justify-between w-full px-1">
            <div className="text-sm text-white/80 ">Display name</div>
            <button className="text-gray-400">-</button>
          </div>
          <div className="flex flex-row items-center gap-x-1 ">
            <motion.div className="flex flex-row relative px-2  bg-gray-800 rounded-md w-[180px]">
              <AutoLangInput
                ref={inputRef}
                type="text"
                className="outline-none font-semibold bg-transparent"
                style={{ color: PCOLOR[order - 1] }}
                minLength={1}
                maxLength={16}
                onBlur={handleSetName}
                onKeyDown={onKeyDown}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <div className="absolute right-2 text-[10px] text-white/80">
                Enter
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <div className="relative">
          <AnimatePresence mode="wait">
            {generalAnnounceState === GeneralAnnounceType.RejectNameChange && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: -5 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute sm:-top-5 right-0 text-center font-nippo text-red-500/80 text-sm text-nowrap bg-gray-800 px-2 rounded-full"
              >
                {GeneralAnnounceMessage[generalAnnounceState]}
              </motion.div>
            )}
            {generalAnnounceState === GeneralAnnounceType.SuccessNameChange && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: -5 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute sm:-top-5 top-10 right-0 text-center font-nippo text-lime-500/80 text-sm text-nowrap bg-gray-800 px-2 rounded-full"
              >
                Name change successfull
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => {
              setNameEditMode();
              setIsNameEdit(true);
            }}
            className="sm:w-[125px] sm:flex hidden hover:opacity-90 sm:px-2 h-6 w-6 
             rounded-full bg-gray-800/50 flex-row font-nippo gap-x-1 text-white/80 text-sm items-center justify-center"
          >
            <div className="sm:flex hidden py-1">Change name</div>
            <MdEdit />
          </button>
        </div>
      )}
    </>
  );
}

