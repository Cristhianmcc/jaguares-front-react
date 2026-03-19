import React from "react";
import { motion } from "framer-motion";
import EditableText from '../EditableText.jsx';

const defaultNovedades = {
  subtitulo: "Academia Jaguares",
  titulo: "Últimas Novedades",
  items: [
    {
      id: 1,
      imagen: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=890&q=80",
      categoria: "Inscripciones",
      titulo: "¡Inscripciones abiertas para el período 2026!",
      fecha: "15 de febrero de 2026",
    },
    {
      id: 2,
      imagen: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=890&q=80",
      categoria: "Torneos",
      titulo: "Categoría Sub-12 clasifica al Campeonato Regional",
      fecha: "10 de febrero de 2026",
    },
    {
      id: 3,
      imagen: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=890&q=80",
      categoria: "Staff",
      titulo: "Bienvenida a nuestros nuevos entrenadores certificados",
      fecha: "5 de febrero de 2026",
    }
  ]
};

const GlowNews = ({ novedadesData, onUpdate }) => {
  const data = novedadesData || defaultNovedades;
  const items = data.items || [];

  return (
    <section id="novedades" className="px-6 py-24 md:px-16 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <EditableText
            tag="p"
            className="text-sm font-semibold uppercase tracking-[0.3em] text-primary"
            value={data.subtitulo}
            onChange={onUpdate ? v => onUpdate({ ...data, subtitulo: v }) : undefined}
          />
          <EditableText
            tag="h2"
            className="mt-2 font-display text-5xl md:text-7xl uppercase"
            value={data.titulo}
            onChange={onUpdate ? v => onUpdate({ ...data, titulo: v }) : undefined}
          />
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((news, index) => (
            <motion.article
              key={news.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-card transition-all hover:-translate-y-2 hover:border-primary/50"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={news.imagen}
                  alt={news.titulo}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute top-4 left-4 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <EditableText
                    tag="span"
                    value={news.categoria}
                    onChange={onUpdate ? v => {
                      const newItems = [...items];
                      newItems[index] = { ...news, categoria: v };
                      onUpdate({ ...data, items: newItems });
                    } : undefined}
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 text-xs text-muted-foreground">{news.fecha}</div>
                <EditableText
                  tag="h3"
                  className="font-display text-xl font-medium leading-snug text-foreground transition-colors group-hover:text-primary"
                  value={news.titulo}
                  multiline
                  onChange={onUpdate ? v => {
                     const newItems = [...items];
                     newItems[index] = { ...news, titulo: v };
                     onUpdate({ ...data, items: newItems });
                  } : undefined}
                />
                <a href={news.enlace || "#"} className="mt-4 mt-auto inline-flex items-center text-sm font-semibold text-primary hover:underline">
                  Leer más →
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlowNews;