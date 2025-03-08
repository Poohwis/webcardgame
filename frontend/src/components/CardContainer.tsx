import { motion } from "motion/react";
interface CardContainerProps {
  cards: number[];
  selectCardIndices: number[];
  handleSelectCard: (index: number) => void;
}
export default function CardContainer({
  cards,
  selectCardIndices,
  handleSelectCard,
}: CardContainerProps) {
  const cardsName = ["ACE", "JACK", "KING", "QUEEN", "JOKER"];
  return (
    <div className="flex flex-row space-x-2 items-center justify-center">
      {cards.map((card, index) => (
        <motion.div
        key={index}
          onClick={() => handleSelectCard(index)}
          className=" bg-white w-[120px] h-[170px] hover:cursor-pointer  hover:bg-gray-100
         rounded-lg border-[1px] border-gray-200 flex items-start flex-col justify-between font-nippo"
        >
          <div className="text-3xl font-bold pt-1 pl-2 flex items-center justify-center">
            {cardsName[card].split("")[0]}
            {/* {firstLetter} */}
            {/* <span className="text-gray-400">{restLetter}</span> */}
          </div>
          <div className="text-3xl font-bold pb-1 pl-2 flex items-center justify-center self-end rotate-180">
            {/* {firstLetter} */}
            {/* <span className="text-gray-400">{restLetter}</span> */}
            {cardsName[card].split("")[0]}
          </div>
        </motion.div>
        // <div
        //   key={index}
        //   onClick={() => handleSelectCard(index)}
        //   style={{
        //     background: selectCardIndices.includes(index) ? "red" : "black",
        //   }}
        //   className="w-[150px] h-[200px] hover:cursor-pointer bg-red-500 text-white flex items-center justify-center"
        // >
        //   {card}
        // </div>
      ))}
    </div>
  );
}
