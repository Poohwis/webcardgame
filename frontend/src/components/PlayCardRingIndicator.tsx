import { motion } from "motion/react";
import { useTableStateStore } from "../store/tableStateStore";
import { cn } from "../utils/cn";
interface RoundPlayCardIndicator {
  radius: number;
  size: number;
  text: string;
  textColor: string;
  className?: string;
  reversed?: boolean;
  isShow: boolean;
}

export default function PlayCardRingIndicator({
  radius,
  size,
  text,
  textColor,
  className = "",
  reversed = false,
  isShow,
}: RoundPlayCardIndicator) {
  // const ringSize = isShow ? size * (isSmallWindow ? 1.36 : 1.25) : size;
  const ringSize = isShow ? size + 100 : size

  const centerX = ringSize / 2;
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
      className={cn(
        `absolute rounded-full font-silk ${className} transition-colors duration-500`,
        tableState === "initial" ||
          tableState === "boardSetupOne" ||
          tableState === "boardSetupTwo"
          ? "hidden"
          : "visible"
      )}
      animate={{
        width: ringSize,
        height: ringSize,
        rotateZ:
          tableState === "resultUpdate"
            ? reversed
              ? 270
              : 90
            : reversed
            ? 225
            : 45,
      }}
      transition={
        tableState === "resultUpdate" ? {} : { delay: 0.5, type: "spring" }
      }
      viewBox={`0 ${reversed ? 95 : 75} ${ringSize} ${ringSize}`}
    >
      <defs>
        <path id={text} d={d} fill="transparent" />
      </defs>
      <text
      //  fontSize={isSmallWindow ? 20 : 24}
       fontSize={size * 0.07}
        fill={textColor}>
        <textPath href={`#${text}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    </motion.svg>
  );
}
