import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import EditableText from '../EditableText.jsx';

const GlowCTA = ({ ctaData, onUpdateCTA }) => {
  const defaults = {
    titulo: "SÚMATE A\nJAGUARES",
    descripcion: "Empieza hoy tu camino deportivo. Inscripciones abiertas para todas las disciplinas.",
    ubicacion: "Lima, Perú",
    telefono: "+51 973 324 460",
    email: "fcrealjosegalvez10@gmail.com",
    botonTexto: "Inscríbete Ahora",
    botonEnlace: "/inscripcion",
    ubicacionEtiqueta: "Ubicación",
    telefonoEtiqueta: "Teléfono",
    emailEtiqueta: "Email",
    imagen: "",
  };

  const withFallback = (value, fallback) => typeof value === 'string' && value.trim() ? value : fallback;
  const data = Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [key, withFallback(ctaData?.[key], fallback)])
  );
  const update = (field) => onUpdateCTA ? (value) => onUpdateCTA(field, value) : undefined;

  const contacts = [
    { Icon: MapPin, labelKey: 'ubicacionEtiqueta', valueKey: 'ubicacion' },
    { Icon: Phone, labelKey: 'telefonoEtiqueta', valueKey: 'telefono' },
    { Icon: Mail, labelKey: 'emailEtiqueta', valueKey: 'email' },
  ];

  return (
    <section id="contacto" data-section="cta" className="px-6 py-24 md:px-16 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-card border border-border p-12 md:p-20"
          style={{
            boxShadow: 'var(--shadow-glow)',
            backgroundImage: data.imagen ? `linear-gradient(rgba(10,15,25,.88), rgba(10,15,25,.88)), url(${data.imagen})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/5" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/5" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-2">
            <div>
              <EditableText tag="h2" className="font-display text-5xl text-foreground md:text-7xl"
                value={data.titulo} multiline onChange={update('titulo')} />
              <EditableText tag="p" className="mt-4 max-w-md text-lg text-muted-foreground"
                value={data.descripcion} multiline onChange={update('descripcion')} />
              <motion.a href={data.botonEnlace} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all hover:shadow-glow">
                <EditableText tag="span" value={data.botonTexto} onChange={update('botonTexto')} />
                <ArrowRight className="h-5 w-5" />
              </motion.a>
            </div>

            <div className="flex flex-col justify-center gap-6">
              {contacts.map(({ Icon, labelKey, valueKey }) => (
                <div className="flex items-center gap-4" key={valueKey}>
                  <div className="rounded-lg bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <EditableText tag="p" className="font-semibold text-foreground"
                      value={data[labelKey]} onChange={update(labelKey)} />
                    <EditableText tag="p" className="text-sm text-muted-foreground"
                      value={data[valueKey]} onChange={update(valueKey)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GlowCTA;
