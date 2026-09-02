import React from 'react';
import { motion } from 'framer-motion';
import { useLandingEditor, useLandingContent, useSectionOrder } from '../context/LandingEditorContext.jsx';

import GlowNavbar from '../components/glow/GlowNavbar.jsx';
import GlowHero from '../components/glow/GlowHero.jsx';
import GlowDisciplines from '../components/glow/GlowDisciplines.jsx';
import GlowRanking from '../components/glow/GlowRanking.jsx';
import GlowGallery from '../components/glow/GlowGallery.jsx';
import GlowTeachers from '../components/glow/GlowTeachers.jsx';
import GlowAbout from '../components/glow/GlowAbout.jsx';
import GlowCTA from '../components/glow/GlowCTA.jsx';
import GlowFooter from '../components/glow/GlowFooter.jsx';

export default function Home() {
  const editorCtx = useLandingEditor();
  const { data: landingData } = useLandingContent();
  const { sections } = useSectionOrder();

  // Editor: contenido en memoria. Sitio público: última versión publicada.
  const content = editorCtx?.content || landingData || {};
  const isEdit = Boolean(editorCtx?.isEditable);
  const headings = content.encabezados || {};

  const reveal = (index) => ({
    initial: { opacity: 0, y: 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.6, ease: 'easeOut', delay: index * 0.05 },
  });

  const updateHeading = (slug, value) => {
    if (!isEdit) return;
    editorCtx.updateSection('encabezados', { ...headings, [slug]: value });
  };

  const renderers = {
    hero: () => (
      <GlowHero
        slidesData={content.hero?.slides || []}
        heroConfig={content.heroConfig || {}}
        onUpdateSlide={isEdit ? editorCtx.updateSlide : undefined}
      />
    ),
    deportes: () => (
      <motion.div {...reveal(1)}>
        <GlowDisciplines
          deportesData={content.deportes || []}
          headingData={headings.deportes || {}}
          onUpdate={isEdit ? value => editorCtx.updateSection('deportes', value) : undefined}
          onUpdateHeading={isEdit ? value => updateHeading('deportes', value) : undefined}
        />
      </motion.div>
    ),
    ranking: () => (
      <motion.div {...reveal(2)}>
        <GlowRanking
          headingData={headings.ranking || {}}
          onUpdateHeading={isEdit ? value => updateHeading('ranking', value) : undefined}
        />
      </motion.div>
    ),
    galeria: () => (
      <motion.div {...reveal(3)}>
        <GlowGallery
          galeriaData={content.galeria || {}}
          headingData={headings.galeria || {}}
          onUpdate={isEdit ? value => editorCtx.updateSection('galeria', value) : undefined}
          onUpdateHeading={isEdit ? value => updateHeading('galeria', value) : undefined}
        />
      </motion.div>
    ),
    docentes: () => (
      <motion.div {...reveal(4)}>
        <GlowTeachers
          docentesData={content.docentes || []}
          headingData={headings.docentes || {}}
          onUpdate={isEdit ? value => editorCtx.updateSection('docentes', value) : undefined}
          onUpdateHeading={isEdit ? value => updateHeading('docentes', value) : undefined}
        />
      </motion.div>
    ),
    estadisticas: () => (
      <motion.div id="nosotros" {...reveal(5)}>
        <GlowAbout
          estadisticasData={content.estadisticas || {}}
          onUpdate={isEdit ? value => editorCtx.updateSection('estadisticas', value) : undefined}
        />
      </motion.div>
    ),
    cta: () => (
      <motion.div {...reveal(6)}>
        <GlowCTA
          ctaData={content.cta || {}}
          onUpdateCTA={isEdit ? (field, value) => {
            editorCtx.updateSection('cta', { ...(content.cta || {}), [field]: value });
          } : undefined}
        />
      </motion.div>
    ),
    footer: () => (
      <GlowFooter
        generalData={content.general || {}}
        onUpdateGeneral={isEdit ? (field, value) => {
          editorCtx.updateSection('general', { ...(content.general || {}), [field]: value });
        } : undefined}
      />
    ),
  };

  const orderedSections = [...(sections || [])]
    .filter(section => section.visible !== 0 && renderers[section.section_slug])
    .sort((a, b) => Number(a.orden) - Number(b.orden));

  return (
    <div className="glow-theme min-h-screen bg-background">
      <GlowNavbar navigationData={content.navegacion || {}} />
      <main className="flex flex-col">
        {orderedSections.map(section => (
          <React.Fragment key={section.section_slug}>
            {renderers[section.section_slug]()}
          </React.Fragment>
        ))}
      </main>
    </div>
  );
}
