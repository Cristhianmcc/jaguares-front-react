/**
 * admin-docentes.js
 * Gesti�n de docentes y asignaciones de categor�as/deportes
 */

// Configuraci�n de API - Detectar entorno automáticamente
const API_BASE_URL = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
    ? window.API_BASE_OVERRIDE
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002'
        : 'https://api.jaguarescar.com');

// Helper para obtener fecha local de Per� (UTC-5)
function getFechaLocalPeru() {
    const ahora = new Date();
    const offsetPeru = -5 * 60;
    const offsetLocal = ahora.getTimezoneOffset();
    const diferencia = offsetPeru - offsetLocal;
    const fechaPeru = new Date(ahora.getTime() + diferencia * 60 * 1000);
    return fechaPeru.toISOString().split('T')[0];
}

// Variables globales
let docentes = [];
let asignaciones = [];
let deportes = [];
let categoriasPorDeporte = {};
let currentTab = 'docentes';

// Verificar autenticaci�n al cargar
document.addEventListener('DOMContentLoaded', async () => {
    const session = localStorage.getItem('adminSession');
    
    if (!session) {
        window.location.href = '/admin-login';
        return;
    }

    try {
        const data = JSON.parse(session);
        const sessionTime = new Date(data.timestamp).getTime();
        const now = new Date().getTime();
        const hoursElapsed = (now - sessionTime) / (1000 * 60 * 60);
        
        // Sesi�n expira despu�s de 8 horas
        if (hoursElapsed >= 8) {
            localStorage.removeItem('adminSession');
            window.location.href = '/admin-login';
            return;
        }
        
        // Verificar que sea admin o super_admin (no profesor)
        const rol = data.admin?.rol;
        if (rol === 'profesor') {
            window.location.href = '/profesor';
            return;
        }
        
        document.getElementById('adminEmail').textContent = data.admin.nombre_completo || data.admin.email || data.admin.usuario;
        
    } catch (error) {
        console.error('Error de autenticaci�n:', error);
        localStorage.removeItem('adminSession');
        window.location.href = '/admin-login';
        return;
    }

    // Inicializar
    await cargarDeportes();
    await cargarDocentes();
    await cargarAsignaciones();
    configurarEventos();
    configurarFechasReporte();
});

// Configurar eventos
function configurarEventos() {
    // Cerrar sesi�n
    document.getElementById('btnCerrarSesion')?.addEventListener('click', cerrarSesion);
    document.getElementById('btnCerrarSesionMobile')?.addEventListener('click', cerrarSesion);
    
    // Menú� m�vil
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        document.getElementById('mobile-menu')?.classList.toggle('hidden');
    });
    
    // Formulario de docente
    document.getElementById('form-docente')?.addEventListener('submit', guardarDocente);
    
    // Formulario de asignaci�n
    document.getElementById('form-asignacion')?.addEventListener('submit', crearAsignacion);
    
    // Buscar docente
    document.getElementById('buscarDocente')?.addEventListener('input', filtrarDocentes);
    
    // Cambio de deporte o d�a en asignaci�n - cargar horarios disponibles
    document.getElementById('asig-deporte')?.addEventListener('change', cargarHorariosDisponibles);
    document.getElementById('asig-dia')?.addEventListener('change', cargarHorariosDisponibles);
}

// Cerrar sesi�n
function cerrarSesion() {
    localStorage.removeItem('adminSession');
    window.location.href = '/admin-login';
}

// Obtener token de la sesi�n
function getToken() {
    const session = localStorage.getItem('adminSession');
    if (!session) return null;
    try {
        const data = JSON.parse(session);
        return data.token;
    } catch {
        return null;
    }
}

// Cambiar tabs
function cambiarTab(tab) {
    currentTab = tab;
    
    // Actualizar estilos de tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-primary', 'text-primary');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    document.getElementById(`tab-${tab}`).classList.add('border-primary', 'text-primary');
    document.getElementById(`tab-${tab}`).classList.remove('border-transparent', 'text-gray-500');
    
    // Mostrar/ocultar paneles
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
    document.getElementById(`panel-${tab}`).classList.remove('hidden');
}

// Cargar deportes
async function cargarDeportes() {
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/deportes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            deportes = data.deportes || [];
            
            // Llenar selects de deportes
            const selectAsig = document.getElementById('asig-deporte');
            const selectReporte = document.getElementById('reporte-deporte');
            
            const options = deportes.map(d => 
                `<option value="${d.deporte_id}">${d.nombre}</option>`
            ).join('');
            
            if (selectAsig) selectAsig.innerHTML = '<option value="">Seleccione un deporte...</option>' + options;
            if (selectReporte) selectReporte.innerHTML = '<option value="">Todos los deportes</option>' + options;
        }
    } catch (error) {
        console.error('Error al cargar deportes:', error);
    }
}

// Cargar horarios disponibles cuando se selecciona deporte y d�a
async function cargarHorariosDisponibles() {
    const deporteId = document.getElementById('asig-deporte').value;
    const dia = document.getElementById('asig-dia').value;
    const selectHorario = document.getElementById('asig-horario');
    
    if (!deporteId || !dia) {
        selectHorario.innerHTML = '<option value="">Primero seleccione deporte y d�a...</option>';
        return;
    }
    
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/horarios-disponibles?deporte_id=${deporteId}&dia=${dia}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const horarios = data.horarios || [];
            
            if (horarios.length === 0) {
                selectHorario.innerHTML = '<option value="">No hay horarios para este deporte/d�a</option>';
            } else {
                selectHorario.innerHTML = '<option value="">Seleccione un horario...</option>' + 
                    horarios.map(h => `<option value="${h.horario_id}">${h.categoria} - ${h.hora_inicio} a ${h.hora_fin}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        selectHorario.innerHTML = '<option value="">Error al cargar horarios</option>';
    }
}

// Cargar docentes
async function cargarDocentes() {
    const loading = document.getElementById('loading-docentes');
    const tabla = document.getElementById('tabla-docentes');
    const sinDocentes = document.getElementById('sin-docentes');
    
    loading?.classList.remove('hidden');
    tabla.innerHTML = '';
    sinDocentes?.classList.add('hidden');
    
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/docentes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            docentes = data.docentes || [];
            
            // Stats
            document.getElementById('stat-total-docentes').textContent = docentes.length;
            document.getElementById('stat-docentes-activos').textContent = docentes.filter(d => d.estado === 'activo').length;
            
            // Llenar select de asignaciones
            const selectAsigDocente = document.getElementById('asig-docente');
            if (selectAsigDocente) {
                selectAsigDocente.innerHTML = '<option value="">Seleccione un docente...</option>' +
                    docentes.filter(d => d.estado === 'activo').map(d => 
                        `<option value="${d.admin_id}">${d.nombre_completo}</option>`
                    ).join('');
            }
            
            renderizarDocentes(docentes);
        }
    } catch (error) {
        console.error('Error al cargar docentes:', error);
        mostrarToast('Error al cargar docentes', 'error');
    } finally {
        loading?.classList.add('hidden');
    }
}

// Renderizar tabla de docentes
function renderizarDocentes(lista) {
    const tabla = document.getElementById('tabla-docentes');
    const sinDocentes = document.getElementById('sin-docentes');
    
    if (lista.length === 0) {
        tabla.innerHTML = '';
        sinDocentes?.classList.remove('hidden');
        return;
    }
    
    sinDocentes?.classList.add('hidden');
    
    tabla.innerHTML = lista.map(docente => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div>
                        <p class="font-bold text-black dark:text-white">${docente.nombre_completo}</p>
                        <p class="text-xs text-gray-500">${docente.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">${docente.usuario}</td>
            <td class="px-4 py-4">
                <div class="flex flex-wrap gap-1">
                    ${docente.deportes_asignados ? 
                        docente.deportes_asignados.split(', ').map(d => 
                            `<span class="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded">${d}</span>`
                        ).join('') : 
                        '<span class="text-gray-400 text-xs">Sin asignar</span>'
                    }
                </div>
            </td>
            <td class="px-4 py-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold ${
                    docente.estado === 'activo' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }">
                    ${docente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td class="px-4 py-4 text-sm text-gray-500">
                ${docente.ultimo_acceso ? new Date(docente.ultimo_acceso).toLocaleDateString('es-PE') : 'Nunca'}
            </td>
            <td class="px-4 py-4">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="editarDocente(${docente.admin_id})" class="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-500" title="Editar">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button onclick="abrirModalToggleDocente(${docente.admin_id}, '${docente.estado}')" class="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors text-yellow-600" title="${docente.estado === 'activo' ? 'Desactivar' : 'Activar'}">
                        <span class="material-symbols-outlined">${docente.estado === 'activo' ? 'person_off' : 'person'}</span>
                    </button>
                    <button onclick="resetearPassword(${docente.admin_id})" class="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-purple-500" title="Resetear contrase\u00f1a">
                        <span class="material-symbols-outlined">lock_reset</span>
                    </button>
                    <button onclick="abrirModalEliminarDocente(${docente.admin_id}, '${docente.nombre_completo}')" class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500" title="Eliminar docente">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filtrar docentes
function filtrarDocentes() {
    const busqueda = document.getElementById('buscarDocente').value.toLowerCase();
    const filtrados = docentes.filter(d => 
        d.nombre_completo.toLowerCase().includes(busqueda) ||
        d.usuario.toLowerCase().includes(busqueda) ||
        d.email.toLowerCase().includes(busqueda)
    );
    renderizarDocentes(filtrados);
}

// Cargar asignaciones
async function cargarAsignaciones() {
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/asignaciones-docentes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            asignaciones = data.asignaciones || [];
            
            document.getElementById('stat-asignaciones').textContent = asignaciones.length;
            
            renderizarAsignaciones();
        }
    } catch (error) {
        console.error('Error al cargar asignaciones:', error);
    }
}

// Renderizar asignaciones
function renderizarAsignaciones() {
    const lista = document.getElementById('lista-asignaciones');
    const sinAsig = document.getElementById('sin-asignaciones');
    
    if (asignaciones.length === 0) {
        lista.innerHTML = '';
        sinAsig?.classList.remove('hidden');
        return;
    }
    
    sinAsig?.classList.add('hidden');
    
    lista.innerHTML = asignaciones.map(asig => `
        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary">person</span>
                </div>
                <div>
                    <p class="font-bold text-black dark:text-white">${asig.docente_nombre || 'Sin docente'}</p>
                    <p class="text-sm text-gray-500">
                        ${asig.deporte || 'Sin deporte'} - ${asig.categoria || 'Sin categor�a'}
                        ${asig.dia ? ` (${asig.dia})` : ''}
                        ${asig.hora_inicio && asig.hora_fin ? ` (${String(asig.hora_inicio).slice(0,5)} - ${String(asig.hora_fin).slice(0,5)})` : ''}
                    </p>
                </div>
            </div>
            <button onclick="eliminarAsignacion(${asig.id})" class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-500" title="Eliminar asignaci�n">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
    `).join('');
}

// Abrir modal nuevo docente
function abrirModalNuevoDocente() {
    document.getElementById('modal-docente-titulo').textContent = 'Nuevo Docente';
    document.getElementById('btn-guardar-texto').textContent = 'Crear Docente';
    document.getElementById('docente-id').value = '';
    document.getElementById('form-docente').reset();
    document.getElementById('campo-password').classList.remove('hidden');
    document.getElementById('docente-password').required = true;
    document.getElementById('modal-docente').classList.remove('hidden');
}

// Cerrar modal docente
function cerrarModalDocente() {
    document.getElementById('modal-docente').classList.add('hidden');
}

// Editar docente
function editarDocente(adminId) {
    const docente = docentes.find(d => d.admin_id === adminId);
    if (!docente) return;
    
    document.getElementById('modal-docente-titulo').textContent = 'Editar Docente';
    document.getElementById('btn-guardar-texto').textContent = 'Guardar Cambios';
    document.getElementById('docente-id').value = adminId;
    document.getElementById('docente-nombre').value = docente.nombre_completo;
    document.getElementById('docente-usuario').value = docente.usuario;
    document.getElementById('docente-email').value = docente.email;
    document.getElementById('campo-password').classList.add('hidden');
    document.getElementById('docente-password').required = false;
    document.getElementById('modal-docente').classList.remove('hidden');
}

// Guardar docente
async function guardarDocente(e) {
    e.preventDefault();
    
    const adminId = document.getElementById('docente-id').value;
    const data = {
        nombre_completo: document.getElementById('docente-nombre').value,
        usuario: document.getElementById('docente-usuario').value,
        email: document.getElementById('docente-email').value,
        rol: 'profesor'
    };
    
    if (!adminId) {
        data.password = document.getElementById('docente-password').value;
        if (!data.password || data.password.length < 8) {
            mostrarToast('La contrase�a debe tener al menos 8 caracteres', 'error');
            return;
        }
    }
    
    try {
        const token = getToken();
        const url = adminId 
            ? `${API_BASE_URL}/api/admin/docentes/${adminId}` 
            : `${API_BASE_URL}/api/admin/docentes`;
        
        const response = await fetch(url, {
            method: adminId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            cerrarModalDocente();
            mostrarConfirmacion(
                adminId ? '�Docente Actualizado!' : '�Docente Creado!',
                adminId ? 'Los datos del docente han sido actualizados.' : 'El nuevo docente ha sido creado exitosamente.'
            );
            await cargarDocentes();
        } else {
            mostrarToast(result.error || 'Error al guardar docente', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error de conexi�n', 'error');
    }
}

// Toggle estado docente - abrir modal
let _toggleDocenteId = null;
let _toggleDocenteNuevoEstado = null;

function abrirModalToggleDocente(adminId, estadoActual) {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    _toggleDocenteId = adminId;
    _toggleDocenteNuevoEstado = nuevoEstado;
    const desactivando = nuevoEstado === 'inactivo';
    document.getElementById('toggleDocente-titulo').textContent =
        desactivando ? '¿Desactivar docente?' : '¿Activar docente?';
    document.getElementById('toggleDocente-subtitulo').textContent =
        desactivando
            ? 'El docente no podrá iniciar sesión mientras esté inactivo.'
            : 'El docente podrá volver a iniciar sesión.';
    const btn = document.getElementById('btn-confirmar-toggle');
    btn.className = desactivando
        ? 'flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors'
        : 'flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors';
    document.getElementById('modalToggleDocente').classList.remove('hidden');
}

function cerrarModalToggleDocente() {
    document.getElementById('modalToggleDocente').classList.add('hidden');
    _toggleDocenteId = null;
    _toggleDocenteNuevoEstado = null;
}

async function confirmarToggleDocente() {
    if (!_toggleDocenteId) return;
    cerrarModalToggleDocente();
    await toggleEstadoDocente(_toggleDocenteId, _toggleDocenteNuevoEstado === 'activo' ? 'inactivo' : 'activo');
}

// Toggle estado docente
async function toggleEstadoDocente(adminId, estadoActual) {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/docentes/${adminId}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarToast(`Docente ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`, 'success');
            await cargarDocentes();
        } else {
            mostrarToast(result.error || 'Error al cambiar estado', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error de conexi�n', 'error');
    }
}

// Resetear password
async function resetearPassword(adminId) {
    const nuevaPassword = prompt('Ingrese la nueva contrase�a (m�nimo 8 caracteres):');
    
    if (!nuevaPassword) return;
    
    if (nuevaPassword.length < 8) {
        mostrarToast('La contrase�a debe tener al menos 8 caracteres', 'error');
        return;
    }
    
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/docentes/${adminId}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password: nuevaPassword })
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarConfirmacion('�Contrase�a Actualizada!', 'La contrase�a del docente ha sido cambiada.');
        } else {
            mostrarToast(result.error || 'Error al resetear contrase�a', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error de conexi�n', 'error');
    }
}

// Crear asignaci�n
async function crearAsignacion(e) {
    e.preventDefault();
    
    const horarioId = document.getElementById('asig-horario').value;
    const adminId = document.getElementById('asig-docente').value;
    
    if (!adminId || !horarioId) {
        mostrarToast('Seleccione docente y horario', 'error');
        return;
    }
    
    const data = {
        admin_id: adminId,
        horario_id: horarioId
    };
    
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/asignaciones-docentes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('form-asignacion').reset();
            document.getElementById('asig-horario').innerHTML = '<option value="">Primero seleccione deporte y d�a...</option>';
            mostrarToast('Asignaci�n creada correctamente', 'success');
            await cargarAsignaciones();
            await cargarDocentes();
        } else {
            mostrarToast(result.error || 'Error al crear asignaci�n', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error de conexi�n', 'error');
    }
}

// Eliminar asignaci�n
async function eliminarAsignacion(asignacionId) {
    if (!confirm('�Est� seguro de eliminar esta asignaci�n?')) {
        return;
    }
    
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/asignaciones-docentes/${asignacionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarToast('Asignaci�n eliminada', 'success');
            await cargarAsignaciones();
            await cargarDocentes();
        } else {
            mostrarToast(result.error || 'Error al eliminar', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error de conexi�n', 'error');
    }
}

// Configurar fechas de reporte
function configurarFechasReporte() {
    const fechaHoy = getFechaLocalPeru();
    const [anio, mes] = fechaHoy.split('-');
    const inicioMes = `${anio}-${mes}-01`;
    
    document.getElementById('reporte-fecha-inicio').value = inicioMes;
    document.getElementById('reporte-fecha-fin').value = fechaHoy;
}

// Cargar categorías cuando cambia el deporte en el filtro de reporte
async function cargarCategoriasReporte() {
    const deporteId = document.getElementById('reporte-deporte').value;
    const selectCat = document.getElementById('reporte-categoria');
    const selectDia = document.getElementById('reporte-dia');
    selectCat.innerHTML = '<option value="">Todas las categorías</option>';
    selectDia.innerHTML = '<option value="">Todos los días</option>';
    if (!deporteId) return;
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/categorias?deporte_id=${deporteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            selectCat.innerHTML = '<option value="">Todas las categorías</option>' +
                (data.categorias || []).map(c => `<option value="${c}">${c}</option>`).join('');
        }
    } catch (e) {
        console.error('Error al cargar categorías:', e);
    }
}

// Cargar días cuando cambia la categoría
async function cargarDiasReporte() {
    const deporteId = document.getElementById('reporte-deporte').value;
    const categoria = document.getElementById('reporte-categoria').value;
    const selectDia = document.getElementById('reporte-dia');
    selectDia.innerHTML = '<option value="">Todos los días</option>';
    if (!categoria) return;
    try {
        const token = getToken();
        let url = `${API_BASE_URL}/api/admin/dias`;
        const params = [];
        if (deporteId) params.push(`deporte_id=${deporteId}`);
        if (categoria) params.push(`categoria=${encodeURIComponent(categoria)}`);
        if (params.length) url += '?' + params.join('&');
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) {
            const data = await response.json();
            const labels = { LUNES:'Lunes', MARTES:'Martes', MIERCOLES:'Miércoles', JUEVES:'Jueves', VIERNES:'Viernes', SABADO:'Sábado', DOMINGO:'Domingo' };
            selectDia.innerHTML = '<option value="">Todos los días</option>' +
                (data.dias || []).map(d => `<option value="${d}">${labels[d] || d}</option>`).join('');
        }
    } catch (e) {
        console.error('Error al cargar días:', e);
    }
}

// Cargar reporte de asistencias
async function cargarReporteAsistencias() {
    const fechaInicio = document.getElementById('reporte-fecha-inicio').value;
    const fechaFin = document.getElementById('reporte-fecha-fin').value;
    const deporteId = document.getElementById('reporte-deporte').value;
    const categoria = document.getElementById('reporte-categoria').value;
    const dia = document.getElementById('reporte-dia').value;
    
    if (!fechaInicio || !fechaFin) {
        mostrarToast('Seleccione fechas de inicio y fin', 'error');
        return;
    }
    
    try {
        const token = getToken();
        let url = `${API_BASE_URL}/api/admin/reporte-asistencias?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        if (deporteId) url += `&deporte_id=${deporteId}`;
        if (categoria) url += `&categoria=${encodeURIComponent(categoria)}`;
        if (dia)       url += `&dia=${encodeURIComponent(dia)}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Stats
            const stats = data.estadisticas || {};
            const presentes = parseInt(stats.total_presentes) || 0;
            const ausentes = parseInt(stats.total_ausentes) || 0;
            const total = presentes + ausentes;
            const porcentaje = total > 0 ? ((presentes / total) * 100).toFixed(1) : 0;
            
            document.getElementById('reporte-presentes').textContent = presentes;
            document.getElementById('reporte-ausentes').textContent = ausentes;
            document.getElementById('reporte-total').textContent = total;
            document.getElementById('reporte-porcentaje').textContent = porcentaje + '%';
            
            // Tabla
            const tabla = document.getElementById('tabla-reporte-asistencias');
            const sinReporte = document.getElementById('sin-reporte');
            const detalle = data.detalle || [];
            
            if (detalle.length === 0) {
                tabla.innerHTML = '';
                sinReporte?.classList.remove('hidden');
                document.getElementById('btn-exportar-excel')?.setAttribute('disabled', 'true');
            } else {
                sinReporte?.classList.add('hidden');
                document.getElementById('btn-exportar-excel')?.removeAttribute('disabled');
                tabla.innerHTML = detalle.map(row => {
                    const porcAsist = row.total_registros > 0 
                        ? ((row.total_presentes / row.total_registros) * 100).toFixed(1) 
                        : 0;
                    const colorPorc = porcAsist >= 80 ? 'text-green-500' : porcAsist >= 60 ? 'text-yellow-500' : 'text-red-500';
                    return `
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td class="px-4 py-3 text-sm">${new Date(row.fecha).toLocaleDateString('es-PE')}</td>
                            <td class="px-4 py-3 text-sm font-medium">${row.deporte}</td>
                            <td class="px-4 py-3 text-sm">
                                <span class="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">${row.categoria || '-'}</span>
                            </td>
                            <td class="px-4 py-3 text-sm capitalize">${row.dia ? row.dia.charAt(0) + row.dia.slice(1).toLowerCase() : '-'}</td>
                            <td class="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">${row.hora_inicio || '-'} – ${row.hora_fin || '-'}</td>
                            <td class="px-4 py-3 text-center">
                                <span class="px-2 py-1 bg-green-100 text-green-700 rounded font-bold">${row.total_presentes}</span>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <span class="px-2 py-1 bg-red-100 text-red-700 rounded font-bold">${row.total_ausentes}</span>
                            </td>
                            <td class="px-4 py-3 text-center">
                                <span class="font-bold ${colorPorc}">${porcAsist}%</span>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
    } catch (error) {
        console.error('Error al cargar reporte:', error);
        mostrarToast('Error al cargar reporte', 'error');
    }
}

// Exportar asistencias a Excel
async function exportarExcel() {
    const fechaInicio = document.getElementById('reporte-fecha-inicio').value;
    const fechaFin = document.getElementById('reporte-fecha-fin').value;
    const deporteId = document.getElementById('reporte-deporte').value;
    const categoria = document.getElementById('reporte-categoria').value;
    const dia = document.getElementById('reporte-dia').value;
    
    if (!fechaInicio || !fechaFin) {
        mostrarToast('Seleccione fechas de inicio y fin', 'error');
        return;
    }
    
    try {
        const token = getToken();
        let url = `${API_BASE_URL}/api/admin/exportar-asistencias-excel?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        if (deporteId) url += `&deporte_id=${deporteId}`;
        if (categoria) url += `&categoria=${encodeURIComponent(categoria)}`;
        if (dia)       url += `&dia=${encodeURIComponent(dia)}`;
        
        mostrarToast('Generando Excel...', 'info');
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const urlBlob = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlBlob;
            a.download = `Asistencias_${fechaInicio}_${fechaFin}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(urlBlob);
            
            mostrarToast('Archivo descargado correctamente', 'success');
        } else {
            const error = await response.json();
            mostrarToast(error.error || 'Error al exportar', 'error');
        }
    } catch (error) {
        console.error('Error al exportar Excel:', error);
        mostrarToast('Error al exportar Excel', 'error');
    }
}

// Eliminar docente — modal
let _eliminarDocenteId = null;

function abrirModalEliminarDocente(adminId, nombre) {
    _eliminarDocenteId = adminId;
    document.getElementById('eliminarDocente-nombre').textContent = nombre;
    document.getElementById('modalEliminarDocente').classList.remove('hidden');
}

function cerrarModalEliminarDocente() {
    document.getElementById('modalEliminarDocente').classList.add('hidden');
    _eliminarDocenteId = null;
}

async function confirmarEliminarDocente() {
    if (!_eliminarDocenteId) return;
    const adminId = _eliminarDocenteId;
    cerrarModalEliminarDocente();
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/docentes/${adminId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            mostrarToast('Docente eliminado correctamente', 'success');
            await cargarDocentes();
            await cargarAsignaciones();
        } else {
            mostrarToast(result.error || 'Error al eliminar docente', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error de conexión', 'error');
    }
}

// Toggle password visibility
function togglePassword() {
    const input = document.getElementById('docente-password');
    const icon = document.getElementById('toggle-password-icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
    } else {
        input.type = 'password';
        icon.textContent = 'visibility';
    }
}

// Mostrar confirmaci�n
function mostrarConfirmacion(titulo, Mensaje) {
    document.getElementById('confirmacion-titulo').textContent = titulo;
    document.getElementById('confirmacion-Mensaje').textContent = Mensaje;
    document.getElementById('modal-confirmacion').classList.remove('hidden');
}

// Cerrar modal confirmaci�n
function cerrarModalConfirmacion() {
    document.getElementById('modal-confirmacion').classList.add('hidden');
}

// Mostrar toast
function mostrarToast(Mensaje, tipo = 'info') {
    const toast = document.getElementById('toast');
    const toastMensaje = document.getElementById('toast-Mensaje');
    const toastIcon = document.getElementById('toast-icon');
    
    toastMensaje.textContent = Mensaje;
    
    // Configurar estilo seg�n tipo
    toast.className = 'fixed bottom-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in-down';
    
    switch(tipo) {
        case 'success':
            toast.classList.add('bg-green-500', 'text-white');
            toastIcon.textContent = 'check_circle';
            break;
        case 'error':
            toast.classList.add('bg-red-500', 'text-white');
            toastIcon.textContent = 'error';
            break;
        default:
            toast.classList.add('bg-blue-500', 'text-white');
            toastIcon.textContent = 'info';
    }
    
    toast.classList.remove('hidden');
    
    // Ocultar despu�s de 3 segundos
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}












