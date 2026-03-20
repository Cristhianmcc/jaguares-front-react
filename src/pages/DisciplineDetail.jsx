import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Dribbble, Flame, Heart, Trophy, Users, Volleyball } from "lucide-react";
import GlowNavbar from "../components/glow/GlowNavbar.jsx";
import GlowFooter from "../components/glow/GlowFooter.jsx";
import { getDisciplineBySlug, toDisciplineSlug } from "../data/sportHubDisciplines.js";

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || '';

const defaultHeroImages = {
  futbol: "/assets/glow/hero-futbol.jpg",
  voley: "/assets/glow/hero-voley.jpg",
  basquet: "/assets/glow/hero-basquet.jpg",
  "mamas-fit": "/assets/glow/hero-mamasfit.jpg",
  "funcional-mixto": "/assets/glow/hero-funcional.jpg",
  "futbol-femenino": "/assets/glow/hero-futfem.jpg"
};

const defaultGalleryMap = {
  futbol: [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=700&q=80&fit=crop",
    "https://images.unsplash.com/photo-1508098682722-e99c643e7486?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500&q=80&fit=crop",
  ],
  voley: [
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=700&q=80&fit=crop",
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1562552052-d8ef4a40c4ce?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=500&q=80&fit=crop",
  ],
  basquet: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=700&q=80&fit=crop",
    "https://images.unsplash.com/photo-1505666287802-931dc83948e9?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=500&q=80&fit=crop",
  ],
  "mamas-fit": [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80&fit=crop",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80&fit=crop",
  ],
  "funcional-mixto": [
    "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=700&q=80&fit=crop",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1550259979-ed79b48d2a30?w=500&q=80&fit=crop",
  ],
  "futbol-femenino": [
    "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=700&q=80&fit=crop",
    "https://images.unsplash.com/photo-1541771519-7fdb2fc6ad44?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1518604964265-c68e4db8b76e?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500&q=80&fit=crop",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&q=80&fit=crop",
  ],
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
  const [landingData, setLandingData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/landing`)
      .then(r => r.json())
      .then(json => { if (json.success) setLandingData(json.data); })
      .catch(() => {});
  }, []);

  // Buscar el deporte por slug en los datos de la BD
  const discipline = useMemo(() => {
    if (landingData?.deportes && Array.isArray(landingData.deportes)) {
      const match = landingData.deportes.find(d => {
        const depSlug = d.slug || toDisciplineSlug(d.titulo || d.id);
        return depSlug === slug;
      });
      if (match) {
        return {
          slug,
          title: match.titulo,
          longDescription: match.longDescription || match.descripcion || '',
          heroImage: match.heroImage || '',
          categories: Array.isArray(match.categories) ? match.categories : [],
          gallery: Array.isArray(match.gallery) ? match.gallery : [],
        };
      }
    }
    // Fallback a datos estáticos
    const staticD = getDisciplineBySlug(slug);
    if (staticD) return { ...staticD, heroImage: '', gallery: [] };
    return null;
  }, [slug, landingData]);

  const generalData = landingData?.general || {};

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
        <GlowFooter generalData={generalData} />
      </div>
    );
  }

  const Icon = getIcon(slug);
  const heroImg = discipline.heroImage || defaultHeroImages[slug] || "/assets/glow/hero-sports.jpg";
  const gallery = discipline.gallery.length > 0 ? discipline.gallery : (defaultGalleryMap[slug] || []);

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

      {gallery.length > 0 && (
        <section className="px-6 py-12 pb-24 md:px-16 lg:px-24">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Galería</p>
              <h2 className="mt-2 font-display text-4xl uppercase md:text-5xl">
                Nuestras <span className="text-gradient">clases</span>
              </h2>
            </motion.div>
            <div className="grid auto-rows-[200px] grid-cols-2 gap-3 md:auto-rows-[160px] md:grid-cols-4">
              {gallery.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className={`overflow-hidden rounded-xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                >
                  <img
                    src={img}
                    alt={`${discipline.title} ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <GlowFooter generalData={generalData} />
    </div>
  );
}
