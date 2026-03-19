import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const GlowNavbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Inicio", href: "/" },
    { label: "Disciplinas", href: "#disciplinas" },
    { label: "Ranking", href: "#ranking" },
    { label: "Galeria", href: "#galeria" },
    { label: "Docentes", href: "#docentes" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Contacto", href: "#contacto" },
    { label: "Consultar Estado", href: "/consulta" },
    { label: "Intranet", href: "/admin-login" },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:px-16 lg:px-24">
        <a href="/" className="flex items-center gap-3">
          <img src="/assets/logo.ico" alt="Jaguares" className="h-12 w-12 object-contain" />
          <span className="font-display text-2xl tracking-wide">JAGUARES</span>
        </a>

        <div className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/inscripcion"
            className="bg-gradient-primary rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-glow"
          >
            Inscribite
          </a>
        </div>

        <button onClick={() => setOpen(!open)} className="text-foreground lg:hidden">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/30 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/inscripcion"
                onClick={() => setOpen(false)}
                className="bg-gradient-primary mt-2 rounded-lg px-5 py-3 text-center font-semibold text-primary-foreground"
              >
                Inscribite
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default GlowNavbar;
