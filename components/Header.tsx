"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import Link from "next/link";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);

      if (currentY > prevScrollY.current && currentY > 50) {
        setVisible(false); // Scrolling down
      } else {
        setVisible(true); // Scrolling up
      }

      prevScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed  top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className={clsx(
              "   px-6 rounded-full shadow-lg backdrop-blur-md backdrop-saturate-150 transition-colors duration-300 ease-in-out flex items-center gap-6 justify-between",
              scrolled
                ? "bg-white/30 border border-blue-200"
                : "bg-white/60 border border-blue-200"
            )}
          >
            {/* Logo */}
            <h1 className="font-extrabold font-[family-name:var(--font-apricot)] text-blue-700 text-lg tracking-tight py-2 border-r border-blue-200 pr-6">
              UniSched
            </h1>

            {/* Menu */}
            <nav className="flex  font-[family-name:var(--font-handy)] space-x-4 text-base font-medium text-blue-600">
              <Link
                href="#about"
                className="hover:text-blue-900 transition-colors"
              >
                Home
              </Link>
              <Link
                href="#themes"
                className="hover:text-blue-900 transition-colors"
              >
                Themes
              </Link>
              <Link
                href="#contact"
                className="hover:text-blue-900 transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Header;
