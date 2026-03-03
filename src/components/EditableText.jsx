import React, { useState, useEffect, useRef } from 'react';
import { useLandingEditor } from '../context/LandingEditorContext.jsx';

/**
 * EditableText — in admin mode:
 *  • Hover → dashed outline to indicate element is editable
 *  • Click  → inline text editing (input/textarea)
 *  • Styles saved per-element via textStyle / onStyleChange props
 *  • Style controls appear inline in the sidebar per field (always visible)
 *
 * Props:
 *   tag           — HTML element ('span','div','h1','p',…). Default: 'span'
 *   value         — current text
 *   onChange      — (newValue) => void   · enables inline editing
 *   multiline     — use textarea. Default: false
 *   className / style — forwarded
 *   textStyle     — style object { fontFamily, fontSize, fontWeight, … }
 *   onStyleChange — (newStyleObj) => void · enables sidebar style panel
 */
export default function EditableText({
  tag: Tag = 'span',
  value     = '',
  onChange,
  multiline = false,
  className,
  style,
  textStyle = {},
  onStyleChange,
}) {
  const ctx      = useLandingEditor();
  const isEdit   = !!ctx?.isEditable;
  const canEdit  = !!(isEdit && typeof onChange      === 'function');
  const canStyle = !!(isEdit && typeof onStyleChange === 'function');

  const [editing, setEditing] = useState(false);
  const [local,   setLocal  ] = useState(value);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);

  /* Sync from parent */
  useEffect(() => { if (!editing) setLocal(value); }, [value, editing]);

  /* Focus when entering edit mode */
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      try { inputRef.current.select(); } catch (_) {}
    }
  }, [editing]);

  /* Load Google Font dynamically when fontFamily changes */
  useEffect(() => {
    if (!textStyle?.fontFamily) return;
    const fam = textStyle.fontFamily;
    const id  = `et-font-${fam.replace(/\s+/g, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam)}:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&display=swap`;
    document.head.appendChild(link);
  }, [textStyle?.fontFamily]);

  /* Merged base + per-element textStyle */
  const mergedStyle = { ...style, ...textStyle };

  /* ── NOT in editor: render normally ─────────────────────────────── */
  if (!isEdit) {
    return <Tag className={className} style={mergedStyle}>{value}</Tag>;
  }

  /* ── Helpers ─────────────────────────────────────────────────────── */
  const commit = () => {
    setEditing(false);
    setHovered(false);
    if (local !== value) onChange?.(local);
  };

  const cancel = () => {
    setLocal(value);
    setEditing(false);
    setHovered(false);
  };

  const openEdit = (e) => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  /* ── EDITING state ───────────────────────────────────────────────── */
  if (editing) {
    const inputStyle = {
      ...mergedStyle,
      font: 'inherit', lineHeight: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit',
      background: 'rgba(245,158,11,0.13)', border: '2px solid #f59e0b',
      borderRadius: 4, outline: 'none', width: '100%',
      padding: '2px 6px', boxSizing: 'border-box', resize: 'vertical', display: 'block',
    };
    if (multiline) {
      return (
        <textarea ref={inputRef} className={className}
          style={{ ...inputStyle, minHeight: '5em', whiteSpace: 'pre-line' }}
          value={local} onChange={e => setLocal(e.target.value)}
          onBlur={commit} onKeyDown={e => { if (e.key === 'Escape') cancel(); }} />
      );
    }
    return (
      <input ref={inputRef} className={className} style={inputStyle}
        value={local} onChange={e => setLocal(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }} />
    );
  }

  /* ── IDLE: outline + hover indicator ────────────────────────────── */
  return (
    <Tag
      className={className}
      style={{
        ...mergedStyle,
        position: 'relative',
        cursor: canEdit ? 'text' : 'default',
        outline: hovered ? '2px dashed rgba(245,158,11,0.85)' : '2px dashed transparent',
        outlineOffset: 3,
        borderRadius: 2,
        transition: 'outline 0.12s',
      }}
      onClick={canEdit ? openEdit : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={canEdit ? 'Clic para editar texto' : undefined}
    >
      {value}
      {hovered && (
        <span style={{
          position: 'absolute', top: -5, right: -5,
          background: '#f59e0b', color: '#fff', borderRadius: '50%',
          width: 15, height: 15, display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 8, fontWeight: 'bold',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          zIndex: 9999, pointerEvents: 'none',
        }}>✎</span>
      )}
    </Tag>
  );
}


