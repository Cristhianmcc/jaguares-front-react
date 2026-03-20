import React, { useState } from 'react';
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
  const { isSectionVisible } = useSectionOrder();
  
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Editor mode: datos del context; Public mode: datos de la API
  const src = editorCtx?.content || landingData || {};
  const slidesData = src.hero?.slides || [];
  const deportesData = src.deportes || [];
  const docentesData = src.docentes || [];
  const ctaData = src.cta || {};
  const estadisticasData = src.estadisticas || {};
  const galeriaData = src.galeria || null;
  const generalData = src.general || {};

  const reveal = {
    initial: { opacity: 0, y: 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.65, ease: 'easeOut' }
  };

  const revealByIndex = (index) => ({
    ...reveal,
    transition: { ...reveal.transition, delay: index * 0.08 }
  });

  const isEdit = editorCtx?.isEditable;

  return (
    <div className="glow-theme min-h-screen bg-background">
      <GlowNavbar />
      <GlowHero
        slidesData={slidesData}
        onUpdateSlide={isEdit ? editorCtx.updateSlide : undefined}
      />

      {isSectionVisible('deportes') && (
        <motion.div {...revealByIndex(0)}>
          <GlowDisciplines
            deportesData={deportesData}
            onUpdate={isEdit ? (v) => editorCtx.updateSection('deportes', v) : undefined}
          />
        </motion.div>
      )}

      {isSectionVisible('ranking') && (
        <motion.div {...revealByIndex(1)}>
          <GlowRanking />
        </motion.div>
      )}

      {isSectionVisible('galeria') && (
        <motion.div {...revealByIndex(2)}>
          <GlowGallery
            galeriaData={galeriaData}
            onUpdate={isEdit ? (v) => editorCtx.updateSection('galeria', v) : undefined}
          />
        </motion.div>
      )}

      {isSectionVisible('docentes') && (
        <motion.div {...revealByIndex(3)}>
          <GlowTeachers
            docentesData={docentesData}
            onUpdate={isEdit ? (v) => editorCtx.updateSection('docentes', v) : undefined}
          />
        </motion.div>
      )}

      {isSectionVisible('estadisticas') && (
        <motion.div id="nosotros" {...revealByIndex(5)}>
          <GlowAbout
            estadisticasData={estadisticasData}
            onUpdate={isEdit ? (v) => editorCtx.updateSection('estadisticas', v) : undefined}
          />
        </motion.div>
      )}

      {isSectionVisible('cta') && (
        <motion.div {...revealByIndex(7)}>
          <GlowCTA
            ctaData={ctaData}
            onUpdateCTA={isEdit ? (field, value) => {
              const newData = { ...ctaData, [field]: value };
              editorCtx.updateSection('cta', newData);
            } : undefined}
          />
        </motion.div>
      )}

      <GlowFooter generalData={generalData} />
      
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowVideoModal(false)}>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <button className="absolute -top-10 right-0 text-white hover:text-primary transition-colors font-bold text-xl" onClick={() => setShowVideoModal(false)}>
              Cerrar X
            </button>
            <iframe src={generalData?.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"} className="w-full h-full border-0" allowFullScreen />
          </div>
        </div>
      )}
    </div>
  );
}
