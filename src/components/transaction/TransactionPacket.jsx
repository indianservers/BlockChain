import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function TransactionPacket({ progress }) {
  return (
    <motion.div
      className="absolute top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-bluex to-cyanx text-white shadow-lg shadow-cyanx/30"
      animate={{ left: `${progress}%` }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      aria-hidden="true"
    >
      <Send size={21} />
    </motion.div>
  );
}
