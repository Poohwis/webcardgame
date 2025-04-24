import { motion } from "motion/react";
import { useTableStateStore } from "../store/tableStateStore";
interface RoundPlayCardIndicator {
  radius: number;
  size: number;
  text: string;
  textColor: string;
  className?: string;
  reversed?: boolean;
}

export default function RoundPlayCardIndicator({
  radius,
  size,
  text,
  textColor,
  className = "",
  reversed = false,
}: RoundPlayCardIndicator) {
  // const width = size;
  //   const width = 300;
  const centerX = size / 2;
  const chordLength = 280;
  const startX = centerX - chordLength / 2;
  const endX = centerX + chordLength / 2;

  const height =
    radius - Math.sqrt(Math.max(0, radius * radius - (chordLength / 2) ** 2));

  const cp1X = startX + chordLength / 3;
  const cp2X = startX + (2 * chordLength) / 3;
  const cpY = height;

  // const d = `M${startX},${radius} C${cp1X},${cpY} ${cp2X},${cpY} ${endX},${radius}`;
  const d = reversed
    ? `M${endX},${radius} C${cp2X},${cpY} ${cp1X},${cpY} ${startX},${radius}`
    : `M${startX},${radius} C${cp1X},${cpY} ${cp2X},${cpY} ${endX},${radius}`;

  const { tableState } = useTableStateStore();

  return (
    <motion.svg
      className={` absolute rounded-full top-18 font-silk ${className}`}
      animate={{
        width: size,
        height: size,
        rotateZ:
          tableState === "resultUpdate"
           ? (reversed ? 270 : 90) : reversed ? 225 : 45,
      }}
      transition={
        tableState === "resultUpdate" ? {} : { delay: 0.5, type: "spring" }
      }
      viewBox={`0 ${reversed ? 95 : 75} ${size} ${size}`}
    >
      <defs>
        <path id={text} d={d} fill="transparent" />
      </defs>
      <text fontSize={24} fill={textColor}>
        <textPath href={`#${text}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    </motion.svg>
  );
}
