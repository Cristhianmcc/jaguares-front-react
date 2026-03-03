import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LandingEditorContext } from '../context/LandingEditorContext.jsx';
import SectionOrderPanel from '../components/SectionOrderPanel.jsx';
import Home from './Home.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || '';
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

// ─────────────────────────────────────────────────────────────
// Micro-componentes de formulario reutilizables
// ─────────────────────────────────────────────────────────────
function FieldText({ label, value, onChange, placeholder = '', textStyle, onStyleChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.label}>{label}</label>
      <input
        style={styles.input}
        value={value || ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
      <TextStyleControls textStyle={textStyle} onStyleChange={onStyleChange} />
    </div>
  );
}

function FieldTextarea({ label, value, onChange, rows = 3, placeholder = '', textStyle, onStyleChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.label}>{label}</label>
      <textarea
        style={{ ...styles.input, height: rows * 24, resize: 'vertical' }}
        value={value || ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
      <TextStyleControls textStyle={textStyle} onStyleChange={onStyleChange} />
    </div>
  );
}

function FieldColor({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
      <label style={{ ...styles.label, marginBottom: 0 }}>{label}</label>
      <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
        style={{ width: 42, height: 32, border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
      <span style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}

function FieldImage({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE}/api/landing/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        onChange(data.url);
      } else {
        setError(data.error || 'Error al subir');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.label}>{label}</label>
      {/* Preview */}
      {value && (
        <img
          src={value} alt="preview"
          style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8, marginBottom: 8, border: '1px solid #e2e8f0' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      {/* Input URL */}
      <input
        style={{ ...styles.input, marginBottom: 6 }}
        value={value || ''}
        placeholder="https://... o sube una imagen abajo"
        onChange={e => onChange(e.target.value)}
      />
      {/* Botón subir */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        style={{
          width: '100%', padding: '8px 0',
          background: uploading ? '#e2e8f0' : '#1e293b',
          color: uploading ? '#94a3b8' : '#fff',
          border: 'none', borderRadius: 8,
          fontSize: 12, fontWeight: 600, cursor: uploading ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        {uploading ? 'Subiendo...' : 'Subir imagen desde tu PC'}
      </button>
      {error && <p style={{ color: '#ef4444', fontSize: 11, margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />;
}

// ─────────────────────────────────────────────────────────────
// Controles de estilo de texto — inline en cada campo
// ─────────────────────────────────────────────────────────────
const TEXT_FONTS = [
  'Inter Tight','DM Sans','Roboto','Oswald','Montserrat',
  'Playfair Display','Bebas Neue','Lato','Open Sans','Poppins',
  'Raleway','Anton','Barlow','Nunito','Ubuntu',
];

function TextStyleControls({ textStyle = {}, onStyleChange }) {
  const [open, setOpen] = useState(false);
  if (!onStyleChange) return null;
  const upd = (k, v) => onStyleChange({ ...textStyle, [k]: v !== '' ? v : undefined });

  const isBold      = textStyle.fontWeight === 'bold' || textStyle.fontWeight === '700';
  const isItalic    = textStyle.fontStyle === 'italic';
  const isUnderline = (textStyle.textDecoration || '').includes('underline');
  const fontSize    = textStyle.fontSize ? parseInt(textStyle.fontSize) : '';

  const row    = { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 };
  const slbl   = { fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4, minWidth: 52, flexShrink: 0 };
  const inp    = { height: 26, border: '1px solid #cbd5e1', borderRadius: 5, padding: '0 6px', fontSize: 11, color: '#1e293b', background: '#fff', flex: 1 };
  const togBtn = (active) => ({
    height: 26, minWidth: 30, border: '1px solid #cbd5e1', borderRadius: 5, cursor: 'pointer',
    background: active ? '#f59e0b' : '#f8fafc', color: active ? '#fff' : '#475569',
    fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  });

  return (
    <div style={{ marginTop: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: open ? '#fffbeb' : '#f8fafc',
          border: '1px solid ' + (open ? '#f59e0b' : '#e2e8f0'),
          borderRadius: open ? '6px 6px 0 0' : 6,
          padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 700,
          color: open ? '#92400e' : '#64748b',
        }}
      >
        <span>✎ Estilos</span>
        <span style={{ fontSize: 9 }}>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '8px 8px 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <button onClick={() => onStyleChange({})}
              style={{ fontSize: 10, color: '#ef4444', background: 'none', border: '1px solid #fca5a5', borderRadius: 4, padding: '1px 6px', cursor: 'pointer' }}>
              Reset
            </button>
          </div>
          {/* Fuente */}
          <div style={row}>
            <span style={slbl}>Fuente</span>
            <select value={textStyle.fontFamily || ''} onChange={e => upd('fontFamily', e.target.value)} style={{ ...inp }}>
              <option value="">— Herencia —</option>
              {TEXT_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          {/* Tamaño + Peso */}
          <div style={row}>
            <span style={slbl}>Tamaño</span>
            <input type="number" min={8} max={300} placeholder="px"
              value={fontSize} onChange={e => upd('fontSize', e.target.value ? `${e.target.value}px` : '')}
              style={{ ...inp, width: 58, flex: 'none' }} />
            <span style={{ ...slbl, minWidth: 'auto', marginLeft: 4 }}>Peso</span>
            <select value={textStyle.fontWeight || ''} onChange={e => upd('fontWeight', e.target.value)} style={{ ...inp }}>
              <option value="">Normal</option>
              <option value="300">Ligera (300)</option>
              <option value="400">Regular (400)</option>
              <option value="600">Semi-negrita (600)</option>
              <option value="700">Negrita (700)</option>
              <option value="900">Extra-negrita (900)</option>
            </select>
          </div>
          {/* Estilo + Mayús */}
          <div style={row}>
            <span style={slbl}>Estilo</span>
            <button style={togBtn(isBold)} onClick={() => upd('fontWeight', isBold ? 'normal' : '700')}><strong>N</strong></button>
            <button style={togBtn(isItalic)} onClick={() => upd('fontStyle', isItalic ? 'normal' : 'italic')}><em>K</em></button>
            <button style={togBtn(isUnderline)} onClick={() => upd('textDecoration', isUnderline ? 'none' : 'underline')}><span style={{ textDecoration: 'underline' }}>S</span></button>
            <span style={{ ...slbl, minWidth: 'auto', marginLeft: 4 }}>Mayús</span>
            <select value={textStyle.textTransform || ''} onChange={e => upd('textTransform', e.target.value)} style={{ ...inp }}>
              <option value="">Normal</option>
              <option value="uppercase">MAYÚSCULAS</option>
              <option value="lowercase">minúsculas</option>
              <option value="capitalize">Primera Mayúscula</option>
            </select>
          </div>
          {/* Color */}
          <div style={row}>
            <span style={slbl}>Color</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', flex: 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: 5, border: '2px solid #cbd5e1', background: textStyle.color || '#ffffff', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                <input type="color" value={textStyle.color || '#ffffff'} onChange={e => upd('color', e.target.value)}
                  style={{ position: 'absolute', inset: '-4px', width: '150%', height: '150%', opacity: 0, cursor: 'pointer' }} />
              </div>
              <span style={{ fontSize: 10, color: '#475569' }}>{textStyle.color || 'Heredado'}</span>
            </label>
            <span style={{ ...slbl, minWidth: 'auto' }}>Fondo</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <div style={{ width: 24, height: 24, borderRadius: 5, border: '2px solid #cbd5e1', background: textStyle.background || 'transparent', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                <input type="color" value={textStyle.background || '#ffffff'} onChange={e => upd('background', e.target.value)}
                  style={{ position: 'absolute', inset: '-4px', width: '150%', height: '150%', opacity: 0, cursor: 'pointer' }} />
              </div>
            </label>
          </div>
          {/* Alineación */}
          <div style={{ ...row, marginBottom: 2 }}>
            <span style={slbl}>Alinear</span>
            {[['left','◀'],['center','—'],['right','▶']].map(([align, icon]) => (
              <button key={align} style={{ ...togBtn(textStyle.textAlign === align), minWidth: 32 }}
                onClick={() => upd('textAlign', textStyle.textAlign === align ? '' : align)}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tabs de secciones
// ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'hero',         label: 'Hero' },
  { id: 'partidos',     label: 'Partidos' },
  { id: 'deportes',     label: 'Deportes' },
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'docentes',     label: 'Docentes' },
  { id: 'novedades',       label: 'Novedades' },
  { id: 'patrocinadores', label: 'Patrocinadores' },
  { id: 'galeria',      label: 'Galería' },
  { id: 'cta',          label: 'CTA' },
  { id: 'tipografia',   label: 'Tipografía' },
  { id: 'general',      label: 'General' },
  { id: 'versiones',    label: '🕐 Versiones' },
  { id: 'orden',        label: '↕ Orden' },
];

// ─────────────────────────────────────────────────────────────
// Paneles de edición por sección
// ─────────────────────────────────────────────────────────────
function HeroPanel({ data, onChange }) {
  if (!data?.slides) return null;

  const updateSlide = (idx, field, val) => {
    const slides = data.slides.map((s, i) => i === idx ? { ...s, [field]: val } : s);
    onChange({ ...data, slides });
  };

  return (
    <div>
      <p style={styles.hint}>Edita los textos e imagen de cada slide del carrusel principal.</p>
      {data.slides.map((slide, idx) => (
        <SectionCard key={slide.id} title={`Slide ${idx + 1} — ${slide.sport}`}>
          <FieldText label="Deporte / Categoría" value={slide.sport}
            onChange={v => updateSlide(idx, 'sport', v)}
            textStyle={slide.sportStyle||{}} onStyleChange={s => updateSlide(idx,'sportStyle',s)} />
          <FieldText label="Título principal (usa \\n para salto)" value={slide.title}
            onChange={v => updateSlide(idx, 'title', v)}
            textStyle={slide.titleStyle||{}} onStyleChange={s => updateSlide(idx,'titleStyle',s)} />
          <FieldText label="Subtítulo" value={slide.subtitle}
            onChange={v => updateSlide(idx, 'subtitle', v)}
            textStyle={slide.subtitleStyle||{}} onStyleChange={s => updateSlide(idx,'subtitleStyle',s)} />
          <FieldTextarea label="Descripción" value={slide.description}
            onChange={v => updateSlide(idx, 'description', v)}
            textStyle={slide.descriptionStyle||{}} onStyleChange={s => updateSlide(idx,'descriptionStyle',s)} />
          <FieldImage label="Imagen de fondo" value={slide.image}
            onChange={v => updateSlide(idx, 'image', v)} />
          <FieldColor label="Color de acento" value={slide.accent}
            onChange={v => updateSlide(idx, 'accent', v)} />
        </SectionCard>
      ))}
    </div>
  );
}

function DeportesPanel({ data, onChange }) {
  if (!Array.isArray(data)) return null;

  const updateDeporte = (idx, field, val) => {
    const updated = data.map((d, i) => i === idx ? { ...d, [field]: val } : d);
    onChange(updated);
  };

  return (
    <div>
      <p style={styles.hint}>Edita las tarjetas de disciplinas deportivas.</p>
      {data.map((dep, idx) => (
        <SectionCard key={dep.id} title={`Deporte ${idx + 1}${dep.destacado ? ' ⭐ (Destacado)' : ''}`}>
          <FieldText label="Categoría / Badge" value={dep.categoria}
            onChange={v => updateDeporte(idx, 'categoria', v)}
            textStyle={dep.categoriaStyle||{}} onStyleChange={s => updateDeporte(idx,'categoriaStyle',s)} />
          <FieldText label="Fecha / Días" value={dep.fecha}
            onChange={v => updateDeporte(idx, 'fecha', v)}
            textStyle={dep.fechaStyle||{}} onStyleChange={s => updateDeporte(idx,'fechaStyle',s)} />
          <FieldText label="Título" value={dep.titulo}
            onChange={v => updateDeporte(idx, 'titulo', v)}
            textStyle={dep.tituloStyle||{}} onStyleChange={s => updateDeporte(idx,'tituloStyle',s)} />
          <FieldTextarea label="Descripción" value={dep.descripcion}
            onChange={v => updateDeporte(idx, 'descripcion', v)}
            textStyle={dep.descripcionStyle||{}} onStyleChange={s => updateDeporte(idx,'descripcionStyle',s)} />
          <FieldImage label="Imagen" value={dep.imagen}
            onChange={v => updateDeporte(idx, 'imagen', v)} />
        </SectionCard>
      ))}
    </div>
  );
}

function EstadisticasPanel({ data, onChange }) {
  if (!data) return null;

  const update = (field, val) => onChange({ ...data, [field]: val });

  return (
    <div>
      <p style={styles.hint}>Números que aparecen en la sección de estadísticas (contadores).</p>
      <SectionCard title="Contadores Animados">
        <FieldText label='Gente (ej: "90+")' value={data.gente} onChange={v => update('gente', v)}
          textStyle={data.genteStyle||{}} onStyleChange={s => update('genteStyle', s)} />
        <FieldText label='Partidos (ej: "2548")' value={data.partidos} onChange={v => update('partidos', v)}
          textStyle={data.partidosStyle||{}} onStyleChange={s => update('partidosStyle', s)} />
        <FieldText label='Años (ej: "25+")' value={data.anos} onChange={v => update('anos', v)}
          textStyle={data.anosStyle||{}} onStyleChange={s => update('anosStyle', s)} />
        <FieldText label='Trofeos (ej: "256")' value={data.trofeos} onChange={v => update('trofeos', v)}
          textStyle={data.trofeosStyle||{}} onStyleChange={s => update('trofeosStyle', s)} />
      </SectionCard>
    </div>
  );
}

function DocentesPanel({ data, onChange }) {
  if (!Array.isArray(data)) return null;

  const updateDocente = (idx, field, val) => {
    const updated = data.map((d, i) => i === idx ? { ...d, [field]: val } : d);
    onChange(updated);
  };

  const addDocente = () => {
    const newId = Date.now();
    onChange([...data, { id: newId, nombre: '', especialidad: '', foto: '' }]);
  };

  const removeDocente = (idx) => {
    if (!window.confirm(`¿Eliminar al docente "${data[idx].nombre || `#${idx + 1}`}"?`)) return;
    onChange(data.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <p style={styles.hint}>Staff técnico que aparece en la sección de docentes.</p>
      {data.map((doc, idx) => (
        <SectionCard key={doc.id ?? idx} title={`Docente ${idx + 1}${doc.nombre ? ` — ${doc.nombre}` : ''}`}>
          <FieldText label="Nombre" value={doc.nombre}
            onChange={v => updateDocente(idx, 'nombre', v)}
            textStyle={doc.nombreStyle||{}} onStyleChange={s => updateDocente(idx,'nombreStyle',s)} />
          <FieldText label="Especialidad" value={doc.especialidad}
            onChange={v => updateDocente(idx, 'especialidad', v)}
            textStyle={doc.especialidadStyle||{}} onStyleChange={s => updateDocente(idx,'especialidadStyle',s)} />
          <FieldImage label="Foto" value={doc.foto}
            onChange={v => updateDocente(idx, 'foto', v)} />
          {/* Botón eliminar */}
          <button
            onClick={() => removeDocente(idx)}
            style={{
              width: '100%', marginTop: 4, padding: '7px 0',
              background: 'transparent', color: '#ef4444',
              border: '1px solid #fca5a5', borderRadius: 8,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            🗑 Eliminar docente
          </button>
        </SectionCard>
      ))}
      {/* Botón agregar */}
      <button
        onClick={addDocente}
        style={{
          width: '100%', marginTop: 8, padding: '10px 0',
          background: '#f0fdf4', color: '#16a34a',
          border: '1.5px dashed #86efac', borderRadius: 10,
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}
      >
        + Agregar docente
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Panel: Partidos
// ─────────────────────────────────────────────────────────────
function PartidosPanel({ data, onChange }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ padding: 16, color: '#64748b', fontSize: 13 }}>
        <p>Cargando datos de partidos...</p>
      </div>
    );
  }

  const updatePartido = (idx, field, val) => {
    const updated = data.map((p, i) => i === idx ? { ...p, [field]: val } : p);
    onChange(updated);
  };

  const updateEquipo = (idx, side, equipoField, val) => {
    const campo = side === 'local' ? 'equipoLocal' : 'equipoVisita';
    const updated = data.map((p, i) => i === idx ? { ...p, [campo]: { ...p[campo], [equipoField]: val } } : p);
    onChange(updated);
  };

  return (
    <div>
      <p style={styles.hint}>Edita los 4 partidos: equipos, logos, resultado, fecha y sede.</p>
      {data.map((partido, idx) => (
        <SectionCard
          key={partido.id ?? idx}
          title={`Partido ${idx + 1} — ${partido.equipoLocal?.nombre} vs ${partido.equipoVisita?.nombre}`}
        >
          <p style={{ ...styles.label, color: '#64748b', margin: '0 0 8px' }}>⚽ Equipo Local</p>
          <FieldText label="Nombre" value={partido.equipoLocal?.nombre}
            onChange={v => updateEquipo(idx, 'local', 'nombre', v)}
            textStyle={partido.equipoLocal?.nombreStyle||{}} onStyleChange={s => updateEquipo(idx,'local','nombreStyle',s)} />
          <FieldImage label="Logo" value={partido.equipoLocal?.logo}
            onChange={v => updateEquipo(idx, 'local', 'logo', v)} />

          <Divider />
          <p style={{ ...styles.label, color: '#64748b', margin: '0 0 8px' }}>🏃 Equipo Visita</p>
          <FieldText label="Nombre" value={partido.equipoVisita?.nombre}
            onChange={v => updateEquipo(idx, 'visita', 'nombre', v)}
            textStyle={partido.equipoVisita?.nombreStyle||{}} onStyleChange={s => updateEquipo(idx,'visita','nombreStyle',s)} />
          <FieldImage label="Logo" value={partido.equipoVisita?.logo}
            onChange={v => updateEquipo(idx, 'visita', 'logo', v)} />

          <Divider />
          <FieldText label="Fecha" value={partido.fecha}
            onChange={v => updatePartido(idx, 'fecha', v)}
            textStyle={partido.fechaStyle||{}} onStyleChange={s => updatePartido(idx,'fechaStyle',s)} />
          <FieldText label="Resultado / Hora" value={partido.resultado}
            onChange={v => updatePartido(idx, 'resultado', v)}
            textStyle={partido.resultadoStyle||{}} onStyleChange={s => updatePartido(idx,'resultadoStyle',s)} />
          <FieldText label="Liga" value={partido.liga}
            onChange={v => updatePartido(idx, 'liga', v)}
            textStyle={partido.ligaStyle||{}} onStyleChange={s => updatePartido(idx,'ligaStyle',s)} />
          <FieldText label="Temporada" value={partido.season}
            onChange={v => updatePartido(idx, 'season', v)}
            textStyle={partido.seasonStyle||{}} onStyleChange={s => updatePartido(idx,'seasonStyle',s)} />
          <FieldText label="Sede / Ciudad" value={partido.sede}
            onChange={v => updatePartido(idx, 'sede', v)}
            textStyle={partido.sedeStyle||{}} onStyleChange={s => updatePartido(idx,'sedeStyle',s)} />
        </SectionCard>
      ))}
    </div>
  );
}

function NovedadesPanel({ data, onChange }) {
  if (!data) return null;

  const updateHeader = (field, val) => onChange({ ...data, [field]: val });

  const updateItem = (idx, field, val) => {
    const items = (data.items || []).map((it, i) => i === idx ? { ...it, [field]: val } : it);
    onChange({ ...data, items });
  };

  const addItem = () => {
    const items = [...(data.items || []), {
      id: Date.now(), categoria: '', titulo: '', fecha: '',
      comentarios: '0', enlace: '#', alt: '', categoria_href: '#', titulo_href: '#', imagen: ''
    }];
    onChange({ ...data, items });
  };

  const removeItem = (idx) => {
    if (!window.confirm('¿Eliminar esta novedad?')) return;
    const items = (data.items || []).filter((_, i) => i !== idx);
    onChange({ ...data, items });
  };

  const items = data.items || [];

  return (
    <div>
      <p style={styles.hint}>Edita el título de la sección y cada tarjeta de novedad.</p>

      <SectionCard title="Encabezado de la sección">
        <FieldText label="Subtítulo pequeño" value={data.subtitulo} onChange={v => updateHeader('subtitulo', v)}
          textStyle={data.subtituloStyle||{}} onStyleChange={s => updateHeader('subtituloStyle', s)} />
        <FieldText label="Título grande" value={data.titulo} onChange={v => updateHeader('titulo', v)}
          textStyle={data.tituloStyle||{}} onStyleChange={s => updateHeader('tituloStyle', s)} />
      </SectionCard>

      {items.map((item, idx) => (
        <SectionCard key={item.id ?? idx} title={`Novedad ${idx + 1}${item.titulo ? ' — ' + item.titulo.slice(0, 30) + (item.titulo.length > 30 ? '…' : '') : ''}`}>
          <FieldImage label="Imagen" value={item.imagen} onChange={v => updateItem(idx, 'imagen', v)} />
          <FieldText label="Categoría" value={item.categoria} onChange={v => updateItem(idx, 'categoria', v)} />
          <FieldText label="Título" value={item.titulo} onChange={v => { updateItem(idx, 'titulo', v); updateItem(idx, 'alt', v); }}
            textStyle={item.tituloStyle||{}} onStyleChange={s => updateItem(idx,'tituloStyle',s)} />
          <FieldText label="Fecha" value={item.fecha} onChange={v => updateItem(idx, 'fecha', v)} />
          <FieldText label="N° Comentarios" value={item.comentarios} onChange={v => updateItem(idx, 'comentarios', v)} />
          <FieldText label="Enlace (URL)" value={item.enlace} onChange={v => { updateItem(idx, 'enlace', v); updateItem(idx, 'categoria_href', v); updateItem(idx, 'titulo_href', v); }} />
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => removeItem(idx)}
              style={{ width: '100%', padding: '6px 0', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
            >🗑 Eliminar novedad</button>
          </div>
        </SectionCard>
      ))}

      <button
        onClick={addItem}
        style={{ width: '100%', padding: '10px 0', marginTop: 8, background: 'transparent', border: '2px dashed #22c55e', color: '#22c55e', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
      >+ Agregar novedad</button>
    </div>
  );
}

function PatrocinadoresPanel({ data, onChange }) {
  const lista = Array.isArray(data) && data.length > 0 ? data : [];

  const updateSponsor = (idx, field, val) => {
    const updated = lista.map((s, i) => i === idx ? { ...s, [field]: val } : s);
    onChange(updated);
  };

  const addSponsor = () => {
    onChange([...lista, { id: Date.now(), nombre: '', imagen: '', enlace: '#' }]);
  };

  const removeSponsor = (idx) => {
    if (!window.confirm('¿Eliminar este patrocinador?')) return;
    onChange(lista.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <p style={styles.hint}>Edita los logos y nombres de los patrocinadores. Puedes subir una imagen o dejar el nombre en texto.</p>
      {lista.map((sp, idx) => (
        <SectionCard key={sp.id ?? idx} title={`Patrocinador ${idx + 1}${sp.nombre ? ' — ' + sp.nombre : ''}`}>
          <FieldText label="Nombre (texto)" value={sp.nombre} onChange={v => updateSponsor(idx, 'nombre', v)}
            textStyle={sp.nombreStyle||{}} onStyleChange={s => updateSponsor(idx,'nombreStyle',s)} />
          <FieldImage label="Logo (imagen)" value={sp.imagen} onChange={v => updateSponsor(idx, 'imagen', v)} />
          <FieldText label="Enlace (URL)" value={sp.enlace} onChange={v => updateSponsor(idx, 'enlace', v)} />
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => removeSponsor(idx)}
              style={{ width: '100%', padding: '6px 0', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
            >🗑 Eliminar patrocinador</button>
          </div>
        </SectionCard>
      ))}
      <button
        onClick={addSponsor}
        style={{ width: '100%', padding: '10px 0', marginTop: 8, background: 'transparent', border: '2px dashed #22c55e', color: '#22c55e', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
      >+ Agregar patrocinador</button>
    </div>
  );
}

function CTAPanel({ data, onChange }) {
  if (!data) return null;
  const update = (field, val) => onChange({ ...data, [field]: val });

  return (
    <div>
      <p style={styles.hint}>Sección de llamada a la acción (fondo oscuro con imagen de fútbol).</p>
      <SectionCard title="Sección CTA Principal">
        <FieldImage label="Imagen de fondo" value={data.imagen} onChange={v => update('imagen', v)} />
        <FieldText label="Subtítulo pequeño" value={data.subtitulo} onChange={v => update('subtitulo', v)}
          textStyle={data.subtituloStyle||{}} onStyleChange={s => update('subtituloStyle', s)} />
        <FieldTextarea label="Título grande" value={data.titulo} onChange={v => update('titulo', v)} rows={3}
          textStyle={data.tituloStyle||{}} onStyleChange={s => update('tituloStyle', s)} />
        <FieldText label="Texto del botón" value={data.botonTexto} onChange={v => update('botonTexto', v)}
          textStyle={data.botonTextoStyle||{}} onStyleChange={s => update('botonTextoStyle', s)} />
        <FieldText label="Enlace del botón (URL)" value={data.botonEnlace} onChange={v => update('botonEnlace', v)} />
      </SectionCard>
    </div>
  );
}

// ─── Tipografía ─────────────────────────────────────────────
const FONTS_TITULOS = [
  { value: 'Inter Tight',       label: 'Inter Tight (predeterminado)' },
  { value: 'Oswald',            label: 'Oswald' },
  { value: 'Bebas Neue',        label: 'Bebas Neue' },
  { value: 'Barlow Condensed',  label: 'Barlow Condensed' },
  { value: 'Montserrat',        label: 'Montserrat' },
  { value: 'Antonio',           label: 'Antonio' },
  { value: 'Rajdhani',          label: 'Rajdhani' },
  { value: 'Teko',              label: 'Teko' },
  { value: 'Russo One',         label: 'Russo One' },
  { value: 'Black Han Sans',    label: 'Black Han Sans' },
  { value: 'Saira Condensed',   label: 'Saira Condensed' },
];
const FONTS_CUERPO = [
  { value: 'DM Sans',           label: 'DM Sans (predeterminado)' },
  { value: 'Roboto',            label: 'Roboto' },
  { value: 'Open Sans',         label: 'Open Sans' },
  { value: 'Lato',              label: 'Lato' },
  { value: 'Nunito',            label: 'Nunito' },
  { value: 'Poppins',           label: 'Poppins' },
  { value: 'Source Sans 3',     label: 'Source Sans 3' },
  { value: 'Inter',             label: 'Inter' },
  { value: 'Noto Sans',         label: 'Noto Sans' },
];
const PESOS = [
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'SemiBold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'ExtraBold (800)' },
  { value: '900', label: 'Black (900)' },
];

function TipografiaPanel({ data, onChange }) {
  if (!data) return null;
  const update = (field, val) => onChange({ ...data, [field]: val });

  // Cargar Google Fonts en el panel para mostrar el preview
  useEffect(() => {
    const fT = data.fuenteTitulos || 'Inter Tight';
    const fC = data.fuenteCuerpo  || 'DM Sans';
    const pT = data.pesoTitulos   || '700';
    const toP = (n) => n.replace(/ /g, '+');
    const id = 'tipografia-preview-fonts';
    let link = document.getElementById(id);
    if (!link) { link = document.createElement('link'); link.id = id; link.rel = 'stylesheet'; document.head.appendChild(link); }
    const weights = [...new Set(['400', '700', pT])].join(';');
    link.href = `https://fonts.googleapis.com/css2?family=${toP(fT)}:wght@${weights}&family=${toP(fC)}:wght@400;600&display=swap`;
  }, [data?.fuenteTitulos, data?.fuenteCuerpo, data?.pesoTitulos]);

  const selStyle = {
    ...styles.input,
    height: 38,
    cursor: 'pointer',
    appearance: 'auto',
  };

  const fontPreview = (font, weight = 700) => ({
    fontFamily: `'${font}', sans-serif`,
    fontSize: 20,
    fontWeight: weight,
    marginTop: 8,
    color: '#1e293b',
    background: '#f8fafc',
    borderRadius: 8,
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
  });

  return (
    <div>
      <p style={styles.hint}>Cambia las fuentes de toda la página. Los cambios se aplican en tiempo real en la vista previa.</p>
      <SectionCard title="Fuente de Títulos">
        <label style={styles.label}>FUENTE</label>
        <select style={selStyle} value={data.fuenteTitulos || 'Inter Tight'} onChange={e => update('fuenteTitulos', e.target.value)}>
          {FONTS_TITULOS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <div style={fontPreview(data.fuenteTitulos || 'Inter Tight', parseInt(data.pesoTitulos || '700'))}>
          Jaguares F.C. — Academia
        </div>
        <label style={{...styles.label, marginTop: 12}}>PESO / GROSOR</label>
        <select style={selStyle} value={data.pesoTitulos || '700'} onChange={e => update('pesoTitulos', e.target.value)}>
          {PESOS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </SectionCard>
      <SectionCard title="Fuente de Cuerpo de Texto">
        <label style={styles.label}>FUENTE</label>
        <select style={selStyle} value={data.fuenteCuerpo || 'DM Sans'} onChange={e => update('fuenteCuerpo', e.target.value)}>
          {FONTS_CUERPO.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <div style={{...fontPreview(data.fuenteCuerpo || 'DM Sans', 400)}}>
          Inscríbete en la academia de fútbol profesional
        </div>
      </SectionCard>
    </div>
  );
}

function GaleriaPanel({ data, onChange }) {
  if (!data) return null;
  const items = data.items || [];
  const updateItem = (idx, field, val) => {
    const newItems = items.map((it, i) => i === idx ? { ...it, [field]: val } : it);
    onChange({ ...data, items: newItems });
  };
  return (
    <div>
      <p style={styles.hint}>Galería de 6 imágenes + botón de redes sociales en la parte inferior.</p>
      <SectionCard title="Botón de red social">
        <FieldText label="Texto del botón" value={data.botonTexto} onChange={v => onChange({ ...data, botonTexto: v })}
          textStyle={data.botonTextoStyle||{}} onStyleChange={s => onChange({ ...data, botonTextoStyle: s })} />
      </SectionCard>
      {items.map((item, idx) => (
        <SectionCard key={idx} title={`Imagen ${idx + 1}`}>
          <FieldImage label="Imagen" value={item.imagen} onChange={v => updateItem(idx, 'imagen', v)} />
          <FieldText label="Texto alternativo" value={item.alt} onChange={v => updateItem(idx, 'alt', v)}
            textStyle={item.altStyle||{}} onStyleChange={s => updateItem(idx,'altStyle',s)} />
        </SectionCard>
      ))}
    </div>
  );
}

function GeneralPanel({ data, onChange }) {
  if (!data) return null;
  const update = (field, val) => onChange({ ...data, [field]: val });

  return (
    <div>
      <p style={styles.hint}>Datos generales del club: nombre, footer y redes sociales.</p>
      <SectionCard title="Identidad del Club">
        <FieldText label="Nombre del club" value={data.nombreClub} onChange={v => update('nombreClub', v)} />
      </SectionCard>
      <SectionCard title="Footer">
        <FieldText label="Texto de copyright" value={data.copyright} onChange={v => update('copyright', v)} />
        <FieldText label="URL Facebook" value={data.facebook} onChange={v => update('facebook', v)} />
        <FieldText label="URL WhatsApp" value={data.whatsapp} onChange={v => update('whatsapp', v)} />
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Página principal: AdminLandingEditor
// ─────────────────────────────────────────────────────────────
export default function AdminLandingEditor() {
  const [content, setContent]         = useState(null);
  const [original, setOriginal]       = useState(null);
  const [activeTab, setActiveTab]     = useState('hero');
  const [editMode, setEditMode]       = useState(true);
  const [status, setStatus]           = useState('idle'); // idle | loading | saving | saved | error
  const [statusMsg, setStatusMsg]     = useState('');
  const [isDirty, setIsDirty]         = useState(false);
  const [previewKey, setPreviewKey]   = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef                     = useRef(null);

  // Módulo 5: versiones
  const [versions, setVersions]             = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [lastDraftId, setLastDraftId]       = useState(null);
  const [previewVersion, setPreviewVersion] = useState(null); // { id, label, status, content }

  // Verificar autenticación admin
  useEffect(() => {
    if (!getToken()) {
      window.location.href = '/admin-login';
    }
  }, []);

  // Módulo 5: cargar lista de versiones
  const fetchVersions = useCallback(() => {
    setVersionsLoading(true);
    fetch(`${API_BASE}/api/landing/versions`, { headers: authHeaders() })
      .then(r => r.json())
      .then(({ success, versions: list }) => {
        if (success) setVersions(list || []);
      })
      .catch(() => {})
      .finally(() => setVersionsLoading(false));
  }, []);

  // Módulo 5: guardar como borrador (NO afecta la landing pública)
  const handleSaveDraft = useCallback(async (label) => {
    if (!content) return;
    setStatus('saving');
    setStatusMsg('');
    try {
      const body = label ? { ...content, _draftLabel: label } : content;
      const res = await fetch(`${API_BASE}/api/landing/draft`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus('error');
        setStatusMsg(err.error || `Error HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setOriginal(JSON.parse(JSON.stringify(content)));
        setIsDirty(false);
        setLastDraftId(data.draftId);
        setStatus('saved');
        setStatusMsg(`Borrador guardado · ${new Date().toLocaleTimeString()}`);
        fetchVersions();
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setStatusMsg(data.error || 'Error al guardar borrador.');
      }
    } catch {
      setStatus('error');
      setStatusMsg(navigator.onLine ? 'No se pudo conectar con el servidor.' : 'Sin conexión a internet.');
    }
  }, [content, fetchVersions]);

  // Módulo 5: publicar una versión específica (por id)
  const handlePublishVersion = useCallback(async (versionId, versionLabel) => {
    if (!window.confirm(`¿Publicar la versión "${versionLabel}"?\n\nEsta versión será visible en la landing pública de inmediato.`)) return;
    setStatus('saving');
    setStatusMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/landing/publish/${versionId}`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus('error');
        setStatusMsg(err.error || `Error HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStatus('saved');
        setStatusMsg(`✓ "${versionLabel}" publicada · ${new Date().toLocaleTimeString()}`);
        setIframeLoaded(false); setPreviewKey(k => k + 1);
        fetchVersions();
        setTimeout(() => setStatus('idle'), 4000);
      } else {
        setStatus('error');
        setStatusMsg(data.error || 'Error al publicar.');
      }
    } catch {
      setStatus('error');
      setStatusMsg(navigator.onLine ? 'No se pudo conectar con el servidor.' : 'Sin conexión a internet.');
    }
  }, [fetchVersions]);

  // Módulo 5: guardar borrador y publicarlo en un solo paso
  const handlePublishCurrent = useCallback(async () => {
    if (!content) return;
    const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const label = `Publicación · ${new Date().toLocaleDateString('es-PE')} ${hora}`;
    setStatus('saving');
    setStatusMsg('Guardando borrador…');
    try {
      // 1. Guardar borrador
      const draftRes = await fetch(`${API_BASE}/api/landing/draft`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...content, _draftLabel: label }),
      });
      if (!draftRes.ok) {
        const err = await draftRes.json().catch(() => ({}));
        setStatus('error');
        setStatusMsg(err.error || `Error HTTP ${draftRes.status}`);
        return;
      }
      const draftData = await draftRes.json();
      if (!draftData.success) {
        setStatus('error'); setStatusMsg(draftData.error || 'Error al crear borrador.'); return;
      }
      const newId = draftData.draftId;
      setLastDraftId(newId);
      setStatusMsg('Publicando…');

      // 2. Publicar el borrador recién creado
      const pubRes = await fetch(`${API_BASE}/api/landing/publish/${newId}`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!pubRes.ok) {
        const err = await pubRes.json().catch(() => ({}));
        setStatus('error');
        setStatusMsg(err.error || `Error HTTP ${pubRes.status}`);
        return;
      }
      const pubData = await pubRes.json();
      if (pubData.success) {
        setOriginal(JSON.parse(JSON.stringify(content)));
        setIsDirty(false);
        setStatus('saved');
        setStatusMsg(`🚀 Publicado · ${new Date().toLocaleTimeString()}`);
        setIframeLoaded(false); setPreviewKey(k => k + 1);
        fetchVersions();
        setTimeout(() => setStatus('idle'), 4000);
      } else {
        setStatus('error');
        setStatusMsg(pubData.error || 'Error al publicar.');
      }
    } catch {
      setStatus('error');
      setStatusMsg(navigator.onLine ? 'No se pudo conectar con el servidor.' : 'Sin conexión a internet.');
    }
  }, [content, fetchVersions]);

  // Módulo 5: eliminar borrador
  const handleDeleteVersion = useCallback(async (id, label) => {
    if (!window.confirm(`¿Eliminar el borrador "${label}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/landing/versions/${id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) fetchVersions();
      else alert(data.error || 'Error al eliminar.');
    } catch { alert('Error de conexión.'); }
  }, [fetchVersions]);

  // Módulo 5: previsualizar una versión (carga su content en el preview)
  const handlePreviewVersion = useCallback(async (versionId) => {
    try {
      const res = await fetch(`${API_BASE}/api/landing/versions/${versionId}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setPreviewVersion(data.version);
      else alert(data.error || 'No se pudo cargar la versión.');
    } catch { alert('Error de conexión.'); }
  }, []);

  // Módulo 5: restaurar (cargar en editor) una versión archivada/borrador
  const handleRestoreToEditor = useCallback((version) => {
    if (!window.confirm(`¿Cargar la versión "${version.label}" en el editor?\n\nTus cambios actuales sin guardar se perderán.`)) return;
    const c = typeof version.content === 'string' ? JSON.parse(version.content) : version.content;
    setContent(c);
    setOriginal(JSON.parse(JSON.stringify(c)));
    setIsDirty(false);
    setPreviewVersion(null);
    setActiveTab('hero');
  }, []);

  // Cargar contenido desde API
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchVersions(); }, []);

  useEffect(() => {
    setStatus('loading');
    fetch(`${API_BASE}/api/landing`, { headers: authHeaders() })
      .then(r => r.json())
      .then(({ success, data }) => {
        if (success) {
          setContent(data);
          setOriginal(JSON.parse(JSON.stringify(data)));
          setStatus('idle');
        } else {
          setStatus('error');
          setStatusMsg('No se pudo cargar el contenido.');
        }
      })
      .catch(() => {
        setStatus('error');
        setStatusMsg('Error de conexión con el servidor.');
      });
  }, []);

  // Detectar cambios
  useEffect(() => {
    if (content && original) {
      setIsDirty(JSON.stringify(content) !== JSON.stringify(original));
    }
  }, [content, original]);

  // Proteger sidebar de estilos del tema SoccerClub + hover visual en secciones
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'editor-sidebar-protect';
    style.textContent = `
      #editor-sidebar select,
      #editor-sidebar input[type="text"],
      #editor-sidebar input[type="number"],
      #editor-sidebar input[type="url"],
      #editor-sidebar textarea {
        color: #1e293b !important;
        background: #fff !important;
        -webkit-text-fill-color: #1e293b !important;
        appearance: auto !important;
        -webkit-appearance: menulist !important;
      }
      #editor-sidebar select option {
        color: #1e293b !important;
        background: #fff !important;
      }
      .sc-editor-preview [data-section] { cursor: pointer; transition: box-shadow 0.12s; }\n      .sc-editor-preview [data-section]:hover { box-shadow: inset 0 0 0 2px rgba(245,158,11,0.75); }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const handleDiscard = () => {
    if (!isDirty) return;
    if (window.confirm('¿Descartar todos los cambios no guardados?')) {
      setContent(JSON.parse(JSON.stringify(original)));
      setIsDirty(false);
    }
  };

  const handleRefreshPreview = () => { setIframeLoaded(false); setPreviewKey(k => k + 1); };

  const updateSection = (section, val) => {
    setContent(prev => ({ ...prev, [section]: val }));
  };

  const updateSlide = useCallback((idx, field, val) => {
    setContent(prev => {
      const slides = prev.hero.slides.map((s, i) => i === idx ? { ...s, [field]: val } : s);
      return { ...prev, hero: { ...prev.hero, slides } };
    });
  }, []);

  const updateDeporte = useCallback((idx, field, val) => {
    setContent(prev => {
      const deportes = prev.deportes.map((d, i) => i === idx ? { ...d, [field]: val } : d);
      return { ...prev, deportes };
    });
  }, []);

  const updatePartido = useCallback((idx, field, val) => {
    setContent(prev => {
      const partidos = (prev.partidos || []).map((p, i) => i === idx ? { ...p, [field]: val } : p);
      return { ...prev, partidos };
    });
  }, []);

  // ── Render ──
  if (status === 'loading') {
    return (
      <div style={styles.loadingWrap}>
        <style>{`@keyframes le-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ ...styles.spinner, animation: 'le-spin 0.7s linear infinite' }} />
        <p style={{ color: '#666', marginTop: 16 }}>Cargando editor de landing…</p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes le-spin { to { transform: rotate(360deg); } }
        .le-input:focus { border-color: #f59e0b !important; box-shadow: 0 0 0 3px #f59e0b33; }
        .le-tab:hover { background: #f1f5f9 !important; color: #334155 !important; }
        .le-btn-primary:hover:not(:disabled) { background: #d97706 !important; transform: translateY(-1px); box-shadow: 0 4px 12px #f59e0b44; }
        .le-btn-secondary:hover { opacity: 0.8; }
        iframe { display: block; }
      `}</style>
      {/* ── HEADER BAR ── */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="/assets/logo.ico" alt="Jaguares" style={{ height: 36, objectFit: 'contain' }} />
          <div>
            <div style={styles.headerTitle}>Editor de Landing Page</div>
            <div style={styles.headerSub}>Jaguares — Admin</div>
          </div>
        </div>

        <div style={styles.headerCenter}>
          {/* Status pill */}
          {status === 'saving' && <StatusPill color="#f59e0b" icon="◌" text="Guardando…" />}
          {status === 'saved'  && <StatusPill color="#10b981" icon="✓" text={statusMsg || 'Guardado'} />}
          {status === 'error'  && <StatusPill color="#ef4444" icon="✕" text={statusMsg || 'Error'} />}
          {isDirty && status === 'idle' && <StatusPill color="#6366f1" icon="✎" text="Cambios sin guardar" />}
        </div>

        <div style={styles.headerRight}>
          {/* Toggle Edit Mode */}
          <button
            style={{ ...styles.btnSecondary, background: editMode ? '#1e293b' : '#e2e8f0', color: editMode ? '#fff' : '#333' }}
            onClick={() => setEditMode(e => !e)}
            title={editMode ? 'Desactivar modo edición' : 'Activar modo edición'}
          >
            {editMode ? '✎ Edición ON' : '◉ Solo Vista'}
          </button>

          <button style={styles.btnSecondary} onClick={handleRefreshPreview} title="Refrescar vista previa">
            ↺ Actualizar
          </button>

          <button
            style={{ ...styles.btnSecondary, opacity: isDirty ? 1 : 0.4, cursor: isDirty ? 'pointer' : 'default' }}
            onClick={handleDiscard}
            disabled={!isDirty}
            title="Descartar cambios"
          >
            ✕ Descartar
          </button>

          <button
            style={{ ...styles.btnSecondary, opacity: (isDirty && status !== 'saving') ? 1 : 0.5, cursor: isDirty ? 'pointer' : 'default', borderLeft: '3px solid #6366f1', fontWeight: 700 }}
            onClick={() => handleSaveDraft()}
            disabled={!isDirty || status === 'saving'}
            title="Guarda los cambios como borrador sin afectar la landing pública"
          >
            💾 Borrador
          </button>

          <button
            style={{ ...styles.btnPrimary, opacity: status !== 'saving' ? 1 : 0.5, cursor: status !== 'saving' ? 'pointer' : 'default', background: '#16a34a' }}
            onClick={handlePublishCurrent}
            disabled={status === 'saving'}
            title={isDirty ? 'Guardar y publicar — actualiza la landing pública' : 'Publicar contenido actual — actualiza la landing pública'}
          >
            🚀 Publicar
          </button>

          <a href="/admin-panel" style={styles.btnBack}>← Panel Admin</a>
        </div>
      </header>

      {/* ── BODY: Panel izquierdo + Vista previa ── */}
      <div style={styles.body}>
        {/* ── PANEL IZQUIERDO (Editor) ── */}
        {editMode && (
          <aside id="editor-sidebar" style={styles.sidebar}>
            {/* Tabs */}
            <div style={styles.tabBar}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido del panel */}
            <div style={styles.panelContent}>
              {!content
                ? <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>Sin contenido</p>
                : (
                  <>
                    {activeTab === 'hero'         && <HeroPanel data={content.hero} onChange={v => updateSection('hero', v)} />}
                    {activeTab === 'partidos'     && <PartidosPanel data={content.partidos} onChange={v => updateSection('partidos', v)} />}
                    {activeTab === 'deportes'     && <DeportesPanel data={content.deportes} onChange={v => updateSection('deportes', v)} />}
                    {activeTab === 'estadisticas' && <EstadisticasPanel data={content.estadisticas} onChange={v => updateSection('estadisticas', v)} />}
                    {activeTab === 'docentes'     && <DocentesPanel data={content.docentes} onChange={v => updateSection('docentes', v)} />}
                    {activeTab === 'novedades'       && <NovedadesPanel data={content.novedades} onChange={v => updateSection('novedades', v)} />}
                    {activeTab === 'patrocinadores' && <PatrocinadoresPanel data={content.patrocinadores} onChange={v => updateSection('patrocinadores', v)} />}
                    {activeTab === 'galeria'       && <GaleriaPanel data={content.galeria} onChange={v => updateSection('galeria', v)} />}
                    {activeTab === 'cta'          && <CTAPanel data={content.cta} onChange={v => updateSection('cta', v)} />}
                    {activeTab === 'tipografia'   && <TipografiaPanel data={content.tipografia} onChange={v => updateSection('tipografia', v)} />}
                    {activeTab === 'general'      && <GeneralPanel data={content.general} onChange={v => updateSection('general', v)} />}
                    {activeTab === 'orden'      && (
                      <SectionOrderPanel
                        onOrderChange={() => { setIframeLoaded(false); setPreviewKey(k => k + 1); }}
                      />
                    )}
                    {activeTab === 'versiones'    && (
                      <VersionesPanel
                        versions={versions}
                        loading={versionsLoading}
                        previewVersionId={previewVersion?.id}
                        onPreview={handlePreviewVersion}
                        onPublish={(id, label) => handlePublishVersion(id, label)}
                        onRestore={handleRestoreToEditor}
                        onDelete={handleDeleteVersion}
                        onRefresh={fetchVersions}
                        onSaveDraft={handleSaveDraft}
                        isDirty={isDirty}
                      />
                    )}
                  </>
                )
              }
            </div>

            {/* Meta info */}
            {content?._meta?.ultimaActualizacion && (
              <div style={styles.metaBar}>
                Última actualización: {new Date(content._meta.ultimaActualizacion).toLocaleString('es-PE')}
                {content._meta.actualizadoPor && ` · por ${content._meta.actualizadoPor}`}
              </div>
            )}
          </aside>
        )}

        {/* ── PANEL DERECHO (Vista previa) ── */}
        <main style={{ ...styles.previewWrap, flex: editMode ? '1' : '1' }}>
          <div style={styles.previewHeader}>
            <span style={styles.previewLabel}>
              Vista previa — {editMode ? 'Edita directamente — haz clic en textos e imágenes' : 'Modo solo vista'}
            </span>
            <div style={styles.previewDots}>
              <span style={{ ...styles.dot, background: '#ef4444' }} />
              <span style={{ ...styles.dot, background: '#f59e0b' }} />
              <span style={{ ...styles.dot, background: '#10b981' }} />
              <span style={styles.previewUrl}>localhost / jaguares.club</span>
            </div>
          </div>
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {previewVersion ? (
              // Módulo 5: Previsualizando una versión específica
              <>
                <div style={{ background: '#1e293b', color: '#fff', padding: '6px 16px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
                  <span>🔍 Vista previa: <strong>{previewVersion.label}</strong> · {previewVersion.status === 'published' ? '🟢 Publicada' : previewVersion.status === 'archived' ? '🔘 Archivada' : '🟡 Borrador'}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {previewVersion.status !== 'published' && (
                      <button
                        onClick={() => handlePublishVersion(previewVersion.id, previewVersion.label)}
                        style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 5, padding: '3px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                      >🚀 Publicar esta versión</button>
                    )}
                    <button
                      onClick={() => handleRestoreToEditor(previewVersion)}
                      style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 5, padding: '3px 12px', cursor: 'pointer', fontSize: 12 }}
                    >✎ Editar en editor</button>
                    <button
                      onClick={() => setPreviewVersion(null)}
                      style={{ background: '#475569', color: '#fff', border: 'none', borderRadius: 5, padding: '3px 12px', cursor: 'pointer', fontSize: 12 }}
                    >✕ Cerrar</button>
                  </div>
                </div>
                <LandingEditorContext.Provider value={{ isEditable: false, content: typeof previewVersion.content === 'string' ? JSON.parse(previewVersion.content) : previewVersion.content }}>
                  <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#fff' }}>
                    <Home />
                  </div>
                </LandingEditorContext.Provider>
              </>
            ) : editMode && content ? (
              <LandingEditorContext.Provider value={{ isEditable: true, content, updateSlide, updateDeporte, updatePartido, updateSection, navigateToTab: setActiveTab }}>
                <div
                  className="sc-editor-preview"
                  style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#fff' }}
                  onClick={(e) => {
                    if (e.target.closest('a, button, input, select, textarea')) return;
                    const sectionEl = e.target.closest('[data-section]');
                    if (!sectionEl) return;
                    const slug = sectionEl.dataset.section;
                    const tabMap = { hero: 'hero', partidos: 'partidos', deportes: 'deportes', ranking: 'estadisticas', estadisticas: 'estadisticas', cta: 'cta', docentes: 'docentes', novedades: 'novedades', patrocinadores: 'patrocinadores', inscripcion: 'cta', galeria: 'galeria' };
                    const tab = tabMap[slug];
                    if (tab) setActiveTab(tab);
                  }}
                >
                  <Home />
                </div>
              </LandingEditorContext.Provider>
            ) : (
              <>
                {!iframeLoaded && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    background: '#f1f5f9',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 12,
                  }}>
                    <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'le-spin 0.75s linear infinite' }} />
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Cargando vista previa…</p>
                  </div>
                )}
                <iframe
                  key={previewKey}
                  ref={iframeRef}
                  src="/"
                  title="Vista previa landing"
                  style={{ ...styles.iframe, opacity: iframeLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  onLoad={() => setTimeout(() => setIframeLoaded(true), 4000)}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VersionesPanel — Módulo 5
// ─────────────────────────────────────────────────────────────
function VersionesPanel({ versions, loading, previewVersionId, onPreview, onPublish, onRestore, onDelete, onRefresh, onSaveDraft, isDirty }) {
  const STATUS_LABEL = { published: '🟢 Publicada', draft: '🟡 Borrador', archived: '🔘 Archivada' };
  const STATUS_COLOR = { published: '#16a34a', draft: '#b45309', archived: '#64748b' };

  if (loading) {
    return <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>Cargando versiones…</p>;
  }

  const published = versions.find(v => v.status === 'published');
  const drafts    = versions.filter(v => v.status === 'draft');
  const archived  = versions.filter(v => v.status === 'archived');

  const VersionRow = ({ v }) => {
    const isPreviewing = previewVersionId === v.id;
    const isPublished  = v.status === 'published';
    return (
      <div style={{
        border: `1px solid ${isPreviewing ? '#6366f1' : isPublished ? '#16a34a' : '#e2e8f0'}`,
        borderRadius: 8, padding: 10, marginBottom: 8,
        background: isPreviewing ? '#eff6ff' : isPublished ? '#f0fdf4' : '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: '#1e293b', wordBreak: 'break-word' }}>{v.label}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              {new Date(v.created_at).toLocaleString('es-PE')} · {v.created_by}
            </div>
            {v.published_at && (
              <div style={{ fontSize: 11, color: '#16a34a', marginTop: 1 }}>
                Publicada {new Date(v.published_at).toLocaleString('es-PE')}
              </div>
            )}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR[v.status], background: STATUS_COLOR[v.status] + '18', padding: '2px 8px', borderRadius: 10, flexShrink: 0 }}>
            {STATUS_LABEL[v.status]}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <button
            onClick={() => onPreview(v.id)}
            style={{ ...btnV, background: isPreviewing ? '#6366f1' : '#e2e8f0', color: isPreviewing ? '#fff' : '#334155' }}
          >{isPreviewing ? '👁 Viendo' : '👁 Ver'}</button>

          {!isPublished && (
            <button onClick={() => onPublish(v.id, v.label)} style={{ ...btnV, background: '#16a34a', color: '#fff' }}>
              🚀 Publicar
            </button>
          )}

          <button onClick={() => onRestore(v)} style={{ ...btnV, background: '#6366f1', color: '#fff' }}>
            ✎ Editar
          </button>

          {v.status === 'draft' && (
            <button onClick={() => onDelete(v.id, v.label)} style={{ ...btnV, background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5' }}>
              🗑
            </button>
          )}
        </div>
      </div>
    );
  };

  const btnV = { padding: '4px 10px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 5, cursor: 'pointer' };

  return (
    <div>
      <p style={{ fontSize: 12, color: '#64748b', marginTop: 0, marginBottom: 12, lineHeight: 1.5 }}>
        Guarda borradores sin afectar la landing pública. Publica cuando estés conforme.
      </p>

      {/* Acciones rápidas */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {isDirty && (
          <button
            onClick={() => onSaveDraft()}
            style={{ padding: '7px 12px', fontSize: 12, fontWeight: 700, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer' }}
          >
            💾 Guardar borrador ahora
          </button>
        )}
        <button onClick={onRefresh} style={{ padding: '7px 10px', fontSize: 12, background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
          ↺ Refrescar
        </button>
      </div>

      {versions.length === 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 24, background: '#f8fafc', borderRadius: 8 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <p style={{ margin: 0, fontSize: 12 }}>Aún no hay versiones guardadas.<br/>Usa «💾 Borrador» o «🚀 Publicar» para empezar.</p>
        </div>
      )}

      {published && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Versión Activa</div>
          <VersionRow v={published} />
        </div>
      )}

      {drafts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Borradores ({drafts.length})</div>
          {drafts.map(v => <VersionRow key={v.id} v={v} />)}
        </div>
      )}

      {archived.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Historial ({archived.length})</div>
          {archived.map(v => <VersionRow key={v.id} v={v} />)}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// StatusPill
// ─────────────────────────────────────────────────────────────
function StatusPill({ color, icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: color + '1a', border: `1px solid ${color}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, color }}>
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────────────────────
const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: '#f8fafc',
    color: '#1e293b',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    gap: 12,
    flexShrink: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
  },
  headerTitle: {
    fontWeight: 700, fontSize: 16, color: '#0f172a',
  },
  headerSub: {
    fontSize: 11, color: '#94a3b8',
  },
  headerCenter: {
    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  headerRight: {
    display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
  },

  btnPrimary: {
    padding: '8px 16px', background: '#f59e0b', color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  btnSecondary: {
    padding: '8px 12px', background: '#e2e8f0', color: '#334155',
    border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 12,
    cursor: 'pointer',
  },
  btnBack: {
    padding: '8px 12px', background: '#1e293b', color: '#fff',
    borderRadius: 8, fontWeight: 600, fontSize: 12,
    textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
  },

  // Body
  body: {
    display: 'flex', flex: 1, overflow: 'hidden',
  },

  // Sidebar
  sidebar: {
    width: 360,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    borderRight: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  tabBar: {
    display: 'flex',
    flexWrap: 'wrap',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc',
    flexShrink: 0,
  },
  tab: {
    flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '7px 6px', background: 'transparent', border: 'none',
    cursor: 'pointer', color: '#64748b', fontSize: 12, fontWeight: 500,
    transition: 'all 0.15s', borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    color: '#f59e0b', background: '#fff',
    borderBottom: '2px solid #f59e0b',
    fontWeight: 700,
  },
  panelContent: {
    flex: 1, overflowY: 'auto', padding: 16,
  },

  metaBar: {
    padding: '8px 16px', fontSize: 11, color: '#94a3b8',
    borderTop: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0,
  },

  // Preview
  previewWrap: {
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  previewHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 16px', background: '#f1f5f9',
    borderBottom: '1px solid #e2e8f0', flexShrink: 0,
  },
  previewLabel: {
    fontSize: 12, color: '#64748b', fontWeight: 500,
  },
  previewDots: {
    display: 'flex', alignItems: 'center', gap: 6,
  },
  dot: {
    width: 10, height: 10, borderRadius: '50%',
  },
  previewUrl: {
    marginLeft: 8, fontSize: 11, color: '#94a3b8', background: '#e2e8f0',
    padding: '2px 10px', borderRadius: 10,
  },
  iframe: {
    flex: 1, border: 'none', width: '100%', height: '100%',
  },

  // Cards
  card: {
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 10, padding: 14, marginBottom: 14,
  },
  cardTitle: {
    fontSize: 13, fontWeight: 700, color: '#334155',
    marginTop: 0, marginBottom: 12, paddingBottom: 8,
    borderBottom: '1px solid #e2e8f0',
  },

  // Form
  label: {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
    marginBottom: 4,
  },
  input: {
    display: 'block', width: '100%', padding: '7px 10px',
    border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13,
    color: '#1e293b', background: '#fff', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  },
  hint: {
    fontSize: 12, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5,
  },

  // Loading
  loadingWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh', background: '#f8fafc',
  },
  spinner: {
    width: 40, height: 40, borderRadius: '50%',
    border: '4px solid #e2e8f0', borderTopColor: '#f59e0b',
    animation: 'spin 0.7s linear infinite',
  },
};
