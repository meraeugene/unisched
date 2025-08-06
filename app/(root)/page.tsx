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
            className="text-5xl font-extrabold font-[family-name:var(--font-apricot)] text-blue-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            UniSched
          </motion.h1>
          <motion.p
            className="mt-5 text-lg lg:text-xl text-blue-900 font-[family-name:var(--font-handy)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Upload. Edit. Own your class schedule.
          </motion.p>
          <motion.div
            className="mt-7"
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
          className="text-4xl font-extrabold font-[family-name:var(--font-apricot)] text-blue-700 mb-4"
        >
          Supported Universities
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="text-blue-900 text-lg  max-w-[250px] mx-auto  mb-6 font-[family-name:var(--font-handy)]"
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
          transition={{ delay: 0.6 }}
          className="text-4xl font-extrabold font-[family-name:var(--font-apricot)] text-blue-700 mb-4"
        >
          Get in Touch
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          viewport={{ once: true }}
          className="text-blue-900 text-lg  max-w-[250px] mx-auto  mb-8 font-[family-name:var(--font-handy)]"
        >
          Have questions, feedback, or school formats to suggest?
        </motion.p>
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
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
