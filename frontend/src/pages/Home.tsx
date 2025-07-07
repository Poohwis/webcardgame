import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../utils/cn";
import { useEffect, useState } from "react";
import HomeCard from "../components/HomeCard";
export default function HomePage() {
  const navigate = useNavigate();
  const [inputedRoomCode, setInputedRoomCode] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const handleCreateRoom = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}create`);
      const roomURL = await response.text();

      const roomId = roomURL.split("/").pop();
      navigate(`/ws/${roomId}`);
    } catch (err) {
      //TODO:show the error
      console.error("Error creating room:", err);
    }
  };
  const handleJoinRoom = async () => {
    const trimmedCode = inputedRoomCode.trim();
    if (!trimmedCode || trimmedCode.length !== 8) {
      console.error("Invalid room code");
      setErrMessage("Invalid room code");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}validate/${inputedRoomCode}`);
      if (res.ok) {
        navigate(`/ws/${inputedRoomCode}`);
      } else {
        setErrMessage("Room not found");
        console.error("room not found");
      }
    } catch (err) {
      console.error("Error validating room:", err);
    }
  };

  useEffect(() => {
    if (errMessage) {
      const timer = setTimeout(() => setErrMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errMessage]);

  //z-index base at 50
  return (
    <div
      className="inline-flex flex-col items-center justify-center w-screen h-screen overflow-hidden relative
                  bg-radial from-primary via-lime-200 to-cyan-800"
    >
      <HomeCard />
      <div
        className="z-[51] bg-gradient-to-t from-gray-800 to-gray-600 w-[250px] h-[800px]
       absolute top-0 rounded-b-md shadow-md shadow-black "
      />
      <div className="z-[52]">
        {/* Gamebanner */}
        <motion.div
          className="relative font-silk flex items-center justify-center overflow-hidden bg-red-800 px-1 py-4 text-2xl w-[220px]
            rounded-md text-white h-20"
        >
          {Array.from({ length: 23 }).map((_, index) => (
            <motion.div
              key={index}
              style={{ width: 230 - index * 10, height: 230 - index * 10 }}
              className={cn(
                "absolute rounded-full",
                index % 2 === 0 ? "bg-red-800" : "bg-red-900"
              )}
            />
          ))}
          <motion.h1 className="z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-nowrap">
            Liar's card
          </motion.h1>
        </motion.div>

        {/* Separator */}
        <motion.div className="z-10 h-[2px] w-[220px] bg-gray-700 mt-6 mb-8" />

        {/* Create and join Menu */}
        <div className="flex flex-col w-[220px] items-end relative">
          <motion.button
            whileTap={{ y: 2 }}
            type="submit"
            onClick={handleCreateRoom}
            exit={{ x: 230 }}
            transition={{ delay: 0.3 }}
            className="font-silk bg-black px-2 text-white/80 group hover:cursor-pointer relative w-[140px] h-6 flex flex-row overflow-hidden rounded-sm justify-end"
          >
            <div className="z-20">Create room</div>
            <div className="bg-lime-500 h-6 w-[140px] absolute -right-[140px] z-10 group-hover:-translate-x-[140px] transition-transform" />
          </motion.button>

          <span className="font-silk text-sm mt-4 text-white/80">or</span>
          <span className="font-silk text-sm mt-2 text-white/80">
            <span className="text-lime-500">join </span>
            with code
          </span>
          <div className="flex flex-row">
            <input
              type="text"
              maxLength={8}
              value={inputedRoomCode}
              onChange={(e) => {
                setErrMessage("");
                setInputedRoomCode(e.target.value);
              }}
              className={cn(
                "flex focus:outline-none font-mono w-[100px] h-6 bg-lime-100 pl-1 text-gray-800 border-t-2 border-l-2 border-b-2 box-border -mr-1",
                errMessage ? "border-red-500" : "border-gray-500"
              )}
            />

            <motion.button
              whileTap={{ y: 2 }}
              type="submit"
              onClick={handleJoinRoom}
              exit={{ x: 230 }}
              transition={{ delay: 0.3 }}
              className="font-silk bg-black px-2 text-white/80 group hover:cursor-pointer relative w- h-6 flex flex-row overflow-hidden rounded-sm"
            >
              <div className="z-20 ">join</div>
              <div className="bg-lime-500 h-6 w-[140px] absolute -right-[140px] z-10 group-hover:-translate-x-[140px] transition-transform" />
            </motion.button>
          </div>
          <AnimatePresence>
            {errMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="font-nippo text-red-500 absolute -bottom-8"
              >
                {errMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const Footer = () => {
  return (
    <div className="z-[51] absolute bg-gray-700 text-white/80 bottom-2 font-mono px-2 text-[12px] rounded-md text-center border-2 border-gray-500 shadow-sm shadow-black">
      Demo project made by P.Phuwis<br></br>see more on my{" "}
      <a
        target="_blank"
        href={"https://phuwis-portfolio.vercel.app/"}
        className="text-lime-500/80 underline"
      >
        portfolio
      </a>
    </div>
  );
};
