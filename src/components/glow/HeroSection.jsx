import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import heroFutbol from "@/assets/hero-futbol.jpg";
import heroVoley from "@/assets/hero-voley.jpg";
import heroBasquet from "@/assets/hero-basquet.jpg";
import heroMamasFit from "@/assets/hero-mamasfit.jpg";
import heroFuncional from "@/assets/hero-funcional.jpg";
import heroFutFem from "@/assets/hero-futfem.jpg";

const slides = [
  { image: heroFutbol, title: "FÚTBOL", subtitle: "Formación técnica y táctica de alto nivel" },
  { image: heroVoley, title: "VÓLEY", subtitle: "Dominá la cancha con técnica profesional" },
  { image: heroBasquet, title: "BÁSQUET", subtitle: "Jugá en equipo, competí al máximo" },
  { image: heroMamasFit, title: "MAMÁS FIT", subtitle: "Energía, bienestar y comunidad" },
  { image: heroFuncional, title: "FUNCIONAL MIXTO", subtitle: "Fuerza, cardio y movilidad combinados" },
  { image: heroFutFem, title: "FÚTBOL FEMENINO", subtitle: "El fútbol femenino crece con nosotras" },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Carousel images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-24 md:px-16 lg:px-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary md:text-base">
              Escuela Deportiva Jaguares
            </p>
            <h1 className="font-display text-6xl leading-none tracking-tight md:text-8xl lg:text-9xl">
              {slides[current].title}
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground md:text-xl">
              {slides[current].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href="#disciplinas"
            className="bg-gradient-primary inline-flex items-center justify-center rounded-lg px-8 py-4 font-semibold text-primary-foreground transition-all hover:scale-105 hover:shadow-glow"
          >
            Ver Disciplinas
          </a>
          <a
            href="#contacto"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary/50 px-8 py-4 font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-secondary"
          >
            Inscribite Ahora
          </a>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border/40 bg-background/30 p-3 text-foreground backdrop-blur-sm transition-all hover:bg-background/60 md:left-8"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border/40 bg-background/30 p-3 text-foreground backdrop-blur-sm transition-all hover:bg-background/60 md:right-8"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
