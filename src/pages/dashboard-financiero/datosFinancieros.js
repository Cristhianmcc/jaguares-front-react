/**
 * Dashboard Financiero — capa de datos compartida por las 3 propuestas.
 *
 * Única fuente: GET /api/admin/estadisticas-financieras (server/index.js).
 * Aquí se normaliza la respuesta (el backend devuelve DECIMAL de MySQL como
 * texto en algunos campos), se documenta QUÉ cuenta cada cifra y se derivan
 * las opciones de filtro. Ninguna propuesta calcula dinero por su cuenta:
 * todas leen de este módulo.
 */
import { fetchWithAuth } from '../../config/api.js';

export const ENDPOINT = '/api/admin/estadisticas-financieras';
const HORAS_SESION = 8; // igual que AdminLogin / legacy

/* ------------------------------------------------------------------ */
/* Definiciones: qué cuenta cada cifra y de dónde sale                 */
/* ------------------------------------------------------------------ */
export const DEFINICIONES = {
  ingresosHoy: {
    titulo: 'Cobrado hoy',
    definicion:
      'Mensualidades confirmadas hoy (con el monto registrado en Pagos mensuales, incluidos los montos editados) más las matrículas de las inscripciones registradas hoy.',
    fuente: 'pagos_mensuales (confirmado, fecha de pago de hoy) + matrículas',
  },
  ingresosMes: {
    titulo: 'Cobrado del mes',
    definicion:
      'Mensualidades confirmadas que corresponden al mes en curso (igual que en Pagos mensuales, con el monto editado) más las matrículas de las inscripciones del mes.',
    fuente: 'pagos_mensuales (confirmado) del mes actual + matrículas del mes',
  },
  totalIngresos: {
    titulo: 'Cobrado acumulado',
    definicion:
      'Todas las mensualidades confirmadas más todas las matrículas cobradas. Es dinero realmente registrado, no tarifas.',
    fuente: 'pagos_mensuales confirmados + matrículas cobradas',
  },
  totalMatriculas: {
    titulo: 'Matrículas cobradas',
    definicion:
      'Matrícula del deporte en cada inscripción confirmada. Las matrículas exoneradas (desde el detalle del alumno) no se suman.',
    fuente: 'inscripciones confirmadas con matrícula cobrada × deportes.matricula',
  },
  totalMensualidades: {
    titulo: 'Mensualidades cobradas',
    definicion: 'Suma de los pagos mensuales confirmados, con el monto que figura en Pagos mensuales (si se editó, se usa el editado).',
    fuente: 'pagos_mensuales (estado confirmado)',
  },
  tarifaMensual: {
    titulo: 'Tarifa mensual activa',
    definicion:
      'Lo que suman las mensualidades de las inscripciones activas según su plan. Es lo que se espera cobrar al mes, no lo cobrado.',
    fuente: 'inscripciones activas (precio_mensual)',
  },
  recaudadoPeriodo: {
    titulo: 'Cobrado en el período',
    definicion:
      'Mensualidades confirmadas del mes/año elegido más las matrículas de ese período. Con filtro de deporte, cuenta la parte de cada pago que corresponde a ese deporte.',
    fuente: 'pagos_mensuales confirmados + matrículas, filtrado en el servidor',
  },
  avanceMes: {
    titulo: 'Avance de cobranza del mes',
    definicion:
      'Mensualidades cobradas del mes en curso divididas entre la tarifa mensual de todas las inscripciones activas.',
    fuente: 'Mensualidades del mes ÷ tarifa mensual activa',
  },
  valorDeporte: {
    titulo: 'Cobrado por deporte',
    definicion:
      'Matrículas y mensualidades cobradas en el período, por deporte. Como un pago mensual no indica el deporte, se reparte entre los deportes activos del alumno según su tarifa (o solo entre los indicados en "Confirmado solo: …").',
    fuente: 'pagos_mensuales confirmados repartidos + matrículas',
  },
  valorAlumno: {
    titulo: 'Lo que pagó cada alumno',
    definicion:
      'Mensualidades confirmadas y matrículas cobradas del alumno en el período elegido (o en total, sin filtros).',
    fuente: 'pagos_mensuales confirmados + matrículas cobradas',
  },
  desgloseMensual: {
    titulo: 'Mensualidades por mes y deporte',
    definicion:
      'Pagos mensuales confirmados agrupados por el mes al que corresponden. Cada pago cuenta una sola vez; si el alumno tiene varios deportes se reparte entre ellos.',
    fuente: 'pagos_mensuales (estado confirmado)',
  },
};

/* ------------------------------------------------------------------ */
/* Formato                                                             */
/* ------------------------------------------------------------------ */
const fmtSoles = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmtSolesEntero = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const fmtNumero = new Intl.NumberFormat('es-PE');
const fmtPct = new Intl.NumberFormat('es-PE', { style: 'percent', maximumFractionDigits: 1 });

/** "S/ 1,234.50" — Intl usa "S/" para PEN en es-PE. */
export const soles = (n) => fmtSoles.format(Number(n) || 0);
export const solesEntero = (n) => fmtSolesEntero.format(Math.round(Number(n) || 0));
export const numero = (n) => fmtNumero.format(Number(n) || 0);
export const porcentaje = (parte, total) => (total > 0 ? fmtPct.format(parte / total) : '—');

/** Separa "S/ 1,234.50" en { simbolo, entero, decimales } para maquetar cifras grandes. */
export function partesSoles(n) {
  const partes = fmtSoles.formatToParts(Number(n) || 0);
  let simbolo = 'S/';
  let entero = '';
  let decimales = '';
  let enDecimales = false;
  for (const p of partes) {
    if (p.type === 'currency') simbolo = p.value;
    else if (p.type === 'decimal') enDecimales = true;
    else if (p.type === 'fraction') decimales = p.value;
    else if (p.type === 'integer' || p.type === 'group') {
      if (!enDecimales) entero += p.value;
    } else if (p.type === 'minusSign') entero = '-' + entero;
  }
  return { simbolo, entero, decimales };
}

export function fechaHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Lima',
  });
}

export function fechaLarga(d = new Date()) {
  return d.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Lima',
  });
}

export function mesActualLima(d = new Date()) {
  const nombre = d.toLocaleDateString('es-PE', { month: 'long', timeZone: 'America/Lima' });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

/* ------------------------------------------------------------------ */
/* Meses                                                               */
/* ------------------------------------------------------------------ */
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
];
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

const sinTildes = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/** Número de mes 1–12 a partir del texto guardado en pagos_mensuales.mes. 0 si no se reconoce. */
export function numeroMes(texto) {
  const t = sinTildes(texto);
  if (!t) return 0;
  if (t === 'septiembre') return 9;
  const i = MESES.indexOf(t);
  if (i >= 0) return i + 1;
  const n = parseInt(t, 10);
  return n >= 1 && n <= 12 ? n : 0;
}

export function nombreMes(numero) {
  const n = MESES[numero - 1];
  return n ? n.charAt(0).toUpperCase() + n.slice(1) : '—';
}
export const mesCorto = (numero) => MESES_CORTOS[numero - 1] || '—';

/* ------------------------------------------------------------------ */
/* Sesión                                                              */
/* ------------------------------------------------------------------ */
export function leerSesion() {
  try {
    const raw = localStorage.getItem('adminSession');
    if (!raw) return null;
    const s = JSON.parse(raw);
    const horas = (Date.now() - new Date(s.timestamp).getTime()) / 36e5;
    if (!s.token || !(horas < HORAS_SESION)) return null;
    return { email: s.admin?.email || '', nombre: s.admin?.nombre || '', token: s.token };
  } catch {
    return null;
  }
}

export function irALogin() {
  try {
    localStorage.removeItem('adminSession');
  } catch {
    /* sin acceso a localStorage */
  }
  window.location.href = '/admin-login';
}

/* ------------------------------------------------------------------ */
/* Normalización                                                       */
/* ------------------------------------------------------------------ */
const num = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export function normalizar(est) {
  const r = est?.resumen || {};
  const resumen = {
    alumnosActivos: num(r.totalAlumnosActivos),
    inscripcionesActivas: num(r.totalInscripcionesActivas),
    totalMatriculas: num(r.totalMatriculas),
    totalMensualidades: num(r.totalMensualidades),
    totalIngresos: num(r.totalIngresosActivos),
    ingresosMes: num(r.ingresosMes),
    ingresosHoy: num(r.ingresosHoy),
    mensualidadesMes: num(r.mensualidadesMes),
    matriculasMes: num(r.matriculasMes),
    pendienteMes: num(r.pendienteMes),
    tarifaMensualActiva: num(r.tarifaMensualActiva),
  };

  const porDeporte = (est?.porDeporte || [])
    .map((d) => ({
      deporte: d.deporte || 'Sin deporte',
      inscritos: num(d.totalInscritos),
      matriculas: num(d.matriculas),
      mensualidades: num(d.mensualidades), // cobrado (pagos confirmados repartidos)
      tarifaMensual: num(d.tarifaMensual), // lo esperado según plan
      total: num(d.total),
    }))
    .sort((a, b) => b.total - a.total);

  const porAlumno = (est?.porAlumno || []).map((a) => ({
    dni: a.dni || '',
    nombres: a.nombres || '',
    telefono: a.telefono || '',
    deportes: Array.isArray(a.deportes) ? a.deportes : String(a.deportes || '').split(', ').filter(Boolean),
    deportesInactivos: Array.isArray(a.deportesInactivos) ? a.deportesInactivos : [],
    matriculas: num(a.matriculas),
    mensualidades: num(a.mensualidades),
    tarifaMensual: num(a.tarifaMensual),
    total: num(a.total),
  }));

  const desglose = (est?.desgloseMensual || [])
    .map((f) => {
      const mesNum = numeroMes(f.mes);
      const anio = parseInt(f.anio, 10) || 0;
      return {
        mesTexto: f.mes || '',
        mes: mesNum,
        anio,
        clave: anio * 100 + mesNum,
        deporte: f.deporte || 'General',
        pagos: num(f.cantidad_pagos),
        monto: num(f.total_recaudado),
      };
    })
    .sort((a, b) => b.clave - a.clave || b.monto - a.monto);

  const rf = est?.resumenFiltrado;
  const resumenFiltrado = rf
    ? {
        monto: num(rf.totalMonto),
        montoMensualidades: num(rf.montoMensualidades),
        montoMatriculas: num(rf.montoMatriculas),
        pagos: num(rf.cantidadPagos),
        alumnos: num(rf.cantidadAlumnos),
      }
    : null;

  return {
    resumen,
    porDeporte,
    porAlumno,
    desglose,
    resumenFiltrado,
    actualizado: est?.timestamp || null,
  };
}

/* ------------------------------------------------------------------ */
/* Derivados                                                           */
/* ------------------------------------------------------------------ */

/** Opciones de filtro a partir de lo que realmente existe en los datos. */
export function opcionesFiltro(datos) {
  const anios = new Set();
  const meses = new Map(); // número -> texto original más frecuente
  const conteoTexto = new Map();
  for (const f of datos?.desglose || []) {
    if (f.anio) anios.add(f.anio);
    if (f.mes) {
      const k = `${f.mes}|${f.mesTexto}`;
      conteoTexto.set(k, (conteoTexto.get(k) || 0) + f.pagos);
    }
  }
  for (const [k, c] of conteoTexto) {
    const [n, texto] = k.split('|');
    const actual = meses.get(+n);
    const variantes = [...new Set([...(actual?.variantes || []), texto])];
    if (!actual || c > actual.c) meses.set(+n, { texto, c, variantes });
    else actual.variantes = variantes;
  }
  const deportes = new Set((datos?.porDeporte || []).map((d) => d.deporte));
  for (const f of datos?.desglose || []) if (f.deporte && f.deporte !== 'General') deportes.add(f.deporte);

  return {
    anios: [...anios].sort((a, b) => b - a),
    meses: [...meses.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([n, v]) => ({ valor: v.texto, numero: n, etiqueta: nombreMes(n), variantes: v.variantes })),
    deportes: [...deportes].sort((a, b) => a.localeCompare(b, 'es')),
  };
}

/** Aplica los filtros a las tablas que el backend devuelve sin filtrar. */
export function aplicarFiltrosLocales(datos, filtros) {
  if (!datos) return datos;
  const mesNum = filtros.mes ? numeroMes(filtros.mes) : 0;
  const anio = filtros.anio ? parseInt(filtros.anio, 10) : 0;
  const dep = filtros.deporte || '';
  return {
    ...datos,
    desglose: datos.desglose.filter(
      (f) => (!mesNum || f.mes === mesNum) && (!anio || f.anio === anio) && (!dep || f.deporte === dep)
    ),
    porDeporte: datos.porDeporte, // el servidor ya lo calcula para el período; se muestran todos los deportes
    porAlumno: datos.porAlumno, // el servidor ya lo filtra por período y deporte
  };
}

/** Serie mensual (suma de todos los deportes) ordenada de más antigua a más reciente. */
export function serieMensual(desglose, maxMeses = 12) {
  const m = new Map();
  for (const f of desglose || []) {
    if (!f.mes || !f.anio) continue;
    const prev = m.get(f.clave) || { clave: f.clave, mes: f.mes, anio: f.anio, monto: 0, pagos: 0 };
    prev.monto += f.monto;
    prev.pagos += f.pagos;
    m.set(f.clave, prev);
  }
  return [...m.values()].sort((a, b) => a.clave - b.clave).slice(-maxMeses);
}

/** Clave (aaaamm) del mes calendario anterior. */
export const claveMesAnterior = (clave) => {
  const anio = Math.floor(clave / 100);
  const mes = clave % 100;
  return mes <= 1 ? (anio - 1) * 100 + 12 : anio * 100 + (mes - 1);
};

/** Clave (aaaamm) del mes en curso en Lima. */
export function claveMesActual(d = new Date()) {
  const [anio, mes] = d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' }).split('-');
  return parseInt(anio, 10) * 100 + parseInt(mes, 10);
}

/** Desglose agrupado por mes (más reciente primero) con subtotal por mes. */
export function agruparPorMes(desglose) {
  const grupos = new Map();
  for (const f of desglose || []) {
    const k = f.clave || `${f.mesTexto}-${f.anio}`;
    if (!grupos.has(k)) grupos.set(k, { clave: k, mes: f.mes, mesTexto: f.mesTexto, anio: f.anio, monto: 0, pagos: 0, filas: [] });
    const g = grupos.get(k);
    g.monto += f.monto;
    g.pagos += f.pagos;
    g.filas.push(f);
  }
  return [...grupos.values()]
    .sort((a, b) => (Number(b.clave) || 0) - (Number(a.clave) || 0))
    .map((g) => ({ ...g, filas: g.filas.sort((a, b) => b.monto - a.monto) }));
}

export const etiquetaMes = (g) => (g.mes ? `${nombreMes(g.mes)} ${g.anio || ''}`.trim() : `${g.mesTexto || 'Sin mes'} ${g.anio || ''}`.trim());

/** Texto legible de los filtros activos. */
export function describirFiltros(filtros, opciones) {
  const partes = [];
  if (filtros.mes) {
    const o = opciones?.meses.find((x) => x.valor === filtros.mes);
    partes.push(o ? o.etiqueta : filtros.mes);
  }
  if (filtros.anio) partes.push(String(filtros.anio));
  if (filtros.deporte) partes.push(filtros.deporte);
  return partes.join(' · ');
}

/** Alumnos del período; "hasta N" cuando la cifra es una suma de variantes. */
export const alumnosPeriodo = (rf) => (rf ? `${rf.alumnosAprox ? 'hasta ' : ''}${numero(rf.alumnos)}` : '0');

export const NOTA_SUMA = 'Suma por deporte: un pago de un alumno con varios deportes cuenta en cada uno.';

export const hayFiltros = (f) => Boolean(f.anio || f.mes || f.deporte);

/* ------------------------------------------------------------------ */
/* Petición                                                            */
/* ------------------------------------------------------------------ */
export class ErrorSesion extends Error {}

async function pedir(filtros, signal) {
  const p = new URLSearchParams();
  if (filtros.mes) p.set('mes', filtros.mes);
  if (filtros.anio) p.set('anio', String(filtros.anio));
  if (filtros.deporte) p.set('deporte', filtros.deporte);
  const q = p.toString();

  const res = await fetchWithAuth(`${ENDPOINT}${q ? `?${q}` : ''}`, {
    signal,
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (res.status === 401 || res.status === 403) throw new ErrorSesion('La sesión expiró.');
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`El servidor respondió ${res.status} sin datos legibles.`);
  }
  if (!res.ok || !json.success) {
    throw new Error(json?.error || `El servidor respondió ${res.status}.`);
  }
  return normalizar(json.estadisticas);
}

/**
 * Pide las estadísticas. Si el mes elegido está guardado con más de una
 * escritura (p. ej. "setiembre" y "septiembre"), el servidor solo compara una
 * a la vez, así que se pide cada variante y se suma el resumen del período.
 */
export async function obtenerEstadisticas(filtros, signal, variantesMes = []) {
  const variantes = filtros.mes && variantesMes.length > 1 ? variantesMes : null;
  if (!variantes) return pedir(filtros, signal);
  const resultados = await Promise.all(variantes.map((mes) => pedir({ ...filtros, mes }, signal)));
  const base = resultados[0];
  const partes = resultados.map((r) => r.resumenFiltrado).filter(Boolean);
  return {
    ...base,
    resumenFiltrado: partes.length
      ? {
          ...partes.reduce((a, b) => ({ monto: a.monto + b.monto, pagos: a.pagos + b.pagos, alumnos: a.alumnos + b.alumnos })),
          // un mismo alumno pudo pagar con ambas escrituras: la suma es un máximo
          alumnosAprox: partes.length > 1,
        }
      : null,
  };
}

/* ------------------------------------------------------------------ */
/* Exportación a Excel (misma librería y CDN que el dashboard actual)  */
/* ------------------------------------------------------------------ */
const XLSX_URL = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';

function cargarXlsx() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((resolve, reject) => {
    const existente = document.querySelector(`script[data-src="${XLSX_URL}"]`);
    const s = existente || document.createElement('script');
    const listo = () => (window.XLSX ? resolve(window.XLSX) : reject(new Error('No se pudo cargar la librería de Excel.')));
    s.addEventListener('load', listo, { once: true });
    s.addEventListener('error', () => reject(new Error('No se pudo cargar la librería de Excel. Revisa tu conexión.')), { once: true });
    if (!existente) {
      s.src = XLSX_URL;
      s.dataset.src = XLSX_URL;
      document.body.appendChild(s);
    }
  });
}

/**
 * Genera el Excel con los datos que se ven en pantalla (filtros aplicados).
 * Los montos van como números para que contabilidad pueda sumar.
 */
export async function exportarExcel({ datos, vista, filtros, opciones }) {
  const XLSX = await cargarXlsx();
  const { resumen } = datos;
  const ahora = new Date();
  const generado = ahora.toLocaleString('es-PE', { timeZone: 'America/Lima' });
  const periodo = hayFiltros(filtros) ? describirFiltros(filtros, opciones) : 'Todo el historial';
  const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

  const hojaResumen = [
    ['Dashboard financiero — Jaguares'],
    [`Generado: ${generado}`],
    [`Período de las tablas: ${periodo}`],
    [],
    ['Métrica', 'Monto (S/)', 'Qué cuenta'],
    ['Cobrado hoy', r2(resumen.ingresosHoy), DEFINICIONES.ingresosHoy.definicion],
    ['Cobrado del mes', r2(resumen.ingresosMes), DEFINICIONES.ingresosMes.definicion],
    ['Pendiente por confirmar del mes', r2(resumen.pendienteMes), 'Pagos mensuales del mes en estado pendiente'],
    ['Cobrado acumulado', r2(resumen.totalIngresos), DEFINICIONES.totalIngresos.definicion],
    ['Matrículas cobradas', r2(resumen.totalMatriculas), DEFINICIONES.totalMatriculas.definicion],
    ['Mensualidades cobradas', r2(resumen.totalMensualidades), DEFINICIONES.totalMensualidades.definicion],
    [],
    ['Alumnos activos', resumen.alumnosActivos],
    ['Inscripciones activas', resumen.inscripcionesActivas],
  ];
  if (datos.resumenFiltrado) {
    hojaResumen.push([], ['Cobrado en el período', r2(datos.resumenFiltrado.monto), DEFINICIONES.recaudadoPeriodo.definicion]);
    hojaResumen.push(['Pagos confirmados en el período', datos.resumenFiltrado.pagos]);
    hojaResumen.push(['Alumnos que pagaron en el período', datos.resumenFiltrado.alumnos]);
  }

  const hojaDeportes = [
    ['Deporte', 'Inscripciones activas', 'Matrículas cobradas (S/)', 'Mensualidades cobradas (S/)', 'Total cobrado (S/)', 'Tarifa mensual activa (S/)'],
    ...vista.porDeporte.map((d) => [d.deporte, d.inscritos, r2(d.matriculas), r2(d.mensualidades), r2(d.total), r2(d.tarifaMensual)]),
  ];

  const hojaDesglose = [
    ['Año', 'Mes', 'Deporte', 'Pagos confirmados', 'Cobrado (S/)'],
    ...vista.desglose.map((f) => [f.anio || '', f.mes ? nombreMes(f.mes) : f.mesTexto, f.deporte, f.pagos, r2(f.monto)]),
  ];

  const hojaAlumnos = [
    ['Pos.', 'DNI', 'Alumno', 'Deportes activos', 'Deportes inactivos', 'Matrículas (S/)', 'Mensualidades (S/)', 'Total pagado (S/)', 'Tarifa mensual activa (S/)'],
    ...vista.porAlumno.map((a, i) => [i + 1, a.dni, a.nombres, a.deportes.join(', '), a.deportesInactivos.join(', '), r2(a.matriculas), r2(a.mensualidades), r2(a.total), r2(a.tarifaMensual)]),
  ];

  const wb = XLSX.utils.book_new();
  const agregar = (filas, nombre, anchos) => {
    const ws = XLSX.utils.aoa_to_sheet(filas);
    ws['!cols'] = anchos.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(wb, ws, nombre);
  };
  agregar(hojaResumen, 'Resumen', [34, 16, 90]);
  agregar(hojaDeportes, 'Por deporte', [24, 20, 24, 26, 18, 26]);
  agregar(hojaDesglose, 'Por mes', [8, 12, 24, 18, 16]);
  agregar(hojaAlumnos, 'Alumnos', [6, 12, 40, 30, 24, 16, 18, 18, 26]);

  const fecha = ahora.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  XLSX.writeFile(wb, `Dashboard_Financiero_Jaguares_${fecha}.xlsx`);
}
