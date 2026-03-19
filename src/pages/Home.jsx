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

  const sections = landingData?.sections || {};
  const slidesData = sections.hero?.slides || [];
  const deportesData = sections.deportes || [];
  const docentesData = sections.docentes || [];
  const ctaData = sections.cta || {};

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

  return (
    <div className="glow-theme min-h-screen bg-background">
      <GlowNavbar />
      <GlowHero
        slidesData={slidesData}
        onUpdateSlide={editorCtx?.isEditable ? editorCtx.updateSlide : undefined}
      />

      {isSectionVisible('deportes') && (
        <motion.div {...revealByIndex(0)}>
          <GlowDisciplines
            deportesData={deportesData}
            onUpdate={editorCtx?.isEditable ? (v) => editorCtx.updateSection('deportes', v) : undefined}
          />
        </motion.div>
      )}

      {(isSectionVisible('ranking') || isSectionVisible('partidos')) && (
        <motion.div {...revealByIndex(1)}>
          <GlowRanking />
        </motion.div>
      )}

      {isSectionVisible('galeria') && (
        <motion.div {...revealByIndex(2)}>
          <GlowGallery />
        </motion.div>
      )}

      {isSectionVisible('docentes') && (
        <motion.div {...revealByIndex(3)}>
          <GlowTeachers docentesData={docentesData} />
        </motion.div>
      )}

      {isSectionVisible('estadisticas') && (
        <motion.div id="nosotros" {...revealByIndex(4)}>
          <GlowAbout />
        </motion.div>
      )}

      {isSectionVisible('cta') && (
        <motion.div {...revealByIndex(5)}>
          <GlowCTA
            ctaData={ctaData}
            onUpdateCTA={editorCtx?.isEditable ? (field, value) => {
              const newData = { ...ctaData, [field]: value };
              editorCtx.updateSection('cta', newData);
            } : undefined}
          />
        </motion.div>
      )}

      <GlowFooter />
      
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowVideoModal(false)}>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <button className="absolute -top-10 right-0 text-white hover:text-primary transition-colors font-bold text-xl" onClick={() => setShowVideoModal(false)}>
              Cerrar X
            </button>
            <iframe src={landingData?.general?.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"} className="w-full h-full border-0" allowFullScreen />
          </div>
        </div>
      )}
    </div>
  );
}
