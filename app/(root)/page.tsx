/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {} from "framer-motion";
import Header from "@/components/Header";
import SupportedCOR from "@/components/SupportedCOR";

export default function Home() {
  return (
    <main className="text-gray-900 bg-white relative overflow-hidden">
      <Header />
      {/* Hero Section */}
      <section
        id="about"
        className="px-8 flex flex-col min-h-screen items-center justify-center gap-10 relative z-20"
      >
        {/* Optional gradient background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #2563eb 100%)`,
          }}
        />

        <div className="z-10 text-center ">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl 2xl:text-6xl  font-extrabold  font-[family-name:var(--font-apricot)] text-blue-700"
          >
            UniSched
          </motion.h1>

          <motion.p
            className="mt-6 md:mt-7 2xl:mt-8 2xl:text-2xl text-base md:text-xl text-blue-900 font-[family-name:var(--font-handy)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Upload your COR PDF and turn it into a clean schedule. <br /> Edit,
            style, and save it your way.
          </motion.p>
          <motion.div
            className="mt-5 md:mt-6  flex  justify-center items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              className="px-6 py-3 font-[family-name:var(--font-handy)] tracking-widest bg-blue-600 text-lg text-white rounded-full hover:bg-blue-700 transition"
              href="/start"
            >
              Get Started
            </Link>
            <Link
              className="px-6 py-3 font-[family-name:var(--font-handy)] tracking-widest border border-blue-600 text-lg text-blue-600 rounded-full hover:bg-blue-50 transition"
              href="#universities"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Supported COR University */}
      <section
        id="universities"
        className="py-20 px-8 mx-auto   text-center relative z-10"
      >
        <div
          className="absolute inset-1 rounded-lg -z-10"
          style={{
            backgroundImage: `radial-gradient(120% 120% at 50% 70%, #ffffff 55%, #93c5fd 100%)`,
          }}
        />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className=" text-4xl md:text-5xl 
  font-extrabold font-[family-name:var(--font-apricot)] text-blue-700 mb-6 md:mb-8"
        >
          Supported Universities
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-blue-900   2xl:text-2xl text-lg md:text-xl  max-w-[300px] mx-auto mb-6  md:mb-8 font-[family-name:var(--font-handy)]"
        >
          These universities are currently supported by UniSched.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <SupportedCOR />
        </motion.div>
      </section>

      {/* Themes Section */}
      <section
        id="about"
        className="py-20 px-4 md:px-8 mx-auto text-center relative z-10"
      >
        <div
          className="absolute inset-1 rounded-lg -z-10"
          style={{
            backgroundImage: `radial-gradient(120% 120% at 50% 70%, #ffffff 55%, #c7d2fe 100%)`,
          }}
        />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="  text-4xl md:text-5xl
 font-extrabold font-[family-name:var(--font-apricot)] text-blue-700 mb-6 md:mb-8"
        >
          Pick Your Style
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-blue-900   2xl:text-2xl text-base md:text-xl  max-w-md mx-auto mb-6 md:mb-8 font-[family-name:var(--font-handy)]"
        >
          Explore our available themes to personalize your class schedule. Pick
          your fave — the choice is yours.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 max-w-4xl  mx-auto md:grid-cols-2 gap-6"
        >
          {[{ img: "/themes/blue.png" }, { img: "/themes/green.png" }].map(
            (theme, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden" // control height
              >
                <div className="relative w-full h-full">
                  <img
                    src={theme.img}
                    alt={`Theme ${idx + 1}`}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
            )
          )}
        </motion.div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 px-4 max-w-xs md:max-w-xl lg:max-w-2xl  mx-auto text-center relative z-10"
      >
        <div
          className="absolute inset-1 rounded-lg -z-10"
          style={{
            backgroundImage: `radial-gradient(120% 120% at 50% 70%, #ffffff 55%, #93c5fd 100%)`,
          }}
        />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className=" text-4xl md:text-5xl 
 font-extrabold font-[family-name:var(--font-apricot)] text-blue-700 mb-6 md:mb-8"
        >
          Get in Touch
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-blue-900 mb-8   2xl:text-2xl text-base md:text-xl  max-w-[350px] mx-auto  md:mb-8 font-[family-name:var(--font-handy)]"
        >
          Got questions, feedback, theme ideas, or want your university added?
          Let us know!
        </motion.p>
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          href="mailto: villalon.andrew123@gmail.com"
          className="px-6 py-3 font-[family-name:var(--font-handy)] tracking-widest bg-blue-600 text-lg text-white rounded-full hover:bg-blue-700 transition"
        >
          Contact Us
        </motion.a>
      </section>
    </main>
  );
}
