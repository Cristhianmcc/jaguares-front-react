/**
 * JavaScript para Gestií³n de Ranking
 */

const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
    ? window.API_BASE_OVERRIDE
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002'
        : 'https://api.jaguarescar.com');

let profesorData = null;
let deportesDisponibles = [];
let alumnosRanking = [];
let alumnoSeleccionado = null;

// Verificar autenticacií³n al cargar
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    inicializarEventos();
    cargarDeportesProfesor();
    setMesActual();
});

/**
 * Verifica que el usuario tenga sesií³n activa y sea profesor
 */
function verificarSesion() {
    const session = localStorage.getItem('adminSession');
    
    if (!session) {
        window.location.href = '/admin-login';
        return;
    }
    
    const data = JSON.parse(session);
    
    if (data.admin.rol !== 'profesor') {
        alert('Acceso denegado. Esta í¡rea es solo para profesores.');
        window.location.href = '/admin-login';
        return;
    }
    
    const sessionTime = new Date(data.timestamp).getTime();
    const now = new Date().getTime();
    const hoursElapsed = (now - sessionTime) / (1000 * 60 * 60);
    
    if (hoursElapsed >= 8) {
        alert('Tu sesií³n ha expirado.');
        localStorage.removeItem('adminSession');
        localStorage.removeItem('admin_token');
        window.location.href = '/admin-login';
        return;
    }
    
    profesorData = data.admin;
    document.getElementById('profesorNombre').textContent = profesorData.nombre_completo || profesorData.email;
}

/**
 * Establecer mes actual en el selector
 */
function setMesActual() {
    const mesActual = new Date().getMonth() + 1;
    document.getElementById('filtroMes').value = mesActual;
}

/**
 * Inicializar eventos
 */
function inicializarEventos() {
    document.getElementById('filtroDeporte').addEventListener('change', onDeporteChange);
    document.getElementById('btnCargarRanking').addEventListener('click', cargarRanking);
    document.getElementById('btnRecalcularAsistencias').addEventListener('click', recalcularAsistencias);
    document.getElementById('btnCancelarBonus').addEventListener('click', cerrarModalBonus);
    document.getElementById('btnGuardarBonus').addEventListener('click', guardarBonus);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('modalBonus').addEventListener('click', (e) => {
        if (e.target.id === 'modalBonus') {
            cerrarModalBonus();
        }
    });
}

/**
 * Cargar deportes asignados al profesor
 */
async function cargarDeportesProfesor() {
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const response = await fetch(`${API_BASE}/api/profesor/mis-deportes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar deportes');
        
        const data = await response.json();
        deportesDisponibles = data.deportes || [];
        
        const select = document.getElementById('filtroDeporte');
        select.innerHTML = '<option value="">Seleccione un deporte...</option>';
        
        deportesDisponibles.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.deporte_id || d.id;
            opt.textContent = d.nombre;
            select.appendChild(opt);
        });
        
    } catch (error) {
        console.error('Error cargando deportes:', error);
        mostrarToast('Error al cargar deportes', 'error');
    }
}

/**
 * Cuando cambia el deporte seleccionado
 */
async function onDeporteChange() {
    const deporteId = document.getElementById('filtroDeporte').value;
    const selectCategoria = document.getElementById('filtroCategoria');
    
    if (!deporteId) {
        selectCategoria.innerHTML = '<option value="">Primero seleccione deporte</option>';
        selectCategoria.disabled = true;
        return;
    }
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const response = await fetch(`${API_BASE}/api/profesor/ranking/categorias/${deporteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar categorí­as');
        
        const data = await response.json();
        const categorias = data.categorias || [];
        
        selectCategoria.innerHTML = '<option value="">Seleccione categorí­a...</option>';
        categorias.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            selectCategoria.appendChild(opt);
        });
        
        selectCategoria.disabled = false;
        
    } catch (error) {
        console.error('Error cargando categorí­as:', error);
        selectCategoria.innerHTML = '<option value="">Error al cargar</option>';
    }
}

/**
 * Cargar ranking de alumnos
 */
async function cargarRanking() {
    const deporteId = document.getElementById('filtroDeporte').value;
    const categoria = document.getElementById('filtroCategoria').value;
    const mes = document.getElementById('filtroMes').value;
    
    if (!deporteId) {
        mostrarToast('Seleccione un deporte', 'error');
        return;
    }
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const cacheBust = Date.now();
        let url = `${API_BASE}/api/profesor/ranking?deporte_id=${deporteId}&mes=${mes}&t=${cacheBust}`;
        if (categoria) {
            url += `&categoria=${encodeURIComponent(categoria)}`;
        }
        
        const response = await fetch(url, {
            cache: 'no-store',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar ranking');
        
        const data = await response.json();
        alumnosRanking = data.alumnos || [];
        
        renderizarRanking();
        
        const seccionAcciones = document.getElementById('seccionAcciones');
        const seccionRanking = document.getElementById('seccionRanking');
        if (seccionAcciones) seccionAcciones.style.display = 'block';
        if (seccionRanking) seccionRanking.style.display = 'block';
        
    } catch (error) {
        console.error('Error cargando ranking:', error);
        mostrarToast('Error al cargar ranking', 'error');
    }
}

/**
 * Renderizar tabla de ranking
 */
function renderizarRanking() {
    const tbody = document.getElementById('tablaRanking');
    const listaMobile = document.getElementById('listaRankingMobile');
    const mensajeVacio = document.getElementById('mensajeVacio');
    const totalAlumnosEl = document.getElementById('totalAlumnos');
    
    if (totalAlumnosEl) totalAlumnosEl.textContent = alumnosRanking.length;
    
    if (alumnosRanking.length === 0) {
        if (tbody) tbody.innerHTML = '';
        if (listaMobile) listaMobile.innerHTML = '';
        if (mensajeVacio) mensajeVacio.style.display = 'block';
        return;
    }
    
    if (mensajeVacio) mensajeVacio.style.display = 'none';
    
    // Ordenar por puntos totales
    alumnosRanking.sort((a, b) => (b.puntos_total || 0) - (a.puntos_total || 0));
    
    // Desktop
    tbody.innerHTML = alumnosRanking.map((alumno, index) => {
        const posicion = index + 1;
        const medalClass = posicion === 1 ? 'text-yellow-500' : posicion === 2 ? 'text-gray-400' : posicion === 3 ? 'text-amber-700' : 'text-text-muted dark:text-gray-400';
        
        return `
            <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td class="py-4 px-4">
                    <span class="font-bold ${medalClass} text-lg">${posicion}</span>
                </td>
                <td class="py-4 px-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <span class="material-symbols-outlined text-primary">person</span>
                        </div>
                        <div>
                            <p class="font-semibold text-black dark:text-white">${alumno.nombre_completo}</p>
                            <p class="text-xs text-text-muted dark:text-gray-400">${alumno.categoria || ''}</p>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-4 text-center">
                    <span class="text-blue-600 dark:text-blue-400 font-bold">${alumno.puntos_asistencia || 0}</span>
                </td>
                <td class="py-4 px-4 text-center">
                    <span class="text-green-600 dark:text-green-400 font-bold">${alumno.puntos_bonus || 0}</span>
                </td>
                <td class="py-4 px-4 text-center">
                    <span class="text-primary font-black text-xl">${alumno.puntos_total || 0}</span>
                </td>
                <td class="py-4 px-4 text-center">
                    <button onclick="abrirModalBonus(${alumno.alumno_id}, '${escapeHtml(alumno.nombre_completo)}', ${alumno.puntos_bonus || 0})" 
                            class="px-3 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg text-sm transition-colors inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">star</span>
                        Bonus
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Mobile
    listaMobile.innerHTML = alumnosRanking.map((alumno, index) => {
        const posicion = index + 1;
        const medalClass = posicion === 1 ? 'bg-yellow-500' : posicion === 2 ? 'bg-gray-400' : posicion === 3 ? 'bg-amber-700' : 'bg-gray-300 dark:bg-gray-600';
        
        return `
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 ${medalClass} rounded-full flex items-center justify-center">
                        <span class="font-black text-white">${posicion}</span>
                    </div>
                    <div class="flex-1">
                        <p class="font-bold text-black dark:text-white">${alumno.nombre_completo}</p>
                        <p class="text-xs text-text-muted dark:text-gray-400">${alumno.categoria || ''}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-black text-primary">${alumno.puntos_total || 0}</p>
                        <p class="text-xs text-text-muted dark:text-gray-400">puntos</p>
                    </div>
                </div>
                <div class="mt-4 flex items-center justify-between">
                    <div class="flex gap-4 text-sm">
                        <span class="text-blue-600 dark:text-blue-400">Asist: ${alumno.puntos_asistencia || 0}</span>
                        <span class="text-green-600 dark:text-green-400">Bonus: ${alumno.puntos_bonus || 0}</span>
                    </div>
                    <button onclick="abrirModalBonus(${alumno.alumno_id}, '${escapeHtml(alumno.nombre_completo)}', ${alumno.puntos_bonus || 0})" 
                            class="px-3 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded text-sm transition-colors">
                        + Bonus
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Escape HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function ajustarBonus(delta) {
    const input = document.getElementById('inputPuntosBonus');
    input.value = (parseInt(input.value) || 0) + delta;
}

function abrirModalBonus(alumnoId, nombre, puntosActuales) {
    alumnoSeleccionado = alumnoId;
    bonusActualSeleccionado = parseInt(puntosActuales) || 0;
    document.getElementById('modalAlumnoNombre').textContent = nombre;
    document.getElementById('inputPuntosBonus').value = bonusActualSeleccionado;
    document.getElementById('bonusActualLabel').textContent = bonusActualSeleccionado;
    document.getElementById('inputMotivo').value = '';
    document.getElementById('modalBonus').classList.remove('hidden');
}

/**
 * Cerrar modal de bonus
 */
function cerrarModalBonus() {
    document.getElementById('modalBonus').classList.add('hidden');
    alumnoSeleccionado = null;
}

/**
 * Guardar puntos bonus
 */
async function guardarBonus() {
    if (!alumnoSeleccionado) return;
    
    const puntosFinal = parseInt(document.getElementById('inputPuntosBonus').value) || 0;
    const motivo = document.getElementById('inputMotivo').value.trim();
    const deporteId = document.getElementById('filtroDeporte').value;
    const categoria = document.getElementById('filtroCategoria').value;
    const mes = parseInt(document.getElementById('filtroMes').value);
    const anio = new Date().getFullYear();
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const response = await fetch(`${API_BASE}/api/profesor/ranking/bonus`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                alumno_id: alumnoSeleccionado,
                deporte_id: deporteId,
                categoria: categoria,
                puntos_bonus: puntosFinal,
                motivo: motivo,
                mes: mes,
                anio: anio
            })
        });
        
        if (!response.ok) throw new Error('Error al guardar bonus');
        
        const diff = puntosFinal - bonusActualSeleccionado;
        const msg = diff > 0
            ? `+${diff} puntos bonus asignados`
            : diff < 0
            ? `${diff} puntos bonus descontados`
            : 'Bonus actualizado sin cambios';
        mostrarToast(msg);
        cerrarModalBonus();
        
        // Recargar ranking
        cargarRanking();
        
    } catch (error) {
        console.error('Error guardando bonus:', error);
        mostrarToast('Error al guardar puntos', 'error');
    }
}

/**
 * Recalcular puntos de asistencia
 */
function cerrarModalRecalcular() {
    document.getElementById('modalRecalcular').classList.add('hidden');
}

async function confirmarRecalcular() {
    cerrarModalRecalcular();
    const deporteId = document.getElementById('filtroDeporte').value;
    const categoria = document.getElementById('filtroCategoria').value;
    const mes = parseInt(document.getElementById('filtroMes').value);
    const anio = new Date().getFullYear();
    const btn = document.getElementById('btnRecalcularAsistencias');
    const textoOriginal = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Calculando...';
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        const response = await fetch(`${API_BASE}/api/profesor/ranking/calcular-asistencias`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ deporte_id: deporteId, categoria: categoria || null, mes, anio })
        });
        if (!response.ok) throw new Error('Error al recalcular');
        const result = await response.json();
        mostrarToast(`Puntos recalculados: ${result.actualizados || result.total || 0} alumnos`);
        cargarRanking();
    } catch (error) {
        console.error('Error recalculando:', error);
        mostrarToast('Error al recalcular puntos', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = textoOriginal;
    }
}

async function recalcularAsistencias() {
    const deporteId = document.getElementById('filtroDeporte').value;
    if (!deporteId) {
        mostrarToast('Seleccione un deporte', 'error');
        return;
    }
    document.getElementById('modalRecalcular').classList.remove('hidden');
}

/**
 * Mostrar toast notification
 */
function mostrarToast(Mensaje, tipo = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastDiv = toast.querySelector('div');
    
    toastMessage.textContent = Mensaje;
    
    if (tipo === 'error') {
        toastDiv.className = 'bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2';
        toastDiv.querySelector('span').textContent = 'error';
    } else {
        toastDiv.className = 'bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2';
        toastDiv.querySelector('span').textContent = 'check_circle';
    }
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}




