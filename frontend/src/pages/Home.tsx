import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../utils/cn";
import { useEffect, useState } from "react";
import HomeCard from "../components/HomeCard";
import BgmSetting from "../components/BgmSetting";
export default function HomePage() {
  const navigate = useNavigate();
  const [inputedRoomCode, setInputedRoomCode] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const handleCreateRoom = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}create`);
      const roomURL = await response.text();

      const roomId = roomURL.split("/").pop();
      navigate(`/room/${roomId}`);
    } catch (err) {
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
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}validate/${inputedRoomCode}`
      );
      if (res.ok) {
        navigate(`/room/${inputedRoomCode}`);
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
      <BgmSetting />
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
    <div className="z-[52] absolute bg-gray-700 text-white/80 bottom-2 font-mono px-2 text-[12px] rounded-md text-center border-2 border-gray-500 shadow-sm shadow-black">
      <Acknowledgments />
      <br />© 2025 Phuwis — Liar's card
    </div>
  );
};

export function Acknowledgments() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-blue-300 rounded-lg underline"
      >
        Acknowledgments
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 font-nippo">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-lg relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-4 text-gray-600 hover:text-black text-xl"
            >
              &times;
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-black">
              Sound & Music Credits
            </h2>
            <ul className="space-y-4 text-sm text-gray-800">
              <li>
                <strong>slap-cards</strong> by <em>themfish</em> —{" "}
                <a
                  href="https://freesound.org/s/45821/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Freesound
                </a>{" "}
                (License: Attribution 4.0)
              </li>
              <li>
                <strong>Card Flip</strong> by <em>f4ngy</em> —{" "}
                <a
                  href="https://freesound.org/s/240776/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Freesound
                </a>{" "}
                (License: Attribution 4.0)
              </li>
              <li>
                Sound Effect by{" "}
                <a
                  href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6346"
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  freesound_community
                </a>{" "}
                from{" "}
                <a
                  href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6346"
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pixabay
                </a>
              </li>
              <li>
                Music by{" "}
                <a
                  href="https://pixabay.com/users/backgroundmusicforvideos-46459014/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=353636"
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Maksym Malko
                </a>{" "}
                from{" "}
                <a
                  href="https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=353636"
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pixabay
                </a>
              </li>
            </ul>
            <div className="flex flex-col mt-10">
              <h2 className="text-2xl font-semibold mb-4 text-black">
                Card visual inspiration
              </h2>
              <div className="text-black text-sm text-balance">
                The card design was inspired by the minimalist aesthetic of
                <a
                  className="px-1 underline text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.kickstarter.com/projects/imaginative-monkey/light-roast-playing-cards/creator"
                >
                  Siavash Mortazavi’s
                </a>
                work. This is a personal hobby project and not affiliated with
                or endorsed by them.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
