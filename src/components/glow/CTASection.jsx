import { motion } from "framer-motion";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";

const CTASection = () => {
  return (
    <section id="contacto" className="px-6 py-24 md:px-16 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 md:p-20"
        >
          {/* Decorative circles */}
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-foreground/5" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-foreground/5" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-5xl text-primary-foreground md:text-7xl">
                SUMATE A<br />JAGUARES
              </h2>
              <p className="mt-4 max-w-md text-lg text-primary-foreground/80">
                Empezá hoy tu camino deportivo. Inscripciones abiertas para todas las disciplinas.
              </p>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-background px-8 py-4 font-semibold text-foreground transition-all hover:shadow-glow"
              >
                Inscribite Ahora
                <ArrowRight className="h-5 w-5" />
              </motion.a>
            </div>

            <div className="flex flex-col justify-center gap-6 text-primary-foreground/90">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary-foreground/10 p-3">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Ubicación</p>
                  <p className="text-sm text-primary-foreground/70">Av. Deportiva 1234, Buenos Aires</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary-foreground/10 p-3">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Teléfono</p>
                  <p className="text-sm text-primary-foreground/70">+54 11 1234-5678</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary-foreground/10 p-3">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-sm text-primary-foreground/70">info@academiafit.com</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
