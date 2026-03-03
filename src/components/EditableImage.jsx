import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useLandingEditor } from '../context/LandingEditorContext.jsx';

/**
 * EditableImage — renders a normal <img> (or background-image container)
 * that opens an image-URL modal when the admin is in edit mode.
 *
 * Props:
 *   src         — current image URL
 *   alt         — alt text
 *   onChange    — (newUrl: string) => void   ← activates edit mode
 *   imgStyle    — styles applied to <img>
 *   wrapStyle   — styles applied to the outer wrapper div (editable mode)
 *   className   — className on the <img> (non-editable) or wrapper (editable)
 *
 * Background-image mode (bgMode=true):
 *   Renders a <div> styled with backgroundImage instead of <img>.
 *   The div receives bgDivClassName and bgDivStyle.
 *
 * Public landing: renders <img> identically to before.
 */
export default function EditableImage({
  src,
  alt = '',
  onChange,
  imgStyle,
  wrapStyle,
  className,
  /* background-image mode */
  bgMode          = false,
  bgDivStyle,
  bgDivClassName,
  /* performance */
  priority        = false,   // true → eager + fetchpriority=high (hero LCP)
}) {
  const ctx    = useLandingEditor();
  const active = !!(ctx?.isEditable && typeof onChange === 'function');

  const [modal,    setModal]    = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [hovered,  setHovered]  = useState(false);

  /* ── Public landing: render as-is ─────────────────────────────── */
  if (!active) {
    if (bgMode) {
      return (
        <div
          className={bgDivClassName}
          style={{ ...bgDivStyle, backgroundImage: `url(${src})` }}
        />
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={imgStyle}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchpriority={priority ? 'high' : 'auto'}
      />
    );
  }

  /* ── Helpers ───────────────────────────────────────────────────── */
  const openModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUrlInput('');
    setModal(true);
  };

  const handleSave = () => {
    const trimmed = urlInput.trim();
    if (trimmed) onChange(trimmed);
    setModal(false);
    setUrlInput('');
  };

  /* ── Editable wrapper ──────────────────────────────────────────── */
  const OVERLAY = {
    position: 'absolute',
    inset: 0,
    background: 'rgba(245,158,11,0.30)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: hovered ? 1 : 0,
    transition: 'opacity 0.2s',
    backdropFilter: 'blur(1px)',
    zIndex: 5,
    cursor: 'pointer',
    borderRadius: 'inherit',
  };

  const BADGE = {
    background: '#f59e0b',
    color: '#fff',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 700,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  };

  // En bgMode NO forzamos position/display — la clase CSS (hero-carousel-bg)
  // ya tiene position:absolute y las dimensiones correctas. Sobreescribirla
  // rompería el layout y haría desaparecer las imágenes.
  const wrapperStyle = bgMode
    ? { ...bgDivStyle, backgroundImage: `url(${src})`, cursor: 'pointer' }
    : { position: 'relative', display: 'block', cursor: 'pointer', ...wrapStyle };

  return (
    <>
      <div
        className={bgMode ? bgDivClassName : className}
        style={wrapperStyle}
        onClick={openModal}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Clic para cambiar imagen"
      >
        {!bgMode && (
          <img src={src} alt={alt} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', ...imgStyle }} />
        )}
        <div style={OVERLAY}>
          <span style={BADGE}>Cambiar imagen</span>
        </div>
      </div>

      {/* ── Modal via Portal (escapa del overflow del contenedor admin) ── */}
      {modal && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.72)',
            zIndex: 999999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 14, padding: 28,
              width: 500, maxWidth: '92vw', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Cambiar imagen
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Introduce la URL pública de la nueva imagen
            </p>

            {/* Preview actual */}
            {src && (
              <img
                src={src} alt="actual"
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}
              />
            )}

            <input
              type="url"
              placeholder="https://example.com/imagen.jpg"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setModal(false); }}
              autoFocus
              style={{
                width: '100%', padding: '10px 12px',
                border: '2px solid #e2e8f0', borderRadius: 8,
                fontSize: 14, boxSizing: 'border-box', outline: 'none',
                marginBottom: 16,
              }}
              onFocus={e => { e.target.style.borderColor = '#f59e0b'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModal(false)}
                style={{ padding: '8px 18px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!urlInput.trim()}
                style={{ padding: '8px 18px', background: urlInput.trim() ? '#f59e0b' : '#fcd34d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: urlInput.trim() ? 'pointer' : 'default', fontSize: 13 }}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
