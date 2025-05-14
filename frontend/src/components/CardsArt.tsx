import { cn } from "../utils/cn";

interface CardsArtProps {
  card: number;
  sm?: boolean;
  isHover?: boolean;
}
export function CardsArt({ card, sm = false, isHover }: CardsArtProps) {
  switch (card) {
    case 0:
      return <AceArt sm={sm} isHover={isHover} />;
    case 1:
      return <JackArt sm={sm} isHover={isHover} />;
    case 2:
      return <KingArt sm={sm} isHover={isHover} />;
    case 3:
      return <QueenArt sm={sm} />;
    case 4:
      return <JokerArt sm={sm} />;
  }
}

interface ArtProps {
  sm: boolean;
  isHover?: boolean;
}
const AceArt = ({ sm, isHover }: ArtProps) => {
  return (
    <div
      className={cn(
        "top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[60px] h-[75px]",
        "absolute flex flex-col rounded-[4px] bg-lime-800 ",
        sm ? "scale-[0.83]" : ""
      )}
    >
      <div
        className={cn(
          " w-6 h-9 -bottom-[3px] absolute -translate-x-[50%] left-[50%] rounded-[4px]",
          isHover ? "bg-gray-100" : "bg-white"
        )}
      />
      <div
        className={cn(
          " w-6 h-6 top-3 absolute -translate-x-[50%] left-[50%] rounded-full ",
          isHover ? "bg-gray-100" : "bg-white"
        )}
      />
    </div>
  );
};
const JackArt = ({ sm, isHover }: ArtProps) => {
  const skinColor = "#fadca9";
  return (
    <div
      style={{ backgroundColor: skinColor }}
      className={cn(
        "top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]",
        "w-[60px] h-[75px] absolute flex flex-col rounded-[4px]",
        sm ? "scale-[0.83]" : ""
      )}
    >
      <div className="bg-gray-700 w-2 h-[74px] absolute left-0 rounded-br-full" />
      <div className="bg-gray-700 w-2 h-[74px] absolute right-0 rounded-bl-full" />
      <div className="w-full h-7 bg-gray-700 z-10 flex relative">
        <div className="w-2 h-2 bg-[#fadca9] absolute -bottom-1 left-[50%] -translate-x-[50%] rotate-45" />
        <div className="w-full h-4 bg-red-800 flex items-center justify-between ">
          <div
            className={cn(
              "w-0 h-0 absolute -mt-3 border-r-[32px] border-r-transparent border-t-[6px] -ml-[1px]",
              isHover ? "border-t-gray-100" : "border-t-white"
            )}
          />
          <div
            className={cn(
              "w-0 h-0 absolute right-0 -mt-3 border-l-[32px] border-l-transparent border-t-[6px] -mr-[1px]",
              isHover ? "border-t-gray-100" : "border-t-white"
            )}
          />
        </div>
      </div>
      <div className="flex flex-row gap-x-1 absolute bottom-4 left-[50%] -translate-x-[50%]">
        <div
          className="w-0 h-0 "
          style={{
            borderLeft: "20px solid transparent",
            borderBottom: "4px solid #374151", // triangle color
          }}
        />
        <div
          className="w-0 h-0 "
          style={{
            borderRight: "20px solid transparent",
            borderBottom: "4px solid #374151", // triangle color
          }}
        />
      </div>
    </div>
  );
};
const KingArt = ({ sm, isHover }: ArtProps) => {
  const skinColor = "#fadca9";
  return (
    <div
      style={{ backgroundColor: skinColor }}
      className={cn(
        "top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]",
        "w-[60px] h-[75px] absolute flex flex-col",
        sm ? "scale-[0.83]" : ""
      )}
    >
      <div className="bg-amber-700 w-[3px] h-12 absolute left-0" />
      <div className="bg-amber-700 w-[3px] h-12 absolute right-0" />
      <div className="relative w-full h-7 bg-yellow-500 flex flex-row justify-between">
        <div
          className={cn(
            "w-6 h-6 -mt-3 rotate-[45deg]",
            isHover ? "bg-gray-100" : "bg-white"
          )}
        />
        <div
          className={cn(
            "w-6 h-6 -mt-3 rotate-[45deg]",
            isHover ? "bg-gray-100" : "bg-white"
          )}
        />
        <div className="w-full h-[1px] bg-yellow-600 absolute bottom-0" />
      </div>
      <div className="w-full h-8 pb-1 px-1 rounded-b-[4px] bg-amber-700 absolute bottom-0 flex flex-row justify-around">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-full w-[2px] bg-amber-600" />
        ))}
      </div>
    </div>
  );
};

const QueenArt = ({ sm }: ArtProps) => {
  const skinColor = "#fadca9";
  return (
    <div
      style={{ backgroundColor: skinColor }}
      className={cn(
        "top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]",
        "w-[60px] h-[75px] absolute flex flex-col overflow-hidden rounded-[4px]",
        sm ? "scale-[0.83]" : ""
      )}
    >
      <div className="bg-rose-600 w-[3px] h-20 absolute left-0" />
      <div className="bg-rose-600 w-[3px] h-20 absolute right-0" />
      <div className="w-[95%] h-2 bg-yellow-500 absolute z-20 left-[50%] -translate-x-[50%] top-4 rounded-t-sm" />
      <div className="w-[11px] h-[11px] rotate-45 bg-yellow-500 absolute z-20 left-[50%] -translate-x-[50%] top-[10px] " />
      <div className="bg-rose-600 w-16 h-16 -mt-7 rotate-12 rounded-br-3xl absolute z-10" />
      <div className="bg-rose-700 w-16 h-16 -mt-[23px] rotate-[20deg] rounded-br-3xl absolute" />
      <div className="bg-rose-500 w-2 h-2 absolute bottom-2 left-[50%] -translate-x-[50%] rotate-45 flex items-center justify-center">
        <div
          style={{ backgroundColor: skinColor }}
          className="w-4 h-[1px] -rotate-45 absolute"
        />
      </div>
    </div>
  );
};
const JokerArt = ({ sm }: ArtProps) => {
  return (
    <>
      {/* <div className="absolute w-4 h-4 bg-red-800 rounded-full top-[40px] left-[20%] z-10"></div> */}
      <div
        className={cn(
          "top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]",
          "w-[60px] h-[75px] absolute flex flex-col rounded-[4px]",
          sm ? "scale-[0.83]" : ""
        )}
      >
        <div className="w-0 h-0 absolute top-0 -left-[22px] z-10">
          <div
            className="w-[50px] h-[40px] bg-red-800 z-10"
            style={{
              clipPath: "polygon(45% 0, 25% 100%, 100% 0)",
            }}
          />
          <div
            className="w-3 h-3 bg-gray-800 z-10 absolute translate-x-1 rotate-[24deg] -translate-y-[2px]"
            style={{
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            }}
          />
        </div>

        <div className="w-0 h-0 absolute top-0 right-[28px] z-10">
          <div
            className="w-[50px] h-[40px] bg-gray-800 z-10 scale-x-[-1]"
            style={{
              clipPath: "polygon(45% 0, 25% 100%, 100% 0)",
            }}
          />
          <div
            className="w-3 h-3 bg-red-800 z-10 absolute rotate-[62deg] -translate-y-[2px] left-[34px]"
            style={{
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            }}
          />
        </div>
        <div className="w-full h-full flex flex-row">
          <div className="w-full flex-1 h-full bg-gray-800 relative rounded-l-[4px]"></div>
          <div className="w-full flex-1 h-full bg-red-800 relative rounded-r-[4px]"></div>
        </div>
      </div>
    </>
  );
};
