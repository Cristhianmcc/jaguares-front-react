import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Dribbble, Flame, Heart, Trophy, Users, Volleyball } from "lucide-react";
import GlowNavbar from "../components/glow/GlowNavbar.jsx";
import GlowFooter from "../components/glow/GlowFooter.jsx";
import { getDisciplineBySlug } from "../data/sportHubDisciplines.js";

const imageMap = {
  futbol: "/assets/glow/hero-futbol.jpg",
  voley: "/assets/glow/hero-voley.jpg",
  basquet: "/assets/glow/hero-basquet.jpg",
  "mamas-fit": "/assets/glow/hero-mamasfit.jpg",
  "funcional-mixto": "/assets/glow/hero-funcional.jpg",
  "futbol-femenino": "/assets/glow/hero-futfem.jpg"
};

const getIcon = (slug) => {
  if (slug === "voley") return Volleyball;
  if (slug === "basquet") return Trophy;
  if (slug === "mamas-fit") return Heart;
  if (slug === "funcional-mixto") return Flame;
  if (slug === "futbol-femenino") return Users;
  return Dribbble;
};

export default function DisciplineDetail({ slug }) {
  const discipline = useMemo(() => getDisciplineBySlug(slug), [slug]);

  if (!discipline) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <GlowNavbar />
        <main className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-6 text-center md:px-16 lg:px-24">
          <h1 className="font-display text-5xl uppercase">Disciplina no encontrada</h1>
          <p className="mt-4 text-muted-foreground">La ruta no coincide con los deportes disponibles.</p>
          <a href="/" className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground">
            Volver al inicio
          </a>
        </main>
        <GlowFooter />
      </div>
    );
  }

  const Icon = getIcon(discipline.slug);
  const heroImg = imageMap[discipline.slug] || "/assets/glow/hero-sports.jpg";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlowNavbar />

      <section className="relative h-[48vh] w-full overflow-hidden">
        <img src={heroImg} alt={discipline.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 flex items-end px-6 pb-12 md:px-16 lg:px-24">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <a href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </a>
            <div className="flex items-center gap-4">
              <div className="inline-flex rounded-xl bg-primary p-3 text-primary-foreground">
                <Icon className="h-8 w-8" />
              </div>
              <h1 className="font-display text-5xl uppercase md:text-7xl">{discipline.title}</h1>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-16 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            {discipline.longDescription}
          </motion.p>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Categorias y horarios</p>
            <h2 className="mt-2 font-display text-4xl uppercase md:text-6xl">
              Encontra tu <span className="text-gradient">lugar</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {discipline.categories.map((cat, index) => (
              <motion.article
                key={cat.name}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <h3 className="font-display text-2xl">{cat.name}</h3>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" /> {cat.ages}
                </p>
                <div className="mt-4 space-y-2">
                  {cat.schedule.map((item) => (
                    <p key={item} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" /> {item}
                    </p>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <a
              href="/inscripcion"
              className="inline-flex rounded-lg bg-gradient-to-r from-primary to-accent px-8 py-4 font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              Inscribite en {discipline.title}
            </a>
          </motion.div>
        </div>
      </section>

      <GlowFooter />
    </div>
  );
}
