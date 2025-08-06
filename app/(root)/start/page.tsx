"use client";

import { AnimatePresence, motion } from "framer-motion";
import GenerateSched from "../../../components/GenerateSched";

export default function StartPage() {
  return (
    <main className="min-h-screen  flex flex-col items-center justify-center bg-white text-gray-900 relative overflow-hidden">
      {/* Blue Glow Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #2563eb 100%)`,
          backgroundSize: "100% 100%",
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key="uploader"
          className="z-10 w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GenerateSched />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
