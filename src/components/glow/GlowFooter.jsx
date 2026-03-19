import React from "react";

const GlowFooter = () => (
  <footer className="border-t border-border px-6 py-10 md:px-16 lg:px-24 bg-background">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
      <p>© {new Date().getFullYear()} Jaguares - Escuela Deportiva. Todos los derechos reservados.</p>
      <div className="flex gap-6">
        <a href="#" className="transition-colors hover:text-foreground">Instagram</a>
        <a href="#" className="transition-colors hover:text-foreground">Facebook</a>
        <a href="#" className="transition-colors hover:text-foreground">WhatsApp</a>
      </div>
    </div>
  </footer>
);

export default GlowFooter;