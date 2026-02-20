/**

 * JavaScript para el Panel de Administración

 */



let inscritosData = [];

let dniSeleccionado = null;

let accionModal = null; // 'desactivar' o 'reactivar'



/**

 * Convierte URLs de Google Drive al formato de thumbnail/visualizacin

 */

function convertirURLDrive(url) {

    if (!url) return '';

    


    

    // Si ya es una URL de thumbnail, devolverla tal cual

    if (url.includes('thumbnail?id=')) {

        return url;

    }

    

    // Extraer fileId de URLs de Drive

    let fileId = null;

    

    // Formato: https://drive.google.com/uc?export=view&id=FILEID

    if (url.includes('uc?export=view&id=') || url.includes('uc?id=')) {

        const match = url.match(/[?&]id=([^&]+)/);

        if (match) fileId = match[1];

    }

    

    // Formato: https://drive.google.com/file/d/FILEID/view

    if (url.includes('/file/d/')) {

        const match = url.match(/\/file\/d\/([^\/\?]+)/);

        if (match) fileId = match[1];

    }

    

    // Formato: https://drive.google.com/open?id=FILEID

    if (!fileId && url.includes('open?id=')) {

        const match = url.match(/[?&]id=([^&]+)/);

        if (match) fileId = match[1];

    }

    

    // Si encontramos el fileId, devolver URL de thumbnail para visualizacin directa

    if (fileId) {

        // Usar formato thumbnail que funciona mejor para <img src="">

        const urlConvertida = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;


        return urlConvertida;

    }

    

    // Si no pudimos convertir, devolver la URL original


    return url;

}



/**

 * Convierte URLs de Google Drive al formato de visualizacin estndar /file/d/ID/view

 * Para usar en onclick y enlaces que abren en nueva pestaa

 */

function convertirURLDriveView(url) {

    if (!url) return '';

    

    // Extraer fileId de URLs de Drive

    let fileId = null;

    

    // Formato: https://drive.google.com/uc?export=view&id=FILEID

    if (url.includes('uc?export=view&id=') || url.includes('uc?id=')) {

        const match = url.match(/[?&]id=([^&]+)/);

        if (match) fileId = match[1];

    }

    

    // Formato: https://drive.google.com/file/d/FILEID/view

    if (!fileId && url.includes('/file/d/')) {

        const match = url.match(/\/file\/d\/([^\/\?]+)/);

        if (match) fileId = match[1];

    }

    

    // Formato: https://drive.google.com/open?id=FILEID

    if (!fileId && url.includes('open?id=')) {

        const match = url.match(/[?&]id=([^&]+)/);

        if (match) fileId = match[1];

    }

    

    // Si encontramos el fileId, devolver URL de visualizacin estndar

    if (fileId) {

        return `https://drive.google.com/file/d/${fileId}/view`;

    }

    

    // Si no pudimos convertir, devolver la URL original

    return url;

}



// Verificar autenticacin al cargar

document.addEventListener('DOMContentLoaded', () => {

    verificarSesion();

    inicializarEventos();

    cargarInscritos();

    cargarConfiguracion();

});



function verificarSesion() {

    const session = localStorage.getItem('adminSession');

    

    if (!session) {

        window.location.href = '/admin-login';

        return;

    }

    

    const data = JSON.parse(session);
    const sessionTime = new Date(data.timestamp).getTime();
    const now = new Date().getTime();
    const hoursElapsed = (now - sessionTime) / (1000 * 60 * 60);

    // Bloquear acceso de profesores al panel admin
    if (data.admin && data.admin.rol === 'profesor') {
        window.location.href = '/profesor';
        return;
    }

    if (hoursElapsed >= 8) {
        localStorage.removeItem('adminSession');
        window.location.href = '/admin-login';
        return;
    }
    

    // Actualizar email en desktop y móvil

    document.getElementById('adminEmail').textContent = data.admin.email;

    const adminEmailMobile = document.getElementById('adminEmailMobile');

    if (adminEmailMobile) {

        adminEmailMobile.textContent = data.admin.email;

    }

}



function inicializarEventos() {

    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);

    

    // Botn cerrar Sesión móvil

    const btnCerrarSesionMobile = document.getElementById('btnCerrarSesionMobile');

    if (btnCerrarSesionMobile) {

        btnCerrarSesionMobile.addEventListener('click', cerrarSesion);

    }

    

    document.getElementById('btnFiltrar').addEventListener('click', aplicarFiltros);

    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);

    

    // Eventos para desactivar

    document.getElementById('btnCancelarDesactivar').addEventListener('click', cerrarModales);

    document.getElementById('btnConfirmarDesactivar').addEventListener('click', confirmarDesactivar);

    

    // Eventos para reactivar

    document.getElementById('btnCancelarReactivar').addEventListener('click', cerrarModales);

    document.getElementById('btnConfirmarReactivar').addEventListener('click', confirmarReactivar);

    

    // Evento para buscar por DNI al presionar Enter (solo si el elemento existe)

    const filtroDNI = document.getElementById('filtroDNI');

    if (filtroDNI) {

        filtroDNI.addEventListener('keypress', (e) => {

            if (e.key === 'Enter') {

                const dni = e.target.value.trim();

                if (dni.length === 8) {

                    buscarPorDNI(dni);

                }

            }

        });

        

        // Limpiar bsqueda por DNI cuando se vaca el input

        filtroDNI.addEventListener('input', (e) => {

            if (e.target.value.length === 0) {

                cerrarDetalleUsuario();

            }

        });

    }

}



function cerrarSesion() {

    localStorage.removeItem('adminSession');

    window.location.href = '/admin-login';

}



async function cargarInscritos(dia = null, deporte = null) {

    const loadingContainer = document.getElementById('loadingContainer');

    const tablaContainer = document.getElementById('tablaContainer');

    const sinResultados = document.getElementById('sinResultados');

    

    loadingContainer.classList.remove('hidden');

    tablaContainer.classList.add('hidden');

    sinResultados.classList.add('hidden');

    

    try {

        const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
            ? window.API_BASE_OVERRIDE
            : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3002'
                : 'https://api.jaguarescar.com');
        

        // Obtener token de la Sesión

        const session = localStorage.getItem('adminSession');

        if (!session) {

            window.location.href = '/admin-login';

            return;

        }

        const { token } = JSON.parse(session);

        

        let url = `${API_BASE}/api/admin/inscritos`;

        const params = new URLSearchParams();

        

        if (dia) params.append('dia', dia);

        if (deporte) params.append('deporte', deporte);

        

        // o. Agregar timestamp para forzar actualizacin

        params.append('t', new Date().getTime());

        

        if (params.toString()) {

            url += '?' + params.toString();

        }

        

        const response = await fetch(url, {

            cache: 'no-store',

            headers: {

                'Cache-Control': 'no-cache, no-store, must-revalidate',

                'Pragma': 'no-cache',

                'Authorization': `Bearer ${token}` // o. Agregar token JWT

            }

        });

        const data = await response.json();

        

        if (data.success) {

            inscritosData = data.inscritos;

            renderizarTabla(inscritosData);

            actualizarEstadisticas(inscritosData);

        } else {

            mostrarError('Error al cargar datos: ' + data.error);

        }

    } catch (error) {

        console.error('Error al cargar inscritos:', error);

        mostrarError('Error de conexin. Verifica que el servidor est activo.');

    } finally {

        loadingContainer.classList.add('hidden');

    }

}



function renderizarTabla(inscritos) {

    const tablaBody = document.getElementById('tablaBody');

    const tablaContainer = document.getElementById('tablaContainer');

    const sinResultados = document.getElementById('sinResultados');

    

    if (!inscritos || inscritos.length === 0) {

        tablaContainer.classList.add('hidden');

        sinResultados.classList.remove('hidden');

        return;

    }

    

    tablaBody.innerHTML = '';

    

    // Agrupar por DNI para mostrar una sola fila por alumno

    const porDni = new Map();

    inscritos.forEach(ins => {

        if (!porDni.has(ins.dni)) {

            porDni.set(ins.dni, {

                ...ins,

                deportes: [],

                horarios: [],

                estado_pago: ins.estado_pago,

                estado_usuario: ins.estado_usuario

            });

        }

        const entry = porDni.get(ins.dni);

        const deporte = ins.deporte || ins.dia || null;

        const horario = ins.horario || (ins.hora_inicio && ins.hora_fin

            ? `${ins.hora_inicio} - ${ins.hora_fin}` : null);

        if (deporte && !entry.deportes.includes(deporte)) entry.deportes.push(deporte);

        if (horario && !entry.horarios.includes(horario)) entry.horarios.push(horario);

        // Si alguna inscripción está pendiente, el alumno queda como pendiente

        if (ins.estado_pago !== 'confirmado') entry.estado_pago = ins.estado_pago;

        // Si alguna inscripción está inactiva, marcar al alumno como inactivo

        if (ins.estado_usuario && ins.estado_usuario.toLowerCase() === 'inactivo') {

            entry.estado_usuario = 'inactivo';

        }

    });

    

    porDni.forEach(inscrito => {

        const row = document.createElement('tr');

        

        const estadoUsuario = inscrito.estado_usuario ? inscrito.estado_usuario.toLowerCase() : 'activo';

        const esInactivo = estadoUsuario === 'inactivo';

        

        row.className = `border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${esInactivo ? 'opacity-60 bg-gray-50 dark:bg-gray-900/50' : ''}`;

        

        const estadoClass = inscrito.estado_pago === 'confirmado'

            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'

            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';

        const estadoTexto = inscrito.estado_pago === 'confirmado' ? 'Activo' : 'Pendiente';

        

        const badgeInactivo = esInactivo

            ? `<span class="px-2 py-1 bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-[10px] font-black uppercase tracking-wider ml-2">INACTIVO</span>`

            : '';

        

        const botonAccion = esInactivo

            ? `<button onclick="reactivarUsuario('${inscrito.dni}')" class="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Reactivar todas las inscripciones de este usuario">

                    <span class="material-symbols-outlined text-xl">check_circle</span>

               </button>`

            : `<button onclick="desactivarUsuario('${inscrito.dni}')" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Desactivar todas las inscripciones de este usuario">

                    <span class="material-symbols-outlined text-xl">person_off</span>

               </button>`;

        

        const nombreSeguro = (inscrito.nombres + ' ' + inscrito.apellidos).replace(/'/g, "\\'");

        const botonEliminar = `<button onclick="eliminarAlumnoCompleto('${inscrito.dni}', '${nombreSeguro}')" class="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar alumno completamente del sistema">

                    <span class="material-symbols-outlined text-xl">delete_forever</span>

               </button>`;

        

        // Deportes como badges apilados

        const deportesBadges = inscrito.deportes.length > 0

            ? inscrito.deportes.map(d =>

                `<span class="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold whitespace-nowrap">${d}</span>`

              ).join('')

            : '<span class="text-gray-400 text-xs">-</span>';

        

        // Horarios apilados, uno por línea

        const horariosHtml = inscrito.horarios.length > 0

            ? inscrito.horarios.map(h =>

                `<span class="block text-xs text-gray-600 dark:text-gray-400">${h}</span>`

              ).join('')

            : '<span class="text-gray-400 text-xs">-</span>';

        

        row.innerHTML = `

            <td class="px-4 py-3 font-mono text-sm font-semibold">${inscrito.dni}${badgeInactivo}</td>

            <td class="px-4 py-3 ${esInactivo ? 'line-through' : ''}">${inscrito.nombres}</td>

            <td class="px-4 py-3 ${esInactivo ? 'line-through' : ''}">${inscrito.apellidos}</td>

            <td class="px-4 py-3 font-mono text-sm">${inscrito.telefono || '-'}</td>

            <td class="px-4 py-3">

                <div class="flex flex-wrap gap-1">${deportesBadges}</div>

            </td>

            <td class="px-4 py-3">${horariosHtml}</td>

            <td class="px-4 py-3">

                <span class="px-2 py-1 ${estadoClass} rounded text-xs font-semibold">${estadoTexto}</span>

            </td>

            <td class="px-4 py-3 text-center">

                <div class="flex items-center justify-center gap-1">

                    ${botonAccion}

                    ${botonEliminar}

                </div>

            </td>

        `;

        

        tablaBody.appendChild(row);

    });

    

    tablaContainer.classList.remove('hidden');

    sinResultados.classList.add('hidden');

}

function eliminarAlumnoCompleto(dni, nombre) {

    const modal = document.getElementById('modalEliminarAlumno');

    const spanNombre = document.getElementById('modalEliminarAlumnoNombre');

    const btnConfirmar = document.getElementById('btnConfirmarEliminarAlumno');

    if (!modal || !spanNombre || !btnConfirmar) return;

    

    spanNombre.textContent = nombre || dni;

    modal.classList.remove('hidden');

    modal.classList.add('flex');

    modal.onclick = (e) => { if (e.target === modal) cerrarModalEliminarAlumno(); };

    

    btnConfirmar.onclick = async () => {

        cerrarModalEliminarAlumno();

        try {

            const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))

                ? window.API_BASE_OVERRIDE : '';

            const session = JSON.parse(localStorage.getItem('adminSession') || '{}');

            const token = session.token || '';

            const response = await fetch(`${API_BASE}/api/admin/alumnos/${dni}`, {

                method: 'DELETE',

                headers: { 'Authorization': `Bearer ${token}` }

            });

            const data = await response.json();

            if (data.success) {

                mostrarNotificacion('Éxito', 'Alumno eliminado correctamente del sistema', 'success');

                setTimeout(() => cargarInscritos(), 500);

            } else {

                mostrarError(data.error || 'Error al eliminar alumno');

            }

        } catch (err) {

            console.error('Error al eliminar alumno:', err);

            mostrarError('Error de conexión al eliminar alumno');

        }

    };

}

function cerrarModalEliminarAlumno() {

    const modal = document.getElementById('modalEliminarAlumno');

    if (modal) {

        modal.classList.add('hidden');

        modal.classList.remove('flex');

    }

}



function actualizarEstadisticas(inscritos) {

    // Deduplicar por DNI igual que la tabla (un alumno puede tener varias inscripciones)

    const porDni = new Map();

    inscritos.forEach(i => {

        if (!porDni.has(i.dni)) {

            porDni.set(i.dni, i);

        } else {

            // Si alguna inscripción está pendiente, el alumno queda pendiente

            if (i.estado_pago !== 'confirmado') porDni.get(i.dni).estado_pago = i.estado_pago;

            // Si alguna está inactiva, el alumno queda inactivo

            if (i.estado_usuario && i.estado_usuario.toLowerCase() === 'inactivo') {

                porDni.get(i.dni).estado_usuario = 'inactivo';

            }

        }

    });

    

    const alumnos = [...porDni.values()];

    const total = alumnos.length;

    const activos = alumnos.filter(i => i.estado_pago === 'confirmado' && (!i.estado_usuario || i.estado_usuario.toLowerCase() === 'activo')).length;

    const pendientes = alumnos.filter(i => i.estado_pago === 'pendiente' && (!i.estado_usuario || i.estado_usuario.toLowerCase() === 'activo')).length;

    const inactivos = alumnos.filter(i => i.estado_usuario && i.estado_usuario.toLowerCase() === 'inactivo').length;

    

    document.getElementById('totalInscritos').textContent = total;

    document.getElementById('totalActivos').textContent = activos;

    document.getElementById('totalPendientes').textContent = pendientes;

    document.getElementById('totalInactivos').textContent = inactivos;

}



function aplicarFiltros() {

    const dni = document.getElementById('filtroDNI').value.trim();

    

    // Si hay DNI, buscar por DNI (tiene prioridad)

    if (dni.length === 8) {

        buscarPorDNI(dni);

        return;

    }

    

    // Si no hay DNI, filtrar por da/deporte

    const dia = document.getElementById('filtroDia').value;

    const deporte = document.getElementById('filtroDeporte').value;

    

    cerrarDetalleUsuario();

    cargarInscritos(dia || null, deporte || null);

}



function limpiarFiltros() {

    document.getElementById('filtroDNI').value = '';

    document.getElementById('filtroDia').value = '';

    document.getElementById('filtroDeporte').value = '';

    cerrarDetalleUsuario();

    cargarInscritos();

}



function desactivarUsuario(dni) {

    dniSeleccionado = dni;

    accionModal = 'desactivar';

    document.getElementById('dniDesactivar').textContent = dni;

    document.getElementById('modalDesactivar').classList.remove('hidden');

    document.body.style.overflow = 'hidden';

}



function reactivarUsuario(dni) {

    dniSeleccionado = dni;

    accionModal = 'reactivar';

    document.getElementById('dniReactivar').textContent = dni;

    document.getElementById('modalReactivar').classList.remove('hidden');

    document.body.style.overflow = 'hidden';

}



function cerrarModales() {

    dniSeleccionado = null;

    accionModal = null;

    document.getElementById('modalDesactivar').classList.add('hidden');

    document.getElementById('modalReactivar').classList.add('hidden');

    document.body.style.overflow = '';

}



async function confirmarDesactivar() {

    if (!dniSeleccionado) return;

    

    const btnConfirmar = document.getElementById('btnConfirmarDesactivar');

    const textoOriginal = btnConfirmar.innerHTML;

    

    btnConfirmar.disabled = true;

    btnConfirmar.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Procesando...';

    

    try {

        const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
    ? window.API_BASE_OVERRIDE
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002'
        : 'https://api.jaguarescar.com');

        

        const response = await fetch(`${API_BASE}/api/desactivar-usuario`, {

            method: 'POST',

            headers: {

                'Content-Type': 'application/json'

            },

            body: JSON.stringify({ dni: dniSeleccionado })

        });

        

        const data = await response.json();

        

        if (data.success) {

            cerrarModales();

            cargarInscritos();

            mostrarNotificacion('Usuario desactivado correctamente', 'success');

        } else {

            mostrarNotificacion('Error: ' + data.error, 'error');

            btnConfirmar.disabled = false;

            btnConfirmar.innerHTML = textoOriginal;

        }

    } catch (error) {

        console.error('Error al desactivar:', error);

        mostrarNotificacion('Error de conexin', 'error');

        btnConfirmar.disabled = false;

        btnConfirmar.innerHTML = textoOriginal;

    }

}



async function confirmarReactivar() {

    if (!dniSeleccionado) return;

    

    const btnConfirmar = document.getElementById('btnConfirmarReactivar');

    const textoOriginal = btnConfirmar.innerHTML;

    

    btnConfirmar.disabled = true;

    btnConfirmar.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Procesando...';

    

    try {

        const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
    ? window.API_BASE_OVERRIDE
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002'
        : 'https://api.jaguarescar.com');

        

        const response = await fetch(`${API_BASE}/api/reactivar-usuario`, {

            method: 'POST',

            headers: {

                'Content-Type': 'application/json'

            },

            body: JSON.stringify({ dni: dniSeleccionado })

        });

        

        const data = await response.json();

        

        if (data.success) {

            cerrarModales();

            cargarInscritos();

            mostrarNotificacion('Usuario reactivado correctamente', 'success');

        } else {

            mostrarNotificacion('Error: ' + data.error, 'error');

            btnConfirmar.disabled = false;

            btnConfirmar.innerHTML = textoOriginal;

        }

    } catch (error) {

        console.error('Error al reactivar:', error);

        mostrarNotificacion('Error de conexin', 'error');

        btnConfirmar.disabled = false;

        btnConfirmar.innerHTML = textoOriginal;

    }

}



function mostrarError(Mensaje) {

    const tablaContainer = document.getElementById('tablaContainer');

    const sinResultados = document.getElementById('sinResultados');

    

    tablaContainer.classList.add('hidden');
    sinResultados.classList.remove('hidden');
    sinResultados.querySelector('p').textContent = Mensaje;
}



// Funcin para buscar usuario por DNI

async function buscarPorDNI(dni) {

    const detalleUsuario = document.getElementById('detalleUsuario');

    const tablaContainer = document.getElementById('tablaContainer');

    const sinResultados = document.getElementById('sinResultados');

    const loadingContainer = document.getElementById('loadingContainer');

    

    loadingContainer.classList.remove('hidden');

    detalleUsuario.classList.add('hidden');

    tablaContainer.classList.add('hidden');

    sinResultados.classList.add('hidden');

    

    try {

        const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
    ? window.API_BASE_OVERRIDE
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002'
        : 'https://api.jaguarescar.com');

        

        // o. Agregar timestamp para evitar cach y forzar actualizacin

        const timestamp = new Date().getTime();

        const response = await fetch(`${API_BASE}/api/consultar/${dni}?t=${timestamp}`, {

            cache: 'no-store', // Forzar no usar cach del navegador

            headers: {

                'Cache-Control': 'no-cache, no-store, must-revalidate',

                'Pragma': 'no-cache'

            }

        });

        const data = await response.json();

        




        

        if (data.success) {

            mostrarDetalleUsuario(data);

            loadingContainer.classList.add('hidden');

            detalleUsuario.classList.remove('hidden');

        } else {

            mostrarError(data.error || 'No se encontr usuario con ese DNI o el pago no est confirmado');

            loadingContainer.classList.add('hidden');

        }

    } catch (error) {

        console.error('Error al buscar usuario:', error);

        mostrarError('Error de conexin al buscar usuario');

        loadingContainer.classList.add('hidden');

    }

}



// Funcin para mostrar detalle del usuario

function mostrarDetalleUsuario(data) {










    

    // Datos personales

    document.getElementById('detalleDNI').textContent = data.alumno.dni;

    document.getElementById('detalleNombre').textContent = `${data.alumno.nombres} ${data.alumno.apellidos}`;

    

    // Formatear fecha de nacimiento

    const fechaNac = data.alumno.fecha_nacimiento ? new Date(data.alumno.fecha_nacimiento).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'No registrado';

    document.getElementById('detalleFechaNacimiento').textContent = fechaNac;

    

    document.getElementById('detalleEdadSexo').textContent = `${data.alumno.edad || 'N/A'} / ${data.alumno.sexo || 'N/A'}`;

    

    // Contacto

    document.getElementById('detalleTelefono').textContent = data.alumno.telefono || 'No registrado';

    document.getElementById('detalleEmail').textContent = data.alumno.email || 'No registrado';

    document.getElementById('detalleDireccion').textContent = data.alumno.direccion || 'No registrado';

    document.getElementById('detalleApoderado').textContent = data.alumno.apoderado || 'No registrado';

    document.getElementById('detalleTelefonoApoderado').textContent = data.alumno.telefono_apoderado || 'No registrado';

    

    // Salud

    document.getElementById('detalleSeguroTipo').textContent = data.alumno.seguro_tipo || 'No registrado';

    document.getElementById('detalleCondicionMedica').textContent = data.alumno.condicion_medica || 'No registrado';

    

    // Pago

    document.getElementById('detalleMonto').textContent = `S/ ${parseFloat(data.pago.monto).toFixed(2)}`;

    document.getElementById('detalleMetodoPago').textContent = data.pago.metodo_pago || '-';

    

    const estadoPago = data.pago.estado;

    const estadoTexto = estadoPago === 'confirmado' ? 'Confirmado' : 'Pendiente';

    const estadoColor = estadoPago === 'confirmado' ? 'text-green-600' : 'text-yellow-600';

    document.getElementById('detalleEstadoPago').innerHTML = `<span class="${estadoColor}">${estadoTexto}</span>`;

    

    // Generar grid 2x2 con todas las imgenes (Comprobante + 3 documentos)

    const seccionImagenes = document.getElementById('seccionImagenes');

    if (seccionImagenes) {

        let imagenesHTML = '';

        

        // 1. Comprobante de Pago

        if (data.pago.comprobante_url) {

            const urlComprobante = convertirURLDrive(data.pago.comprobante_url);

            const urlComprobanteView = convertirURLDriveView(data.pago.comprobante_url);

            imagenesHTML += `

                <div class="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800">

                    <p class="text-xs font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-1">

                        <span class="material-symbols-outlined text-sm">receipt_long</span>

                        Comprobante de Pago

                    </p>

                    <div class="w-full overflow-hidden rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800" style="height: 220px;">

                        <img src="${urlComprobante}" 

                             alt="Comprobante" 

                             class="w-full h-full cursor-pointer hover:opacity-90 transition-opacity" style="object-fit: contain;"

                             onclick="window.open('${urlComprobanteView}', '_blank')"

                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22%23e3f2fd%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22%231976d2%22 x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2218%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESin comprobante%3C/text%3E%3C/svg%3E';">

                    </div>

                    <a href="${urlComprobanteView}" target="_blank" class="block text-xs text-center text-blue-600 hover:text-blue-700 mt-2">

                        <span class="material-symbols-outlined text-xs">open_in_new</span> Abrir en Drive

                    </a>

                </div>

            `;

        }

        

        // 2. DNI Frontal

        if (data.alumno.dni_frontal_url) {

            const urlDNIFrontal = convertirURLDrive(data.alumno.dni_frontal_url);

            const urlDNIFrontalView = convertirURLDriveView(data.alumno.dni_frontal_url);

            imagenesHTML += `

                <div class="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-800">

                    <p class="text-xs font-bold text-green-900 dark:text-green-200 mb-2 flex items-center gap-1">

                        <span class="material-symbols-outlined text-sm">credit_card</span>

                        DNI Frontal

                    </p>

                    <div class="w-full overflow-hidden rounded-lg border border-green-200 dark:border-green-700 bg-white dark:bg-gray-800" style="height: 220px;">

                        <img src="${urlDNIFrontal}" 

                             alt="DNI Frontal" 

                             class="w-full h-full cursor-pointer hover:opacity-90 transition-opacity" style="object-fit: contain;"

                             onclick="window.open('${urlDNIFrontalView}', '_blank')"

                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22250%22%3E%3Crect fill=%22%23dcfce7%22 width=%22400%22 height=%22250%22/%3E%3Ctext fill=%22%2316a34a%22 x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2216%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESin DNI frontal%3C/text%3E%3C/svg%3E';">

                    </div>

                    <a href="${urlDNIFrontalView}" target="_blank" class="block text-xs text-center text-green-600 hover:text-green-700 mt-2">

                        <span class="material-symbols-outlined text-xs">open_in_new</span> Abrir en Drive

                    </a>

                </div>

            `;

        }

        

        // 3. DNI Reverso

        if (data.alumno.dni_reverso_url) {

            const urlDNIReverso = convertirURLDrive(data.alumno.dni_reverso_url);

            const urlDNIReversoView = convertirURLDriveView(data.alumno.dni_reverso_url);

            imagenesHTML += `

                <div class="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-800">

                    <p class="text-xs font-bold text-green-900 dark:text-green-200 mb-2 flex items-center gap-1">

                        <span class="material-symbols-outlined text-sm">credit_card</span>

                        DNI Reverso

                    </p>

                    <div class="w-full overflow-hidden rounded-lg border border-green-200 dark:border-green-700 bg-white dark:bg-gray-800" style="height: 220px;">

                        <img src="${urlDNIReverso}" 

                             alt="DNI Reverso" 

                             class="w-full h-full cursor-pointer hover:opacity-90 transition-opacity" style="object-fit: contain;"

                             onclick="window.open('${urlDNIReversoView}', '_blank')"

                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22250%22%3E%3Crect fill=%22%23dcfce7%22 width=%22400%22 height=%22250%22/%3E%3Ctext fill=%22%2316a34a%22 x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2216%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESin DNI reverso%3C/text%3E%3C/svg%3E';">

                    </div>

                    <a href="${urlDNIReversoView}" target="_blank" class="block text-xs text-center text-green-600 hover:text-green-700 mt-2">

                        <span class="material-symbols-outlined text-xs">open_in_new</span> Abrir en Drive

                    </a>

                </div>

            `;

        }

        

        // 4. Foto Carnet

        if (data.alumno.foto_carnet_url) {

            const urlFotoCarnet = convertirURLDrive(data.alumno.foto_carnet_url);

            const urlFotoCarnetView = convertirURLDriveView(data.alumno.foto_carnet_url);

            imagenesHTML += `

                <div class="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-800">

                    <p class="text-xs font-bold text-green-900 dark:text-green-200 mb-2 flex items-center gap-1">

                        <span class="material-symbols-outlined text-sm">portrait</span>

                        Foto Tamanio Carnet

                    </p>

                    <div class="w-full overflow-hidden rounded-lg border border-green-200 dark:border-green-700 bg-white dark:bg-gray-800" style="height: 220px;">

                        <img src="${urlFotoCarnet}" 

                             alt="Foto Carnet" 

                             class="w-full h-full cursor-pointer hover:opacity-90 transition-opacity" style="object-fit: contain;"

                             onclick="window.open('${urlFotoCarnetView}', '_blank')"

                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22%3E%3Crect fill=%22%23dcfce7%22 width=%22400%22 height=%22500%22/%3E%3Ctext fill=%22%2316a34a%22 x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2216%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESin foto carnet%3C/text%3E%3C/svg%3E';">

                    </div>

                    <a href="${urlFotoCarnetView}" target="_blank" class="block text-xs text-center text-green-600 hover:text-green-700 mt-2">

                        <span class="material-symbols-outlined text-xs">open_in_new</span> Abrir en Drive

                    </a>

                </div>

            `;

        }

        

        if (imagenesHTML) {

            seccionImagenes.innerHTML = imagenesHTML;

        } else {

            seccionImagenes.innerHTML = `

                <div class="col-span-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">

                    <span class="material-symbols-outlined text-gray-400 text-4xl">image_not_supported</span>

                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">No se han subido documentos</p>

                </div>

            `;

        }

    }

    

    // o. Eliminar las secciones antiguas de comprobante y documentos separadas (si existen)

    const comprobanteContainer = document.getElementById('detalleComprobante');

    if (comprobanteContainer) comprobanteContainer.remove();

    

    const documentosContainer = document.getElementById('detalledocumentos');

    if (documentosContainer) documentosContainer.remove();

    

    // Renderizar horarios

    const horariosContainer = document.getElementById('detalleHorarios');

    horariosContainer.innerHTML = '';

    

    if (data.horarios && data.horarios.length > 0) {

        data.horarios.forEach(horario => {

            const horarioCard = document.createElement('div');

            

            // Verificar si el deporte est pausado/suspendido

            const esSuspendido = horario.estado_inscripcion === 'suspendida';

            

            // Clases condicionales segn estado

            const cardClasses = esSuspendido 

                ? 'border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-100 dark:bg-gray-800 opacity-60'

                : 'border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900';

            const textClasses = esSuspendido ? 'line-through text-gray-400' : 'text-black dark:text-white';

            const iconClasses = esSuspendido ? 'text-gray-400' : 'text-primary';

            

            horarioCard.className = cardClasses;

            

            // Determinar color del estado

            let estadoHTML;

            if (esSuspendido) {

                estadoHTML = `<span class="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Pausado por alumno</span>`;

            } else {

                const estadoPago = data.pago.estado === 'confirmado';

                const estadoColor = estadoPago ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400';

                const estadoTexto = estadoPago ? 'Pago Confirmado' : 'Pendiente de Pago';

                estadoHTML = `<span class="${estadoColor} font-semibold">${estadoTexto}</span>`;

            }

            

            horarioCard.innerHTML = `

                <div class="flex items-center gap-3 mb-2">

                    <span class="material-symbols-outlined ${iconClasses}">sports</span>

                    <p class="font-bold text-lg ${textClasses}">${horario.deporte || '-'}</p>

                    ${esSuspendido ? '<span class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold uppercase">Pausado</span>' : ''}

                </div>

                <div class="space-y-1 text-sm ${esSuspendido ? 'text-gray-400' : ''}">

                    <div class="flex items-center gap-2">

                        <span class="material-symbols-outlined text-xs">calendar_today</span>

                        <p class="${esSuspendido ? 'line-through' : ''}"><span class="font-semibold">Da:</span> ${horario.dia || '-'}</p>

                    </div>

                    <div class="flex items-center gap-2">

                        <span class="material-symbols-outlined text-xs">schedule</span>

                        <p class="${esSuspendido ? 'line-through' : ''}"><span class="font-semibold">Horario:</span> ${horario.hora_inicio || '-'} - ${horario.hora_fin || '-'}</p>

                    </div>

                    <div class="flex items-center gap-2">

                        <span class="material-symbols-outlined text-xs">check_circle</span>

                        <p><span class="font-semibold">Estado:</span> ${estadoHTML}</p>

                    </div>

                </div>

            `;

            horariosContainer.appendChild(horarioCard);

        });

    } else {

        horariosContainer.innerHTML = '<p class="text-text-muted">No hay horarios registrados</p>';

    }

}



// Funcin para cerrar detalle del usuario

function cerrarDetalleUsuario() {

    document.getElementById('detalleUsuario').classList.add('hidden');

    document.getElementById('filtroDNI').value = '';

    cargarInscritos();

}



// ==================== CONFIGURACI"N DEL SISTEMA ====================



const API_BASE_CONFIG = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

    ? 'http://localhost:3002'

    : 'https://api.jaguarescar.com';



/**

 * Cargar Configuración del sistema

 */

async function cargarConfiguracion() {

    try {

        const session = JSON.parse(localStorage.getItem('adminSession') || '{}');

        const token = session.token;

        

        const response = await fetch(`${API_BASE_CONFIG}/api/admin/configuracion`, {

            headers: {

                'Authorization': `Bearer ${token}`

            }

        });

        

        const data = await response.json();

        

        if (data.success && data.configuraciones) {

            // Buscar Configuración de Matrícula

            const matriculaConfig = data.configuraciones.find(c => c.clave === 'matricula_activa');

            if (matriculaConfig) {

                actualizarUIMatricula(matriculaConfig.valor === true || matriculaConfig.valor === 'true');

            }

        }

    } catch (error) {

        console.error('Error al cargar Configuración:', error);

    }

}



/**

 * Actualizar UI del toggle de Matrícula

 */

function actualizarUIMatricula(activa) {

    const toggle = document.getElementById('toggleMatricula');

    const estado = document.getElementById('matriculaEstado');

    

    if (toggle) {

        toggle.checked = activa;

    }

    

    if (estado) {

        if (activa) {

            estado.textContent = 'o" Matrícula ACTIVA - Se cobra S/20 por deporte nuevo';

            estado.className = 'text-xs text-green-600 dark:text-green-400 mt-2 font-semibold';

        } else {

            estado.textContent = 'o- Matrícula DESACTIVADA - No se cobra Matrícula';

            estado.className = 'text-xs text-orange-600 dark:text-orange-400 mt-2 font-semibold';

        }

    }

}



/**

 * Toggle Matrícula activa/inactiva

 */

async function toggleMatricula(activa) {

    try {

        const session = JSON.parse(localStorage.getItem('adminSession') || '{}');

        const token = session.token;

        

        const response = await fetch(`${API_BASE_CONFIG}/api/admin/configuracion/matricula_activa`, {

            method: 'PUT',

            headers: {

                'Content-Type': 'application/json',

                'Authorization': `Bearer ${token}`

            },

            body: JSON.stringify({ valor: activa })

        });

        

        const data = await response.json();

        

        if (data.success) {

            actualizarUIMatricula(activa);

            mostrarNotificacion(

                activa ? 'Matrícula activada' : 'Matrícula desactivada',

                activa ? 'Se cobrar S/20 por cada deporte nuevo' : 'No se cobrar Matrícula en inscripciones',

                activa ? 'success' : 'warning'

            );

        } else {

            throw new Error(data.error || 'Error al actualizar');

        }

    } catch (error) {

        console.error('Error al cambiar Matrícula:', error);

        mostrarNotificacion('Error', 'No se pudo actualizar la Configuración', 'error');

        // Revertir el toggle

        const toggle = document.getElementById('toggleMatricula');

        if (toggle) toggle.checked = !activa;

    }

}



/**

 * Mostrar notificacin simple

 */

function mostrarNotificacion(titulo, Mensaje, tipo = 'success') {

    // Crear notificacin temporal

    const notif = document.createElement('div');

    const bgColor = tipo === 'success' ? 'bg-green-500' : (tipo === 'warning' ? 'bg-orange-500' : 'bg-red-500');

    const icon = tipo === 'success' ? 'check_circle' : (tipo === 'warning' ? 'warning' : 'error');

    

    notif.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-pulse`;

    notif.innerHTML = `

        <span class="material-symbols-outlined">${icon}</span>

        <div>

            <p class="font-bold">${titulo}</p>

            <p class="text-sm opacity-90">${Mensaje}</p>

        </div>

    `;

    document.body.appendChild(notif);

    

    setTimeout(() => notif.remove(), 3000);

}



// Event listener para el toggle de Matrícula

document.addEventListener('DOMContentLoaded', () => {

    const toggleMatriculaEl = document.getElementById('toggleMatricula');

    if (toggleMatriculaEl) {

        toggleMatriculaEl.addEventListener('change', (e) => {

            toggleMatricula(e.target.checked);

        });

    }

});












