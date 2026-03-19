import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { disciplines } from "@/data/disciplines";

const DisciplinesSection = () => {
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
          <h2 className="mt-2 font-display text-5xl md:text-7xl">
            ELEGÍ TU <span className="text-gradient">DEPORTE</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {disciplines.map((discipline, index) => (
            <Link key={discipline.slug} to={`/disciplina/${discipline.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card transition-colors hover:border-primary/30"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${discipline.color} opacity-0 transition-opacity group-hover:opacity-100`} />
                <div className="relative z-10">
                  <div className="mb-6 inline-flex rounded-xl bg-secondary p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <discipline.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-3xl">{discipline.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {discipline.description}
                  </p>
                  <span className="mt-4 inline-block text-sm font-semibold text-primary">
                    Ver categorías y horarios →
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DisciplinesSection;
