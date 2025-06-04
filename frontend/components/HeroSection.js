import React from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Icon } from '@iconify/react'; // Pakiet @iconify/react powinien być zainstalowany

// Importujemy komponent ParallaxBackground
import { ParallaxBackground } from './ParallaxBackground'; // Upewnij się, że ścieżka jest poprawna

// Dane dla slajdów karuzeli
const slides = [
  {
    id: 1,
    title: "Advanced Trading Algorithms",
    description: "Leverage machine learning for predictive market analysis.",
    image: "/images/algo1.jpg", // Twoje lokalne obrazki (np. frontend/public/images/algo1.jpg)
    placeholderImage: "https://placehold.co/800x600/1a202c/ffffff?text=Advanced+Algorithms", // Obrazek placeholder
    color: "from-blue-500/20 to-purple-500/20"
  },
  {
    id: 2,
    title: "Real-time Market Analysis",
    description: "Monitor market conditions with millisecond precision.",
    image: "/images/algo2.jpg", // Twoje lokalne obrazki
    placeholderImage: "https://placehold.co/800x600/2d3748/ffffff?text=Real-time+Market",
    color: "from-green-500/20 to-blue-500/20"
  },
  {
    id: 3,
    title: "Robust Backtesting Framework",
    description: "Test strategies against historical data with high accuracy.",
    image: "/images/algo3.jpg", // Twoje lokalne obrazki
    placeholderImage: "https://placehold.co/800x600/4a5568/ffffff?text=Backtesting+Framework",
    color: "from-orange-500/20 to-red-500/20"
  },
  {
    id: 4,
    title: "AI-Powered Trading",
    description: "Neural networks that adapt to evolving market conditions.",
    image: "/images/ai_trading.jpg", // Twoje lokalne obrazki
    placeholderImage: "https://placehold.co/800x600/718096/ffffff?text=AI+Trading+Systems",
    color: "from-purple-500/20 to-pink-500/20"
  },
  {
    id: 5,
    title: "Cutting-Edge Quantitative Analysis",
    description: "Advanced mathematical models for optimal decision making.",
    image: "/images/quant_analysis.jpg", // Twoje lokalne obrazki
    placeholderImage: "https://placehold.co/800x600/a0aec0/ffffff?text=Quant+Analysis+Models",
    color: "from-cyan-500/20 to-blue-500/20"
  }
];

// Główny komponent Hero Section
export const HeroSection = () => {
  const [current, setCurrent] = React.useState(0);
  const [direction, setDirection] = React.useState(0);

  // Warianty animacji dla slajdów
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%", // Pełne przesunięcie poza ekran
      opacity: 0,
      scale: 0.8, // Zmniejszenie skali przy wejściu
      rotateY: direction > 0 ? 30 : -30, // Subtelny obrót 3D
    }),
    center: {
      x: "0%",
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 }, // Sprężynowa animacja dla x
        opacity: { duration: 1.25 }, // Skalowane 0.5s * 2.5
        scale: { duration: 1.5 },    // Skalowane 0.6s * 2.5
        rotateY: { duration: 1.5 },   // Skalowane 0.6s * 2.5
      },
    },
    exit: (direction) => ({
      x: direction < 0 ? "100%" : "-100%", // Pełne przesunięcie poza ekran
      opacity: 0,
      scale: 0.8, // Zmniejszenie skali przy wyjściu
      rotateY: direction < 0 ? 30 : -30, // Subtelny obrót 3D
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 }, // Sprężynowa animacja dla x
        opacity: { duration: 1.25 }, // Skalowane 0.5s * 2.5
        scale: { duration: 1.25 },    // Skalowane 0.5s * 2.5
        rotateY: { duration: 1.25 },   // Skalowane 0.5s * 2.5
      },
    }),
  };

  // Efekt do automatycznego przełączania slajdów
  React.useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6500); // Zmieniono na 8 sekund
    return () => clearInterval(interval); // Czyści interwał przy odmontowaniu komponentu
  }, []);

  // Funkcje do ręcznej nawigacji
  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative w-full min-h-[600px] flex items-center justify-center py-16 sm:py-24 overflow-hidden">
      {/* Tło z efektem paralaksy */}
      <ParallaxBackground />

      {/* Kontener dla zawartości karuzeli */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-lg shadow-2xl">
          {/* Gradient tła slajdu */}
          <div className={`absolute inset-0 bg-gradient-to-br ${slides[current].color} opacity-70 transition-all duration-700 ease-in-out`} />

          {/* Slajdy */}
          <AnimatePresence custom={direction} mode="wait"> {/* Usunięto initial={false} aby pierwszy slajd miał animację wejścia */}
            <motion.div
              key={slides[current].id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              <div className="relative h-full w-full">
                {/* Obraz - teraz to będzie Twój lokalny obrazek */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.img
                    src={slides[current].image} // Użycie lokalnej ścieżki obrazka
                    alt={slides[current].title}
                    className="w-full h-full object-cover"
                    // Fallback dla obrazu lokalnego (jeśli nie zostanie znaleziony)
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x600/cccccc/333333?text=Local+Image+Not+Found"; }}
                    initial={{ scale: 1.05 }} // Delikatne powiększenie przy wejściu
                    animate={{ scale: 1 }}
                    transition={{ duration: 2.0, ease: "easeOut" }} // Skalowane 0.8s * 2.5
                  />
                  {/* Półprzezroczysta nakładka z obrazkiem placeholder, która będzie zanikać */}
                  <motion.div
                    key={`placeholder-overlay-${slides[current].id}`} // Klucz dla AnimatePresence
                    initial={{ opacity: 0.7 }} // Start z półprzezroczystością
                    animate={{ opacity: 0 }} // Animuj do pełnej przezroczystości
                    transition={{ delay: 1.25, duration: 3.75, ease: "easeOut" }} // Skalowane 0.5s * 2.5 i 1.5s * 2.5
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slides[current].placeholderImage})` }}
                  />
                  {/* Nakładka gradientowa na obrazie (pozostaje) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Zawartość tekstowa slajdu */}
                <div className="absolute bottom-16 sm:bottom-20 left-0 right-0 p-4 sm:p-6 text-white">
                  <motion.h3
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }} // Skalowane 0.6s * 2.5 i 0.2s * 2.5
                    className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2"
                  >
                    {slides[current].title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.875, ease: "easeOut" }} // Skalowane 0.6s * 2.5 i 0.35s * 2.5
                    className="text-sm sm:text-base text-white/80"
                  >
                    {slides[current].description}
                  </motion.p>
                </div>

                {/* Elementy nakładki w stylu kodu dla technicznego wyglądu */}
                <div className="absolute top-4 right-4 font-mono text-xs text-white/70 bg-black/30 px-2 py-1 sm:px-3 sm:py-1 rounded-md">
                  algo.trading.v{slides[current].id}.js
                </div>

                {/* Fragmenty kodu dla slajdu AI/Quant - widoczne tylko na większych ekranach */}
                <div className="absolute top-12 right-8 font-mono text-xs text-green-400/80 hidden md:block">
                  {slides[current].id === 4 && ( // Slajd AI
                    <>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.25, delay: 1.0 }}> {/* Skalowane 0.5s * 2.5 i 0.4s * 2.5 */}
                        {`> training neural network...`}
                      </motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.25, delay: 1.5 }}> {/* Skalowane 0.5s * 2.5 i 0.6s * 2.5 */}
                        {`> pattern recognition active...`}
                      </motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.25, delay: 2.0 }}> {/* Skalowane 0.5s * 2.5 i 0.8s * 2.5 */}
                        {`> AI confidence: 98.2%`}
                      </motion.div>
                    </>
                  )}

                  {slides[current].id === 5 && ( // Slajd analizy ilościowej
                    <>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.25, delay: 1.0 }}> {/* Skalowane 0.5s * 2.5 i 0.4s * 2.5 */}
                        {`> calculating stochastic processes...`}
                      </motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.25, delay: 1.5 }}> {/* Skalowane 0.5s * 2.5 i 0.6s * 2.5 */}
                        {`> solving differential equations...`}
                      </motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.25, delay: 2.0 }}> {/* Skalowane 0.5s * 2.5 i 0.8s * 2.5 */}
                        {`> model accuracy: 99.4%`}
                      </motion.div>
                    </>
                  )}

                  {(slides[current].id !== 4 && slides[current].id !== 5) && ( // Pozostałe slajdy
                    <>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.25, delay: 1.0 }}> {/* Skalowane 0.5s * 2.5 i 0.4s * 2.5 */}
                        {`> optimizing trading patterns...`}
                      </motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.25, delay: 1.5 }}> {/* Skalowane 0.5s * 2.5 i 0.6s * 2.5 */}
                        {`> analyzing market data...`}
                      </motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.25, delay: 2.0 }}> {/* Skalowane 0.5s * 2.5 i 0.8s * 2.5 */}
                        {`> prediction confidence: 94.7%`}
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Formuły matematyczne dla slajdu analizy ilościowej - widoczne tylko na większych ekranach */}
                {slides[current].id === 5 && (
                  <div className="absolute top-12 left-8 font-mono text-xs text-blue-300/90 hidden md:block">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.25, delay: 1.0 }} className="mb-2"> {/* Skalowane 0.5s * 2.5 i 0.4s * 2.5 */}
                      {"dS(t) = μS(t)dt + σS(t)dW(t)"}
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.25, delay: 1.5 }} className="mb-2"> {/* Skalowane 0.5s * 2.5 i 0.6s * 2.5 */}
                      {"V(S,t) = max(S - K, 0)"}
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.25, delay: 2.0 }}> {/* Skalowane 0.5s * 2.5 i 0.8s * 2.5 */}
                      {"dV/dt + 1/2σ²S²d²V/dS² + rSdV/dS - rV = 0"}
                    </motion.div>
                  </div>
                )}

                {/* Wizualizacja sieci AI dla slajdu AI - widoczna tylko na większych ekranach */}
                {slides[current].id === 4 && (
                  <div className="absolute top-1/4 left-8 hidden md:block">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 2.0, delay: 1.0 }} // Skalowane 0.8s * 2.5 i 0.4s * 2.5
                      className="grid grid-cols-4 gap-1"
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                          key={`node-${i}`}
                          initial={{ scale: 0 }}
                          animate={{
                            scale: 1,
                            opacity: [0.3, 0.8, 0.3] // Efekt pulsowania
                          }}
                          transition={{
                            duration: 5, // Skalowane 2s * 2.5
                            delay: 0.25 * i, // Skalowane 0.1s * 2.5
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                          className="h-2 w-2 rounded-full bg-purple-400/70"
                        />
                      ))}
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nawigacja (Przyciski) */}
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex gap-2 z-10">
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 w-8 sm:h-9 sm:w-9 bg-white/20 backdrop-blur-md text-white"
              onClick={handlePrev}
              aria-label="Previous slide"
            >
              <Icon icon="lucide:chevron-left" className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 w-8 sm:h-9 sm:w-9 bg-white/20 backdrop-blur-md text-white"
              onClick={handleNext}
              aria-label="Next slide"
            >
              <Icon icon="lucide:chevron-right" className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* Wskaźniki slajdów */}
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 flex gap-1 sm:gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > current ? 1 : -1);
                  setCurrent(index);
                }}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  index === current ? "w-6 sm:w-8 bg-white" : "w-1.5 sm:w-2 bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; // Eksportuj jako domyślny
