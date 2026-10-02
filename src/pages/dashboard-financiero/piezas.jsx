import React, { useId, useState } from 'react';
import { DEFINICIONES, mesCorto, soles, solesEntero } from './datosFinancieros.js';

/* ------------------------------------------------------------------ */
/* Iconos: un solo trazo (1.75) y caja de 24, dibujados a mano.        */
/* ------------------------------------------------------------------ */
const TRAZOS = {
  volver: 'M15 18l-6-6 6-6',
  descargar: 'M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14',
  recargar: 'M20 11a8 8 0 10-2.3 5.7M20 5v6h-6',
  info: 'M12 11v6m0-9.5v.01M12 21a9 9 0 110-18 9 9 0 010 18z',
  cerrar: 'M6 6l12 12M18 6L6 18',
  alerta: 'M12 9v4m0 3.5v.01M10.3 4.2L2.8 17.5A2 2 0 004.5 20.5h15a2 2 0 001.7-3L13.7 4.2a2 2 0 00-3.4 0z',
  ok: 'M5 12.5l4.5 4.5L19 7.5',
  filtro: 'M4 6h16M7 12h10M10 18h4',
};

export function Icono({ nombre, tam = 18, className }) {
  return (
    <svg
      className={className}
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={TRAZOS[nombre]} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Definición desplegable: explica qué cuenta una cifra.               */
/* ------------------------------------------------------------------ */
export function Definicion({ clave, p, etiqueta }) {
  const def = DEFINICIONES[clave];
  const [abierta, setAbierta] = useState(false);
  const id = useId();
  if (!def) return null;
  return (
    <span className={`${p}-def`}>
      <button
        type="button"
        className={`${p}-def-btn`}
        aria-expanded={abierta}
        aria-controls={id}
        onClick={() => setAbierta((v) => !v)}
        title={abierta ? 'Ocultar definición' : 'Qué cuenta esta cifra'}
      >
        <Icono nombre="info" tam={15} />
        <span className="sr-only-df">{abierta ? 'Ocultar definición de ' : 'Qué cuenta '}{etiqueta || def.titulo}</span>
      </button>
      {abierta && (
        <span id={id} role="note" className={`${p}-def-panel`}>
          <span className={`${p}-def-texto`}>{def.definicion}</span>
          <span className={`${p}-def-fuente`}>Fuente: {def.fuente}</span>
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Filtros                                                             */
/* ------------------------------------------------------------------ */
export function Filtros({ d, p, compacto = false }) {
  const { filtros, opciones, cambiarFiltro, limpiarFiltros, filtrosActivos, actualizando } = d;
  return (
    <form className={`${p}-filtros`} onSubmit={(e) => e.preventDefault()} aria-label="Filtrar tablas">
      {!compacto && (
        <span className={`${p}-filtros-rotulo`}>
          <Icono nombre="filtro" tam={16} /> Período
        </span>
      )}
      <label className={`${p}-campo`}>
        <span className={`${p}-campo-rotulo`}>Mes</span>
        <select value={filtros.mes} onChange={(e) => cambiarFiltro('mes', e.target.value)}>
          <option value="">Todos</option>
          {opciones.meses.map((m) => (
            <option key={m.numero} value={m.valor}>{m.etiqueta}</option>
          ))}
        </select>
      </label>
      <label className={`${p}-campo`}>
        <span className={`${p}-campo-rotulo`}>Año</span>
        <select value={filtros.anio} onChange={(e) => cambiarFiltro('anio', e.target.value)}>
          <option value="">Todos</option>
          {opciones.anios.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </label>
      <label className={`${p}-campo`}>
        <span className={`${p}-campo-rotulo`}>Deporte</span>
        <select value={filtros.deporte} onChange={(e) => cambiarFiltro('deporte', e.target.value)}>
          <option value="">Todos</option>
          {opciones.deportes.map((dep) => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>
      </label>
      {filtrosActivos && (
        <button type="button" className={`${p}-limpiar`} onClick={limpiarFiltros}>
          <Icono nombre="cerrar" tam={14} /> Quitar filtros
        </button>
      )}
      <span className={`${p}-sincronia`} aria-live="polite">
        {actualizando ? 'Actualizando…' : ''}
      </span>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Columnas por mes (SVG). El color sale de CSS (currentColor).        */
/* ------------------------------------------------------------------ */
export function ColumnasMes({ serie, p, alto = 180, destacarUltimo = true, entero = true }) {
  if (!serie.length) return null;
  const max = Math.max(...serie.map((s) => s.monto), 1);
  const ancho = 100 / serie.length;
  const fmt = entero ? solesEntero : soles;
  const cambioAnio = (i) => i > 0 && serie[i].anio !== serie[i - 1].anio;
  return (
    <figure className={`${p}-columnas`}>
      <div className={`${p}-columnas-area`} style={{ height: alto }}>
        {serie.map((s, i) => {
          const h = Math.max((s.monto / max) * 100, s.monto > 0 ? 1.5 : 0);
          const ultimo = destacarUltimo && i === serie.length - 1;
          return (
            <div
              key={s.clave}
              className={`${p}-col${ultimo ? ` ${p}-col--ultimo` : ''}`}
              style={{ width: `${ancho}%` }}
            >
              <span className={`${p}-col-valor`}>{fmt(s.monto)}</span>
              <span className={`${p}-col-barra`} style={{ height: `${h}%` }} />
            </div>
          );
        })}
      </div>
      <div className={`${p}-columnas-eje`} aria-hidden="true">
        {serie.map((s, i) => (
          <span key={s.clave} style={{ width: `${ancho}%` }}>
            {mesCorto(s.mes)}
            {(i === 0 || cambioAnio(i)) && <em>{s.anio}</em>}
          </span>
        ))}
      </div>
      <table className="sr-only-df">
        <caption>Recaudado por mes</caption>
        <tbody>
          {serie.map((s) => (
            <tr key={s.clave}>
              <th scope="row">{`${mesCorto(s.mes)} ${s.anio}`}</th>
              <td>{soles(s.monto)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Estados                                                             */
/* ------------------------------------------------------------------ */
export function PanelError({ p, mensaje, onReintentar }) {
  return (
    <div className={`${p}-error`} role="alert">
      <Icono nombre="alerta" tam={22} />
      <div>
        <p className={`${p}-error-titulo`}>No se pudieron cargar las cifras</p>
        <p className={`${p}-error-texto`}>
          {/[.!?]$/.test(String(mensaje || '').trim()) ? mensaje : `${mensaje || 'Error desconocido'}.`} Revisa que el servidor esté encendido y vuelve a intentarlo.
        </p>
      </div>
      <button type="button" onClick={onReintentar}>
        <Icono nombre="recargar" tam={16} /> Reintentar
      </button>
    </div>
  );
}

export function Aviso({ p, aviso }) {
  return (
    <div className={`${p}-aviso-zona`} aria-live="polite">
      {aviso && (
        <div className={`${p}-aviso ${p}-aviso--${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>
          <Icono nombre={aviso.tipo === 'error' ? 'alerta' : 'ok'} tam={16} />
          {aviso.texto}
        </div>
      )}
    </div>
  );
}

/** Aviso para tablas que el filtro de mes/año no afecta. */
export function NotaSinPeriodo({ p, visible }) {
  if (!visible) return null;
  return (
    <p className={`${p}-nota-periodo`}>
      <Icono nombre="info" tam={14} /> Estos montos salen de las inscripciones activas hoy y no cambian con el mes ni el año elegidos.
    </p>
  );
}

export const LOGO = '/assets/logo.ico';
