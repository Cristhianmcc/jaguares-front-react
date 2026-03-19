import { motion } from "framer-motion";

const stats = [
  { value: "500+", label: "Alumnos activos" },
  { value: "6", label: "Disciplinas" },
  { value: "15+", label: "Profesores" },
  { value: "8", label: "Años de experiencia" },
];

const AboutSection = () => {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-16 lg:px-24">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Sobre nosotros
            </p>
            <h2 className="mt-2 font-display text-5xl md:text-7xl">
              MÁS QUE UNA <span className="text-gradient">ACADEMIA</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Somos una comunidad deportiva comprometida con el desarrollo integral
              de cada persona. Desde los más chicos hasta los adultos, ofrecemos
              programas adaptados a cada nivel y objetivo.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Nuestro equipo de profesionales certificados te acompaña en cada paso,
              combinando técnica, disciplina y pasión por el deporte.
            </p>
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
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-card"
              >
                <p className="font-display text-5xl text-gradient">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
