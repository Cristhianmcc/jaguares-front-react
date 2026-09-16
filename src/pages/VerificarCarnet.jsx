import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api.js';


// Helper para convertir URLs de Google Drive a URLs directas de imagen compatibles con <img>
const getDriveFileId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const matchFile = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile) return matchFile[1];
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId) return matchId[1];
  return null;
};

const formatFotoUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.includes('drive.google.com/thumbnail') || trimmed.includes('lh3.googleusercontent.com')) {
    return trimmed;
  }

  const fileId = getDriveFileId(trimmed);
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  return trimmed;
};

export default function VerificarCarnet() {
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dniParam = params.get('dni') || '';
    if (dniParam) {
      setDni(dniParam);
      consultarDni(dniParam);
    } else {
      setLoading(false);
    }
  }, []);

  const consultarDni = async (dniAConsultar) => {
    const d = (dniAConsultar || dni).trim();
    if (!d || d.length < 6) {
      setError('Por favor ingrese un DNI válido');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Consulta pública informativa de credencial (no altera asistencias de puerta)
      const res = await fetch(`${API_BASE}/api/consultar/${encodeURIComponent(d)}?incluir_inactivos=1&t=${Date.now()}`);
      if (!res.ok) {
        throw new Error('Error al conectar con el servidor (' + res.status + ')');
      }
      const data = await res.json();

      if (data.success && data.alumno) {
        const alDia = Boolean(
          data.pago && (
            data.pago.estado === 'confirmado' ||
            data.pago.estado === 'pagado' ||
            data.pago.estado === 'aprobado'
          )
        );

        setDatos({
          ...data,
          activo: alDia,
          aviso: alDia ? 'MEMBRESÍA ACTIVA' : 'MEMBRESÍA INACTIVA - PAGO PENDIENTE'
        });
      } else {
        setError(data.error || 'No se encontró ningún alumno registrado con este DNI.');
        setDatos(null);
      }
    } catch (err) {
      console.error('Error verificando carnet:', err);
      setError('Ocurrió un error al conectar con el servidor. Intente nuevamente.');
      setDatos(null);
    } finally {
      setLoading(false);
    }
  };

  const getHorarioHoy = (horarios) => {
    if (!horarios || !Array.isArray(horarios) || horarios.length === 0) return null;
    const ahoraPeru = new Date(Date.now() - 5 * 3600 * 1000);
    const DIAS = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
    const diaHoy = DIAS[ahoraPeru.getUTCDay()];
    const norm = s => (s || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return horarios.find(h => norm(h.dia) === diaHoy) || null;
  };

  const getAnioNacimiento = (fecha) => {
    if (!fecha) return '----';
    const match = String(fecha).match(/(\d{4})/);
    return match ? match[1] : '----';
  };

  const limpiarTexto = (t) => {
    if (!t) return '';
    return String(t)
      .replace(/FÃºtbol|FÃ°tbol|F\uFFFDtbol/gi, 'Fútbol')
      .replace(/EconÃ³mico|EconÃ³m|Econ\uFFFDmico/gi, 'Económico')
      .replace(/EstÃ¡ndar|Est\uFFFDndar/gi, 'Estándar')
      .replace(/CategorÃ­a|Categor\uFFFD/gi, 'Categoría')
      .replace(/BÃ¡squet|B\uFFFDsquet/gi, 'Básquet')
      .replace(/VÃ³ley|V\uFFFDley/gi, 'Vóley');
  };

  const estaAlDia = Boolean(
    datos?.activo !== undefined
      ? datos.activo
      : (datos?.pago && (
          datos.pago.estado === 'confirmado' ||
          datos.pago.estado === 'pagado' ||
          datos.pago.estado === 'aprobado'
        ))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/20 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-slate-900/60 backdrop-blur-md px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.ico" alt="Logo Jaguares" className="h-9 w-auto drop-shadow" />
            <div>
              <h1 className="text-base font-black italic tracking-wider uppercase text-white flex items-center gap-1.5 leading-none">
                JAGUARES <span className="text-amber-400 font-bold text-xs tracking-normal">| Verificación</span>
              </h1>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold mt-1">
                Control Oficial de Membresía
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col justify-center">
        {loading ? (
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 animate-spin">
              <span className="material-symbols-outlined text-3xl text-amber-400">sync</span>
            </div>
            <h3 className="text-lg font-black text-white">Validando Credencial...</h3>
            <p className="text-xs text-slate-400 mt-1">Consultando base de datos en tiempo real de Jaguares</p>
          </div>
        ) : error ? (
          <div className="bg-slate-900/80 border border-rose-500/30 rounded-3xl p-6 text-center backdrop-blur-xl shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <span className="material-symbols-outlined text-3xl">error</span>
            </div>
            <h3 className="text-lg font-black text-white">No se pudo verificar</h3>
            <p className="text-xs text-slate-300 mt-2">{error}</p>

            {/* Input para buscar otro DNI */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-slate-400 mb-2 font-semibold">Consultar otro DNI:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ingrese DNI..."
                  className="flex-1 bg-slate-800 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => consultarDni(dni)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        ) : datos ? (
          <div className="space-y-4">
            {/* Banner de Estado de Pago / Membresía */}
            <div
              className={`rounded-3xl p-5 border shadow-2xl text-center backdrop-blur-xl transition-all ${
                estaAlDia
                  ? 'bg-gradient-to-b from-emerald-950/80 to-slate-900/90 border-emerald-500/50 shadow-emerald-950/40'
                  : 'bg-gradient-to-b from-rose-950/80 to-slate-900/90 border-rose-500/50 shadow-rose-950/40'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg ${
                  estaAlDia
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30'
                    : 'bg-rose-500 text-white ring-4 ring-rose-500/30'
                }`}
              >
                <span className="material-symbols-outlined text-3xl font-black">
                  {estaAlDia ? 'verified' : 'priority_high'}
                </span>
              </div>

              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1 ${
                  estaAlDia
                    ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-rose-400/20 text-rose-300 border border-rose-400/40'
                }`}
              >
                {estaAlDia ? 'MEMBRESÍA AL DÍA' : 'PAGO PENDIENTE'}
              </span>

              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                {estaAlDia ? 'ALUMNO OFICIAL HABILITADO' : 'REGULARIZAR MENSUALIDAD'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                {estaAlDia
                  ? 'El alumno cuenta con su membresía activa y carnet oficial vigente.'
                  : 'El alumno registra un estado pendiente. Favor de regularizar su pago en administración.'}
              </p>

              {/* Información sobre el horario de hoy */}
              {(() => {
                const hHoy = getHorarioHoy(datos.horarios);
                return (
                  <div className="mt-3 flex justify-center">
                    {hHoy ? (
                      <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-sm text-amber-400">sports_soccer</span>
                        Hoy le toca entrenamiento: {hHoy.dia} ({hHoy.hora_inicio} - {hHoy.hora_fin})
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-800/80 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-slate-400">event_busy</span>
                        Hoy no tiene entrenamiento programado
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Carnet del Alumno con Datos Completos */}
            <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-5 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex gap-4 items-center">
                {/* Foto */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-20 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-lg bg-slate-800 flex items-center justify-center relative">
                    {datos.alumno?.foto_carnet_url ? (
                      <img
                        src={formatFotoUrl(datos.alumno.foto_carnet_url)}
                        alt="Foto carnet"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-slate-400 p-2">
                        <span className="material-symbols-outlined text-3xl text-slate-500">person</span>
                        <p className="text-[8px] font-bold uppercase mt-0.5">Sin Foto</p>
                      </div>
                    )}
                  </div>
                  <span className="mt-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black tracking-wider">
                    CAT. {getAnioNacimiento(datos.alumno?.fecha_nacimiento)}
                  </span>
                </div>

                {/* Nombre y DNI */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Alumno Oficial
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight mt-0.5 truncate">
                    {datos.alumno?.nombres}
                  </h3>
                  <p className="text-sm font-bold text-slate-300 truncate">
                    {datos.alumno?.apellidos}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-white/10 font-bold text-slate-200">
                      DNI: {datos.alumno?.dni}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detalles de Inscripción */}
              <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Disciplina</p>
                  <p className="text-sm font-black text-amber-300 mt-0.5">
                    {limpiarTexto(datos.inscripciones?.[0]?.deporte || 'Fútbol')}
                  </p>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Plan</p>
                  <p className="text-sm font-black text-white mt-0.5">
                    {limpiarTexto(datos.inscripciones?.[0]?.plan || 'Económico')}
                  </p>
                </div>
              </div>

              {/* Horarios si existen */}
              {datos.horarios && datos.horarios.length > 0 && (
                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-white/5">
                  <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-2">
                    Horarios Asignados
                  </p>
                  <div className="space-y-1.5">
                    {datos.horarios.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{h.dia}:</span>
                        <span className="font-mono text-amber-400 text-xs">
                          {h.hora_inicio} - {h.hora_fin}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Watermark de verificación */}
              <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-xs text-amber-400">verified</span>
                Credencial verificada en tiempo real • Jaguares 2026
              </div>
            </div>

            {/* Botón para consultar otro */}
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setDatos(null);
                  setError('');
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors underline font-semibold"
              >
                Consultar otro carnet o DNI
              </button>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-4 text-center text-[10px] text-slate-400 border-t border-white/5 bg-black/40">
        JAGUARES © 2026 • Todos los derechos reservados • jaguarescar.com
      </footer>
    </div>
  );
}
