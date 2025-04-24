import { useGameStateStore } from "../store/gameStateStore";
import { PCOLOR } from "../constant";
import { motion } from "motion/react";
import c from "../../src/assets/svg/c.png";
import { User } from "../type";
import { cn } from "../utils/cn";
import chroma from "chroma-js";
import React, { useEffect, useRef, useState } from "react";
import { useTableStateStore } from "../store/tableStateStore";
import RoundPlayCardIndicator from "./RoundPlayCardIndicator";

interface UserBannerProps {
  users: User[];
  order: number;
}

interface BannerProps {
  isIndicateTurn: boolean;
  isLeading: boolean;
  isBannerShow: boolean;
  remainCard: number;
  chance: number;
  score: number;
  playerName: string;
  playerOrder: number;
}

export default function UserBanner({
  users,
  order: selfOrder,
}: UserBannerProps) {
  const { playersHandCount, playersScore, playersChance, turn, currentState } =
    useGameStateStore();
  const { tableState, pointerState } = useTableStateStore();

  //position of banner show->left top right
  const largeBannerPosition = {
    1: { left: "20%", top: "50%", translate: "-50%" },
    2: { left: "50%", top: 50, translate: "-50%" },
    3: { left: "80%", top: "50%", translate: "-50%" },
  };

  const smallBannerPosition = {
    1: "left",
    2: "top",
    3: "right",
  };

  function getLeadingPlayer(arr: number[]) {
    const max = Math.max(...arr);
    const indices = arr.reduce<number[]>((acc, val, idx) => {
      if (val === max) acc.push(idx);
      return acc;
    }, []);
    return indices.length === 1 ? indices[0] : -1;
  }

  return (
    <>
      <div className="absolute top-0 left-[50%] font-silk text-darkgreen -translate-x-[50%]">
        tableState: {tableState}
      </div>
      <div className="absolute top-4 left-[50%] font-pixelify -translate-x-[50%]">
        currentState: {currentState}
      </div>
      {users.map((user) => {
        const povSlot = ((user.order - selfOrder + 4) % 4) as 1 | 2 | 3 | 0;
        const userIndex = user.order - 1;
        const isBannerShow = currentState === "start";
        if (povSlot === 0)
          return (
            <div key={user.order}>
              <SelfBanner
                isIndicateTurn={
                  turn == selfOrder && pointerState === "pointing"
                }
                isLeading={getLeadingPlayer(playersScore) === userIndex}
                score={playersScore[userIndex]}
                chance={playersChance[userIndex]}
                playerOrder={selfOrder}
                isBannerShow={isBannerShow}
              />
            </div>
          );
        return (
          <div key={user.order}>
            <SmallBanner
              isBannerShow={isBannerShow}
              isIndicateTurn={turn == user.order && pointerState === "pointing"}
              isLeading={getLeadingPlayer(playersScore) === userIndex}
              position={
                smallBannerPosition[povSlot] as "left" | "right" | "top"
              }
              score={playersScore[userIndex]}
              chance={playersChance[userIndex]}
              remainCard={playersHandCount[userIndex]}
              playerName={user.displayName}
              playerOrder={user.order}
            />
            <LargeBanner
              isIndicateTurn={turn == user.order && pointerState === "pointing"}
              isTopBanner={povSlot === 2}
              isBannerShow={isBannerShow}
              isLeading={getLeadingPlayer(playersScore) === userIndex}
              position={largeBannerPosition[povSlot]}
              score={playersScore[userIndex]}
              chance={playersChance[userIndex]}
              remainCard={playersHandCount[userIndex]}
              playerName={user.displayName}
              playerOrder={user.order}
            />
          </div>
        );
      })}
    </>
  );
}

const SelfBanner = ({
  isIndicateTurn,
  isLeading,
  isBannerShow,
  chance,
  score,
  playerOrder,
}: Pick<
  BannerProps,
  | "isIndicateTurn"
  | "isLeading"
  | "isBannerShow"
  | "chance"
  | "score"
  | "playerOrder"
>) => {
  const hilightColor = chroma.mix(PCOLOR[playerOrder - 1], "white", 0.4).hex();

  const [animatedScore, setAnimatedScore] = useState(score);
  const [animatedChance, setAnimatedChance] = useState(chance);
  const { tableState } = useTableStateStore();
  const width = 162;
  const height = 48;
  const hilightOffset = 10;

  useEffect(() => {
    if (tableState === "initial") {
      setAnimatedScore(score);
      setAnimatedChance(chance);
    }
    if (tableState === "resultUpdate") {
      setAnimatedScore(score);
      setAnimatedChance(chance);
    }
  }, [tableState, score, chance]);

  return (
    <>
      {/* Container */}
      <ResultPopup
        position={{ left: "50%", bottom: 15, translate: 110 }}
        score={animatedScore}
        chance={animatedChance}
      />
      <div
        className="z-50 w-[200px] h-[65px] absolute -bottom-[10px] overflow-hidden
     left-[50%] -translate-x-[50%] flex items-end justify-center"
      >
        {/* Main */}
        <motion.div
          initial={{ y: 100 }}
          animate={isBannerShow && { y: 0 }}
          style={{ top: 17 }}
          className="z-50 w-[162px] h-[65px] relative
      rounded-t-lg font-pixelify flex flex-col items-center"
        >
          <motion.div
            style={{ backgroundColor: hilightColor }}
            initial={{ width, height }}
            animate={
              isIndicateTurn
                ? {
                    width: width + hilightOffset,
                    height: height + hilightOffset / 2,
                    top: -hilightOffset / 2,
                  }
                : {}
            }
            transition={{ delay: 1 }}
            className="z-10 absolute top-0 rounded-t-lg"
          />
          <motion.img
            src={c}
            initial={{ opacity: 0, rotateZ: 40 }}
            animate={
              isLeading
                ? { opacity: 1, x: 0, y: 0 }
                : { opacity: 0, x: 10, y: -10 }
            }
            transition={{ delay: 4 }}
            alt="crown"
            className="z-50 absolute w-[22px] h-[22px] -top-3 -right-2"
          />
          <div
            style={{ backgroundColor: PCOLOR[playerOrder - 1] }}
            className="z-30 w-full h-full px-3 py-1  rounded-t-lg"
          >
            <div className="flex flex-row justify-between sm:text-sm text-[12px] text-white/80 w-full">
              <div>CHANCE</div>
              <div>SCORE</div>
            </div>
            <div className="flex flex-row sm:text-sm text-[12px] justify-between items-center w-full">
              <ChanceBox type={"large"} chance={animatedChance} />
              <div className=" bg-white/80 text-gray-600 w-4 h-4 text-center rounded-full flex items-center justify-center">
                {animatedScore}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

const SmallBanner = ({
  isIndicateTurn,
  isLeading,
  remainCard,
  chance,
  position,
  score,
  playerName,
  playerOrder,
  isBannerShow,
}: BannerProps & { position: "left" | "right" | "top" }) => {
  if (position == "top") return;
  const hilightColor = chroma.mix(PCOLOR[playerOrder - 1], "white", 0.4).hex();
  const isLeftSide = position == "left"; //This banner only available at left or right side on mobile screen : top use largebanner
  const width = 48;
  const height = 190;
  const hilightOffset = 10;

  const [animatedScore, setAnimatedScore] = useState(score);
  const [animatedChance, setAnimatedChance] = useState(chance);
  const { tableState } = useTableStateStore();

  useEffect(() => {
    if (tableState === "initial") {
      setAnimatedScore(score);
      setAnimatedChance(chance);
    }
    if (tableState === "resultUpdate") {
      setAnimatedScore(score);
      setAnimatedChance(chance);
    }
  }, [tableState, score, chance]);

  return (
    <motion.div
      style={isLeftSide ? { left: 0 } : { right: width }}
      initial={isLeftSide ? { opacity: 0, x: -10 } : { opacity: 0, x: 10 }}
      animate={isBannerShow && { x: 0, opacity: 1 }}
      className="absolute top-[50%] -mt-12 sm:hidden flex"
    >
      <ResultPopup
        position={
          isLeftSide
            ? { left: 15, top: height + 15 }
            : { right: -width + 15, top: height + 15 }
        }
        score={animatedScore}
        chance={animatedChance}
      />
      <motion.div
        style={{ backgroundColor: hilightColor }}
        initial={{ width, height }}
        animate={
          isIndicateTurn
            ? {
                width: width + hilightOffset,
                height: height + hilightOffset,
                left: -hilightOffset / 2,
                top: -hilightOffset / 2,
              }
            : {}
        }
        className={cn("absolute", isLeftSide ? "rounded-r-lg" : "rounded-l-lg")}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={
          isLeading
            ? {
                opacity: 1,
                x: 0,
                y: 0,
                rotateZ: isLeftSide ? 40 : -40,
              }
            : {
                opacity: 0,
                x: isLeftSide ? 10 : -10,
                y: -10,
                rotateZ: isLeftSide ? 40 : -40,
              }
        }
        transition={{ delay: 4 }}
        className={cn(
          " z-50 w-[22px] h-[22px] flex items-center justify-center absolute -top-3",
          isLeftSide ? " left-9 rotate-[40deg]" : "-right-3 -rotate-[40deg]"
        )}
      >
        <motion.img src={c} alt="crown" className="w-[22px] h-[22px]" />
      </motion.div>
      <div
        style={{
          width: width,
          height: height,
          backgroundColor: PCOLOR[playerOrder - 1],
        }}
        className={cn(
          "z-30 absolute flex flex-col items-center font-pixelify overflow-hidden text-white/80",
          isLeftSide ? "rounded-r-lg" : "rounded-l-lg"
        )}
      >
        <div className={cn("mt-4  text-white", isLeftSide ? "mr-1" : "ml-1")}>
          {playerName.split("")[0] || ""}
        </div>
        <div className="text-[12px]">CHANCE</div>
        <ChanceBox type="small" chance={animatedChance} />
        <div className="flex flex-col items-center text-[12px] rounded-lg mt-1 px-1">
          <div>SCORE</div>
          <div className="text-gray-600 w-3 h-3 rounded-full flex items-center justify-center bg-white/80 ">
            {animatedScore}
          </div>
        </div>
      </div>
      <div
        className={cn(
          "z-50 flex flex-col items-center justify-center absolute -bottom-[180px] w-[100px] h-[68px] overflow-hidden",
          isLeftSide ? "rotate-90 -right-16" : "-rotate-90 -left-4"
        )}
      >
        {tableState === "start" &&
          Array.from({ length: 5 }).map((_, index) => (
            <MiniCard
              key={index}
              index={index}
              remain={typeof remainCard === "undefined" ? 0 : remainCard}
            />
          ))}
      </div>
    </motion.div>
  );
};

const LargeBanner = ({
  isIndicateTurn,
  isLeading,
  remainCard,
  chance,
  position,
  score,
  playerName,
  playerOrder,
  isTopBanner,
  isBannerShow,
}: BannerProps & { isTopBanner: boolean; position: React.CSSProperties }) => {
  const hilightColor = chroma.mix(PCOLOR[playerOrder - 1], "white", 0.4).hex();
  const width = 162;
  const height = 72;
  const hilightOffset = 10;
  const [animatedScore, setAnimatedScore] = useState(score);
  const [animatedChance, setAnimatedChance] = useState(chance);
  const { tableState } = useTableStateStore();

  useEffect(() => {
    if (tableState === "initial") {
      setAnimatedScore(score);
      setAnimatedChance(chance);
    }
    if (tableState === "resultUpdate") {
      setAnimatedScore(score);
      setAnimatedChance(chance);
    }
  }, [tableState, score, chance]);
  return (
    <div className={cn(isTopBanner ? " flex " : " sm:flex hidden")}>
      <ResultPopup
        position={{ ...position, translate: "110px 35px" }}
        score={animatedScore}
        chance={animatedChance}
      />
      <motion.div
        style={position}
        initial={{ opacity: 0, y: 10 }}
        animate={isBannerShow && { opacity: 1, y: 0 }}
        className="absolute"
      >
        <motion.div
          style={{ backgroundColor: hilightColor }}
          initial={{ width, height }}
          animate={
            isIndicateTurn
              ? {
                  width: width + hilightOffset,
                  height: height + hilightOffset,
                  left: -hilightOffset / 2,
                  top: -hilightOffset / 2,
                }
              : {}
          }
          transition={{ delay: 1 }}
          className="z-10 absolute rounded-lg"
        />
        {/* Leading */}
        <motion.img
          src={c}
          alt="wincount"
          initial={{ opacity: 0 }}
          animate={
            isLeading
              ? { opacity: 1, x: 0, y: 0, rotateZ: 40 }
              : { opacity: 0, x: 10, y: -10, rotateZ: 40 }
          }
          transition={{ delay: 4 }}
          className="z-50 absolute w-[22px] h-[22px] -top-3 -right-2 rotate-[40deg]"
        />
        {/* Banner */}
        <div
          style={{
            background: PCOLOR[playerOrder - 1],
            width,
            height,
          }}
          className="z-20 relative flex flex-col rounded-lg px-3 py-1 items-start justify-start font-pixelify"
        >
          <div className="text-white">{playerName}</div>
          <div className="flex flex-row justify-between sm:text-sm text-[12px] text-white/80 w-full">
            <div>CHANCE</div>
            <div>SCORE</div>
          </div>
          <div className="flex flex-row sm:text-sm text-[12px] justify-between items-center w-full">
            <ChanceBox type={"large"} chance={animatedChance} />
            <div className=" bg-white/80 text-gray-600 w-4 h-4 text-center rounded-full flex items-center justify-center">
              {animatedScore}
            </div>
          </div>
        </div>
        {/* Card remain */}
        <div className="z-50 absolute w-[100px] h-[50px]  left-[50%] -translate-x-[50%] -bottom-6 flex overflow-hidden border-[0px] items-center justify-center">
          {tableState === "start" &&
            Array.from({ length: 5 }).map((_, index) => (
              <MiniCard
                key={index}
                index={index}
                remain={typeof remainCard === "undefined" ? 0 : remainCard}
              />
            ))}
        </div>
      </motion.div>
    </div>
  );
};

const MiniCard = ({ index, remain }: { index: number; remain: number }) => {
  const centerIndex = Math.floor((remain - 1) / 2);
  const a = 1.75;
  const position = index - centerIndex;
  const cardWidth = 24; // Width of each card
  const spacing = -8; // Spacing between cards
  const totalWidth = (remain - 1) * (cardWidth + spacing); // Total width occupied
  const startX = -totalWidth / 2; // Start from the negative half
  const isPlayed = remain - 1 >= index;
  return (
    <motion.div
      animate={{
        x: startX + (cardWidth + spacing) * index, // Centered X calculation
        y: isPlayed ? a * Math.pow(position, 2) : -70,
        rotateZ: position * 10,
      }}
      className="cursor-default absolute w-[24px] h-[34px] bg-white rounded-sm p-[2px]"
    >
      <div className="bg-red-800 w-full h-full" />
    </motion.div>
  );
};

const ChanceBox = ({
  type,
  chance,
}: {
  type: "large" | "small";
  chance: number;
}) => {
  if (type === "small") {
    return (
      <div className="flex flex-row space-x-1">
        {Array.from({ length: chance }).map((_, index) => (
          <div key={index} className="w-1 h-1 bg-white/70" />
        ))}
      </div>
    );
  } else {
    return (
      <div className="flex flex-row space-x-1">
        {Array.from({ length: chance }).map((_, index) => (
          <div key={index} className="w-[6px] h-[6px] bg-white/70" />
        ))}
      </div>
    );
  }
};

const ResultPopup = ({
  position,
  score,
  chance,
}: {
  position: React.CSSProperties;
  score: number;
  chance: number;
}) => {
  const [isShow, setIsShow] = useState(false);
  const [mode, setMode] = useState<"score" | "chance">("score");
  const prevScoreRef = useRef<number | undefined>(score);
  const prevChanceRef = useRef<number | undefined>(chance);
  const { tableState } = useTableStateStore();

  useEffect(() => {
    if (prevScoreRef.current !== undefined && score !== prevScoreRef.current) {
      setMode("score");
      setIsShow(true);
    }
    if (
      prevChanceRef.current !== undefined &&
      chance !== prevChanceRef.current &&
      chance < prevChanceRef.current
    ) {
      setMode("chance");
      setIsShow(true);
    }

    prevChanceRef.current = chance;
    prevScoreRef.current = score;
  }, [score, chance, tableState]);

  useEffect(() => {
    if (isShow) {
      const timeout = setTimeout(() => {
        setIsShow(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isShow]);

  return (
    <motion.div
      style={position}
      initial={{ opacity: 0, y: 15 }}
      animate={isShow ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
      className={cn(
        "z-50 hover:cursor-default absolute w-6 h-6 bg-transparent",
        " text-3xl font-pixelify flex flex-col items-center justify-center -space-y-1 right-10",
        mode === "score" ? "text-[#ffb743]" : "text-red-400"
      )}
    >
      <div>{mode === "score" ? "+1" : "-1"}</div>
      <div className="text-sm font-bold bg-gray-600 rounded-full px-1">
        {mode === "score" ? "SCORE" : "CHANCE"}
      </div>
    </motion.div>
  );
};
