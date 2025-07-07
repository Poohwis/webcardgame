import { useEffect, useState } from "react";
import WaveTextWrapper from "./WaveTextWrapper";
import { PCOLOR } from "../constant";
import { useGameStateStore } from "../store/gameStateStore";
import { useTableStateStore } from "../store/tableStateStore";

export default function CallResultTextContainer() {
  const [isCallSuccess, setIsCallSuccess] = useState(false);
  const [isCallFail, setIsCallFail] = useState(false);
  const { turn } = useGameStateStore();
  const { tableState } = useTableStateStore();
  const { currentState } = useGameStateStore();
  const [color, setColor] = useState("");

  useEffect(() => {
    setColor(PCOLOR[turn - 1]);
  }, [turn]);

  const handleCallSuccess = () => {
    if (!isCallSuccess) setIsCallSuccess(true);
  };
  const handleCallFail = () => {
    if (!isCallFail) setIsCallFail(true);
  };

  useEffect(() => {
    if (!isCallFail) return;

    const timeout = setTimeout(() => {
      setIsCallFail(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isCallFail]);

  useEffect(() => {
    if (tableState === "callSuccess") {
      setTimeout(() => handleCallSuccess(), 2000);
    }
    if (tableState === "callFail") {
      setTimeout(() => handleCallFail(), 2000);
    }
  }, [tableState]);

  return (
    <>
      {currentState !== "initial" && (
        <>
          <ResultText
            text={"CALL"}
            color={color}
            textTrigger={isCallSuccess}
            topPosition="45%"
            onWaveEnd={() => setIsCallSuccess(false)}
          />
          <ResultText
            text={"SUCCESS"}
            color={color}
            textTrigger={isCallSuccess}
            topPosition="60%"
            onWaveEnd={() => setIsCallSuccess(false)}
          />

          <ResultText
            text={"CALL FAIL"}
            color={"#374151"}
            textTrigger={isCallFail}
            topPosition="55%"
            onWaveEnd={() => setIsCallFail(false)}
          />
        </>
      )}
    </>
  );
}

interface ResultTextProps {
  text: string;
  color: string;
  textTrigger: boolean;
  topPosition: string;
  onWaveEnd: () => void;
}
const ResultText = ({
  text,
  color,
  textTrigger,
  topPosition,
  onWaveEnd,
}: ResultTextProps) => {
  return (
    <div
      style={{
        WebkitTextStroke: `4px white`,
        color,
        top: topPosition,
      }}
      className="z-[100] absolute left-[50%] -translate-x-[50%] -skew-y-12
        font-nippo font-extrabold sm:text-[100px] text-6xl text-nowrap hover:cursor-default"
    >
      <WaveTextWrapper textTrigger={textTrigger} onWaveEnd={onWaveEnd}>
        {text}
      </WaveTextWrapper>
    </div>
  );
};
