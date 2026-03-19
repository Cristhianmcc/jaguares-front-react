import React from "react";
import { motion } from "framer-motion";
import EditableText from '../EditableText.jsx';

const defaultPatrocinadores = {
  titulo: "Nuestros Sponsors",
  items: [
    { id: 1, nombre: 'NIKE', imagen: '' },
    { id: 2, nombre: 'ADIDAS', imagen: '' },
    { id: 3, nombre: 'PUMA', imagen: '' },
    { id: 4, nombre: 'REEBOK', imagen: '' },
    { id: 5, nombre: 'NEW BALANCE', imagen: '' },
    { id: 6, nombre: 'UMBRO', imagen: '' },
  ]
};

const GlowSponsors = ({ patrocinadoresData, onUpdate }) => {
  const data = patrocinadoresData || defaultPatrocinadores;

  return (
    <section className="border-t border-border/50 bg-background/50 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 md:px-16 lg:px-24">
        <EditableText 
           tag="h4" 
           className="mb-8 text-center text-sm font-semibold tracking-widest text-muted-foreground uppercase"
           value={data.titulo}
           onChange={onUpdate ? v => onUpdate({ ...data, titulo: v }) : undefined}
        />
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale transition-all hover:grayscale-0">
          {(data.items || defaultPatrocinadores.items).map((sponsor, idx) => (
             <motion.div 
               key={sponsor.id || idx}
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
               className="flex h-12 items-center justify-center transition-all hover:scale-110 hover:opacity-100"
             >
               {sponsor.imagen ? (
                 <img src={sponsor.imagen} alt={sponsor.nombre} className="h-full object-contain" />
               ) : (
                 <span className="font-display text-2xl font-bold tracking-wider">{sponsor.nombre}</span>
               )}
             </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlowSponsors;