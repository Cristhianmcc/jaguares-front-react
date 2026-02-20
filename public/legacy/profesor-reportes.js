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

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    inicializarEventos();
    cargarDeportesProfesor();
    establecerFechasDefecto();
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
        alert('Acceso denegado.');
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
        alert('Por favor seleccione un rango de fechas');
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
            mostrarEstadisticas(data.estadisticas);
            estadisticasContainer.classList.remove('hidden');
        } else {
            sinDatos.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('Error al generar reporte:', error);
        loadingContainer.classList.add('hidden');
        alert('Error al generar reporte. Por favor, intenta nuevamente.');
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



