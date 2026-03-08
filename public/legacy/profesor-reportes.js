/**
 * JavaScript para Reportes de Asistencia del Profesor
 */

const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
    ? window.API_BASE_OVERRIDE
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002'
        : 'https://api.jaguarescar.com');

let profesorData = null;
let graficoAsistencia = null;

// ── Modal de notificación ────────────────────────────────────────────────────
const MODAL_TYPES = {
    success: { stripe: 'bg-green-500',  icon: 'check_circle',    iconBg: 'bg-green-100 dark:bg-green-900', iconColor: 'text-green-600 dark:text-green-400', btnClass: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',  title: 'Éxito'      },
    error:   { stripe: 'bg-red-500',    icon: 'error',           iconBg: 'bg-red-100 dark:bg-red-900',     iconColor: 'text-red-600 dark:text-red-400',     btnClass: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',        title: 'Error'      },
    warning: { stripe: 'bg-yellow-400', icon: 'warning',         iconBg: 'bg-yellow-100 dark:bg-yellow-900',iconColor: 'text-yellow-600 dark:text-yellow-400',btnClass: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400',title: 'Advertencia'},
    info:    { stripe: 'bg-blue-500',   icon: 'info',            iconBg: 'bg-blue-100 dark:bg-blue-900',   iconColor: 'text-blue-600 dark:text-blue-400',   btnClass: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',    title: 'Información'},
};

function mostrarModal(type, title, message) {
    const cfg = MODAL_TYPES[type] || MODAL_TYPES.info;
    document.getElementById('notifStripe').className    = `h-1.5 w-full ${cfg.stripe}`;
    document.getElementById('notifIconWrap').className  = `flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${cfg.iconBg}`;
    document.getElementById('notifIcon').className      = `material-symbols-outlined text-2xl ${cfg.iconColor}`;
    document.getElementById('notifIcon').textContent    = cfg.icon;
    document.getElementById('notifTitle').textContent   = title;
    document.getElementById('notifMsg').textContent     = message;
    const btn = document.getElementById('notifClose');
    btn.className = `px-5 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${cfg.btnClass}`;
    const modal = document.getElementById('notifModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    btn.focus();
}

function cerrarModal() {
    const modal = document.getElementById('notifModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Cerrar al hacer clic en el overlay
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('notifOverlay');
    if (overlay) overlay.addEventListener('click', cerrarModal);
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });
});
// ────────────────────────────────────────────────────────────────────────────

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    inicializarEventos();
    cargarDeportesProfesor();
    establecerFechasDefecto();
    cargarHorariosExportacion();
});

/**
 * Verifica sesión activa
 */
function verificarSesion() {
    const session = localStorage.getItem('adminSession');
    
    if (!session) {
        window.location.href = '/admin-login';
        return;
    }
    
    const data = JSON.parse(session);
    
    if (data.admin.rol !== 'profesor') {
        mostrarModal('error', 'Acceso denegado', 'No tienes permiso para acceder a esta sección.');
        window.location.href = '/admin-login';
        return;
    }
    
    const sessionTime = new Date(data.timestamp).getTime();
    const now = new Date().getTime();
    const hoursElapsed = (now - sessionTime) / (1000 * 60 * 60);
    
    if (hoursElapsed >= 8) {
        localStorage.removeItem('adminSession');
        localStorage.removeItem('admin_token');
        window.location.href = '/admin-login';
        return;
    }
    
    profesorData = data.admin;
    document.getElementById('profesorNombre').textContent = profesorData.nombre_completo || profesorData.email;
}

/**
 * Inicializar eventos
 */
function inicializarEventos() {
    document.getElementById('btnGenerarReporte').addEventListener('click', generarReporte);
    document.getElementById('btnExportarExcel').addEventListener('click', exportarExcel);
}

/**
 * Establecer fechas por defecto (último mes)
 */
function establecerFechasDefecto() {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    document.getElementById('fechaFin').valueAsDate = hoy;
    document.getElementById('fechaInicio').valueAsDate = haceUnMes;

    // Mes y año actuales en selector de exportación
    const selectMes = document.getElementById('exportMes');
    const selectAnio = document.getElementById('exportAnio');
    selectMes.value = String(hoy.getMonth() + 1);

    // Llenar años (3 años atrás hasta este año)
    const anioActual = hoy.getFullYear();
    for (let y = anioActual; y >= anioActual - 2; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        selectAnio.appendChild(opt);
    }
    selectAnio.value = anioActual;
}

/**
 * Cargar todos los horarios del profesor para el selector de exportación
 */
async function cargarHorariosExportacion() {
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);

        const response = await fetch(`${API_BASE}/api/profesor/mis-clases`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        const select = document.getElementById('exportHorario');
        if (data.success && data.clases && data.clases.length > 0) {
            select.innerHTML = '<option value="">Seleccione un horario...</option>';
            data.clases.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.horario_id;
                opt.textContent = `${c.deporte} – ${c.categoria} | ${c.dia} ${c.hora_inicio}-${c.hora_fin}`;
                select.appendChild(opt);
            });
        } else {
            select.innerHTML = '<option value="">No hay horarios disponibles</option>';
        }
    } catch (e) {
        console.error('Error al cargar horarios para exportación:', e);
    }
}

/**
 * Exportar Excel con registro mensual de asistencias
 */
async function exportarExcel() {
    const horarioId = document.getElementById('exportHorario').value;
    const mes = document.getElementById('exportMes').value;
    const anio = document.getElementById('exportAnio').value;

    if (!horarioId) {
        mostrarModal('warning', 'Horario requerido', 'Por favor selecciona un horario antes de descargar el Excel.');
        return;
    }

    const btn = document.getElementById('btnExportarExcel');
    const loadingEl = document.getElementById('exportLoading');
    btn.disabled = true;
    loadingEl.classList.remove('hidden');

    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);

        const response = await fetch(
            `${API_BASE}/api/profesor/datos-exportar?horario_id=${horarioId}&mes=${mes}&anio=${anio}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await response.json();

        if (!data.success) {
            mostrarModal('error', 'Error del servidor', data.error || 'No se pudieron obtener los datos del servidor.');
            return;
        }

        if (!data.fechas || data.fechas.length === 0) {
            mostrarModal('info', 'Sin registros', 'No hay registros de asistencia para ese horario en el mes seleccionado.');
            return;
        }

        await generarArchivoExcel(data);

    } catch (error) {
        console.error('Error al exportar:', error);
        mostrarModal('error', 'Error al exportar', 'Ocurrió un problema al generar el archivo Excel. Intenta nuevamente.');
    } finally {
        btn.disabled = false;
        loadingEl.classList.add('hidden');
    }
}

/**
 * Genera y descarga el archivo Excel con ExcelJS (soporta estilos completos)
 */
async function generarArchivoExcel(data) {
    const ExcelJS = window.ExcelJS;
    const mesesNombres = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio',
                          'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const diasAbrev = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

    const nombreMes = mesesNombres[data.mes] || data.mes;
    const h = data.horario;
    const totalFechaCols = data.fechas.length;
    const totalCols = 3 + totalFechaCols + 4;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'JAGUARES';
    workbook.created = new Date();
    const ws = workbook.addWorksheet(`${nombreMes} ${data.anio}`, {
        pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 }
    });

    // ── Paleta de colores ────────────────────────────────────────
    const C = {
        gold:        'C59D5F',
        goldDark:    'B08546',
        darkBg:      '1A1A1A',
        darkBg2:     '374151',
        white:       'FFFFFF',
        grayLight:   'F9FAFB',
        grayMid:     'F3F4F6',
        grayText:    '6B7280',
        grayBorder:  'D1D5DB',
        greenBg:     'DCFCE7', greenFg: '166534',
        greenLightBg:'F0FDF4',
        redBg:       'FEE2E2', redFg:   '991B1B',
        redLightBg:  'FFF1F2',
        yellowBg:    'FEF3C7', yellowFg:'92400E',
    };

    const borderThin = (color) => ({ style: 'thin', color: { argb: color || C.grayBorder } });
    const allBorders = (color) => ({
        top: borderThin(color), left: borderThin(color),
        bottom: borderThin(color), right: borderThin(color)
    });
    const boldBorders = {
        top:    { style: 'medium', color: { argb: C.goldDark } },
        left:   { style: 'medium', color: { argb: C.goldDark } },
        bottom: { style: 'medium', color: { argb: C.goldDark } },
        right:  { style: 'medium', color: { argb: C.goldDark } },
    };

    const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });

    // ── Fila 1: Título ─────────────────────────────────────────
    ws.mergeCells(1, 1, 1, totalCols);
    const r1 = ws.getCell(1, 1);
    r1.value = 'JAGUARES — REGISTRO DE ASISTENCIAS';
    r1.font   = { name: 'Calibri', size: 16, bold: true, color: { argb: C.gold } };
    r1.fill   = fill(C.darkBg);
    r1.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 30;

    // ── Fila 2: Datos del horario ────────────────────────────────
    ws.mergeCells(2, 1, 2, totalCols);
    const r2 = ws.getCell(2, 1);
    r2.value = `Deporte: ${h.deporte}   │   Categoría: ${h.categoria}   │   Horario: ${h.dia} ${h.hora_inicio} – ${h.hora_fin}`;
    r2.font  = { name: 'Calibri', size: 11, bold: true, color: { argb: C.white } };
    r2.fill  = fill(C.darkBg2);
    r2.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 22;

    // ── Fila 3: Período + fecha generación ─────────────────────
    ws.mergeCells(3, 1, 3, totalCols);
    const r3 = ws.getCell(3, 1);
    r3.value = `Período: ${nombreMes} ${data.anio}   │   Generado: ${new Date().toLocaleDateString('es-ES')}`;
    r3.font  = { name: 'Calibri', size: 10, italic: true, color: { argb: '4B5563' } };
    r3.fill  = fill(C.grayLight);
    r3.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(3).height = 18;

    ws.getRow(4).height = 6; // separador

    // ── Fila 5: Encabezados ───────────────────────────────────────
    const encabezados = ['N°', 'Apellidos y Nombres', 'DNI'];
    data.fechas.forEach(f => {
        const d = new Date(f + 'T12:00:00');
        encabezados.push(`${diasAbrev[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}`);
    });
    encabezados.push('Presentes', 'Ausentes', 'Total', '% Asist.');

    const headerRow = ws.getRow(5);
    headerRow.height = 28;
    encabezados.forEach((txt, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = txt;
        cell.font      = { name: 'Calibri', size: 10, bold: true, color: { argb: C.white } };
        cell.fill      = fill(C.gold);
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border    = boldBorders;
    });

    // ── Filas de alumnos ─────────────────────────────────────────
    data.datos.forEach((alumno, idx) => {
        const rowNum = 6 + idx;
        const row    = ws.getRow(rowNum);
        row.height   = 20;
        const par    = idx % 2 === 0;
        const bgFila = par ? C.white : C.grayMid;

        const setBase = (cell, value, opts = {}) => {
            cell.value     = value;
            cell.font      = { name: 'Calibri', size: 10, ...opts.font };
            cell.fill      = fill(opts.bg || bgFila);
            cell.alignment = { vertical: 'middle', horizontal: opts.h || 'left', ...opts.align };
            cell.border    = allBorders();
        };

        setBase(row.getCell(1), idx + 1,            { h: 'center', font: { bold: true } });
        setBase(row.getCell(2), alumno.nombre_completo);
        setBase(row.getCell(3), alumno.dni,         { h: 'center' });

        data.fechas.forEach((f, fi) => {
            const cell = row.getCell(4 + fi);
            const val  = alumno.asistencia_por_fecha[f];
            if (val === null || val === undefined) {
                setBase(cell, '–', { h: 'center', bg: C.grayMid,
                    font: { color: { argb: C.grayText } } });
            } else if (val === 1) {
                setBase(cell, 'P', { h: 'center', bg: par ? C.greenLightBg : C.greenBg,
                    font: { bold: true, color: { argb: C.greenFg } } });
            } else {
                setBase(cell, 'A', { h: 'center', bg: par ? C.redLightBg : C.redBg,
                    font: { bold: true, color: { argb: C.redFg } } });
            }
        });

        const base = 3 + totalFechaCols;
        // Presentes
        setBase(row.getCell(base+1), alumno.total_presentes, {
            h: 'center', bg: par ? C.greenLightBg : C.greenBg,
            font: { bold: true, color: { argb: C.greenFg } }
        });
        // Ausentes
        setBase(row.getCell(base+2), alumno.total_ausentes, {
            h: 'center', bg: par ? C.redLightBg : C.redBg,
            font: { bold: true, color: { argb: alumno.total_ausentes > 0 ? C.redFg : C.grayText } }
        });
        // Total
        setBase(row.getCell(base+3), alumno.total_clases, { h: 'center' });
        // Porcentaje
        const pctBg  = alumno.porcentaje >= 80 ? C.greenBg  : alumno.porcentaje >= 60 ? C.yellowBg  : C.redBg;
        const pctFg  = alumno.porcentaje >= 80 ? C.greenFg  : alumno.porcentaje >= 60 ? C.yellowFg  : C.redFg;
        setBase(row.getCell(base+4), `${alumno.porcentaje}%`, {
            h: 'center', bg: pctBg,
            font: { bold: true, color: { argb: pctFg } }
        });
    });

    // ── Fila de leyenda ──────────────────────────────────────────
    const legRow = 6 + data.datos.length + 1;
    ws.getRow(legRow).height = 18;
    ws.mergeCells(legRow, 1, legRow, 2);
    const legLabel = ws.getCell(legRow, 1);
    legLabel.value = 'LEYENDA:';
    legLabel.font  = { name: 'Calibri', size: 9, bold: true, color: { argb: '4B5563' } };
    legLabel.alignment = { horizontal: 'right', vertical: 'middle' };

    [{ i:3, t:'P = Presente',    bg: C.greenBg,  fg: C.greenFg },
     { i:4, t:'A = Ausente',     bg: C.redBg,    fg: C.redFg   },
     { i:5, t:'- = Sin registro',bg: C.grayMid,  fg: C.grayText}]
    .forEach(({ i, t, bg, fg }) => {
        const cell = ws.getCell(legRow, i);
        cell.value = t;
        cell.font  = { name: 'Calibri', size: 9, bold: true, color: { argb: fg } };
        cell.fill  = fill(bg);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = allBorders();
    });

    // ── Anchos de columnas ────────────────────────────────────────
    ws.getColumn(1).width = 5;
    ws.getColumn(2).width = 36;
    ws.getColumn(3).width = 13;
    data.fechas.forEach((_, i) => { ws.getColumn(4 + i).width = 8; });
    const bc = 3 + totalFechaCols;
    ws.getColumn(bc+1).width = 11;
    ws.getColumn(bc+2).width = 11;
    ws.getColumn(bc+3).width = 9;
    ws.getColumn(bc+4).width = 11;

    // ── Descargar ─────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob   = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href    = url;
    a.download = `Asistencias_${h.deporte}_${h.categoria}_${nombreMes}${data.anio}.xlsx`
        .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Cargar deportes del profesor
 */
async function cargarDeportesProfesor() {
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const response = await fetch(`${API_BASE}/api/profesor/mis-deportes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.deportes) {
            const select = document.getElementById('filtroDeporte');
            select.innerHTML = '<option value="">Todos los deportes</option>';
            
            data.deportes.forEach(deporte => {
                const option = document.createElement('option');
                option.value = deporte.deporte_id;
                option.textContent = deporte.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar deportes:', error);
    }
}

/**
 * Generar reporte de asistencia
 */
async function generarReporte() {
    const deporteId = document.getElementById('filtroDeporte').value;
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    if (!fechaInicio || !fechaFin) {
        mostrarModal('warning', 'Fechas requeridas', 'Por favor selecciona un rango de fechas para generar el reporte.');
        return;
    }
    
    const loadingContainer = document.getElementById('loadingContainer');
    const estadisticasContainer = document.getElementById('estadisticasContainer');
    const sinDatos = document.getElementById('sinDatos');
    
    loadingContainer.classList.remove('hidden');
    estadisticasContainer.classList.add('hidden');
    sinDatos.classList.add('hidden');
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        let url = `${API_BASE}/api/profesor/reporte-asistencias?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        if (deporteId) {
            url += `&deporte_id=${deporteId}`;
        }
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        loadingContainer.classList.add('hidden');
        
        if (data.success && data.estadisticas) {
            estadisticasContainer.classList.remove('hidden');
            // Diferir la creación del gráfico para que el browser procese el layout primero
            setTimeout(() => mostrarEstadisticas(data.estadisticas), 0);
        } else {
            sinDatos.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('Error al generar reporte:', error);
        loadingContainer.classList.add('hidden');
        mostrarModal('error', 'Error al generar reporte', 'Ocurrió un error al procesar los datos. Por favor, intenta nuevamente.');
    }
}

/**
 * Mostrar estadísticas en la interfaz
 */
function mostrarEstadisticas(stats) {
    // Totales
    document.getElementById('totalAsistencias').textContent = stats.total_presentes || 0;
    document.getElementById('totalAusencias').textContent = stats.total_ausentes || 0;
    
    // Calcular promedio
    const total = (stats.total_presentes || 0) + (stats.total_ausentes || 0);
    const promedio = total > 0 ? ((stats.total_presentes / total) * 100).toFixed(1) : 0;
    document.getElementById('promedioAsistencia').textContent = promedio + '%';
    
    // Gráfica de tendencia
    if (stats.por_fecha && stats.por_fecha.length > 0) {
        crearGraficoTendencia(stats.por_fecha);
    }
    
    // Tabla detalle por alumno
    if (stats.por_alumno && stats.por_alumno.length > 0) {
        renderizarTablaAlumnos(stats.por_alumno);
    }
}

/**
 * Crear gráfico de tendencia con Chart.js
 */
function crearGraficoTendencia(datosPorFecha) {
    const ctx = document.getElementById('graficoAsistencia');
    
    // Destruir gráfico anterior si existe
    if (graficoAsistencia) {
        graficoAsistencia.destroy();
    }
    
    const fechas = datosPorFecha.map(d => {
        const fecha = new Date(d.fecha);
        return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    });
    
    const presentes = datosPorFecha.map(d => d.presentes);
    const ausentes = datosPorFecha.map(d => d.ausentes);
    
    graficoAsistencia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fechas,
            datasets: [
                {
                    label: 'Presentes',
                    data: presentes,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Ausentes',
                    data: ausentes,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/**
 * Renderizar tabla de detalle por alumno
 */
function renderizarTablaAlumnos(datosAlumnos) {
    const tbody = document.getElementById('tablaDetalleAlumnos');
    tbody.innerHTML = '';
    
    datosAlumnos.forEach(alumno => {
        const total = alumno.total_presentes + alumno.total_ausentes;
        const porcentaje = total > 0 ? ((alumno.total_presentes / total) * 100).toFixed(1) : 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-4 py-3 text-sm text-text-main dark:text-white">${alumno.nombre_completo}</td>
            <td class="px-4 py-3 text-sm text-green-600 font-semibold">${alumno.total_presentes}</td>
            <td class="px-4 py-3 text-sm text-red-600 font-semibold">${alumno.total_ausentes}</td>
            <td class="px-4 py-3 text-sm font-bold ${porcentaje >= 80 ? 'text-green-600' : porcentaje >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                ${porcentaje}%
            </td>
        `;
        tbody.appendChild(tr);
    });
}



