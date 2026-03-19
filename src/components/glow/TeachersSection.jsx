import { motion } from "framer-motion";

const teachers = [
  {
    name: "Prof. Martín Aguirre",
    role: "Director Técnico - Fútbol",
    bio: "Licenciado en Educación Física. 15 años de experiencia en formación de juveniles.",
    initials: "MA",
  },
  {
    name: "Prof. Laura Méndez",
    role: "Entrenadora - Vóley",
    bio: "Ex jugadora de selección nacional. Especialista en técnica y preparación física.",
    initials: "LM",
  },
  {
    name: "Prof. Diego Castillo",
    role: "Entrenador - Básquet",
    bio: "Coach certificado FIBA. Formador de jugadores en categorías juveniles y mayores.",
    initials: "DC",
  },
  {
    name: "Prof. Ana Gutiérrez",
    role: "Instructora - Mamás Fit",
    bio: "Especialista en fitness pre y post natal. Certificada en entrenamiento funcional.",
    initials: "AG",
  },
  {
    name: "Prof. Sebastián Torres",
    role: "Entrenador - Funcional Mixto",
    bio: "Crossfit Level 2 Trainer. Experto en programación de WODs y strength training.",
    initials: "ST",
  },
  {
    name: "Prof. Florencia Paz",
    role: "Entrenadora - Fútbol Femenino",
    bio: "Directora técnica nacional. Impulsora del fútbol femenino en la región.",
    initials: "FP",
  },
];

const TeachersSection = () => {
  return (
    <section id="docentes" className="px-6 py-24 md:px-16 lg:px-24">
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
          <h2 className="mt-2 font-display text-5xl md:text-7xl">
            CUERPO <span className="text-gradient">DOCENTE</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher, index) => (
            <motion.div
              key={teacher.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="group overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card transition-colors hover:border-primary/30"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary font-display text-3xl text-primary-foreground">
                {teacher.initials}
              </div>
              <h3 className="font-display text-2xl">{teacher.name}</h3>
              <p className="mt-1 text-sm font-semibold text-primary">{teacher.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{teacher.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeachersSection;
