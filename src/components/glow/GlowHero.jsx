import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EditableText from '../EditableText.jsx';

const GlowHero = ({ slidesData, onUpdateSlide }) => {
  const [current, setCurrent] = useState(0);

  // Fallback igual al slider de sport-hub cuando no hay datos del backend.
  const defaultSlides = [
    { image: "/assets/glow/hero-futbol.jpg", title: "FUTBOL", subtitle: "Formacion tecnica y tactica de alto nivel", description: "Formacion tecnica y tactica de alto nivel" },
    { image: "/assets/glow/hero-voley.jpg", title: "VOLEY", subtitle: "Domina la cancha con tecnica profesional", description: "Domina la cancha con tecnica profesional" },
    { image: "/assets/glow/hero-basquet.jpg", title: "BASQUET", subtitle: "Juga en equipo y competi al maximo", description: "Juga en equipo y competi al maximo" },
    { image: "/assets/glow/hero-mamasfit.jpg", title: "MAMAS FIT", subtitle: "Energia, bienestar y comunidad", description: "Energia, bienestar y comunidad" },
    { image: "/assets/glow/hero-funcional.jpg", title: "FUNCIONAL MIXTO", subtitle: "Fuerza, cardio y movilidad combinados", description: "Fuerza, cardio y movilidad combinados" },
    { image: "/assets/glow/hero-futfem.jpg", title: "FUTBOL FEMENINO", subtitle: "El futbol femenino crece con nosotras", description: "El futbol femenino crece con nosotras" }
  ];

  const slides = slidesData?.length > 0 ? slidesData : defaultSlides;

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // Si no hay slide seguro, retornamos nulo o manejamos error
  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[current];
  const slideId = currentSlide.id;

  return (
    <section data-section="hero" className="relative h-screen w-full overflow-hidden">
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
            src={currentSlide.image}
            alt={currentSlide.title || "Slide"}
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

            <EditableText 
              tag="h1" 
              className="font-display text-4xl leading-tight tracking-tight md:text-7xl lg:text-8xl text-white drop-shadow-lg max-w-4xl" 
              value={currentSlide.title} 
              multiline
              onChange={onUpdateSlide ? v => onUpdateSlide(slideId, 'title', v) : undefined}
            />

            <EditableText 
              tag="p" 
              className="mt-4 max-w-lg text-lg text-gray-200 md:text-xl drop-shadow-md" 
              value={currentSlide.description || currentSlide.subtitle} 
              multiline
              onChange={onUpdateSlide ? v => onUpdateSlide(slideId, 'description', v) : undefined}
            />
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href="#disciplinas"
            className="bg-gradient-primary inline-flex w-fit items-center justify-center rounded-lg px-8 py-4 font-semibold text-primary-foreground transition-all hover:scale-105 hover:shadow-glow"
          >
            Ver Disciplinas
          </a>
          <a
            href="/inscripcion"
            className="inline-flex items-center w-fit justify-center rounded-lg border border-border bg-secondary/50 px-8 py-4 font-semibold text-foreground backdrop-blur-sm transition-all hover:bg-secondary text-white"
          >
            Inscribite Ahora
          </a>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border/40 bg-background/30 p-3 text-white backdrop-blur-sm transition-all hover:bg-background/60 md:left-8"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-border/40 bg-background/30 p-3 text-white backdrop-blur-sm transition-all hover:bg-background/60 md:right-8"
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

export default GlowHero;
