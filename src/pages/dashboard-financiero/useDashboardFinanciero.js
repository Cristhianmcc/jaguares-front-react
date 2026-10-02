import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ErrorSesion,
  aplicarFiltrosLocales,
  describirFiltros,
  exportarExcel,
  hayFiltros,
  irALogin,
  leerSesion,
  obtenerEstadisticas,
  opcionesFiltro,
} from './datosFinancieros.js';

const FILTROS_VACIOS = { anio: '', mes: '', deporte: '' };

/**
 * Estado del dashboard financiero. Las tres propuestas usan exactamente este
 * hook, así que muestran las mismas cifras con distinta presentación.
 *
 * estado: 'cargando' (primera carga) | 'listo' | 'error'
 * actualizando: true mientras llega una respuesta nueva con datos ya en pantalla
 */
export function useDashboardFinanciero({ claseBody } = {}) {
  const [sesion] = useState(() => leerSesion());
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [datos, setDatos] = useState(null);
  const [estado, setEstado] = useState('cargando');
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');
  const [exportando, setExportando] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: 'ok' | 'error', texto }
  const [recarga, setRecarga] = useState(0);
  const abortRef = useRef(null);
  const variantesRef = useRef({}); // mes elegido -> escrituras guardadas en la BD

  // La página es de pantalla completa: fondo y tipografía los pone cada propuesta.
  useEffect(() => {
    const prev = document.body.className;
    document.documentElement.classList.remove('dark');
    document.body.className = claseBody || '';
    return () => {
      document.body.className = prev;
    };
  }, [claseBody]);

  useEffect(() => {
    if (!sesion) irALogin();
  }, [sesion]);

  useEffect(() => {
    if (!sesion) return undefined;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setActualizando(true);
    setError('');

    obtenerEstadisticas(filtros, ctrl.signal, variantesRef.current[filtros.mes] || [])
      .then((d) => {
        if (ctrl.signal.aborted) return;
        setDatos(d);
        setEstado('listo');
      })
      .catch((e) => {
        if (ctrl.signal.aborted || e?.name === 'AbortError') return;
        if (e instanceof ErrorSesion) {
          irALogin();
          return;
        }
        setError(e?.message || 'No se pudo conectar con el servidor.');
        setEstado((prev) => (prev === 'listo' ? 'listo' : 'error'));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setActualizando(false);
      });

    return () => ctrl.abort();
  }, [sesion, filtros, recarga]);

  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  const opciones = useMemo(() => opcionesFiltro(datos), [datos]);
  useEffect(() => {
    for (const m of opciones.meses) variantesRef.current[m.valor] = m.variantes || [m.valor];
  }, [opciones]);
  const vista = useMemo(() => aplicarFiltrosLocales(datos, filtros), [datos, filtros]);

  const cambiarFiltro = useCallback((campo, valor) => {
    setFiltros((f) => ({ ...f, [campo]: valor }));
  }, []);
  const fijarFiltros = useCallback((parcial) => setFiltros((f) => ({ ...f, ...parcial })), []);
  const limpiarFiltros = useCallback(() => setFiltros(FILTROS_VACIOS), []);
  const recargar = useCallback(() => setRecarga((n) => n + 1), []);

  const exportar = useCallback(async () => {
    if (!datos || exportando) return;
    setExportando(true);
    try {
      await exportarExcel({ datos, vista, filtros, opciones });
      setAviso({ tipo: 'ok', texto: 'Excel descargado.' });
    } catch (e) {
      setAviso({ tipo: 'error', texto: e?.message || 'No se pudo generar el Excel.' });
    } finally {
      setExportando(false);
    }
  }, [datos, vista, filtros, opciones, exportando]);

  return {
    sesion,
    estado,
    actualizando,
    error,
    datos,
    vista,
    filtros,
    opciones,
    filtrosActivos: hayFiltros(filtros),
    filtroPeriodo: Boolean(filtros.mes || filtros.anio),
    textoFiltros: describirFiltros(filtros, opciones),
    cambiarFiltro,
    fijarFiltros,
    limpiarFiltros,
    recargar,
    exportar,
    exportando,
    aviso,
  };
}
