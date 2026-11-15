"use client";

import { AnimatePresence, motion } from "motion/react";

/**
 * Text whose digits slide up when they change, like an iOS number transition.
 * The tenths digit changes too fast to roll, so it swaps instantly.
 */
export function RollingText({ text }: { text: string }) {
  const chars = [...text];
  return (
    <span className="inline-flex" aria-hidden>
      {chars.map((ch, i) => {
        // Keyed from the right, so "0:10" turning into "9.9" keeps the last digit in place.
        const place = chars.length - i;
        if (!/\d/.test(ch)) return <span key={`${place}${ch}`}>{ch}</span>;
        // Every digit gets the same width, so the number doesn't jiggle as it changes.
        const box = "inline-block w-[1ch] text-center";
        const isTenths = text.includes(".") && place === 1;
        if (isTenths) return <span key={place} className={box}>{ch}</span>;
        return (
          <span key={place} className={`relative overflow-hidden ${box}`}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={ch}
                className="inline-block"
                initial={{ y: "60%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-60%", opacity: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              >
                {ch}
              </motion.span>
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}
