/**

 * JavaScript para el Panel de Administración

 */



let inscritosData = [];
let paginaActualLista = 1;
const POR_PAGINA_LISTA = 10;

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

    cargarDeportesDropdown();

    cargarInscritos();

    cargarConfiguracion();

});



async function cargarDeportesDropdown() {
    try {
        const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
            ? window.API_BASE_OVERRIDE
            : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3002'
                : 'https://api.jaguarescar.com');

        const session = localStorage.getItem('adminSession');
        if (!session) return;
        const { token } = JSON.parse(session);

        const response = await fetch(`${API_BASE}/api/admin/deportes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.deportes) {
            const select = document.getElementById('filtroDeporte');
            // Mantener la primera opción "Todos los deportes"
            const primeraOpcion = select.options[0];
            select.innerHTML = '';
            select.appendChild(primeraOpcion);

            data.deportes.forEach(dep => {
                const option = document.createElement('option');
                option.value = dep.nombre.toUpperCase();
                option.textContent = dep.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar deportes para dropdown:', error);
    }
}

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

    

    // Evento para buscar al presionar Enter (DNI, nombre o apellido)

    const filtroDNI = document.getElementById('filtroDNI');

    if (filtroDNI) {

        filtroDNI.addEventListener('keypress', (e) => {

            if (e.key === 'Enter') {

                aplicarFiltros();

            }

        });

        

        // Limpiar bsqueda cuando se vaca el input

        filtroDNI.addEventListener('input', (e) => {

            if (e.target.value.length === 0) {

                cerrarDetalleUsuario();

                aplicarFiltros();

            }

        });

    }

}



function cerrarSesion() {

    localStorage.removeItem('adminSession');

    window.location.href = '/admin-login';

}



async function cargarInscritos(dia = null, deporte = null, busquedaTexto = null) {

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

            // Filtrar localmente por texto (DNI, nombre o apellido)
            if (busquedaTexto && busquedaTexto.length > 0) {
                const termino = busquedaTexto.toLowerCase();
                inscritosData = inscritosData.filter(ins => {
                    const dni = (ins.dni || '').toLowerCase();
                    const nombres = (ins.nombres || '').toLowerCase();
                    const apellidos = (ins.apellidos || '').toLowerCase();
                    return dni.includes(termino) || nombres.includes(termino) || apellidos.includes(termino);
                });
            }

            paginaActualLista = 1;

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

    // Paginar por DNI
    const inscritosArray = Array.from(porDni.values());
    const totalPaginasLista = Math.ceil(inscritosArray.length / POR_PAGINA_LISTA);
    if (paginaActualLista > totalPaginasLista) paginaActualLista = Math.max(1, totalPaginasLista);
    const inicioLista = (paginaActualLista - 1) * POR_PAGINA_LISTA;
    const paginaInscritos = inscritosArray.slice(inicioLista, inicioLista + POR_PAGINA_LISTA);

    paginaInscritos.forEach(inscrito => {

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

        const botonVerDetalle = `<button onclick="verDetalleAlumno('${inscrito.dni}')" class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Ver información completa del alumno">
                    <span class="material-symbols-outlined text-xl">visibility</span>
               </button>`;

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

                    ${botonVerDetalle}

                    ${botonAccion}

                    ${botonEliminar}

                </div>

            </td>

        `;

        

        tablaBody.appendChild(row);

    });

    

    tablaContainer.classList.remove('hidden');

    sinResultados.classList.add('hidden');

    renderizarPaginacionLista(inscritosArray.length, totalPaginasLista);

}

function renderizarPaginacionLista(total, totalPaginas) {
    let paginacionEl = document.getElementById('paginacionListaInscritos');
    if (!paginacionEl) {
        const container = document.getElementById('tablaContainer');
        paginacionEl = document.createElement('div');
        paginacionEl.id = 'paginacionListaInscritos';
        container.appendChild(paginacionEl);
    }
    if (totalPaginas <= 1) { paginacionEl.innerHTML = ''; return; }
    const inicio = (paginaActualLista - 1) * POR_PAGINA_LISTA + 1;
    const fin = Math.min(paginaActualLista * POR_PAGINA_LISTA, total);
    const rango = 2;
    let botonesHTML = '';
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActualLista - rango && i <= paginaActualLista + rango)) {
            botonesHTML += `<button onclick="irAPaginaLista(${i})" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${i === paginaActualLista ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary/20'}">${i}</button>`;
        } else if (i === paginaActualLista - rango - 1 || i === paginaActualLista + rango + 1) {
            botonesHTML += `<span class="px-2 text-gray-400 text-sm">…</span>`;
        }
    }
    paginacionEl.className = 'flex items-center justify-between px-2 py-4 mt-2 border-t border-gray-200 dark:border-gray-700';
    paginacionEl.innerHTML = `
        <p class="text-sm text-gray-500 dark:text-gray-400">Mostrando <span class="font-semibold text-black dark:text-white">${inicio}-${fin}</span> de <span class="font-semibold text-black dark:text-white">${total}</span> alumnos</p>
        <div class="flex items-center gap-1">
            <button onclick="irAPaginaLista(${paginaActualLista - 1})" ${paginaActualLista === 1 ? 'disabled' : ''} class="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <span class="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            ${botonesHTML}
            <button onclick="irAPaginaLista(${paginaActualLista + 1})" ${paginaActualLista === totalPaginas ? 'disabled' : ''} class="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <span class="material-symbols-outlined text-lg">chevron_right</span>
            </button>
        </div>
    `;
}

function irAPaginaLista(pagina) {
    const porDni = new Map();
    inscritosData.forEach(ins => { if (!porDni.has(ins.dni)) porDni.set(ins.dni, ins); });
    const totalPaginas = Math.ceil(porDni.size / POR_PAGINA_LISTA);
    if (pagina < 1 || pagina > totalPaginas) return;
    paginaActualLista = pagina;
    renderizarTabla(inscritosData);
    document.getElementById('tablaContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const busqueda = document.getElementById('filtroDNI').value.trim();

    

    // Si no hay búsqueda de texto, filtrar por día/deporte en el servidor

    const dia = document.getElementById('filtroDia').value;

    const deporte = document.getElementById('filtroDeporte').value;

    

    cerrarDetalleUsuario();

    // Siempre cargar desde servidor con filtros de día/deporte, luego filtrar localmente por texto
    cargarInscritos(dia || null, deporte || null, busqueda || null);

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

    // Cargar inscripciones activas del alumno
    cargarInscripcionesParaDesactivar(dni);
}

async function cargarInscripcionesParaDesactivar(dni) {
    const lista = document.getElementById('listaDeportesDesactivar');
    const nombreEl = document.getElementById('nombreDesactivar');
    lista.innerHTML = '<p class="text-center text-text-muted text-sm py-4"><span class="material-symbols-outlined animate-spin text-xl align-middle mr-1">progress_activity</span> Cargando...</p>';

    try {
        const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
            ? window.API_BASE_OVERRIDE
            : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3002'
                : 'https://api.jaguarescar.com');
        const session = JSON.parse(localStorage.getItem('adminSession') || '{}');
        const token = session.token || '';

        const response = await fetch(`${API_BASE}/api/admin/inscripciones-alumno/${dni}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            nombreEl.textContent = data.nombre;
            if (data.inscripciones.length === 0) {
                lista.innerHTML = '<p class="text-center text-text-muted text-sm py-4">No tiene inscripciones activas</p>';
                return;
            }

            lista.innerHTML = data.inscripciones.map(ins => `
                <label class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                    <input type="checkbox" name="inscripcionDesactivar" value="${ins.inscripcion_id}" class="w-4 h-4 accent-red-600 checkbox-deporte-desactivar">
                    <div class="flex-1 min-w-0">
                        <p class="font-bold text-sm text-black dark:text-white">${ins.deporte}</p>
                        <p class="text-xs text-gray-500">${ins.plan || 'Sin plan'} · S/ ${parseFloat(ins.precio_mensual || 0).toFixed(2)}</p>
                        <p class="text-xs text-gray-400 mt-0.5">${ins.horarios || 'Sin horarios asignados'}</p>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ins.estado === 'activa' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${ins.estado}</span>
                </label>
            `).join('');

            // Evento "Seleccionar todos"
            const checkTodos = document.getElementById('checkDesactivarTodos');
            if (checkTodos) {
                checkTodos.checked = false;
                checkTodos.onchange = function() {
                    document.querySelectorAll('.checkbox-deporte-desactivar').forEach(cb => cb.checked = this.checked);
                };
            }
        } else {
            lista.innerHTML = '<p class="text-center text-red-600 text-sm py-4">Error al cargar inscripciones</p>';
        }
    } catch (error) {
        console.error('Error al cargar inscripciones:', error);
        lista.innerHTML = '<p class="text-center text-red-600 text-sm py-4">Error de conexión</p>';
    }
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

    // Resetear botón desactivar a su estado original
    const btnDesactivar = document.getElementById('btnConfirmarDesactivar');
    if (btnDesactivar) {
        btnDesactivar.disabled = false;
        btnDesactivar.innerHTML = 'Desactivar';
    }
    // Resetear botón reactivar a su estado original
    const btnReactivar = document.getElementById('btnConfirmarReactivar');
    if (btnReactivar) {
        btnReactivar.disabled = false;
        btnReactivar.innerHTML = 'Reactivar';
    }
}



async function confirmarDesactivar() {

    if (!dniSeleccionado) return;

    // Obtener inscripciones seleccionadas
    const checkboxes = document.querySelectorAll('.checkbox-deporte-desactivar:checked');
    const inscripcionIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    if (inscripcionIds.length === 0) {
        mostrarNotificacion('Selecciona al menos una inscripción para desactivar', 'error');
        return;
    }

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

        const session = JSON.parse(localStorage.getItem('adminSession') || '{}');
        const token = session.token || '';

        const response = await fetch(`${API_BASE}/api/admin/desactivar-inscripciones`, {

            method: 'POST',

            headers: {

                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`

            },

            body: JSON.stringify({ dni: dniSeleccionado, inscripcion_ids: inscripcionIds })

        });

        

        const data = await response.json();

        

        if (data.success) {

            const dniRefrescar = dniSeleccionado;

            cerrarModales();

            cargarInscritos();

            // Refrescar vista detalle para mostrar inscripciones canceladas
            if (dniRefrescar) {
                buscarPorDNI(dniRefrescar);
            }

            mostrarNotificacion(data.message || 'Inscripciones desactivadas correctamente', 'success');

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

    

    try {

        const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
    ? window.API_BASE_OVERRIDE
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002'
        : 'https://api.jaguarescar.com');

        

        // o. Agregar timestamp para evitar cach y forzar actualizacin

        const timestamp = new Date().getTime();

        const response = await fetch(`${API_BASE}/api/consultar/${dni}?t=${timestamp}&incluir_inactivos=1`, {

            cache: 'no-store', // Forzar no usar cach del navegador

            headers: {

                'Cache-Control': 'no-cache, no-store, must-revalidate',

                'Pragma': 'no-cache'

            }

        });

        const data = await response.json();

        




        

        if (data.success || data.inactivo) {

            // Si es inactivo, crear datos mínimos para mostrar
            if (data.inactivo && !data.alumno) {
                mostrarError('Usuario inactivo. Usa el botón de reactivar en la tabla.');
                loadingContainer.classList.add('hidden');
                return;
            }
            mostrarDetalleUsuario(data);

            loadingContainer.classList.add('hidden');

            detalleUsuario.classList.remove('hidden');
            detalleUsuario.scrollIntoView({ behavior: 'smooth', block: 'start' });

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

    // Mostrar estado del alumno y botones según corresponda
    const estadoUsuarioEl = document.getElementById('detalleEstadoUsuario');
    const btnDesactivar = document.getElementById('btnDesactivarDetalle');
    const btnReactivar = document.getElementById('btnReactivarDetalle');
    const esInactivo = data.alumno.estado && data.alumno.estado.toLowerCase() === 'inactivo';
    
    if (estadoUsuarioEl) {
        estadoUsuarioEl.classList.remove('hidden');
        if (esInactivo) {
            estadoUsuarioEl.textContent = 'INACTIVO';
            estadoUsuarioEl.className = 'px-2 py-0.5 rounded text-xs font-bold uppercase ml-2 bg-gray-300 text-gray-700';
        } else {
            estadoUsuarioEl.textContent = 'ACTIVO';
            estadoUsuarioEl.className = 'px-2 py-0.5 rounded text-xs font-bold uppercase ml-2 bg-green-100 text-green-700';
        }
    }
    if (btnDesactivar) {
        btnDesactivar.style.display = esInactivo ? 'none' : 'flex';
        btnDesactivar.setAttribute('data-dni', data.alumno.dni);
    }
    if (btnReactivar) {
        btnReactivar.style.display = esInactivo ? 'flex' : 'none';
        btnReactivar.classList.toggle('hidden', !esInactivo);
        btnReactivar.setAttribute('data-dni', data.alumno.dni);
    }


    

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

    // Número de operación
    const numOp = data.alumno.numero_operacion || data.pago.numero_operacion || null;
    const detalleNumOp = document.getElementById('detalleNumeroOperacion');
    if (detalleNumOp) {
        detalleNumOp.textContent = numOp || 'No registrado';
        detalleNumOp.className = numOp 
            ? 'font-bold text-sm font-mono truncate text-amber-700 dark:text-amber-400' 
            : 'font-bold text-sm truncate text-text-muted';
    }

    

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

    

    // Renderizar horarios agrupados por deporte

    const horariosContainer = document.getElementById('detalleHorarios');

    horariosContainer.innerHTML = '';

    

    if (data.horarios && data.horarios.length > 0) {

        // Agrupar horarios por deporte (inscripcion_id)

        const deportesMap = {};

        data.horarios.forEach(horario => {

            const key = horario.inscripcion_id;

            if (!deportesMap[key]) {

                deportesMap[key] = {

                    inscripcion_id: horario.inscripcion_id,

                    deporte: horario.deporte,

                    categoria: horario.categoria || '',

                    plan: horario.plan || '',

                    precio: horario.precio,

                    estado_inscripcion: horario.estado_inscripcion || 'activa',

                    horarios: []

                };

            }

            deportesMap[key].horarios.push(horario);

        });

        

        const deportes = Object.values(deportesMap);

        

        deportes.forEach(deporte => {

            const esSuspendido = deporte.estado_inscripcion === 'suspendida';

            const esPendiente = deporte.estado_inscripcion === 'pendiente';

            const esCancelada = deporte.estado_inscripcion === 'cancelada';

            const esInactiva = esSuspendido || esCancelada;

            

            // Card contenedora del deporte

            const deporteCard = document.createElement('div');

            deporteCard.className = esCancelada

                ? 'border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 bg-red-50/50 dark:bg-red-900/10 opacity-70'

                : esSuspendido 

                ? 'border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4 mb-4 bg-gray-50 dark:bg-gray-800 opacity-60'

                : esPendiente

                    ? 'border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4 mb-4 bg-yellow-50 dark:bg-yellow-900/10'

                    : 'border-2 border-green-200 dark:border-green-800 rounded-xl p-4 mb-4 bg-white dark:bg-gray-900';

            

            // Badge de estado

            let estadoBadge;

            if (esCancelada) {

                estadoBadge = `<div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase">Cancelada</span>
                    <button onclick="reactivarInscripcion(${deporte.inscripcion_id}, '${deporte.deporte.replace(/'/g, "\\'")}')"
                            class="px-2 py-0.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase transition-colors cursor-pointer flex items-center gap-1">
                        <span class="material-symbols-outlined" style="font-size:12px">refresh</span> Reactivar
                    </button>
                </div>`;

            } else if (esSuspendido) {

                estadoBadge = `<span class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold uppercase">Pausado</span>`;

            } else if (esPendiente) {

                estadoBadge = `<span class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase">Pendiente de Pago</span>`;

            } else {

                estadoBadge = `<span class="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">Pago Confirmado</span>`;

            }

            

            // Horarios del deporte

            const horariosHTML = deporte.horarios.map(h => `

                <div class="flex items-center gap-2 text-sm ${esInactiva ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}">

                    <span class="material-symbols-outlined text-xs ${esInactiva ? 'text-gray-400' : 'text-primary'}">calendar_today</span>

                    <span class="font-medium">${h.dia || '-'}</span>

                    <span>${h.hora_inicio || '-'} - ${h.hora_fin || '-'}</span>

                </div>

            `).join('');

            

            deporteCard.innerHTML = `

                <div class="flex items-center justify-between mb-3">

                    <div class="flex items-center gap-3">

                        <span class="material-symbols-outlined ${esInactiva ? 'text-gray-400' : 'text-primary'} text-2xl">sports</span>

                        <div>

                            <h4 class="font-bold text-base ${esInactiva ? 'text-gray-400 line-through' : 'text-black dark:text-white'}">${deporte.deporte}${deporte.categoria ? ` - ${deporte.categoria}` : ''}</h4>

                            <p class="text-xs text-gray-500">${deporte.plan} | S/ ${parseFloat(deporte.precio || 0).toFixed(2)}</p>

                        </div>

                    </div>

                    ${estadoBadge}

                </div>

                <div class="space-y-1.5 ml-9">

                    ${horariosHTML}

                </div>

            `;

            

            horariosContainer.appendChild(deporteCard);

        });

    } else {

        horariosContainer.innerHTML = '<p class="text-text-muted">No hay horarios registrados</p>';

    }

}



// Funciones para desactivar/reactivar desde la vista de detalle
function desactivarDesdeDetalle() {
    const btn = document.getElementById('btnDesactivarDetalle');
    const dni = btn ? btn.getAttribute('data-dni') : null;
    if (dni) desactivarUsuario(dni);
}

function reactivarDesdeDetalle() {
    const btn = document.getElementById('btnReactivarDetalle');
    const dni = btn ? btn.getAttribute('data-dni') : null;
    if (dni) reactivarUsuario(dni);
}

// Función para reactivar una inscripción individual cancelada
function reactivarInscripcion(inscripcionId, deporteNombre) {
    const modal = document.getElementById('modalReactivarInscripcion');
    const nombreSpan = document.getElementById('nombreDeporteReactivar');
    const btnConfirmar = document.getElementById('btnConfirmarReactivarInscripcion');
    const resultado = document.getElementById('reactivarInscripcionResultado');
    const botones = document.getElementById('reactivarInscripcionBotones');

    nombreSpan.textContent = deporteNombre;
    resultado.classList.add('hidden');
    botones.classList.remove('hidden');
    modal.classList.remove('hidden');

    // Limpiar listener anterior
    const nuevoBtn = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(nuevoBtn, btnConfirmar);
    nuevoBtn.id = 'btnConfirmarReactivarInscripcion';

    nuevoBtn.addEventListener('click', async () => {
        nuevoBtn.disabled = true;
        nuevoBtn.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">refresh</span> Procesando...';

        const filtroDNI = document.getElementById('filtroDNI');
        const dni = filtroDNI ? filtroDNI.value.trim() : null;
        if (!dni) {
            mostrarResultadoReactivar(false, 'No se pudo obtener el DNI del alumno');
            return;
        }

        const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
            ? window.API_BASE_OVERRIDE
            : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3002'
                : 'https://api.jaguarescar.com');

        const session = localStorage.getItem('adminSession');
        if (!session) { mostrarResultadoReactivar(false, 'Sesión no encontrada'); return; }
        const { token } = JSON.parse(session);

        try {
            const response = await fetch(`${API_BASE}/api/admin/reactivar-inscripciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ dni, inscripcion_ids: [inscripcionId] })
            });
            const data = await response.json();
            if (data.success) {
                mostrarResultadoReactivar(true, 'Inscripción reactivada exitosamente');
                setTimeout(() => {
                    cerrarModalReactivarInscripcion();
                    buscarPorDNI(dni);
                    cargarInscritos();
                }, 1500);
            } else {
                mostrarResultadoReactivar(false, data.error || 'No se pudo reactivar');
            }
        } catch (error) {
            console.error('Error al reactivar inscripción:', error);
            mostrarResultadoReactivar(false, 'Error de conexión al reactivar');
        }
    });
}

function mostrarResultadoReactivar(exito, mensaje) {
    const resultado = document.getElementById('reactivarInscripcionResultado');
    const botones = document.getElementById('reactivarInscripcionBotones');
    resultado.classList.remove('hidden');
    if (exito) {
        resultado.innerHTML = `
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-3 text-center">
                <span class="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                <p class="text-sm font-bold text-green-700 dark:text-green-400 mt-1">${mensaje}</p>
            </div>`;
        botones.classList.add('hidden');
    } else {
        resultado.innerHTML = `
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3 text-center">
                <span class="material-symbols-outlined text-red-600 text-2xl">error</span>
                <p class="text-sm font-bold text-red-700 dark:text-red-400 mt-1">${mensaje}</p>
            </div>`;
        const btn = document.getElementById('btnConfirmarReactivarInscripcion');
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-base">refresh</span> Reactivar';
    }
}

function cerrarModalReactivarInscripcion() {
    document.getElementById('modalReactivarInscripcion').classList.add('hidden');
    // Resetear botón a estado original
    const btn = document.getElementById('btnConfirmarReactivarInscripcion');
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-base">refresh</span> Reactivar';
    }
}

// Funcin para cerrar detalle del usuario

function cerrarDetalleUsuario() {

    document.getElementById('detalleUsuario').classList.add('hidden');

}

// Funcin para ver detalle completo del alumno desde la tabla
function verDetalleAlumno(dni) {
    document.getElementById('filtroDNI').value = dni;
    buscarPorDNI(dni);
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

    // Enter en campo de búsqueda de número de operación
    const inputNumOp = document.getElementById('inputBuscarNumOp');
    if (inputNumOp) {
        inputNumOp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') buscarNumeroOperacion();
        });
    }

});

// =====================================================================
//  BÚSQUEDA DE NÚMERO DE OPERACIÓN (Anti-fraude)
// =====================================================================

function toggleSeccionNumOp() {
    const contenido = document.getElementById('contenidoNumOp');
    const icono = document.getElementById('iconToggleNumOp');
    if (!contenido) return;
    if (contenido.classList.contains('hidden')) {
        contenido.classList.remove('hidden');
        if (icono) icono.style.transform = 'rotate(180deg)';
    } else {
        contenido.classList.add('hidden');
        if (icono) icono.style.transform = 'rotate(0deg)';
    }
}

async function buscarNumeroOperacion() {
    const input = document.getElementById('inputBuscarNumOp');
    const contenedor = document.getElementById('resultadosNumOp');
    if (!input || !contenedor) return;

    const valor = input.value.trim();
    if (valor.length < 2) {
        contenedor.innerHTML = '<p class="text-sm text-red-600 font-semibold">Ingresa al menos 2 caracteres.</p>';
        contenedor.classList.remove('hidden');
        return;
    }

    contenedor.innerHTML = '<div class="flex items-center gap-2 text-text-muted"><span class="material-symbols-outlined animate-spin">progress_activity</span> Buscando...</div>';
    contenedor.classList.remove('hidden');

    try {
        const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
            ? window.API_BASE_OVERRIDE
            : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3002'
                : 'https://api.jaguarescar.com');
        const resp = await fetch(`${API_BASE}/api/admin/buscar-numero-operacion?numero_operacion=${encodeURIComponent(valor)}`);
        const data = await resp.json();

        if (!data.success) {
            contenedor.innerHTML = `<p class="text-sm text-red-600 font-semibold">${data.error || 'Error al buscar'}</p>`;
            return;
        }

        if (data.total === 0) {
            contenedor.innerHTML = `
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <span class="material-symbols-outlined text-4xl text-gray-400">search_off</span>
                    <p class="text-sm text-text-muted mt-2">No se encontraron registros con ese número de operación.</p>
                </div>`;
            return;
        }

        let alertaHtml = '';
        if (data.es_duplicado) {
            alertaHtml = `
                <div class="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 mb-4 flex items-start gap-3">
                    <span class="material-symbols-outlined text-red-600 text-2xl flex-shrink-0">warning</span>
                    <div>
                        <p class="font-bold text-red-800 dark:text-red-300 text-sm">${data.mensaje_duplicado}</p>
                        <p class="text-xs text-red-700 dark:text-red-400 mt-1">Verifica los comprobantes antes de confirmar estos pagos.</p>
                    </div>
                </div>`;
        }

        let filasHtml = data.resultados.map(r => {
            const estadoColor = r.estado_pago === 'confirmado' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' :
                                r.estado_pago === 'rechazado' ? 'text-red-600 bg-red-50 dark:bg-red-900/20' :
                                'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
            const fecha = r.fecha_inscripcion ? new Date(r.fecha_inscripcion).toLocaleDateString('es-PE') : '-';
            return `
                <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td class="px-3 py-2 text-sm font-mono font-bold">${r.dni}</td>
                    <td class="px-3 py-2 text-sm font-semibold">${r.nombres} ${r.apellidos}</td>
                    <td class="px-3 py-2 text-sm font-mono font-bold text-primary">${r.numero_operacion || '-'}</td>
                    <td class="px-3 py-2 text-sm">${r.deportes || '-'}</td>
                    <td class="px-3 py-2"><span class="text-xs font-bold px-2 py-1 rounded-full ${estadoColor}">${r.estado_pago || 'pendiente'}</span></td>
                    <td class="px-3 py-2 text-xs text-text-muted">${fecha}</td>
                    <td class="px-3 py-2">
                        ${r.comprobante_pago_url ? `<a href="${r.comprobante_pago_url}" target="_blank" class="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1"><span class="material-symbols-outlined text-sm">image</span>Ver</a>` : '<span class="text-xs text-text-muted">—</span>'}
                    </td>
                </tr>`;
        }).join('');

        contenedor.innerHTML = `
            ${alertaHtml}
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <th class="px-3 py-2 text-left text-xs font-bold uppercase text-text-muted">DNI</th>
                            <th class="px-3 py-2 text-left text-xs font-bold uppercase text-text-muted">Alumno</th>
                            <th class="px-3 py-2 text-left text-xs font-bold uppercase text-text-muted">Nro. Operación</th>
                            <th class="px-3 py-2 text-left text-xs font-bold uppercase text-text-muted">Deportes</th>
                            <th class="px-3 py-2 text-left text-xs font-bold uppercase text-text-muted">Estado Pago</th>
                            <th class="px-3 py-2 text-left text-xs font-bold uppercase text-text-muted">Fecha</th>
                            <th class="px-3 py-2 text-left text-xs font-bold uppercase text-text-muted">Comprobante</th>
                        </tr>
                    </thead>
                    <tbody>${filasHtml}</tbody>
                </table>
            </div>
            <p class="text-xs text-text-muted mt-2">${data.total} resultado(s) encontrado(s)</p>`;

    } catch (err) {
        console.error('Error buscando número de operación:', err);
        contenedor.innerHTML = '<p class="text-sm text-red-600 font-semibold">Error de conexión al buscar.</p>';
    }
}

// Copiar el nro operación del detalle al buscador y buscar duplicados automáticamente
function copiarYBuscarNumOp() {
    const numOp = document.getElementById('detalleNumeroOperacion')?.textContent;
    if (!numOp || numOp === 'No registrado' || numOp === '-') return;
    
    // Abrir la sección si está cerrada
    const contenido = document.getElementById('contenidoNumOp');
    if (contenido && contenido.classList.contains('hidden')) {
        toggleSeccionNumOp();
    }
    
    // Poner el valor y buscar
    const input = document.getElementById('inputBuscarNumOp');
    if (input) {
        input.value = numOp;
        // Scroll suave a la sección
        document.getElementById('inputBuscarNumOp').scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Buscar después de un breve delay para que el scroll termine
        setTimeout(() => buscarNumeroOperacion(), 300);
    }
}












