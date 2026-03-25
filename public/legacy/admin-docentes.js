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
                    <button onclick="verClasesDocente(${docente.admin_id}, '${docente.nombre_completo.replace(/'/g, "\\'")}')" class="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary" title="Ver clases y alumnos">
                        <span class="material-symbols-outlined">calendar_month</span>
                    </button>
                    <button onclick="editarDocente(${docente.admin_id})" class="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-500" title="Editar">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button onclick="abrirModalToggleDocente(${docente.admin_id}, '${docente.estado}')" class="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors text-yellow-600" title="${docente.estado === 'activo' ? 'Desactivar' : 'Activar'}">
                        <span class="material-symbols-outlined">${docente.estado === 'activo' ? 'person_off' : 'person'}</span>
                    </button>
                    <button onclick="resetearPassword(${docente.admin_id})" class="p-2 rounded-lg transition-colors" style="color:#8b5cf6;" onmouseover="this.style.background='#f3e8ff'" onmouseout="this.style.background='transparent'" title="Resetear contrase\u00f1a">
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
                (data.categorias || []).map(c => { const n = typeof c === 'object' ? c.nombre : c; return `<option value="${n}">${n}</option>`; }).join('');
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

// Exportar asistencias a Excel con ExcelJS (estilos completos)
async function exportarExcel() {
    const fechaInicio = document.getElementById('reporte-fecha-inicio').value;
    const fechaFin    = document.getElementById('reporte-fecha-fin').value;
    const deporteId   = document.getElementById('reporte-deporte').value;
    const categoria   = document.getElementById('reporte-categoria').value;
    const dia         = document.getElementById('reporte-dia').value;

    if (!fechaInicio || !fechaFin) {
        mostrarToast('Seleccione fechas de inicio y fin', 'error');
        return;
    }

    const btn = document.getElementById('btn-exportar-excel');
    if (btn) btn.setAttribute('disabled', 'true');
    mostrarToast('Generando Excel...', 'info');

    try {
        const token = getToken();
        let url = `${API_BASE_URL}/api/admin/exportar-asistencias-json?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        if (deporteId) url += `&deporte_id=${deporteId}`;
        if (categoria) url += `&categoria=${encodeURIComponent(categoria)}`;
        if (dia)       url += `&dia=${encodeURIComponent(dia)}`;

        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();

        if (!response.ok || !data.success) {
            mostrarToast(data.error || 'Error al obtener datos', 'error');
            return;
        }

        if (!data.rows || data.rows.length === 0) {
            mostrarToast('No hay registros en ese período', 'warning');
            return;
        }

        await generarExcelAdmin(data);
        mostrarToast('Archivo descargado correctamente', 'success');
    } catch (error) {
        console.error('Error al exportar Excel:', error);
        mostrarToast('Error al exportar Excel', 'error');
    } finally {
        if (btn) btn.removeAttribute('disabled');
    }
}

async function generarExcelAdmin(data) {
    const ExcelJS = window.ExcelJS;
    const { rows, filtros } = data;

    // Paleta (misma que profesor)
    const C = {
        gold: 'C59D5F', goldDark: 'B08546',
        darkBg: '1A1A1A', darkBg2: '374151',
        white: 'FFFFFF', grayLight: 'F9FAFB', grayMid: 'F3F4F6',
        grayText: '6B7280', grayBorder: 'D1D5DB',
        greenBg: 'DCFCE7', greenFg: '166534', greenLightBg: 'F0FDF4',
        redBg: 'FEE2E2', redFg: '991B1B', redLightBg: 'FFF1F2',
    };
    const fill     = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
    const thin     = (c)    => ({ style: 'thin',   color: { argb: c || C.grayBorder } });
    const medium   = (c)    => ({ style: 'medium', color: { argb: c || C.goldDark } });
    const allThin  = ()     => ({ top: thin(), left: thin(), bottom: thin(), right: thin() });
    const allBold  = ()     => ({ top: medium(), left: medium(), bottom: medium(), right: medium() });

    const fechaLabel = `${filtros.fecha_inicio} al ${filtros.fecha_fin}`;
    const totalCols  = 9; // Fecha | Deporte | Categoría | Día | Horario | Alumno | DNI | Asistencia | —
    // We'll use 8 data cols
    const NCOLS = 8;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'JAGUARES';
    workbook.created = new Date();
    const ws = workbook.addWorksheet('Asistencias', {
        pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 }
    });

    // Fila 1: Título
    ws.mergeCells(1, 1, 1, NCOLS);
    const r1 = ws.getCell(1, 1);
    r1.value     = 'JAGUARES — REPORTE DE ASISTENCIAS';
    r1.font      = { name: 'Calibri', size: 16, bold: true, color: { argb: C.gold } };
    r1.fill      = fill(C.darkBg);
    r1.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 30;

    // Fila 2: Período y filtros
    ws.mergeCells(2, 1, 2, NCOLS);
    const partes = [`Período: ${fechaLabel}`];
    if (filtros.categoria) partes.push(`Categoría: ${filtros.categoria}`);
    if (filtros.dia)       partes.push(`Día: ${filtros.dia}`);
    const r2 = ws.getCell(2, 1);
    r2.value     = partes.join('   │   ');
    r2.font      = { name: 'Calibri', size: 11, bold: true, color: { argb: C.white } };
    r2.fill      = fill(C.darkBg2);
    r2.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 22;

    // Fila 3: Fecha generación + total
    ws.mergeCells(3, 1, 3, NCOLS);
    const presentes = rows.filter(r => r.presente == 1).length;
    const r3 = ws.getCell(3, 1);
    r3.value     = `Generado: ${new Date().toLocaleDateString('es-ES')}   │   Total registros: ${rows.length}   │   Presentes: ${presentes}   │   Ausentes: ${rows.length - presentes}`;
    r3.font      = { name: 'Calibri', size: 10, italic: true, color: { argb: '4B5563' } };
    r3.fill      = fill(C.grayLight);
    r3.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(3).height = 18;

    ws.getRow(4).height = 6; // separador

    // Fila 5: Encabezados
    const headers = ['Fecha', 'Deporte', 'Categoría', 'Día', 'Horario', 'Alumno', 'DNI', 'Asistencia'];
    const headerRow = ws.getRow(5);
    headerRow.height = 26;
    headers.forEach((txt, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value     = txt;
        cell.font      = { name: 'Calibri', size: 10, bold: true, color: { argb: C.white } };
        cell.fill      = fill(C.gold);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border    = allBold();
    });

    // Filas de datos
    rows.forEach((row, idx) => {
        const rn   = 6 + idx;
        const r    = ws.getRow(rn);
        r.height   = 19;
        const par  = idx % 2 === 0;
        const bgFila = par ? C.white : C.grayMid;

        const set = (col, value, opts = {}) => {
            const cell = r.getCell(col);
            cell.value     = value;
            cell.font      = { name: 'Calibri', size: 10, color: { argb: opts.fg || '1A1A1A' }, bold: !!opts.bold };
            cell.fill      = fill(opts.bg || bgFila);
            cell.alignment = { vertical: 'middle', horizontal: opts.h || 'left' };
            cell.border    = allThin();
        };

        const d = new Date(row.fecha);
        const fechaStr = `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;

        set(1, fechaStr,                      { h: 'center' });
        set(2, row.deporte);
        set(3, row.categoria,                 { h: 'center' });
        set(4, row.dia,                       { h: 'center' });
        set(5, `${row.hora_inicio}–${row.hora_fin}`, { h: 'center' });
        set(6, row.alumno.trim());
        set(7, row.dni,                       { h: 'center' });

        const presente = row.presente == 1;
        set(8, presente ? 'Presente' : 'Ausente', {
            h: 'center',
            bold: true,
            bg:  presente ? (par ? C.greenLightBg : C.greenBg) : (par ? C.redLightBg : C.redBg),
            fg:  presente ? C.greenFg : C.redFg,
        });
    });

    // Anchos de columna
    [10, 20, 14, 9, 14, 38, 12, 12].forEach((w, i) => { ws.getColumn(i + 1).width = w; });

    // Descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob   = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `Asistencias_${filtros.fecha_inicio}_${filtros.fecha_fin}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ==================== CLASES POR DOCENTE ====================

let _clasesDocenteActual = null; // { adminId, nombre, clases }
let _alumnosClaseActual = null;  // { horario, alumnos, asistencias }

// Ver clases de un docente (modal)
async function verClasesDocente(adminId, nombre) {
    const modal = document.getElementById('modal-clases-docente');
    const loading = document.getElementById('loading-clases-docente');
    const lista = document.getElementById('lista-clases-docente');
    const sinClases = document.getElementById('sin-clases-docente');

    document.getElementById('modal-clases-titulo').textContent = 'Clases de ' + nombre;
    document.getElementById('modal-clases-subtitulo').textContent = 'Horarios y alumnos asignados';

    modal.classList.remove('hidden');
    loading.classList.remove('hidden');
    lista.innerHTML = '';
    sinClases.classList.add('hidden');

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/admin/docente-clases/${adminId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!data.success) {
            mostrarToast(data.error || 'Error al obtener clases', 'error');
            modal.classList.add('hidden');
            return;
        }

        const clases = data.clases || [];
        _clasesDocenteActual = { adminId, nombre, clases };

        if (clases.length === 0) {
            sinClases.classList.remove('hidden');
        } else {
            const labels = { LUNES:'Lunes', MARTES:'Martes', MIERCOLES:'Miércoles', JUEVES:'Jueves', VIERNES:'Viernes', SABADO:'Sábado', DOMINGO:'Domingo' };
            lista.innerHTML = clases.map(c => {
                const diaLabel = labels[c.dia] || c.dia;
                const horaI = String(c.hora_inicio).slice(0,5);
                const horaF = String(c.hora_fin).slice(0,5);
                return `
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span class="material-symbols-outlined text-primary">sports</span>
                        </div>
                        <div>
                            <p class="font-bold text-black dark:text-white">${c.deporte} - ${c.categoria}</p>
                            <p class="text-sm text-gray-500">${diaLabel} · ${horaI} - ${horaF}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 rounded-full text-xs font-bold ${c.total_alumnos > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
                            ${c.total_alumnos} alumno${c.total_alumnos !== 1 ? 's' : ''}
                        </span>
                        <button onclick="verAlumnosClase('${c.horario_ids}', '${c.deporte}', '${c.categoria}', '${diaLabel}', '${horaI} - ${horaF}', '${nombre.replace(/'/g, "\\'")}')" class="px-3 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-1" title="Ver alumnos">
                            <span class="material-symbols-outlined text-lg">group</span>
                            Ver
                        </button>
                    </div>
                </div>`;
            }).join('');
        }
    } catch (error) {
        console.error('Error al cargar clases del docente:', error);
        mostrarToast('Error de conexión', 'error');
        modal.classList.add('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

function cerrarModalClasesDocente() {
    document.getElementById('modal-clases-docente').classList.add('hidden');
    _clasesDocenteActual = null;
}

// Ver alumnos de una clase específica
// Parámetros de la clase actual para poder refiltrar por fecha
let _alumnosClaseParams = null;

async function verAlumnosClase(horarioIds, deporte, categoria, dia, hora, docenteNombre) {
    _alumnosClaseParams = { horarioIds, deporte, categoria, dia, hora, docenteNombre };

    // Configurar fechas por defecto: último mes
    const fechaHoy = getFechaLocalPeru();
    const d30 = new Date(fechaHoy);
    d30.setDate(d30.getDate() - 30);
    const fechaInicio = d30.toISOString().split('T')[0];

    document.getElementById('alumnos-fecha-inicio').value = fechaInicio;
    document.getElementById('alumnos-fecha-fin').value = fechaHoy;

    document.getElementById('modal-alumnos-titulo').textContent = deporte + ' - ' + categoria;
    document.getElementById('modal-alumnos-subtitulo').textContent = dia + ' · ' + hora + ' — Prof. ' + docenteNombre;
    document.getElementById('modal-alumnos-clase').classList.remove('hidden');

    await cargarAlumnosClase(horarioIds, fechaInicio, fechaHoy);
}

// Re-buscar al cambiar fechas
async function filtrarAlumnosClasePorFecha() {
    if (!_alumnosClaseParams) return;
    const fechaInicio = document.getElementById('alumnos-fecha-inicio').value;
    const fechaFin = document.getElementById('alumnos-fecha-fin').value;
    if (!fechaInicio || !fechaFin) {
        mostrarToast('Seleccione ambas fechas', 'error');
        return;
    }
    await cargarAlumnosClase(_alumnosClaseParams.horarioIds, fechaInicio, fechaFin);
}

async function cargarAlumnosClase(horarioIds, fechaInicio, fechaFin) {
    const loading = document.getElementById('loading-alumnos-clase');
    const tabla = document.getElementById('tabla-alumnos-clase');
    const sinAlumnos = document.getElementById('sin-alumnos-clase');
    const wrapper = document.getElementById('tabla-alumnos-clase-wrapper');
    const rangoInfo = document.getElementById('alumnos-rango-info');
    const listaFechas = document.getElementById('lista-clases-fecha');
    const sinFechas = document.getElementById('sin-clases-fecha');

    loading.classList.remove('hidden');
    tabla.innerHTML = '';
    sinAlumnos.classList.add('hidden');
    wrapper.classList.add('hidden');
    rangoInfo.textContent = '';
    listaFechas.innerHTML = '';
    sinFechas.classList.add('hidden');

    // Mostrar tab resumen por defecto al cargar
    cambiarTabAlumnos('resumen');

    const { deporte, categoria, dia, hora, docenteNombre } = _alumnosClaseParams;

    try {
        const token = getToken();
        const url = `${API_BASE_URL}/api/admin/docente-clase-alumnos?horario_ids=${horarioIds}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!data.success) {
            mostrarToast(data.error || 'Error al obtener alumnos', 'error');
            return;
        }

        const alumnos = data.alumnos || [];
        const asistencias = (data.asistencias || []).map(a => ({
            ...a,
            fecha: typeof a.fecha === 'string' ? a.fecha.split('T')[0] : new Date(a.fecha).toISOString().split('T')[0]
        }));

        // Calcular total de clases dictadas (fechas únicas con registro)
        const fechasUnicas = [...new Set(asistencias.map(a => a.fecha))].sort().reverse();
        const totalClases = fechasUnicas.length;

        rangoInfo.textContent = `${totalClases} clase${totalClases !== 1 ? 's' : ''} registrada${totalClases !== 1 ? 's' : ''} entre ${new Date(fechaInicio + 'T12:00:00').toLocaleDateString('es-PE')} y ${new Date(fechaFin + 'T12:00:00').toLocaleDateString('es-PE')}`;

        _alumnosClaseActual = {
            horario: data.horario,
            alumnos,
            asistencias,
            deporte, categoria, dia, hora, docenteNombre,
            fechaInicio, fechaFin,
            totalClases
        };

        if (alumnos.length === 0) {
            sinAlumnos.classList.remove('hidden');
        } else {
            wrapper.classList.remove('hidden');

            // --- Tabla resumen ---
            const asistPorAlumno = {};
            alumnos.forEach(a => { asistPorAlumno[a.alumno_id] = { presentes: 0, ausentes: 0 }; });
            asistencias.forEach(a => {
                if (asistPorAlumno[a.alumno_id]) {
                    if (a.presente == 1) asistPorAlumno[a.alumno_id].presentes++;
                    else asistPorAlumno[a.alumno_id].ausentes++;
                }
            });

            tabla.innerHTML = alumnos.map((a, idx) => {
                const stats = asistPorAlumno[a.alumno_id] || { presentes: 0, ausentes: 0 };
                const total = stats.presentes + stats.ausentes;
                const porc = total > 0 ? ((stats.presentes / total) * 100).toFixed(0) : '-';
                const colorPorc = porc === '-' ? 'text-gray-400' : (porc >= 80 ? 'text-green-600' : porc >= 60 ? 'text-yellow-600' : 'text-red-600');
                return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td class="px-4 py-3 text-sm text-gray-500">${idx + 1}</td>
                    <td class="px-4 py-3 text-sm font-medium text-black dark:text-white">${a.nombre_completo}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">${a.dni || '-'}</td>
                    <td class="px-4 py-3 text-center">
                        <span class="px-2 py-1 bg-green-100 text-green-700 rounded font-bold text-sm">${stats.presentes} <span class="font-normal text-xs text-green-600">/ ${totalClases}</span></span>
                    </td>
                    <td class="px-4 py-3 text-center">
                        <span class="px-2 py-1 bg-red-100 text-red-700 rounded font-bold text-sm">${stats.ausentes}</span>
                    </td>
                    <td class="px-4 py-3 text-center">
                        <span class="font-bold ${colorPorc}">${porc}${porc !== '-' ? '%' : ''}</span>
                    </td>
                </tr>`;
            }).join('');

            // --- Detalle por fecha ---
            if (fechasUnicas.length === 0) {
                sinFechas.classList.remove('hidden');
            } else {
                renderizarDetallePorFecha(fechasUnicas, alumnos, asistencias);
            }
        }
    } catch (error) {
        console.error('Error al cargar alumnos de la clase:', error);
        mostrarToast('Error de conexión', 'error');
    } finally {
        loading.classList.add('hidden');
    }
}

// Renderizar detalle por cada fecha de clase
function renderizarDetallePorFecha(fechasUnicas, alumnos, asistencias) {
    const lista = document.getElementById('lista-clases-fecha');
    const diasLabels = { 0:'Domingo', 1:'Lunes', 2:'Martes', 3:'Miércoles', 4:'Jueves', 5:'Viernes', 6:'Sábado' };

    lista.innerHTML = fechasUnicas.map((fechaRaw, fIdx) => {
        const fechaObj = new Date(fechaRaw + 'T12:00:00');
        const diaLabel = diasLabels[fechaObj.getDay()];
        const fechaStr = fechaObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

        // Asistencias de esta fecha
        const asistFecha = asistencias.filter(a => a.fecha === fechaRaw);
        const presentes = asistFecha.filter(a => a.presente == 1);
        const ausentes = asistFecha.filter(a => a.presente == 0);
        const totalReg = asistFecha.length;
        const porcFecha = totalReg > 0 ? Math.round((presentes.length / totalReg) * 100) : 0;
        const colorPorc = porcFecha >= 80 ? 'text-green-600' : porcFecha >= 60 ? 'text-yellow-600' : 'text-red-600';

        // Mapear alumno_id a nombre
        const alumnoMap = {};
        alumnos.forEach(a => { alumnoMap[a.alumno_id] = a.nombre_completo; });

        const presentesList = presentes.map(p => alumnoMap[p.alumno_id] || 'Desconocido');
        const ausentesList = ausentes.map(p => alumnoMap[p.alumno_id] || 'Desconocido');

        return `
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button onclick="toggleDetalleFecha('fecha-${fIdx}')" class="w-full flex items-center justify-between p-4 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-primary">event</span>
                    </div>
                    <div>
                        <p class="font-bold text-black dark:text-white">${diaLabel} ${fechaStr}</p>
                        <p class="text-xs text-gray-500">${totalReg} alumno${totalReg !== 1 ? 's' : ''} registrado${totalReg !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">${presentes.length} ✓</span>
                    <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">${ausentes.length} ✗</span>
                    <span class="font-bold text-sm ${colorPorc}">${porcFecha}%</span>
                    <span class="material-symbols-outlined text-gray-400 transition-transform" id="icon-fecha-${fIdx}">expand_more</span>
                </div>
            </button>
            <div id="fecha-${fIdx}" class="hidden border-t border-gray-200 dark:border-gray-700">
                <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs font-bold uppercase text-green-600 mb-2 flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">check_circle</span>
                            Presentes (${presentes.length})
                        </p>
                        ${presentesList.length > 0
                            ? presentesList.map(n => `<p class="text-sm text-gray-700 dark:text-gray-300 py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">${n}</p>`).join('')
                            : '<p class="text-sm text-gray-400 italic">Ninguno</p>'
                        }
                    </div>
                    <div>
                        <p class="text-xs font-bold uppercase text-red-600 mb-2 flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">cancel</span>
                            Ausentes (${ausentes.length})
                        </p>
                        ${ausentesList.length > 0
                            ? ausentesList.map(n => `<p class="text-sm text-gray-700 dark:text-gray-300 py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">${n}</p>`).join('')
                            : '<p class="text-sm text-gray-400 italic">Ninguno</p>'
                        }
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

// Toggle expandir/colapsar fecha
function toggleDetalleFecha(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        el.classList.add('hidden');
        if (icon) icon.style.transform = '';
    }
}

// Cambiar tabs dentro del modal de alumnos
function cambiarTabAlumnos(tab) {
    // Actualizar estilos
    ['resumen', 'porfecha'].forEach(t => {
        const btn = document.getElementById('tab-alumnos-' + t);
        const panel = document.getElementById('panel-alumnos-' + t);
        if (t === tab) {
            btn.classList.add('border-primary', 'text-primary');
            btn.classList.remove('border-transparent', 'text-gray-500');
            panel.classList.remove('hidden');
        } else {
            btn.classList.remove('border-primary', 'text-primary');
            btn.classList.add('border-transparent', 'text-gray-500');
            panel.classList.add('hidden');
        }
    });
}

function cerrarModalAlumnosClase() {
    document.getElementById('modal-alumnos-clase').classList.add('hidden');
    _alumnosClaseActual = null;
    _alumnosClaseParams = null;
}

// Descargar Excel de alumnos de clase del docente (con detalle por fecha)
async function descargarExcelAlumnosClase() {
    if (!_alumnosClaseActual) return;
    const { alumnos, asistencias, deporte, categoria, dia, hora, docenteNombre, fechaInicio, fechaFin, totalClases } = _alumnosClaseActual;

    if (alumnos.length === 0) {
        mostrarToast('No hay alumnos para exportar', 'warning');
        return;
    }

    mostrarToast('Generando Excel...', 'info');

    try {
        const ExcelJS = window.ExcelJS;
        const diasAbrev = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
        const C = {
            gold: 'C59D5F', goldDark: 'B08546',
            darkBg: '1A1A1A', darkBg2: '374151',
            white: 'FFFFFF', grayLight: 'F9FAFB', grayMid: 'F3F4F6',
            grayText: '6B7280', grayBorder: 'D1D5DB',
            greenBg: 'DCFCE7', greenFg: '166534', greenLightBg: 'F0FDF4',
            redBg: 'FEE2E2', redFg: '991B1B', redLightBg: 'FFF1F2',
            yellowBg: 'FEF3C7', yellowFg: '92400E',
        };
        const fill   = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
        const thin   = (c) => ({ style: 'thin', color: { argb: c || C.grayBorder } });
        const medium = (c) => ({ style: 'medium', color: { argb: c || C.goldDark } });
        const allThin = () => ({ top: thin(), left: thin(), bottom: thin(), right: thin() });
        const allBold = () => ({ top: medium(), left: medium(), bottom: medium(), right: medium() });

        // Obtener fechas únicas ordenadas
        const fechasSet = new Set();
        asistencias.forEach(a => {
            const f = a.fecha instanceof Date ? a.fecha.toISOString().split('T')[0] : String(a.fecha).split('T')[0];
            fechasSet.add(f);
        });
        const fechas = [...fechasSet].sort();

        // Mapa: alumno_id -> { fecha -> presente }
        const mapaAsist = {};
        alumnos.forEach(a => { mapaAsist[a.alumno_id] = {}; });
        asistencias.forEach(a => {
            const f = a.fecha instanceof Date ? a.fecha.toISOString().split('T')[0] : String(a.fecha).split('T')[0];
            if (mapaAsist[a.alumno_id]) {
                mapaAsist[a.alumno_id][f] = a.presente == 1 ? 1 : 0;
            }
        });

        const totalFechaCols = fechas.length;
        const NCOLS = 3 + totalFechaCols + 4; // #, Nombre, DNI, ...fechas, Presentes, Ausentes, Total, %

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'JAGUARES';
        const ws = workbook.addWorksheet('Registro Asistencias', {
            pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 }
        });

        // Fila 1: Título
        ws.mergeCells(1, 1, 1, NCOLS);
        const c1 = ws.getCell(1, 1);
        c1.value = 'JAGUARES — REGISTRO DE ASISTENCIAS';
        c1.font = { name: 'Calibri', size: 16, bold: true, color: { argb: C.gold } };
        c1.fill = fill(C.darkBg);
        c1.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(1).height = 30;

        // Fila 2: Info clase
        ws.mergeCells(2, 1, 2, NCOLS);
        const c2 = ws.getCell(2, 1);
        c2.value = `Deporte: ${deporte}   │   Categoría: ${categoria}   │   Horario: ${dia} ${hora}   │   Prof. ${docenteNombre}`;
        c2.font = { name: 'Calibri', size: 11, bold: true, color: { argb: C.white } };
        c2.fill = fill(C.darkBg2);
        c2.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(2).height = 22;

        // Fila 3: Periodo
        ws.mergeCells(3, 1, 3, NCOLS);
        const c3 = ws.getCell(3, 1);
        c3.value = `Período: ${fechaInicio} al ${fechaFin}   │   Clases dictadas: ${totalClases || fechas.length}   │   Generado: ${new Date().toLocaleDateString('es-ES')}`;
        c3.font = { name: 'Calibri', size: 10, italic: true, color: { argb: '4B5563' } };
        c3.fill = fill(C.grayLight);
        c3.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(3).height = 18;

        ws.getRow(4).height = 6;

        // Fila 5: Headers
        const headers = ['N°', 'Apellidos y Nombres', 'DNI'];
        fechas.forEach(f => {
            const d = new Date(f + 'T12:00:00');
            headers.push(`${diasAbrev[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}`);
        });
        headers.push('Presentes', 'Ausentes', 'Total', '% Asist.');

        const headerRow = ws.getRow(5);
        headerRow.height = 28;
        headers.forEach((txt, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = txt;
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: C.white } };
            cell.fill = fill(C.gold);
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = allBold();
        });

        // Filas de datos
        alumnos.forEach((alumno, idx) => {
            const rn = 6 + idx;
            const r = ws.getRow(rn);
            r.height = 20;
            const par = idx % 2 === 0;
            const bgFila = par ? C.white : C.grayMid;

            const setCell = (col, value, opts = {}) => {
                const cell = r.getCell(col);
                cell.value = value;
                cell.font = { name: 'Calibri', size: 10, color: { argb: opts.fg || '1A1A1A' }, bold: !!opts.bold };
                cell.fill = fill(opts.bg || bgFila);
                cell.alignment = { vertical: 'middle', horizontal: opts.h || 'left' };
                cell.border = allThin();
            };

            setCell(1, idx + 1, { h: 'center', bold: true });
            setCell(2, alumno.nombre_completo);
            setCell(3, alumno.dni || '-', { h: 'center' });

            // Columnas por fecha
            let totalPresentes = 0;
            let totalAusentes = 0;
            fechas.forEach((f, fi) => {
                const val = mapaAsist[alumno.alumno_id]?.[f];
                if (val === undefined || val === null) {
                    setCell(4 + fi, '–', { h: 'center', bg: C.grayMid, fg: C.grayText });
                } else if (val === 1) {
                    totalPresentes++;
                    setCell(4 + fi, 'P', { h: 'center', bold: true, bg: par ? C.greenLightBg : C.greenBg, fg: C.greenFg });
                } else {
                    totalAusentes++;
                    setCell(4 + fi, 'A', { h: 'center', bold: true, bg: par ? C.redLightBg : C.redBg, fg: C.redFg });
                }
            });

            const base = 3 + totalFechaCols;
            const totalReg = totalPresentes + totalAusentes;
            const porc = totalReg > 0 ? Math.round((totalPresentes / totalReg) * 100) : 0;

            setCell(base + 1, totalPresentes, { h: 'center', bold: true, bg: par ? C.greenLightBg : C.greenBg, fg: C.greenFg });
            setCell(base + 2, totalAusentes, { h: 'center', bold: true, bg: par ? C.redLightBg : C.redBg, fg: totalAusentes > 0 ? C.redFg : C.grayText });
            setCell(base + 3, totalReg, { h: 'center' });

            const pctBg = porc >= 80 ? C.greenBg : porc >= 60 ? C.yellowBg : C.redBg;
            const pctFg = porc >= 80 ? C.greenFg : porc >= 60 ? C.yellowFg : C.redFg;
            setCell(base + 4, totalReg > 0 ? porc + '%' : 'Sin datos', {
                h: 'center', bold: true, bg: pctBg, fg: totalReg === 0 ? C.grayText : pctFg
            });
        });

        // Leyenda
        const legRow = 6 + alumnos.length + 1;
        ws.getRow(legRow).height = 18;
        ws.mergeCells(legRow, 1, legRow, 2);
        const legLabel = ws.getCell(legRow, 1);
        legLabel.value = 'LEYENDA:';
        legLabel.font = { name: 'Calibri', size: 9, bold: true, color: { argb: '4B5563' } };
        legLabel.alignment = { horizontal: 'right', vertical: 'middle' };

        [{ i:3, t:'P = Presente', bg: C.greenBg, fg: C.greenFg },
         { i:4, t:'A = Ausente',  bg: C.redBg,   fg: C.redFg   },
         { i:5, t:'– = Sin registro', bg: C.grayMid, fg: C.grayText }]
        .forEach(({ i, t, bg, fg }) => {
            const cell = ws.getCell(legRow, i);
            cell.value = t;
            cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: fg } };
            cell.fill = fill(bg);
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = allThin();
        });

        // Anchos de columnas
        ws.getColumn(1).width = 5;
        ws.getColumn(2).width = 36;
        ws.getColumn(3).width = 13;
        fechas.forEach((_, i) => { ws.getColumn(4 + i).width = 8; });
        const bc = 3 + totalFechaCols;
        ws.getColumn(bc + 1).width = 11;
        ws.getColumn(bc + 2).width = 11;
        ws.getColumn(bc + 3).width = 9;
        ws.getColumn(bc + 4).width = 11;

        // Descargar
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nombreArchivo = `Asistencias_${deporte}_${categoria}_${fechaInicio}_${fechaFin}.xlsx`
            .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        mostrarToast('Archivo descargado correctamente', 'success');
    } catch (error) {
        console.error('Error al generar Excel:', error);
        mostrarToast('Error al generar Excel', 'error');
    }
}












