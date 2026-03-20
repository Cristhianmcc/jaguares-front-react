/**
 * SectionOrderPanel — Módulo 6
 * Panel de reordenamiento visual de secciones con drag & drop.
 * Usa @dnd-kit/sortable.
 * Se monta ÚNICAMENTE dentro del AdminLandingEditor (editor admin).
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DEFAULT_SECTION_STRUCTURE } from '../context/LandingEditorContext.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || '';
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

// ─────────────────────────────────────────────────────────────
// Fila arrastrable individual
// ─────────────────────────────────────────────────────────────
function SortableRow({ section, onToggleVisible }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.section_slug,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: isDragging ? '#eff6ff' : '#fff',
        border: `1px solid ${isDragging ? '#6366f1' : '#e2e8f0'}`,
        borderRadius: 8,
        padding: '9px 12px',
        marginBottom: 6,
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : undefined,
      }}
    >
      {/* Drag handle */}
      <span
        {...attributes}
        {...listeners}
        style={{
          cursor: 'grab',
          fontSize: 16,
          color: '#94a3b8',
          lineHeight: 1,
          padding: '2px 4px',
          borderRadius: 4,
          flexShrink: 0,
        }}
        title="Arrastrar para reordenar"
      >
        ⠿
      </span>

      {/* Label */}
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        {section.label || section.section_slug}
      </span>

      {/* Visible toggle */}
      <button
        onClick={() => onToggleVisible(section.section_slug)}
        title={section.visible ? 'Ocultar sección' : 'Mostrar sección'}
        style={{
          background: section.visible ? '#dcfce7' : '#f1f5f9',
          color: section.visible ? '#166534' : '#64748b',
          border: `1px solid ${section.visible ? '#bbf7d0' : '#cbd5e1'}`,
          borderRadius: 6,
          padding: '3px 10px',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {section.visible ? 'Visible' : 'Oculta'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Panel principal
// ─────────────────────────────────────────────────────────────
export default function SectionOrderPanel({ onOrderChange }) {
  const [sections, setSections]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [statusMsg, setStatusMsg]   = useState('');
  const [isDirty, setIsDirty]       = useState(false);
  const [original, setOriginal]     = useState([]);

  // Cargar estructura actual
  const fetchStructure = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/landing/structure`)
      .then(r => r.json())
      .then(({ success, sections: list }) => {
        if (success && Array.isArray(list) && list.length > 0) {
          // Solo mantener secciones del diseño actual
          const validSlugs = new Set(DEFAULT_SECTION_STRUCTURE.map(d => d.section_slug));
          const filtered = list.filter(s => validSlugs.has(s.section_slug));
          // Enriquecer con labels
          const enriched = filtered.map(s => ({
            ...s,
            label: DEFAULT_SECTION_STRUCTURE.find(d => d.section_slug === s.section_slug)?.label || s.section_slug,
          }));
          // Agregar secciones nuevas que no estén en BD
          DEFAULT_SECTION_STRUCTURE.forEach(d => {
            if (!enriched.find(e => e.section_slug === d.section_slug)) {
              enriched.push({ ...d });
            }
          });
          // Ordenar
          const sorted = [...enriched].sort((a, b) => a.orden - b.orden);
          setSections(sorted);
          setOriginal(sorted);
        } else {
          setSections([...DEFAULT_SECTION_STRUCTURE]);
          setOriginal([...DEFAULT_SECTION_STRUCTURE]);
        }
      })
      .catch(() => {
        setSections([...DEFAULT_SECTION_STRUCTURE]);
        setOriginal([...DEFAULT_SECTION_STRUCTURE]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStructure(); }, [fetchStructure]);

  // Detectar cambios
  useEffect(() => {
    if (sections.length && original.length) {
      const changed = sections.some((s, i) => {
        const o = original[i];
        return !o || s.section_slug !== o.section_slug || s.visible !== o.visible;
      });
      setIsDirty(changed);
    }
  }, [sections, original]);

  // Sensores de DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections(prev => {
      const oldIndex = prev.findIndex(s => s.section_slug === active.id);
      const newIndex = prev.findIndex(s => s.section_slug === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleToggleVisible = (slug) => {
    setSections(prev =>
      prev.map(s => s.section_slug === slug ? { ...s, visible: s.visible ? 0 : 1 } : s)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg('');

    // Asignar ordenes secuenciales (10, 20, 30 …) según posición actual
    const toSave = sections.map((s, i) => ({
      section_slug: s.section_slug,
      orden: (i + 1) * 10,
      visible: s.visible,
    }));

    try {
      const res = await fetch(`${API_BASE}/api/landing/structure`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ sections: toSave }),
      });
      const data = await res.json();
      if (data.success) {
        const newSections = sections.map((s, i) => ({ ...s, orden: (i + 1) * 10 }));
        setSections(newSections);
        setOriginal(newSections);
        setIsDirty(false);
        setStatusMsg('✓ Orden guardado');
        if (onOrderChange) onOrderChange(newSections);
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        setStatusMsg(`✕ ${data.error || 'Error al guardar'}`);
      }
    } catch {
      setStatusMsg(navigator.onLine ? '✕ Error de servidor' : '✕ Sin conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('¿Restaurar el orden por defecto? Se perderán los cambios guardados.')) return;
    setSections([...DEFAULT_SECTION_STRUCTURE]);
  };

  if (loading) {
    return <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>Cargando estructura…</p>;
  }

  return (
    <div>
      <p style={{ fontSize: 12, color: '#64748b', marginTop: 0, marginBottom: 14, lineHeight: 1.5 }}>
        Arrastra las secciones para cambiar su orden en la landing pública. Pulsa el botón para mostrar/ocultar.
        Guarda cuando termines para que los cambios sean visibles.
      </p>

      {/* Botones acción */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          style={{
            padding: '7px 14px', fontSize: 12, fontWeight: 700,
            background: isDirty ? '#6366f1' : '#e2e8f0',
            color: isDirty ? '#fff' : '#94a3b8',
            border: 'none', borderRadius: 7, cursor: isDirty && !saving ? 'pointer' : 'default',
          }}
        >
          {saving ? 'Guardando…' : 'Guardar orden'}
        </button>
        <button
          onClick={fetchStructure}
          style={{ padding: '7px 10px', fontSize: 12, background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: 7, cursor: 'pointer' }}
        >
          ↺
        </button>
        <button
          onClick={handleReset}
          style={{ padding: '7px 10px', fontSize: 11, background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 7, cursor: 'pointer' }}
        >
          Restaurar orden original
        </button>
        {statusMsg && (
          <span style={{ fontSize: 12, color: statusMsg.startsWith('✓') ? '#16a34a' : '#ef4444', fontWeight: 700 }}>
            {statusMsg}
          </span>
        )}
      </div>

      {/* Lista con drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map(s => s.section_slug)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map(section => (
            <SortableRow
              key={section.section_slug}
              section={section}
              onToggleVisible={handleToggleVisible}
            />
          ))}
        </SortableContext>
      </DndContext>

      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, textAlign: 'center' }}>
        Los cambios no afectan la landing pública hasta que se guarden aquí.
      </p>
    </div>
  );
}
