import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const defaultGalleryItems = [
  { src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80", alt: "Entrenamiento de basquet", category: "Basquet" },
  { src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1600&q=80", alt: "Partido de voley", category: "Voley" },
  { src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80", alt: "Partido de futbol", category: "Futbol" },
  { src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80", alt: "Clase de funcional", category: "Funcional" },
  { src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80", alt: "Entrenamiento de fuerza", category: "Mamas Fit" },
  { src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600&q=80", alt: "Trabajo en equipo", category: "General" },
  { src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80", alt: "Cancha en competencia", category: "Futbol" },
  { src: "https://images.unsplash.com/photo-1543357480-c60d400e2ef9?auto=format&fit=crop&w=1600&q=80", alt: "Sesion de entrenamiento", category: "General" }
];

const GlowGallery = ({ galeriaData, onUpdate }) => {
  const [selected, setSelected] = useState(null);

  // Map from backend format { items: [{imagen, alt}], botonTexto } to display format
  const galleryItems = (galeriaData?.items && galeriaData.items.length > 0)
    ? galeriaData.items.map(it => ({ src: it.imagen || '', alt: it.alt || '', category: '' }))
    : defaultGalleryItems;

  return (
    <section id="galeria" data-section="galeria" className="px-6 py-24 md:px-16 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Nuestros momentos
          </p>
          <h2 className="mt-2 font-display text-5xl md:text-7xl uppercase">
            Galeria <span className="text-gradient">Jaguares</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setSelected(index)}
              className={`group relative cursor-pointer overflow-hidden rounded-xl ${
                index === 0 || index === 5 ? "row-span-2" : ""
              }`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="h-full min-h-[200px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-primary/80 px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {item.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-6 backdrop-blur-md"
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-6 top-6 rounded-full bg-secondary p-2 text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={galleryItems[selected].src}
              alt={galleryItems[selected].alt}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GlowGallery;
