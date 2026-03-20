import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';

/**
 * Context used ONLY inside AdminLandingEditor.
 * When consumed on the public landing (no Provider ancestor),
 * useContext returns null → all editable components fall back
 * to their normal read-only behaviour.
 *
 * Shape of the provided value:
 * {
 *   isEditable : boolean,
 *   content    : { hero, deportes, estadisticas, docentes, cta, general },
 *   updateSlide   : (index, field, value) => void,
 *   updateDeporte : (index, field, value) => void,
 *   updateSection : (section, field, value) => void,   // for flat sections
 * }
 */
export const LandingEditorContext = createContext(null);

/** Hook — returns null when used outside the editor provider */
export function useLandingEditor() {
  return useContext(LandingEditorContext);
}

/**
 * Hook para la landing pública.
 * Usa SWR para stale-while-revalidate: muestra datos cacheados al instante
 * y revalida en background. Si la API falla, devuelve null (fallback silencioso).
 *
 * @returns {{ data: object|null, loading: boolean }}
 */
const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || '';

// Fetcher genérico para SWR — lanza error si la respuesta no es ok
const swrFetcher = (url) =>
  fetch(url)
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });

export function useLandingContent() {
  const { data: json, isLoading } = useSWR(
    `${API_BASE}/api/landing`,
    swrFetcher,
    {
      revalidateOnFocus:    false,   // no re-fetch al volver al tab
      dedupingInterval:     30_000,  // misma petición deduplicada 30 s
      errorRetryCount:      2,       // máximo 2 reintentos
      errorRetryInterval:   5_000,   // espera 5 s entre reintentos
      // Si falla, devuelve null — los componentes usan sus defaults
      onError: () => {},
    }
  );

  const data = json?.success && json?.data ? json.data : null;
  return { data, loading: isLoading };
}

// ─────────────────────────────────────────────────────────────
// Módulo 6: useSectionOrder
// Orden y visibilidad de las secciones de la landing.
// Reads from GET /api/landing/structure — falls back to defaults
// so the public landing NEVER breaks if the server fails.
// ─────────────────────────────────────────────────────────────

/** Orden por defecto = orden actual visible en Home.jsx */
export const DEFAULT_SECTION_STRUCTURE = [
  { section_slug: 'hero',           orden: 10,  visible: 1, label: 'Hero / Carrusel'     },
  { section_slug: 'deportes',       orden: 20,  visible: 1, label: 'Deportes'            },
  { section_slug: 'galeria',        orden: 30,  visible: 1, label: 'Galería / Instagram'  },
  { section_slug: 'docentes',       orden: 40,  visible: 1, label: 'Docentes'            },
  { section_slug: 'estadisticas',   orden: 50,  visible: 1, label: 'Sobre Nosotros'      },
  { section_slug: 'cta',            orden: 60,  visible: 1, label: 'CTA / Contacto'      },
  { section_slug: 'footer',         orden: 70,  visible: 1, label: 'Footer'              },
];

/**
 * Hook para leer el orden de secciones.
 * Falla de forma silenciosa: si la API no responde, usa DEFAULT_SECTION_STRUCTURE.
 * Expone helpers getSectionOrder() e isSectionVisible() para uso directo en JSX.
 */
export function useSectionOrder() {
  const [sections, setSections] = useState(DEFAULT_SECTION_STRUCTURE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/landing/structure`, { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(json => {
        if (!cancelled && json?.success && Array.isArray(json.sections) && json.sections.length > 0) {
          // Enriquecer con labels del default (DB sólo guarda slug/orden/visible)
          const enriched = json.sections.map(s => ({
            ...s,
            label: DEFAULT_SECTION_STRUCTURE.find(d => d.section_slug === s.section_slug)?.label || s.section_slug,
          }));
          setSections(enriched);
        }
      })
      .catch(() => { /* silent fallback */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /** Devuelve el valor CSS `order` para una sección (1-999). Fallback alto para no-registradas. */
  const getSectionOrder = useCallback((slug) => {
    const s = sections.find(s => s.section_slug === slug);
    if (s) return s.orden;
    const def = DEFAULT_SECTION_STRUCTURE.find(d => d.section_slug === slug);
    return def ? def.orden : 999;
  }, [sections]);

  /** Devuelve true si la sección debe mostrarse (visible=1, default true). */
  const isSectionVisible = useCallback((slug) => {
    const s = sections.find(s => s.section_slug === slug);
    return s ? s.visible !== 0 : true;
  }, [sections]);

  return { sections, loading, getSectionOrder, isSectionVisible };
}

