/**
 * Gestión de Reubicaciones - Drag & Drop
 * Academia Jaguares
 */

const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
    ? window.API_BASE_OVERRIDE
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002'
        : 'https://api.jaguarescar.com');

// Helper para obtener headers con autenticación
function getAuthHeadersReubicaciones() {
    const session = localStorage.getItem('adminSession');
    const token = session ? JSON.parse(session).token : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Estado global
let deporteActual = null;
let dataCategorias = [];
let sortableInstances = [];
let pendingMove = null;

// elementos DOM
const selectorDeporte = document.getElementById('selectorDeporte');
const columnasContainer = document.getElementById('columnasContainer');
const boardCategorias = document.getElementById('boardCategorias');
const sinSeleccion = document.getElementById('sinSeleccion');
const sinDatos = document.getElementById('sinDatos');
const loading = document.getElementById('loading');
const infoDeporte = document.getElementById('infoDeporte');
const totalAlumnos = document.getElementById('totalAlumnos');
const totalCategorias = document.getElementById('totalCategorias');

// Modal
const modalConfirmacion = document.getElementById('modalConfirmacion');
const modalSubtitulo = document.getElementById('modalSubtitulo');
const modalOrigen = document.getElementById('modalOrigen');
const modalDestino = document.getElementById('modalDestino');
const btnCancelarReubicacion = document.getElementById('btnCancelarReubicacion');
const btnConfirmarReubicacion = document.getElementById('btnConfirmarReubicacion');

// ==================== INICIALIZACIÓN ====================

function initAdminReubicaciones() {
    cargarDeportes();
    setupEventListeners();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminReubicaciones);
} else {
    initAdminReubicaciones();
}


function setupEventListeners() {
    selectorDeporte.addEventListener('change', onDeporteChange);
    btnCancelarReubicacion.addEventListener('click', cancelarReubicacion);
    btnConfirmarReubicacion.addEventListener('click', confirmarReubicacion);
    
    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modalConfirmacion.classList.contains('hidden')) {
            cancelarReubicacion();
        }
    });
}

// ==================== CARGAR DEPORTES ====================

async function cargarDeportes() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/reubicaciones/deportes`, {
            headers: getAuthHeadersReubicaciones()
        });
        const data = await response.json();

        if (data.success && data.deportes.length > 0) {
            selectorDeporte.innerHTML = '<option value="">-- Seleccionar deporte --</option>';
            
            data.deportes.forEach(deporte => {
                const option = document.createElement('option');
                option.value = deporte.deporte_id;
                option.textContent = `${deporte.nombre} (${deporte.categorias.length} categorías)`;
                option.dataset.icono = deporte.icono;
                selectorDeporte.appendChild(option);
            });
        } else {
            selectorDeporte.innerHTML = '<option value="">No hay deportes disponibles</option>';
        }
    } catch (error) {
        console.error('Error al cargar deportes:', error);
        mostrarToast('Error', 'No se pudieron cargar los deportes', 'error');
    }
}

// ==================== CAMBIO DE DEPORTE ====================

async function onDeporteChange() {
    const deporteId = selectorDeporte.value;
    
    if (!deporteId) {
        mostrarVista('sinSeleccion');
        infoDeporte.classList.add('hidden');
        return;
    }

    deporteActual = deporteId;
    await cargarAlumnosPorCategoria(deporteId);
}

// ==================== CARGAR ALUMNOS ====================

async function cargarAlumnosPorCategoria(deporteId) {
    mostrarVista('loading');
    
    try {
        const response = await fetch(`${API_BASE}/api/admin/reubicaciones/alumnos/${deporteId}`, {
            headers: getAuthHeadersReubicaciones()
        });
        const data = await response.json();

        if (data.success) {
            dataCategorias = data.categorias;
            
            // Calcular totales
            const totalAlumnosCount = dataCategorias.reduce((sum, cat) => sum + cat.alumnos.length, 0);
            
            if (totalAlumnosCount === 0) {
                mostrarVista('sinDatos');
                infoDeporte.classList.add('hidden');
                return;
            }

            // Actualizar info
            totalAlumnos.textContent = `${totalAlumnosCount} alumno${totalAlumnosCount !== 1 ? 's' : ''}`;
            totalCategorias.textContent = `${dataCategorias.length} categoría${dataCategorias.length !== 1 ? 's' : ''}`;
            infoDeporte.classList.remove('hidden');
            
            renderizarBoard(data);
            mostrarVista('board');
        } else {
            mostrarVista('sinDatos');
        }
    } catch (error) {
        console.error('Error al cargar alumnos:', error);
        mostrarToast('Error', 'No se pudieron cargar los alumnos', 'error');
        mostrarVista('sinDatos');
    }
}

// ==================== RENDERIZAR BOARD ====================

function renderizarBoard(data) {
    // Destruir instancias de Sortable anteriores
    sortableInstances.forEach(instance => instance.destroy());
    sortableInstances = [];
    
    columnasContainer.innerHTML = '';

    // Renderizar filtro por día
    renderizarFiltroDia(data.categorias);

    data.categorias.forEach((categoria, index) => {
        const columna = crearColumnaCategoria(categoria, index, data.icono);
        columnasContainer.appendChild(columna);
    });

    // Inicializar Sortable en cada columna
    inicializarSortable();
}

function renderizarFiltroDia(categorias) {
    // Eliminar filtro anterior si existe
    const filtroAnterior = document.getElementById('filtroDiaContainer');
    if (filtroAnterior) filtroAnterior.remove();

    // Recopilar todos los días únicos de todos los alumnos
    const diasSet = new Set();
    categorias.forEach(cat => {
        cat.alumnos.forEach(alumno => {
            if (alumno.dias && alumno.dias !== 'Sin horario') {
                alumno.dias.split(', ').forEach(d => {
                    const dia = d.split(' ')[0];
                    if (dia) diasSet.add(dia);
                });
            }
        });
    });

    const ordenDias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
    const diasOrdenados = ordenDias.filter(d => diasSet.has(d));

    if (diasOrdenados.length === 0) return;

    const filtroContainer = document.createElement('div');
    filtroContainer.id = 'filtroDiaContainer';
    filtroContainer.className = 'mb-4 flex flex-wrap items-center gap-2';
    filtroContainer.innerHTML = `
        <span class="text-sm font-semibold text-text-muted flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">filter_list</span>
            Filtrar por día:
        </span>
        <button onclick="filtrarPorDia(null)" 
            id="filtroBtnTodos"
            class="filtro-dia-btn px-3 py-1 rounded-full text-xs font-bold border-2 border-primary bg-primary text-black transition-colors">
            Todos
        </button>
        ${diasOrdenados.map(dia => `
            <button onclick="filtrarPorDia('${dia}')" 
                id="filtroBtn${dia}"
                class="filtro-dia-btn px-3 py-1 rounded-full text-xs font-bold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors">
                ${dia}
            </button>
        `).join('')}
    `;

    boardCategorias.insertBefore(filtroContainer, columnasContainer);
}

let diaFiltroActivo = null;

function filtrarPorDia(dia) {
    diaFiltroActivo = dia;

    // Actualizar estilos de botones
    document.querySelectorAll('.filtro-dia-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'border-primary', 'text-black');
        btn.classList.add('border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
    });
    const btnActivo = dia ? document.getElementById(`filtroBtn${dia}`) : document.getElementById('filtroBtnTodos');
    if (btnActivo) {
        btnActivo.classList.add('bg-primary', 'border-primary', 'text-black');
        btnActivo.classList.remove('border-gray-300', 'dark:border-gray-600', 'text-gray-700', 'dark:text-gray-300');
    }

    // Filtrar cards de alumnos
    document.querySelectorAll('.alumno-card').forEach(card => {
        if (!dia) {
            card.style.display = '';
            return;
        }
        const dias = card.querySelector('.text-gray-500 span:last-child')?.textContent || '';
        card.style.display = dias.includes(dia) ? '' : 'none';
    });
}

function crearColumnaCategoria(categoria, index, iconoDeporte) {
    const colores = [
        { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', header: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300' },
        { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', header: 'bg-green-500', text: 'text-green-700 dark:text-green-300' },
        { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', header: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-300' },
        { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', header: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300' },
        { bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800', header: 'bg-pink-500', text: 'text-pink-700 dark:text-pink-300' },
        { bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', header: 'bg-cyan-500', text: 'text-cyan-700 dark:text-cyan-300' },
    ];
    
    const color = colores[index % colores.length];
    
    const columna = document.createElement('div');
    columna.className = `rounded-xl border-2 ${color.border} ${color.bg} overflow-hidden`;
    columna.innerHTML = `
        <div class="${color.header} text-white px-4 py-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined">${iconoDeporte || 'sports'}</span>
                    <h3 class="font-bold uppercase tracking-wide">${categoria.categoria}</h3>
                </div>
                <span class="bg-white/20 px-2 py-0.5 rounded-full text-sm font-bold">${categoria.alumnos.length}</span>
            </div>
        </div>
        <div class="categoria-column p-3 space-y-2 max-h-[500px] overflow-y-auto" 
             data-categoria="${categoria.categoria}">
            ${categoria.alumnos.length > 0 
                ? categoria.alumnos.map(alumno => crearCardAlumno(alumno, color)).join('')
                : `<div class="text-center py-8 text-gray-400">
                     <span class="material-symbols-outlined text-4xl">person_add</span>
                     <p class="text-sm mt-2">Arrastra alumnos aquí</p>
                   </div>`
            }
        </div>
    `;
    
    return columna;
}

function crearCardAlumno(alumno, color) {
    const iniciales = obtenerIniciales(alumno.nombres, alumno.apellidos);
    const estadoClass = alumno.estado_inscripcion === 'suspendida' 
        ? 'opacity-60 border-orange-300 dark:border-orange-700' 
        : '';
    const estadoBadge = alumno.estado_inscripcion === 'suspendida'
        ? '<span class="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">PAUSADO</span>'
        : '';
    
    return `
        <div class="alumno-card bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 ${estadoClass} relative"
             data-inscripcion-id="${alumno.inscripcion_id}"
             data-alumno-id="${alumno.alumno_id}"
             data-categoria="${alumno.categoria}"
             data-nombre="${alumno.nombres} ${alumno.apellidos}">
            ${estadoBadge}
            <div class="flex items-center gap-3">
                ${alumno.foto_url 
                    ? `<img src="${alumno.foto_url}" alt="${alumno.nombres}" class="w-10 h-10 rounded-full object-cover border-2 border-gray-200">`
                    : `<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">${iniciales}</div>`
                }
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm text-black dark:text-white truncate">${alumno.nombres}</p>
                    <p class="text-xs text-gray-500 truncate">${alumno.apellidos}</p>
                </div>
                <span class="material-symbols-outlined text-gray-300 dark:text-gray-600 cursor-grab">drag_indicator</span>
            </div>
            <div class="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span class="material-symbols-outlined text-xs">badge</span>
                <span>${alumno.dni}</span>
                <span class="mx-1">•</span>
                <span class="material-symbols-outlined text-xs">calendar_today</span>
                <span>${alumno.dias || 'Sin días'}</span>
            </div>
            ${alumno.edad ? `<div class="mt-1 text-xs ${color.text}">${alumno.edad} años</div>` : ''}
        </div>
    `;
}

function obtenerIniciales(nombres, apellidos) {
    const n = nombres?.charAt(0).toUpperCase() || '';
    const a = apellidos?.charAt(0).toUpperCase() || '';
    return n + a;
}

// ==================== SORTABLE (DRAG & DROP) ====================

function inicializarSortable() {
    const columnas = document.querySelectorAll('.categoria-column');
    
    columnas.forEach(columna => {
        const sortable = new Sortable(columna, {
            group: 'alumnos', // Permite mover entre columnas
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            handle: '.alumno-card', // Solo se puede arrastrar desde la card
            filter: '.text-center', // No arrastrar el placeholder
            
            onStart: function(evt) {
                document.querySelectorAll('.categoria-column').forEach(col => {
                    col.classList.add('sortable-drag-over');
                });
            },
            
            onEnd: function(evt) {
                document.querySelectorAll('.categoria-column').forEach(col => {
                    col.classList.remove('sortable-drag-over');
                });
                
                // Verificar si se movió a otra columna
                const categoriaOrigen = evt.from.dataset.categoria;
                const categoriaDestino = evt.to.dataset.categoria;
                
                if (categoriaOrigen !== categoriaDestino) {
                    const card = evt.item;
                    const inscripcionId = card.dataset.inscripcionId;
                    const nombreAlumno = card.dataset.nombre;
                    
                    // Guardar datos del movimiento pendiente
                    pendingMove = {
                        card,
                        inscripcionId,
                        categoriaOrigen,
                        categoriaDestino,
                        fromContainer: evt.from,
                        toContainer: evt.to,
                        oldIndex: evt.oldIndex,
                        newIndex: evt.newIndex
                    };
                    
                    // Obtener preview de los horarios antes de mostrar modal
                    obtenerPreviewYMostrarModal(inscripcionId, categoriaOrigen, categoriaDestino, nombreAlumno);
                }
            }
        });
        
        sortableInstances.push(sortable);
    });
}

// ==================== PREVIEW Y MODAL ====================

async function obtenerPreviewYMostrarModal(inscripcionId, categoriaOrigen, categoriaDestino, nombreAlumno) {
    try {
        const response = await fetch(`${API_BASE}/api/admin/reubicaciones/preview?inscripcionId=${inscripcionId}&categoriaDestino=${encodeURIComponent(categoriaDestino)}&deporteId=${deporteActual}`, {
            headers: getAuthHeadersReubicaciones()
        });
        const data = await response.json();
        
        if (data.success) {
            mostrarModalConfirmacion(nombreAlumno, categoriaOrigen, categoriaDestino, data);
        } else {
            cancelarReubicacion();
            mostrarToast('Error', data.error || 'No se pudo obtener preview', 'error');
        }
    } catch (error) {
        console.error('Error al obtener preview:', error);
        cancelarReubicacion();
        mostrarToast('Error', 'Error de conexión', 'error');
    }
}

function mostrarModalConfirmacion(nombreAlumno, origen, destino, previewData) {
    const { diasActuales, diasNuevos, precioActual, precioNuevo, planActual, planNuevo, precioCambia } = previewData;
    
    modalSubtitulo.textContent = nombreAlumno;
    modalOrigen.textContent = origen;
    modalDestino.textContent = destino;
    
    // Mostrar los días que cambiarán
    const diasActualesContainer = document.getElementById('diasActualesLista');
    const diasNuevosContainer = document.getElementById('diasNuevosLista');
    
    if (diasActualesContainer && diasNuevosContainer) {
        diasActualesContainer.innerHTML = diasActuales.map(d => 
            `<span class="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium mr-1 mb-1">${d}</span>`
        ).join('');
        
        diasNuevosContainer.innerHTML = diasNuevos.map(d => 
            `<span class="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium mr-1 mb-1">${d}</span>`
        ).join('');
    }
    
    // Mostrar precios
    const seccionPrecios = document.getElementById('seccionPrecios');
    if (seccionPrecios) {
        const diferencia = precioNuevo - precioActual;
        const diferenciaClass = diferencia > 0 ? 'text-red-600' : diferencia < 0 ? 'text-green-600' : 'text-gray-600';
        const diferenciaIcon = diferencia > 0 ? 'trending_up' : diferencia < 0 ? 'trending_down' : 'trending_flat';
        const diferenciaTexto = diferencia > 0 ? `+S/${diferencia.toFixed(2)}` : diferencia < 0 ? `-S/${Math.abs(diferencia).toFixed(2)}` : 'Sin cambio';
        
        seccionPrecios.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="text-center flex-1">
                    <p class="text-xs text-text-muted">Precio actual</p>
                    <p class="font-bold text-lg text-red-600">S/${precioActual.toFixed(2)}</p>
                    <p class="text-xs text-gray-500">${planActual || 'N/A'}</p>
                </div>
                <div class="flex flex-col items-center mx-4">
                    <span class="material-symbols-outlined text-primary text-2xl">arrow_forward</span>
                    <span class="material-symbols-outlined ${diferenciaClass}">${diferenciaIcon}</span>
                    <span class="text-xs font-bold ${diferenciaClass}">${diferenciaTexto}</span>
                </div>
                <div class="text-center flex-1">
                    <p class="text-xs text-text-muted">Precio nuevo</p>
                    <p class="font-bold text-lg text-green-600">S/${precioNuevo.toFixed(2)}</p>
                    <p class="text-xs text-gray-500">${planNuevo || 'N/A'}</p>
                </div>
            </div>
        `;
        seccionPrecios.classList.remove('hidden');
    }
    
    // Mostrar advertencia si los días son diferentes
    const warningDias = document.getElementById('warningDiasDiferentes');
    const diasActualesSet = new Set(diasActuales.map(d => d.split(' ')[0]));
    const diasNuevosSet = new Set(diasNuevos.map(d => d.split(' ')[0]));
    const diasCambian = ![...diasActualesSet].every(d => diasNuevosSet.has(d)) || 
                        ![...diasNuevosSet].every(d => diasActualesSet.has(d));
    
    if (warningDias) {
        warningDias.classList.toggle('hidden', !diasCambian);
    }
    
    modalConfirmacion.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cancelarReubicacion() {
    // Revertir el movimiento visual
    if (pendingMove) {
        const { card, fromContainer, oldIndex } = pendingMove;
        
        // Mover la card de vuelta a su posición original
        const children = fromContainer.children;
        if (oldIndex >= children.length) {
            fromContainer.appendChild(card);
        } else {
            fromContainer.insertBefore(card, children[oldIndex]);
        }
        
        // Actualizar el data-categoria del card
        card.dataset.categoria = pendingMove.categoriaOrigen;
    }
    
    pendingMove = null;
    cerrarModal();
}

async function confirmarReubicacion() {
    if (!pendingMove) return;
    
    const { inscripcionId, categoriaOrigen, categoriaDestino, card } = pendingMove;
    
    // Mostrar loading en el botón
    const btnOriginalText = btnConfirmarReubicacion.innerHTML;
    btnConfirmarReubicacion.disabled = true;
    btnConfirmarReubicacion.innerHTML = `
        <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
        <span>Procesando...</span>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/api/admin/reubicaciones/mover`, {
            method: 'PUT',
            headers: getAuthHeadersReubicaciones(),
            body: JSON.stringify({
                inscripcionId: parseInt(inscripcionId),
                categoriaOrigen,
                categoriaDestino,
                deporteId: parseInt(deporteActual)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Actualizar el data-categoria del card
            card.dataset.categoria = categoriaDestino;
            
            mostrarToast('Reubicación exitosa', data.message, 'success');
            
            // Actualizar contadores en las columnas
            actualizarContadores();
        } else {
            // Revertir el movimiento
            cancelarReubicacion();
            mostrarToast('Error', data.error || 'No se pudo reubicar al alumno', 'error');
            return;
        }
    } catch (error) {
        console.error('Error al reubicar:', error);
        cancelarReubicacion();
        mostrarToast('Error', 'Error de conexión', 'error');
        return;
    } finally {
        btnConfirmarReubicacion.disabled = false;
        btnConfirmarReubicacion.innerHTML = btnOriginalText;
    }
    
    pendingMove = null;
    cerrarModal();
}

function cerrarModal() {
    modalConfirmacion.classList.add('hidden');
    document.body.style.overflow = '';
}

// ==================== ACTUALIZAR CONTADORES ====================

function actualizarContadores() {
    const columnas = document.querySelectorAll('.categoria-column');
    
    columnas.forEach(columna => {
        const categoria = columna.dataset.categoria;
        const header = columna.previouselementsibling;
        const badge = header?.querySelector('span:last-child');
        const cards = columna.querySelectorAll('.alumno-card');
        
        if (badge) {
            badge.textContent = cards.length;
        }
        
        // Actualizar placeholder si está vacío
        if (cards.length === 0 && !columna.querySelector('.text-center')) {
            columna.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <span class="material-symbols-outlined text-4xl">person_add</span>
                    <p class="text-sm mt-2">Arrastra alumnos aquí</p>
                </div>
            `;
        } else if (cards.length > 0) {
            const placeholder = columna.querySelector('.text-center');
            if (placeholder) placeholder.remove();
        }
    });
    
    // Actualizar total global
    const totalCards = document.querySelectorAll('.alumno-card').length;
    totalAlumnos.textContent = `${totalCards} alumno${totalCards !== 1 ? 's' : ''}`;
}

// ==================== UTILIDADES ====================

function mostrarVista(vista) {
    sinSeleccion.classList.add('hidden');
    sinDatos.classList.add('hidden');
    loading.classList.add('hidden');
    boardCategorias.classList.add('hidden');
    
    switch(vista) {
        case 'sinSeleccion':
            sinSeleccion.classList.remove('hidden');
            break;
        case 'sinDatos':
            sinDatos.classList.remove('hidden');
            break;
        case 'loading':
            loading.classList.remove('hidden');
            break;
        case 'board':
            boardCategorias.classList.remove('hidden');
            break;
    }
}

function mostrarToast(titulo, Mensaje, tipo = 'success') {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    const toastIcon = document.getElementById('toastIcon');
    const toastTitulo = document.getElementById('toastTitulo');
    const toastMensaje = document.getElementById('toastMensaje');
    
    const config = {
        success: { icon: 'check_circle', color: 'border-green-500', iconColor: 'text-green-500' },
        error: { icon: 'error', color: 'border-red-500', iconColor: 'text-red-500' },
        info: { icon: 'info', color: 'border-blue-500', iconColor: 'text-blue-500' }
    };
    
    const c = config[tipo] || config.success;
    
    toastContent.className = `bg-white dark:bg-surface-dark rounded-xl shadow-2xl p-4 flex items-center gap-3 min-w-[300px] border-l-4 ${c.color}`;
    toastIcon.textContent = c.icon;
    toastIcon.className = `material-symbols-outlined text-2xl ${c.iconColor}`;
    toastTitulo.textContent = titulo;
    toastMensaje.textContent = Mensaje;
    
    toast.classList.remove('hidden');
    toast.classList.add('animate-fade-in-down');
    
    setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('animate-fade-in-down');
    }, 4000);
}





