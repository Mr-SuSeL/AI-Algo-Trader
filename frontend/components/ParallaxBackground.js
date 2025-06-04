import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const ParallaxBackground = () => {
  const { scrollY } = useScroll();
  // Transformacje dla różnych warstw paralaksy
  const y1 = useTransform(scrollY, [0, 500], [0, -150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const y3 = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Bazowe tło gradientowe */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100 via-gray-100 to-gray-100 z-0" />

      {/* Wzór siatki z efektem paralaksy */}
      <motion.div
        style={{ y: y3, opacity }}
        className="absolute inset-0 z-0"
      >
        <div className="h-full w-full bg-[linear-gradient(to_right,#8881_1px,transparent_1px),linear-gradient(to_bottom,#8881_1px,transparent_1px)] bg-[size:40px_40px]" />
      </motion.div>

      {/* Świecące kule (orbs) z efektem paralaksy - dodano więcej i zróżnicowano */}
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-40 -right-20 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-green-500/15 blur-3xl"
      />
      {/* Dodatkowe kule w różnych miejscach i kolorach */}
      <motion.div
        style={{ y: useTransform(scrollY, [0, 500], [0, -120]) }}
        className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-pink-500/15 blur-3xl"
      />
      <motion.div
        style={{ y: useTransform(scrollY, [0, 500], [0, -80]) }}
        className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full bg-yellow-500/15 blur-3xl"
      />
       <motion.div
        style={{ y: useTransform(scrollY, [0, 500], [0, -100]) }}
        className="absolute -bottom-10 right-1/2 w-48 h-48 rounded-full bg-red-500/15 blur-3xl"
      />
    </div>
  );
};
