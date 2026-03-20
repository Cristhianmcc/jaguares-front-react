import React from "react";
import { motion } from "framer-motion";
import EditableText from '../EditableText.jsx';

const fallbackTeachers = [
  {
    id: 1,
    nombre: "Prof. Leonardo",
    especialidad: "Entrenador - Fútbol",
    descripcion: "Formador de juveniles con amplia experiencia en el desarrollo deportivo.",
    foto: "/assets/Leonardo - Profesores Jaguares 2026-2.jpg.jpeg",
  },
  {
    id: 2,
    nombre: "Prof. Oscar",
    especialidad: "Entrenador - Fútbol",
    descripcion: "Dedicado a la formación integral de jugadores en todas las categorías.",
    foto: "/assets/Oscar - Profesores Jaguares 2026-3.jpg.jpeg",
  },
  {
    id: 3,
    nombre: "Prof. Phaterson",
    especialidad: "Entrenador - Funcional",
    descripcion: "Especialista en entrenamiento funcional y preparación física.",
    foto: "/assets/Phaterson - Profesores Jaguares 2026-4.jpg.jpeg",
  },
  {
    id: 4,
    nombre: "Prof. Rafael",
    especialidad: "Entrenador - Vóley",
    descripcion: "Experto en técnica y estrategia de vóley para todas las edades.",
    foto: "/assets/Rafael - Profesores Jaguares 2026.jpg.jpeg",
  }
];

const GlowTeachers = ({ docentesData = [], onUpdate }) => {
  const teachers = docentesData.length > 0 ? docentesData : fallbackTeachers;

  const updateField = (idx, field, val) => {
    if (!onUpdate) return;
    const updated = teachers.map((t, i) => i === idx ? { ...t, [field]: val } : t);
    onUpdate(updated);
  };

  return (
    <section id="docentes" data-section="docentes" className="px-6 py-24 md:px-16 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Nuestro equipo
          </p>
          <h2 className="mt-2 font-display text-5xl md:text-7xl uppercase">
            Cuerpo <span className="text-gradient">Docente</span>
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6">
          {teachers.map((teacher, index) => (
            <motion.div
              key={teacher.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group flex w-full flex-col items-center rounded-3xl border border-border bg-card px-8 py-10 text-center shadow-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg" />
                <img
                  src={teacher.foto || teacher.foto_url || `/assets/logo.ico`}
                  alt={teacher.nombre || teacher.name}
                  className="relative h-32 w-32 rounded-full object-cover object-top border-2 border-primary/50 ring-4 ring-primary/10"
                />
              </div>
              <EditableText
                tag="h3"
                className="font-display text-2xl"
                value={teacher.nombre || teacher.name || 'Docente'}
                onChange={onUpdate ? v => updateField(index, 'nombre', v) : undefined}
              />
              <EditableText
                tag="p"
                className="mt-1 text-sm font-semibold text-primary"
                value={teacher.especialidad || teacher.role || 'Entrenador'}
                onChange={onUpdate ? v => updateField(index, 'especialidad', v) : undefined}
              />
              <div className="mt-3 h-px w-12 bg-primary/30" />
              <EditableText
                tag="p"
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
                value={teacher.descripcion || teacher.bio || ''}
                multiline
                onChange={onUpdate ? v => updateField(index, 'descripcion', v) : undefined}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlowTeachers;
