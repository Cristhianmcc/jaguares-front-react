import React, { useState } from 'react';

/**
 * Detecta si una URL o ruta apunta a un archivo de video.
 */
export function isVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.ogv') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.m4v')
  );
}

/**
 * Componente unificado para renderizar video o imagen con degradacion elegante.
 * Si src apunta a un video: renderiza <video> con autoPlay/muted/playsInline.
 * Si src es imagen: renderiza <img> con lazy loading.
 * Acepta onEnded para que el carrusel pueda avanzar al terminar el video.
 */
export default function MediaRenderer({
  src,
  alt = 'Media',
  className = '',
  style = {},
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  controls = false,
  poster = '',
  fallbackSrc = '/assets/logo-jaguares.png',
  objectFit = 'cover',
  onEnded,
  onLoadedMetadata,
}) {
  const [hasError, setHasError] = useState(false);

  if (!src && !fallbackSrc) return null;

  const currentSrc = hasError ? fallbackSrc : (src || fallbackSrc);
  const isVideo = !hasError && isVideoUrl(src);

  if (isVideo) {
    return (
      <video
        src={currentSrc}
        poster={poster}
        autoPlay={autoPlay}
        loop={onEnded ? false : loop}
        muted={muted}
        playsInline={playsInline}
        controls={controls}
        className={className}
        style={{ objectFit, ...style }}
        onEnded={onEnded}
        onLoadedMetadata={onLoadedMetadata}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={{ objectFit, ...style }}
      loading="lazy"
      onError={() => {
        if (!hasError && fallbackSrc && fallbackSrc !== currentSrc) {
          setHasError(true);
        }
      }}
    />
  );
}
