import React, { useEffect, useMemo, useRef, useState } from 'react';
import './fuentes.css';
import './moderna.css';
import { useDashboardFinanciero } from './useDashboardFinanciero.js';
import {
  agruparPorMes,
  alumnosPeriodo,
  etiquetaMes,
  fechaHora,
  mesActualLima,
  mesCorto,
  nombreMes,
  numero,
  porcentaje,
  serieMensual,
  soles,
  solesEntero,
} from './datosFinancieros.js';
import { Aviso, Definicion, Icono, LOGO, PanelError } from './piezas.jsx';

const P = 'md';

/* ------------------------------------------------------------------ */
/* Tarjetas de cifras                                                  */
/* ------------------------------------------------------------------ */
function Cifra({ rotulo, clave, valor, pie }) {
  return (
    <div className="md-cifra">
      <div className="md-cifra-cab">
        <span>{rotulo}</span>
        <Definicion clave={clave} p={P} etiqueta={rotulo} />
      </div>
      <div className="md-cifra-valor">{valor}</div>
      {pie && <div className="md-cifra-pie">{pie}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gráfico de área: mensualidades por mes (una serie)                  */
/* ------------------------------------------------------------------ */
function escalaBonita(max) {
  if (max <= 0) return { tope: 1000, paso: 250 };
  const bruto = max / 4;
  const pot = 10 ** Math.floor(Math.log10(bruto));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * pot).find((v) => v >= bruto);
  return { tope: Math.ceil(max / paso) * paso, paso };
}

function useAncho() {
  const ref = useRef(null);
  const [ancho, setAncho] = useState(640);
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => setAncho(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, ancho];
}

function GraficoMeses({ serie, seleccion, onElegir }) {
  const [ref, ancho] = useAncho();
  const [activo, setActivo] = useState(null);
  const alto = 240;
  const m = { izq: 56, der: 16, arr: 16, aba: 30 };
  const w = ancho - m.izq - m.der;
  const h = alto - m.arr - m.aba;
  const { tope, paso } = escalaBonita(Math.max(...serie.map((s) => s.monto), 0));
  const x = (i) => m.izq + (serie.length === 1 ? w / 2 : (i / (serie.length - 1)) * w);
  const y = (v) => m.arr + h - (v / tope) * h;
  const puntos = serie.map((s, i) => [x(i), y(s.monto)]);
  const linea = puntos.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${linea} L${puntos[puntos.length - 1][0].toFixed(1)},${m.arr + h} L${puntos[0][0].toFixed(1)},${m.arr + h} Z`;
  const ticks = [];
  for (let v = 0; v <= tope + 0.5; v += paso) ticks.push(v);

  const mover = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    let mejor = 0;
    puntos.forEach((p, i) => {
      if (Math.abs(p[0] - px) < Math.abs(puntos[mejor][0] - px)) mejor = i;
    });
    setActivo(mejor);
  };
  const a = activo != null ? serie[activo] : null;

  return (
    <div className="md-grafico" ref={ref}>
      <svg width={ancho} height={alto} role="img" aria-label={`Mensualidades cobradas por mes, de ${nombreMes(serie[0].mes)} ${serie[0].anio} a ${nombreMes(serie[serie.length - 1].mes)} ${serie[serie.length - 1].anio}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.izq} x2={ancho - m.der} y1={y(t)} y2={y(t)} className="md-grid" />
            <text x={m.izq - 10} y={y(t) + 4} textAnchor="end" className="md-eje">{t >= 1000 ? `${t / 1000}k` : t}</text>
          </g>
        ))}
        <path d={area} className="md-area" />
        <path d={linea} className="md-linea" />
        {a && <line x1={puntos[activo][0]} x2={puntos[activo][0]} y1={m.arr} y2={m.arr + h} className="md-cruz" />}
        {puntos.map((p, i) => {
          const sel = seleccion === serie[i].clave;
          return sel || i === activo || i === puntos.length - 1 ? (
            <circle key={serie[i].clave} cx={p[0]} cy={p[1]} r={sel ? 6 : 4.5} className={sel ? 'md-punto md-punto--sel' : 'md-punto'} />
          ) : null;
        })}
        <rect
          x={m.izq - 12}
          y={m.arr}
          width={w + 24}
          height={h}
          fill="transparent"
          style={{ cursor: 'pointer' }}
          onPointerMove={mover}
          onPointerLeave={() => setActivo(null)}
          onClick={() => activo != null && onElegir(serie[activo])}
        />
      </svg>
      {a && (
        <div
          className="md-tip"
          style={{ left: Math.min(Math.max(puntos[activo][0], 90), ancho - 90), top: Math.max(puntos[activo][1] - 12, 8) }}
          role="status"
        >
          <strong>{soles(a.monto)}</strong>
          <span>{nombreMes(a.mes)} {a.anio} · {numero(a.pagos)} pagos</span>
          <em>Clic para filtrar este mes</em>
        </div>
      )}
      <div className="md-eje-x">
        {serie.map((s, i) => (
          <button
            key={s.clave}
            style={{ left: x(i) }}
            type="button"
            className={seleccion === s.clave ? 'md-mes md-mes--sel' : 'md-mes'}
            aria-pressed={seleccion === s.clave}
            onClick={() => onElegir(s)}
            aria-label={`${nombreMes(s.mes)} ${s.anio}`}
            title={`Filtrar ${nombreMes(s.mes)} ${s.anio}`}
          >
            {mesCorto(s.mes)}
            <small>{String(s.anio).slice(2)}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Deportes: barras horizontales apiladas (matrículas + tarifa)        */
/* ------------------------------------------------------------------ */
function BarrasDeportes({ filas, elegido, onElegir }) {
  const max = Math.max(...filas.map((f) => f.total), 1);
  const suma = filas.reduce((s, f) => s + f.total, 0);
  return (
    <ul className="md-barras">
      {filas.map((f) => {
        const sel = elegido === f.deporte;
        return (
          <li key={f.deporte}>
            <button
              type="button"
              className={`md-barra-fila${sel ? ' md-barra-fila--sel' : ''}${elegido && !sel ? ' md-barra-fila--tenue' : ''}`}
              aria-pressed={sel}
              onClick={() => onElegir(sel ? '' : f.deporte)}
            >
              <span className="md-barra-nombre">{f.deporte}</span>
              <span className="md-barra-pista" aria-hidden="true">
                <span className="md-seg md-seg--mat" style={{ width: `${(f.matriculas / max) * 100}%` }} />
                <span className="md-seg md-seg--tar" style={{ width: `${(f.mensualidades / max) * 100}%` }} />
              </span>
              <span className="md-barra-valor">{solesEntero(f.total)}</span>
              <span className="md-barra-pct">{porcentaje(f.total, suma)}</span>
              <span className="md-barra-tip" role="tooltip">
                <strong>{soles(f.total)}</strong>
                <span><i className="md-clave md-clave--mat" />Matrículas {soles(f.matriculas)}</span>
                <span><i className="md-clave md-clave--tar" />Mensualidades {soles(f.mensualidades)}</span>
                <span>{numero(f.inscritos)} inscripciones activas · tarifa {soles(f.tarifaMensual)}/mes</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */
function Tarjeta({ titulo, clave, extra, children, className = '' }) {
  return (
    <section className={`md-tarjeta ${className}`}>
      <header className="md-tarjeta-cab">
        <h2>{titulo}</h2>
        {clave && <Definicion clave={clave} p={P} etiqueta={titulo} />}
        {extra && <div className="md-tarjeta-extra">{extra}</div>}
      </header>
      {children}
    </section>
  );
}

function Esqueleto() {
  return (
    <div className="md-contenido" aria-busy="true" aria-label="Cargando cifras">
      <div className="md-cifras">
        {[0, 1, 2, 3].map((i) => <div key={i} className="md-hueso md-hueso--cifra" />)}
      </div>
      <div className="md-fila">
        <div className="md-hueso md-hueso--grande" />
        <div className="md-hueso md-hueso--grande" />
      </div>
    </div>
  );
}

export default function DashboardFinanciero() {
  const d = useDashboardFinanciero({ claseBody: 'md-body' });
  const { sesion, estado, datos, vista, filtros, opciones, error } = d;
  const [todos, setTodos] = useState(false);

  const serie = useMemo(() => (datos ? serieMensual(datos.desglose, 12) : []), [datos]);
  const grupos = useMemo(() => (vista ? agruparPorMes(vista.desglose) : []), [vista]);
  const mesSel = useMemo(() => {
    if (!filtros.mes || !filtros.anio) return null;
    const o = opciones.meses.find((m) => m.valor === filtros.mes);
    return o ? parseInt(filtros.anio, 10) * 100 + o.numero : null;
  }, [filtros, opciones]);

  const elegirMes = (s) => {
    if (mesSel === s.clave) {
      d.fijarFiltros({ mes: '', anio: '' });
      return;
    }
    const o = opciones.meses.find((m) => m.numero === s.mes);
    d.fijarFiltros({ mes: o ? o.valor : '', anio: String(s.anio) });
  };

  const r = datos?.resumen;
  const rf = datos?.resumenFiltrado;
  const totalComp = r ? r.totalMatriculas + r.totalMensualidades : 0;
  const tarifaTotal = r ? r.tarifaMensualActiva : 0;
  const avance = tarifaTotal > 0 && r ? r.mensualidadesMes / tarifaTotal : 0;
  const alumnos = vista ? (todos ? vista.porAlumno : vista.porAlumno.slice(0, 6)) : [];

  return (
    <div className="md">
      <header className="md-barra">
        <a className="md-marca" href="/admin-panel">
          <img src={LOGO} alt="" width="28" height="28" />
          <span>JAGUARES</span>
        </a>
        <nav className="md-migas" aria-label="Ubicación">
          <a href="/admin-panel">Panel</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Finanzas</span>
        </nav>
        <span className="md-espacio" />
        <nav className="md-otras" aria-label="Otras vistas">
          <a href="/admin-pagos-mensuales">Pagos mensuales</a>
          <a href="/admin-dashboard-anterior">Vista anterior</a>
        </nav>
        <span className="md-usuario" title={sesion?.email}>
          <span className="md-avatar" aria-hidden="true">{(sesion?.email || 'A').charAt(0).toUpperCase()}</span>
          <span className="md-usuario-texto">{sesion?.email}</span>
        </span>
      </header>

      <main className="md-principal">
        <div className="md-titulo">
          <div>
            <h1>Finanzas</h1>
            <p>
              Pagos confirmados de la academia
              {datos && <> · actualizado {fechaHora(datos.actualizado)}</>}
            </p>
          </div>
          <div className="md-acciones">
            <button type="button" className="md-btn md-btn--sec" onClick={d.recargar} disabled={d.actualizando}>
              <Icono nombre="recargar" tam={16} className={d.actualizando ? 'md-gira' : undefined} />
              Actualizar
            </button>
            <button type="button" className="md-btn md-btn--pri" onClick={d.exportar} disabled={!datos || d.exportando}>
              <Icono nombre="descargar" tam={16} />
              {d.exportando ? 'Generando…' : 'Exportar Excel'}
            </button>
          </div>
        </div>

        {estado !== 'cargando' && datos && (
          <form className="md-filtros" onSubmit={(e) => e.preventDefault()} aria-label="Filtros">
            <label className="md-select">
              <span>Mes</span>
              <select value={filtros.mes} onChange={(e) => d.cambiarFiltro('mes', e.target.value)}>
                <option value="">Todos</option>
                {opciones.meses.map((m) => <option key={m.numero} value={m.valor}>{m.etiqueta}</option>)}
              </select>
            </label>
            <label className="md-select">
              <span>Año</span>
              <select value={filtros.anio} onChange={(e) => d.cambiarFiltro('anio', e.target.value)}>
                <option value="">Todos</option>
                {opciones.anios.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
            <label className="md-select">
              <span>Deporte</span>
              <select value={filtros.deporte} onChange={(e) => d.cambiarFiltro('deporte', e.target.value)}>
                <option value="">Todos</option>
                {opciones.deportes.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
            {d.filtrosActivos && (
              <button type="button" className="md-limpiar" onClick={d.limpiarFiltros}>
                <Icono nombre="cerrar" tam={14} /> Quitar filtros
              </button>
            )}
          </form>
        )}

        {estado === 'cargando' && <Esqueleto />}
        {estado === 'error' && <PanelError p={P} mensaje={error} onReintentar={d.recargar} />}

        {estado === 'listo' && datos && (
          <div className={`md-contenido${d.actualizando ? ' md-contenido--recarga' : ''}`}>
            {error && <PanelError p={P} mensaje={error} onReintentar={d.recargar} />}

            {d.filtrosActivos && (
              <section className="md-periodo" aria-live="polite">
                <div>
                  <div className="md-periodo-rotulo">
                    Cobrado en {d.textoFiltros}
                    <Definicion clave="recaudadoPeriodo" p={P} />
                  </div>
                  <div className="md-periodo-detalle">
                    {rf
                      ? `Mensualidades ${soles(rf.montoMensualidades)} · Matrículas ${soles(rf.montoMatriculas)} · ${numero(rf.pagos)} pagos · ${alumnosPeriodo(rf)} alumnos`
                      : 'Sin datos del servidor para este período'}
                  </div>
                </div>
                <div className="md-periodo-valor">{soles(rf ? rf.monto : 0)}</div>
              </section>
            )}

            <div className="md-cifras">
              <Cifra rotulo="Cobrado hoy" clave="ingresosHoy" valor={soles(r.ingresosHoy)} pie="Pagos confirmados hoy" />
              <Cifra
                rotulo={`Cobrado de ${mesActualLima().toLowerCase()}`}
                clave="ingresosMes"
                valor={soles(r.ingresosMes)}
                pie={r.pendienteMes > 0 ? `${soles(r.pendienteMes)} por confirmar` : 'Mensualidades del mes + matrículas nuevas'}
              />
              <Cifra rotulo="Cobrado acumulado" clave="totalIngresos" valor={soles(r.totalIngresos)} pie="Matrículas + mensualidades, desde el inicio" />
              <Cifra rotulo="Alumnos activos" valor={numero(r.alumnosActivos)} pie={`${numero(r.inscripcionesActivas)} inscripciones activas`} />
            </div>

            <div className="md-fila">
              <Tarjeta
                titulo="Mensualidades por mes"
                clave="desgloseMensual"
                className="md-ancha"
                extra={<span className="md-leyenda"><span><i className="md-clave md-clave--tar md-clave--linea" />Mensualidades cobradas</span></span>}
              >
                {serie.length ? (
                  <GraficoMeses serie={serie} seleccion={mesSel} onElegir={elegirMes} />
                ) : (
                  <p className="md-vacio">Todavía no hay mensualidades confirmadas.</p>
                )}
                <p className="md-nota">Toca un mes para filtrar el dashboard. Montos confirmados en Pagos mensuales, con las modificaciones incluidas.</p>
              </Tarjeta>

              <Tarjeta titulo="De dónde viene el dinero" clave="totalIngresos">
                <div className="md-comp-total">{soles(totalComp)}</div>
                <div className="md-comp-barra" aria-hidden="true">
                  <span className="md-seg md-seg--mat" style={{ width: `${totalComp ? (r.totalMatriculas / totalComp) * 100 : 0}%` }} />
                  <span className="md-seg md-seg--tar" style={{ width: `${totalComp ? (r.totalMensualidades / totalComp) * 100 : 0}%` }} />
                </div>
                <dl className="md-comp-lista">
                  <div>
                    <dt><i className="md-clave md-clave--mat" />Matrículas <Definicion clave="totalMatriculas" p={P} /></dt>
                    <dd>{soles(r.totalMatriculas)}<small>{porcentaje(r.totalMatriculas, totalComp)}</small></dd>
                  </div>
                  <div>
                    <dt><i className="md-clave md-clave--tar" />Mensualidades <Definicion clave="totalMensualidades" p={P} /></dt>
                    <dd>{soles(r.totalMensualidades)}<small>{porcentaje(r.totalMensualidades, totalComp)}</small></dd>
                  </div>
                </dl>
                <div className="md-avance">
                  <div className="md-avance-cab">
                    <span>Cobranza de {mesActualLima().toLowerCase()}</span>
                    <Definicion clave="avanceMes" p={P} />
                    <strong>{porcentaje(avance, 1)}</strong>
                  </div>
                  <div className="md-avance-pista" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(avance, 1) * 100)} aria-label="Avance de cobranza del mes">
                    <span style={{ width: `${Math.min(avance, 1) * 100}%` }} />
                  </div>
                  <div className="md-avance-pie">{soles(r.mensualidadesMes)} cobrados de {soles(tarifaTotal)} en tarifas activas{r.pendienteMes > 0 ? ` · ${soles(r.pendienteMes)} por confirmar` : ''}</div>
                </div>
              </Tarjeta>
            </div>

            <div className="md-fila">
              <Tarjeta
                titulo="Deportes"
                clave="valorDeporte"
                className="md-ancha"
                extra={
                  <span className="md-leyenda">
                    <span><i className="md-clave md-clave--mat" />Matrículas</span>
                    <span><i className="md-clave md-clave--tar" />Mensualidades</span>
                  </span>
                }
              >
                {datos.porDeporte.length ? (
                  <BarrasDeportes filas={datos.porDeporte} elegido={filtros.deporte} onElegir={(x) => d.cambiarFiltro('deporte', x)} />
                ) : (
                  <p className="md-vacio">No hay cobros ni inscripciones activas para este período.</p>
                )}
                <p className="md-nota">Toca un deporte para filtrar. Si un alumno tiene varios deportes, su pago mensual se reparte entre ellos.</p>
              </Tarjeta>

              <Tarjeta titulo={d.filtrosActivos ? 'Lo que más pagaron en el período' : 'Alumnos que más han pagado'} clave="valorAlumno">
                {alumnos.length === 0 ? (
                  <p className="md-vacio">Nadie ha pagado en este período.</p>
                ) : (
                  <ol className="md-alumnos">
                    {alumnos.map((a, i) => (
                      <li key={a.dni || i}>
                        <span className="md-avatar md-avatar--alumno" aria-hidden="true">{a.nombres.charAt(0)}</span>
                        <span className="md-alumno-texto">
                          <span className="md-alumno-nombre">{a.nombres}</span>
                          <span className="md-alumno-dato">
                            {a.deportes.join(', ') || 'Sin deportes activos'}
                            {a.deportesInactivos.length > 0 && ` · inactivo: ${a.deportesInactivos.join(', ')}`}
                            {` · DNI ${a.dni}`}
                          </span>
                        </span>
                        <span className="md-alumno-valor">{soles(a.total)}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {vista.porAlumno.length > 6 && (
                  <button type="button" className="md-enlace" onClick={() => setTodos((v) => !v)} aria-expanded={todos}>
                    {todos ? 'Ver menos' : `Ver los ${vista.porAlumno.length}`}
                  </button>
                )}
              </Tarjeta>
            </div>

            <details className="md-detalle">
              <summary>
                <span>Detalle por mes y deporte</span>
                <small>{grupos.length} {grupos.length === 1 ? 'mes' : 'meses'} · tabla completa</small>
              </summary>
              {grupos.length === 0 ? (
                <p className="md-vacio">No hay pagos confirmados para este período.</p>
              ) : (
                <div className="md-tabla-marco">
                  <table className="md-tabla">
                    <thead>
                      <tr>
                        <th scope="col">Mes</th>
                        <th scope="col">Deporte</th>
                        <th scope="col" className="md-num">Pagos</th>
                        <th scope="col" className="md-num">Recaudado</th>
                      </tr>
                    </thead>
                    {grupos.map((g) => (
                      <tbody key={g.clave}>
                        {g.filas.map((f, i) => (
                          <tr key={f.deporte}>
                            {i === 0 && <th scope="rowgroup" rowSpan={g.filas.length}>{etiquetaMes(g)}</th>}
                            <td>{f.deporte}</td>
                            <td className="md-num">{numero(f.pagos)}</td>
                            <td className="md-num">{soles(f.monto)}</td>
                          </tr>
                        ))}
                      </tbody>
                    ))}
                  </table>
                </div>
              )}
            </details>
          </div>
        )}
      </main>
      <Aviso p={P} aviso={d.aviso} />
    </div>
  );
}
