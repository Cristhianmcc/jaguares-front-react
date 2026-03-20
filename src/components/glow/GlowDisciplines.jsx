import React from "react";
import { motion } from "framer-motion";
import { Dribbble, Flame, Heart, Users, Trophy, Volleyball } from "lucide-react";
import EditableText from '../EditableText.jsx';
import { toDisciplineSlug } from '../../data/sportHubDisciplines.js';

const getIcon = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('vóley') || t.includes('voley')) return Volleyball;
  if (t.includes('básquet') || t.includes('basquet')) return Trophy;
  if (t.includes('mamás') || t.includes('mamas')) return Heart;
  if (t.includes('femenino')) return Users;
  if (t.includes('funcional')) return Flame;
  return Dribbble;
};

const getDefaultImage = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('vóley') || t.includes('voley'))
    return "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80&fit=crop";
  if (t.includes('básquet') || t.includes('basquet'))
    return "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80&fit=crop";
  if (t.includes('mamás') || t.includes('mamas'))
    return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&fit=crop";
  if (t.includes('femenino'))
    return "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=800&q=80&fit=crop";
  if (t.includes('funcional'))
    return "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&q=80&fit=crop";
  return "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80&fit=crop";
};

const GlowDisciplines = ({ deportesData, onUpdate }) => {
  const fallbackDisciplines = [
    { id: 1, titulo: "Futbol", descripcion: "Formacion tecnica y tactica para todas las categorias." },
    { id: 2, titulo: "Voley", descripcion: "Entrenamientos para mejorar tecnica, salto y juego en equipo." },
    { id: 3, titulo: "Basquet", descripcion: "Desarrollo integral en fundamentos, lectura y competencia." },
    { id: 4, titulo: "Mamas Fit", descripcion: "Clases enfocadas en bienestar, movilidad y fuerza funcional." },
    { id: 5, titulo: "Funcional Mixto", descripcion: "Rutinas dinamicas para mejorar resistencia y coordinacion." },
    { id: 6, titulo: "Futbol Femenino", descripcion: "Programa especifico para potenciar talento y competitividad." }
  ];

  const disciplines = deportesData?.length > 0 ? deportesData : fallbackDisciplines;

  return (
    <section id="disciplinas" data-section="deportes" className="px-6 py-24 md:px-16 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Nuestras disciplinas
          </p>
          <h2 className="mt-2 font-display text-5xl md:text-7xl uppercase">
            Elige tu <span className="text-gradient">Deporte</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {disciplines.map((discipline, index) => {
            const Icon = getIcon(discipline.titulo);
            const bgImage = discipline.imagen || getDefaultImage(discipline.titulo);

            return (
              <motion.div
                key={discipline.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative min-h-[17rem] cursor-pointer overflow-hidden rounded-2xl border border-border shadow-card transition-all hover:border-primary/40 hover:shadow-xl"
              >
                <img
                  src={bgImage}
                  alt={discipline.titulo}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                <div className="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/10" />
                <div className="relative z-10 flex min-h-[17rem] flex-col justify-end p-8">
                  <div className="mb-4 inline-flex w-fit rounded-xl border border-primary/40 bg-primary/20 p-3 text-primary backdrop-blur-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <EditableText
                    tag="h3"
                    className="font-display text-3xl text-white"
                    value={discipline.titulo}
                    onChange={onUpdate ? v => {
                      const newData = [...deportesData];
                      const idx = newData.findIndex(d => d.id === discipline.id);
                      if(idx !== -1) { newData[idx] = { ...newData[idx], titulo: v }; onUpdate(newData); }
                    } : undefined}
                  />
                  <EditableText
                    tag="p"
                    className="mt-2 text-sm leading-relaxed text-white/70"
                    value={discipline.descripcion}
                    multiline
                    onChange={onUpdate ? v => {
                      const newData = [...deportesData];
                      const idx = newData.findIndex(d => d.id === discipline.id);
                      if(idx !== -1) { newData[idx] = { ...newData[idx], descripcion: v }; onUpdate(newData); }
                    } : undefined}
                  />
                  <a
                    href={`/disciplina/${toDisciplineSlug(discipline.slug || discipline.titulo || discipline.id)}`}
                    className="mt-4 inline-block text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    Ver categorías y horarios →
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GlowDisciplines;
