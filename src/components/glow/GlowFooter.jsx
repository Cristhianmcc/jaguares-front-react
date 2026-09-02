import React from "react";
import EditableText from '../EditableText.jsx';

const GlowFooter = ({ generalData = {}, onUpdateGeneral }) => {
  const currentYear = new Date().getFullYear();
  const values = {
    copyright: generalData.copyright || `© ${currentYear} Jaguares - Escuela Deportiva. Todos los derechos reservados.`,
    instagram: generalData.instagram || '#',
    facebook: generalData.facebook || '#',
    whatsapp: generalData.whatsapp || '#',
    instagramTexto: generalData.instagramTexto || 'Instagram',
    facebookTexto: generalData.facebookTexto || 'Facebook',
    whatsappTexto: generalData.whatsappTexto || 'WhatsApp',
  };
  const update = (field) => onUpdateGeneral ? (value) => onUpdateGeneral(field, value) : undefined;

  return (
    <footer data-section="footer" className="border-t border-border px-6 py-10 md:px-16 lg:px-24 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
        <EditableText tag="p" value={values.copyright} onChange={update('copyright')} />
        <div className="flex gap-6">
          <a href={values.instagram} className="transition-colors hover:text-foreground"><EditableText tag="span" value={values.instagramTexto} onChange={update('instagramTexto')} /></a>
          <a href={values.facebook} className="transition-colors hover:text-foreground"><EditableText tag="span" value={values.facebookTexto} onChange={update('facebookTexto')} /></a>
          <a href={values.whatsapp} className="transition-colors hover:text-foreground"><EditableText tag="span" value={values.whatsappTexto} onChange={update('whatsappTexto')} /></a>
        </div>
      </div>
    </footer>
  );
};

export default GlowFooter;
