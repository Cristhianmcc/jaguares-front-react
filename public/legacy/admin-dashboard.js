/**
 * JavaScript para Dashboard Financiero
 */

let chartDeportes = null;
let chartDistribucion = null;

function initAdminDashboard() {
    verificarSesion();
    cargarEstadisticas();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminDashboard);
} else {
    initAdminDashboard();
}

function verificarSesion() {
    const session = localStorage.getItem('adminSession');
    
    if (!session) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    const data = JSON.parse(session);
    const sessionTime = new Date(data.timestamp).getTime();
    const now = new Date().getTime();
    const hoursElapsed = (now - sessionTime) / (1000 * 60 * 60);
    
    if (hoursElapsed >= 8) {
        localStorage.removeItem('adminSession');
        window.location.href = 'admin-login.html';
        return;
    }
    
    document.getElementById('adminEmail').textContent = data.admin.email;
}

async function cargarEstadisticas() {
    const loadingContainer = document.getElementById('loadingContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    
    loadingContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
    
    try {
        const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
            ? window.API_BASE_OVERRIDE
            : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3002'
                : 'https://api.jaguarescar.com');
        
        // Obtener token de sesión
        const sessionData = JSON.parse(localStorage.getItem('adminSession'));
        const token = sessionData?.token;
        
        if (!token) {
            throw new Error('Token no encontrado. Por favor inicia sesión nuevamente.');
        }
        
        const response = await fetch(`${API_BASE}/api/admin/estadisticas-financieras`, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar datos globalmente para exportar
            estadisticasGlobales = prepararDatosExportacion(data.estadisticas);
            // Mostrar el contenedor ANTES de renderizar para que los canvas tengan dimensiones
            dashboardContainer.classList.remove('hidden');
            renderizarEstadisticas(data.estadisticas);
        } else {
            mostrarError('Error al cargar estadí­sticas: ' + data.error);
        }
    } catch (error) {
        console.error('Error al cargar estadí­sticas:', error);
        mostrarError('Error de conexií³n. Verifica que el servidor estí© activo.');
    } finally {
        loadingContainer.classList.add('hidden');
    }
}

function renderizarEstadisticas(stats) {
    const { resumen, porDeporte, porAlumno, timestamp } = stats;
    
    // Actualizar resumen
    document.getElementById('totalIngresos').textContent = `S/ ${resumen.totalIngresosActivos.toFixed(2)}`;
    document.getElementById('ingresosMes').textContent = `S/ ${resumen.ingresosMes.toFixed(2)}`;
    document.getElementById('ingresosHoy').textContent = `S/ ${resumen.ingresosHoy.toFixed(2)}`;
    document.getElementById('totalMatriculas').textContent = `S/ ${resumen.totalMatriculas.toFixed(2)}`;
    document.getElementById('totalMensualidades').textContent = `S/ ${resumen.totalMensualidades.toFixed(2)}`;
    
    // Timestamp
    const fecha = new Date(timestamp);
    document.getElementById('timestampActualizacion').textContent = fecha.toLocaleString('es-PE');
    
    // Renderizar tablas
    renderizarTablaDeportes(porDeporte);
    renderizarTablaAlumnos(porAlumno);
    
    // Renderizar grí¡ficas
    renderizarGraficas(porDeporte, resumen);
}

function renderizarTablaDeportes(deportes) {
    const tbody = document.getElementById('tablaDeportes');
    tbody.innerHTML = '';
    
    if (deportes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-4 py-8 text-center text-text-muted">
                    No hay datos disponibles
                </td>
            </tr>
        `;
        return;
    }
    
    deportes.forEach((deporte, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors';
        
        row.innerHTML = `
            <td class="px-4 py-3 font-semibold text-black dark:text-white">${deporte.deporte}</td>
            <td class="px-4 py-3 text-right font-mono">S/ ${(deporte.matriculas || 0).toFixed(2)}</td>
            <td class="px-4 py-3 text-right font-mono">S/ ${(deporte.mensualidades || 0).toFixed(2)}</td>
            <td class="px-4 py-3 text-right font-bold font-mono text-primary">S/ ${(deporte.total || 0).toFixed(2)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function renderizarTablaAlumnos(alumnos) {
    const tbody = document.getElementById('tablaAlumnos');
    tbody.innerHTML = '';
    
    if (alumnos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-4 py-8 text-center text-text-muted">
                    No hay datos disponibles
                </td>
            </tr>
        `;
        return;
    }
    
    const top10 = alumnos.slice(0, 10);
    
    top10.forEach((alumno, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors';
        
        const deportesText = alumno.deportes.length > 0 
            ? alumno.deportes.join(', ') 
            : '-';
        
        row.innerHTML = `
            <td class="px-4 py-3 font-mono text-sm font-semibold">${alumno.dni}</td>
            <td class="px-4 py-3">${alumno.nombres}</td>
            <td class="px-4 py-3 text-xs">${deportesText}</td>
            <td class="px-4 py-3 text-right font-mono">S/ ${(alumno.matriculas || 0).toFixed(2)}</td>
            <td class="px-4 py-3 text-right font-mono">S/ ${(alumno.mensualidades || 0).toFixed(2)}</td>
            <td class="px-4 py-3 text-right font-bold font-mono text-primary">S/ ${(alumno.total || 0).toFixed(2)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function renderizarGraficas(deportes, resumen) {
    // Destruir grí¡ficas anteriores
    if (chartDeportes) chartDeportes.destroy();
    if (chartDistribucion) chartDistribucion.destroy();
    
    // Colores profesionales
    const colores = [
        '#C59D5F', // Primary gold
        '#16A34A', // Green
        '#2563EB', // Blue
        '#DC2626', // Red
        '#9333EA', // Purple
        '#EA580C', // Orange
        '#0891B2', // Cyan
        '#CA8A04'  // Yellow
    ];
    
    // Grí¡fica por deporte (Barras horizontales)
    const ctxDeportes = document.getElementById('chartDeportes').getContext('2d');
    chartDeportes = new Chart(ctxDeportes, {
        type: 'bar',
        data: {
            labels: deportes.map(d => d.deporte),
            datasets: [{
                label: 'Total Ingresos (S/)',
                data: deportes.map(d => d.total),
                backgroundColor: colores,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'S/ ' + context.parsed.x.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(197, 157, 95, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'S/ ' + value;
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Grí¡fica de distribucií³n (Doughnut)
    const ctxDistribucion = document.getElementById('chartDistribucion').getContext('2d');
    chartDistribucion = new Chart(ctxDistribucion, {
        type: 'doughnut',
        data: {
            labels: ['Matrí­culas', 'Mensualidades'],
            datasets: [{
                data: [resumen.totalMatriculas, resumen.totalMensualidades],
                backgroundColor: ['#F59E0B', '#C59D5F'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 13,
                            family: 'Lexend'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: S/ ${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function mostrarError(Mensaje) {
    const loadingContainer = document.getElementById('loadingContainer');
    loadingContainer.innerHTML = `
        <div class="text-center py-12">
            <span class="material-symbols-outlined text-6xl text-red-600">error</span>
            <p class="text-red-600 mt-4 font-semibold">${Mensaje}</p>
            <button onclick="location.reload()" class="mt-6 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
                Reintentar
            </button>
        </div>
    `;
}
// Variable global para almacenar los datos
let estadisticasGlobales = null;

function prepararDatosExportacion(stats) {
    const { resumen, porDeporte, porAlumno } = stats;
    
    return {
        totalIngresos: resumen.totalIngresosActivos,
        ingresosMes: resumen.ingresosMes,
        totalInscritos: resumen.totalInscritos || 0,
        matriculasPagadas: resumen.totalMatriculas / 20, // Asumiendo matrí­cula de S/20
        MensualidadesPagadas: porAlumno.length,
        distribucion: {
            matriculas: resumen.totalMatriculas,
            Mensualidades: resumen.totalMensualidades
        },
        deportes: porDeporte.map(d => ({
            nombre: d.deporte,
            matriculas: d.matriculas,
            mensualidades: d.mensualidades,
            total: d.total
        })),
        topAlumnos: porAlumno.slice(0, 10).map(a => ({
            dni: a.dni,
            nombres: `${a.nombres} ${a.apellido_paterno} ${a.apellido_materno}`,
            deportes: a.deporte,
            matriculas: a.matriculas,
            mensualidades: a.mensualidades,
            total: a.total
        }))
    };
}

async function exportarDashboardExcel() {
    if (!estadisticasGlobales) {
        alert('No hay datos para exportar');
        return;
    }

    const wb = XLSX.utils.book_new();
    const fecha = new Date().toLocaleDateString('es-PE');
    const hora = new Date().toLocaleTimeString('es-PE');
    
    // ==================== HOJA 1: resumen GENERAL ====================
    const resumenData = [
        ['DASHBOARD FINANCIERO - ESCUELA DEPORTIVA JAGUARES'],
        [`Generado: ${fecha} ${hora}`],
        [''],
        ['resumen GENERAL'],
        [''],
        ['Mí©trica', 'Valor'],
        ['Total Ingresos Confirmados', `S/ ${estadisticasGlobales.totalIngresos.toFixed(2)}`],
        ['Ingresos del Mes Actual', `S/ ${estadisticasGlobales.ingresosMes.toFixed(2)}`],
        ['Total de Inscritos Activos', estadisticasGlobales.totalInscritos],
        ['Total Matrí­culas Cobradas', Math.floor(estadisticasGlobales.matriculasPagadas)],
        ['Total Mensualidades Cobradas', estadisticasGlobales.MensualidadesPagadas],
        [''],
        [''],
        ['DISTRIBUCIí“N DE INGRESOS'],
        [''],
        ['Concepto', 'Monto (S/)', 'Porcentaje'],
        ['Matrí­culas', estadisticasGlobales.distribucion.matriculas.toFixed(2), `${((estadisticasGlobales.distribucion.matriculas / estadisticasGlobales.totalIngresos) * 100).toFixed(1)}%`],
        ['Mensualidades', estadisticasGlobales.distribucion.Mensualidades.toFixed(2), `${((estadisticasGlobales.distribucion.Mensualidades / estadisticasGlobales.totalIngresos) * 100).toFixed(1)}%`],
        [''],
        ['TOTAL', estadisticasGlobales.totalIngresos.toFixed(2), '100.0%']
    ];
    
    const wsresumen = XLSX.utils.aoa_to_sheet(resumenData);
    
    // Estilos y anchos de columna para resumen
    wsresumen['!cols'] = [
        { wch: 35 },  // Columna A
        { wch: 20 },  // Columna B
        { wch: 15 }   // Columna C
    ];
    
    // Fusionar celdas para el tí­tulo
    wsresumen['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },  // Tí­tulo principal
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },  // Fecha
        { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },  // resumen GENERAL
        { s: { r: 13, c: 0 }, e: { r: 13, c: 2 } } // DISTRIBUCIí“N
    ];
    
    XLSX.utils.book_append_sheet(wb, wsresumen, 'resumen General');
    
    // ==================== HOJA 2: INGRESOS POR DEPORTE ====================
    const deportesData = [
        ['INGRESOS POR DEPORTE'],
        [`Fecha: ${fecha}`],
        [''],
        ['Deporte', 'Matrí­culas (S/)', 'Mensualidades (S/)', 'Total (S/)', 'Part. %']
    ];
    
    let totalMatriculas = 0;
    let totalMensualidades = 0;
    let totalGeneral = 0;
    
    estadisticasGlobales.deportes.forEach(dep => {
        totalMatriculas += dep.matriculas;
        totalMensualidades += dep.mensualidades;
        totalGeneral += dep.total;
        
        const participacion = ((dep.total / estadisticasGlobales.totalIngresos) * 100).toFixed(1);
        
        deportesData.push([
            dep.nombre,
            dep.matriculas.toFixed(2),
            dep.mensualidades.toFixed(2),
            dep.total.toFixed(2),
            `${participacion}%`
        ]);
    });
    
    // Fila de totales
    deportesData.push(['']);
    deportesData.push([
        'TOTAL GENERAL',
        totalMatriculas.toFixed(2),
        totalMensualidades.toFixed(2),
        totalGeneral.toFixed(2),
        '100.0%'
    ]);
    
    const wsDeportes = XLSX.utils.aoa_to_sheet(deportesData);
    
    // Anchos de columna
    wsDeportes['!cols'] = [
        { wch: 30 },  // Deporte
        { wch: 18 },  // Matrí­culas
        { wch: 20 },  // Mensualidades
        { wch: 15 },  // Total
        { wch: 12 }   // Participacií³n
    ];
    
    // Fusionar tí­tulo
    wsDeportes['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }
    ];
    
    XLSX.utils.book_append_sheet(wb, wsDeportes, 'Ingresos por Deporte');
    
    // ==================== HOJA 3: TOP 10 ALUMNOS ====================
    const alumnosData = [
        ['TOP 10 ALUMNOS POR INGRESOS GENERADOS'],
        [`Fecha: ${fecha}`],
        [''],
        ['Pos.', 'DNI', 'Nombres y Apellidos', 'Deportes Inscritos', 'Matrí­culas (S/)', 'Mensualidades (S/)', 'Total (S/)']
    ];
    
    estadisticasGlobales.topAlumnos.forEach((alumno, index) => {
        alumnosData.push([
            index + 1,
            alumno.dni,
            alumno.nombres,
            alumno.deportes,
            alumno.matriculas.toFixed(2),
            alumno.mensualidades.toFixed(2),
            alumno.total.toFixed(2)
        ]);
    });
    
    // Total del top 10
    const totalTop10 = estadisticasGlobales.topAlumnos.reduce((sum, a) => sum + a.total, 0);
    const participacionTop10 = ((totalTop10 / estadisticasGlobales.totalIngresos) * 100).toFixed(1);
    
    alumnosData.push(['']);
    alumnosData.push([
        '',
        '',
        'TOTAL TOP 10',
        '',
        estadisticasGlobales.topAlumnos.reduce((sum, a) => sum + a.matriculas, 0).toFixed(2),
        estadisticasGlobales.topAlumnos.reduce((sum, a) => sum + a.mensualidades, 0).toFixed(2),
        totalTop10.toFixed(2)
    ]);
    alumnosData.push([
        '',
        '',
        `Representan el ${participacionTop10}% del total`,
        '',
        '',
        '',
        ''
    ]);
    
    const wsAlumnos = XLSX.utils.aoa_to_sheet(alumnosData);
    
    // Anchos de columna
    wsAlumnos['!cols'] = [
        { wch: 6 },   // Posicií³n
        { wch: 12 },  // DNI
        { wch: 40 },  // Nombres
        { wch: 30 },  // Deportes
        { wch: 18 },  // Matrí­culas
        { wch: 20 },  // Mensualidades
        { wch: 15 }   // Total
    ];
    
    // Fusionar tí­tulo
    wsAlumnos['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }
    ];
    
    XLSX.utils.book_append_sheet(wb, wsAlumnos, 'Top 10 Alumnos');
    
    // ==================== HOJA 4: ANíLISIS Y Mí‰TRICAS ====================
    const analisisData = [
        ['ANíLISIS Y Mí‰TRICAS ADICIONALES'],
        [`Fecha: ${fecha}`],
        [''],
        ['INDICADORES CLAVE'],
        [''],
        ['Mí©trica', 'Valor', 'Descripcií³n'],
        ['Ingreso Promedio por Alumno', `S/ ${(estadisticasGlobales.totalIngresos / Math.max(estadisticasGlobales.totalInscritos, 1)).toFixed(2)}`, 'Ingresos totales / Total inscritos'],
        ['Ingreso Promedio por Deporte', `S/ ${(estadisticasGlobales.totalIngresos / Math.max(estadisticasGlobales.deportes.length, 1)).toFixed(2)}`, 'Ingresos totales / Cantidad de deportes'],
        ['Ratio Matrí­cula/Mensualidad', `${((estadisticasGlobales.distribucion.matriculas / estadisticasGlobales.distribucion.Mensualidades) * 100).toFixed(1)}%`, 'Proporcií³n de ingresos por matrí­culas vs Mensualidades'],
        ['Deportes Activos', estadisticasGlobales.deportes.length, 'Cantidad de deportes generando ingresos'],
        [''],
        [''],
        ['DEPORTE MíS RENTABLE'],
        ['']
    ];
    
    // Encontrar deporte mí¡s rentable
    const deporteMasRentable = estadisticasGlobales.deportes.reduce((max, dep) => 
        dep.total > max.total ? dep : max
    , estadisticasGlobales.deportes[0]);
    
    analisisData.push(['Deporte:', deporteMasRentable.nombre]);
    analisisData.push(['Ingresos Generados:', `S/ ${deporteMasRentable.total.toFixed(2)}`]);
    analisisData.push(['Participacií³n:', `${((deporteMasRentable.total / estadisticasGlobales.totalIngresos) * 100).toFixed(1)}%`]);
    
    const wsAnalisis = XLSX.utils.aoa_to_sheet(analisisData);
    
    // Anchos de columna
    wsAnalisis['!cols'] = [
        { wch: 35 },
        { wch: 20 },
        { wch: 50 }
    ];
    
    // Fusionar celdas
    wsAnalisis['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
        { s: { r: 12, c: 0 }, e: { r: 12, c: 2 } }
    ];
    
    XLSX.utils.book_append_sheet(wb, wsAnalisis, 'Aní¡lisis');
    
    // Descargar archivo
    const nombreArchivo = `Dashboard_Financiero_Jaguares_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
    
    mostrarNotificacion('âœ… Excel generado con formato profesional', 'success');
}

function mostrarNotificacion(Mensaje, tipo = 'info') {
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const notif = document.createElement('div');
    notif.className = `fixed top-4 right-4 ${colores[tipo]} text-white px-6 py-3 rounded-lg shadow-lg z-[9999] flex items-center gap-2`;
    notif.innerHTML = `
        <span class="material-symbols-outlined">${tipo === 'success' ? 'check_circle' : tipo === 'error' ? 'error' : 'info'}</span>
        <span>${Mensaje}</span>
    `;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transition = 'opacity 0.3s';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}





