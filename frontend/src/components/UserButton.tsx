import { motion } from "motion/react";
import { AutoLangText } from "./AutoLangText";

export default function UserButton({ name, color }: { name: string; color: string; }) {
    return (
        <div
            key={name}
            className="flex flex-col flex-1 items-center gap-x-4 hover:cursor-default transition-transform"
        >
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ background: color, borderColor: color }}
                className="sm:hidden border-2 text-white/80 rounded-full px-2 w-8 h-8 flex items-center justify-center text-center text-nowrap"
            >
                {name.split("")[0]}
            </motion.div>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ background: color, borderColor: color }}
                className={`hidden sm:flex border-2 text-white/80 rounded-full px-2 text-center text-nowrap`}
            >
                <AutoLangText>
                {name}
                </AutoLangText>
            </motion.div>
        </div>
    );
}
