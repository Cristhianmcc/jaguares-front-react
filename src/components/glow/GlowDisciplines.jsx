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

const getColors = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('vóley') || t.includes('voley')) return "from-blue-500/20 to-blue-600/5";
  if (t.includes('básquet') || t.includes('basquet')) return "from-orange-500/20 to-orange-600/5";
  if (t.includes('mamás') || t.includes('mamas')) return "from-pink-500/20 to-pink-600/5";
  if (t.includes('femenino')) return "from-purple-500/20 to-purple-600/5";
  if (t.includes('funcional')) return "from-amber-500/20 to-amber-600/5";
  return "from-green-500/20 to-green-600/5";
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
    <section id="disciplinas" className="px-6 py-24 md:px-16 lg:px-24">
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
            Elegí tu <span className="text-gradient">Deporte</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {disciplines.map((discipline, index) => {
            const Icon = getIcon(discipline.titulo);
            const colorClass = getColors(discipline.titulo);
            
            return (
              <motion.div
                key={discipline.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card transition-colors hover:border-primary/30"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 transition-opacity group-hover:opacity-100`} />
                <div className="relative z-10">
                  <div className="mb-6 inline-flex rounded-xl bg-secondary p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-7 w-7" />
                  </div>
                  
                  <EditableText 
                    tag="h3" 
                    className="font-display text-3xl" 
                    value={discipline.titulo}
                    onChange={onUpdate ? v => {
                      const newData = [...deportesData];
                      const idx = newData.findIndex(d => d.id === discipline.id);
                      if(idx !== -1) { newData[idx] = { ...newData[idx], titulo: v }; onUpdate(newData); }
                    } : undefined}
                  />

                  <EditableText 
                    tag="p" 
                    className="mt-3 text-sm leading-relaxed text-muted-foreground" 
                    value={discipline.descripcion}
                    multiline
                    onChange={onUpdate ? v => {
                      const newData = [...deportesData];
                      const idx = newData.findIndex(d => d.id === discipline.id);
                      if(idx !== -1) { newData[idx] = { ...newData[idx], descripcion: v }; onUpdate(newData); }
                    } : undefined}
                  />
                  <a href={`/disciplina/${toDisciplineSlug(discipline.slug || discipline.titulo || discipline.id)}`} className="mt-4 inline-block text-sm font-semibold text-primary">
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
