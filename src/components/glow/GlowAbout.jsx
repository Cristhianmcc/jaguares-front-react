import React from "react";
import { motion } from "framer-motion";
import EditableText from '../EditableText.jsx';

const defaultStats = {
  subtitulo: "Sobre nosotros",
  tituloLinea1: "Mas que una",
  tituloLinea2: "Academia",
  gente: "500+",   genteLabel: "Alumnos activos",
  partidos: "6",   partidosLabel: "Disciplinas",
  anos: "15+",     anosLabel: "Profesores",
  trofeos: "8",    trofeosLabel: "Años de experiencia",
  descripcion1: "Somos una comunidad deportiva comprometida con el desarrollo integral de cada persona. Desde los más chicos hasta los adultos, ofrecemos programas adaptados a cada nivel y objetivo.",
  descripcion2: "Nuestro equipo de profesionales certificados te acompaña en cada paso, combinando técnica, disciplina y pasión por el deporte."
};

const GlowAbout = ({ estadisticasData, onUpdate }) => {
  const data = { ...defaultStats, ...estadisticasData };

  const stats = [
    { key: 'gente',    value: data.gente,    label: data.genteLabel    || 'Alumnos activos' },
    { key: 'partidos', value: data.partidos, label: data.partidosLabel || 'Disciplinas' },
    { key: 'anos',     value: data.anos,     label: data.anosLabel     || 'Profesores' },
    { key: 'trofeos',  value: data.trofeos,  label: data.trofeosLabel  || 'Años de experiencia' },
  ];

  const updateField = (field, val) => {
    if (!onUpdate) return;
    onUpdate({ ...data, [field]: val });
  };

  return (
    <section data-section="estadisticas" className="relative overflow-hidden px-6 py-24 md:px-16 lg:px-24">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <EditableText
              tag="p"
              className="text-sm font-semibold uppercase tracking-[0.3em] text-primary"
              value={data.subtitulo}
              onChange={onUpdate ? v => updateField('subtitulo', v) : undefined}
            />
            <h2 className="mt-2 font-display text-5xl md:text-7xl uppercase">
              <EditableText
                tag="span"
                className=""
                value={data.tituloLinea1}
                onChange={onUpdate ? v => updateField('tituloLinea1', v) : undefined}
              />{' '}
              <EditableText
                tag="span"
                className="text-gradient"
                value={data.tituloLinea2}
                onChange={onUpdate ? v => updateField('tituloLinea2', v) : undefined}
              />
            </h2>
            <EditableText
              tag="p"
              className="mt-6 text-lg leading-relaxed text-muted-foreground"
              value={data.descripcion1}
              multiline
              onChange={onUpdate ? v => updateField('descripcion1', v) : undefined}
            />
            <EditableText
              tag="p"
              className="mt-4 text-lg leading-relaxed text-muted-foreground"
              value={data.descripcion2}
              multiline
              onChange={onUpdate ? v => updateField('descripcion2', v) : undefined}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-card"
              >
                <EditableText
                  tag="p"
                  className="font-display text-5xl text-gradient"
                  value={stat.value}
                  onChange={onUpdate ? v => updateField(stat.key, v) : undefined}
                />
                <EditableText
                  tag="p"
                  className="mt-2 text-sm text-muted-foreground"
                  value={stat.label}
                  onChange={onUpdate ? v => updateField(`${stat.key}Label`, v) : undefined}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GlowAbout;
