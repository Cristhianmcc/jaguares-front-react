/**
 * JavaScript para Gestión de Datos (CRUD) - Sistema Completo
 * Administración de Deportes, Horarios, Categorías y Calendario Semanal
 */

let deportesData = [];
let horariosData = [];
let categoriasData = [];
let planesData = [];
let nivelesData = [];

function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.createElement('div');
    const color = tipo === 'success' ? '#22c55e' : tipo === 'error' ? '#ef4444' : '#f59e0b';
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;background:${color};color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,0.25);transition:opacity 0.4s;opacity:1;max-width:320px`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3000);
}

function normalizeText(value) {
    if (value === null || value === undefined) return '';
    let text = String(value);
    // Fix common replacement characters from bad encodings
    const map = [
        ['Categor?a', 'Categoría'],
        ['Categor??a', 'Categoría'],
        ['B?squet', 'Básquet'],
        ['B??squet', 'Básquet'],
        ['F?tbol', 'Fútbol'],
        ['F??tbol', 'Fútbol'],
        ['V?ley', 'Vóley'],
        ['V??ley', 'Vóley'],
        ['Mi?rcoles', 'Miércoles'],
        ['Mi??rcoles', 'Miércoles'],
        ['S?bado', 'Sábado'],
        ['S??bado', 'Sábado'],
        ['Gestion', 'Gestión'],
        ['Descripci?n', 'Descripción'],
        ['Descripci??n', 'Descripción'],
        ['A?os', 'Años'],
        ['A??os', 'Años']
    ];
    map.forEach(([from, to]) => {
        text = text.replaceAll(from, to);
    });
    // Replace Unicode replacement char when it appears in known words
    text = text.replace(/Categor\uFFFDa/g, 'Categoría');
    text = text.replace(/B\uFFFDsquet/g, 'Básquet');
    text = text.replace(/F\uFFFDtbol/g, 'Fútbol');
    text = text.replace(/V\uFFFDley/g, 'Vóley');
    text = text.replace(/Mi\uFFFDrcoles/g, 'Miércoles');
    text = text.replace(/S\uFFFDbado/g, 'Sábado');
    text = text.replace(/Descripci\uFFFDn/g, 'Descripción');
    text = text.replace(/A\uFFFDos/g, 'Años');
    return text;
}
let modoEdicion = false;

const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
    ? window.API_BASE_OVERRIDE
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002'
        : 'https://api.jaguarescar.com');

// Helper para obtener headers con autenticación
function getAuthHeaders() {
    const session = localStorage.getItem('adminSession');
    const token = session ? JSON.parse(session).token : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// ==================== INICIALIZACI"N ====================

function initAdminCrud() {
    verificarSesion();
    cargarCalendario();
    cargarDeportesActivos();
    cargarPlanesNiveles();
    setupFormHandlers();
    cargarFiltrosReportes();
    setupModalCloseHandlers();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminCrud);
} else {
    initAdminCrud();
}


function verificarSesion() {
    const session = localStorage.getItem('adminSession');
    if (!session) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    const data = JSON.parse(session);
    const sessionTime = new Date(data.timestamp).getTime();
    const hoursElapsed = (new Date().getTime() - sessionTime) / (1000 * 60 * 60);
    
    if (hoursElapsed >= 8) {
        localStorage.removeItem('adminSession');
        window.location.href = 'admin-login.html';
        return;
    }
    
    document.getElementById('adminEmail').textContent = data.admin.email;
}

// ==================== MANEJO DE TABS ====================

function cambiarTab(tab) {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'border-primary', 'text-primary');
        btn.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    });
    
    const btnActivo = document.getElementById(`tab-${tab}`);
    btnActivo.classList.add('active', 'border-primary', 'text-primary');
    btnActivo.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
    
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.getElementById(`content-${tab}`).classList.remove('hidden');
    
    if (tab === 'calendario') cargarCalendario();
    else if (tab === 'deportes') cargarDeportes();
    else if (tab === 'categorias') cargarCategorias();
    else if (tab === 'horarios') cargarHorarios();
    else if (tab === 'planes') cargarPlanes();
    else if (tab === 'inscripciones') {
        if (typeof cargarInscripciones === 'function') cargarInscripciones();
        else setTimeout(() => cambiarTab('inscripciones'), 300);
    }
    else if (tab === 'reportes') { /* Los reportes se generan bajo demanda */ }
}

// ==================== VISTA CALENDARIO ====================

async function cargarCalendario() {
    const loading = document.getElementById('loadingCalendario');
    const container = document.getElementById('calendarioContainer');
    
    loading.classList.remove('hidden');
    container.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE}/api/admin/horarios`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            horariosData = data.horarios;
            renderizarCalendario();
            container.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loading.classList.add('hidden');
    }
}

function renderizarCalendario() {
    const grid = document.getElementById('calendarioGrid');
    grid.innerHTML = '';
    
    // Obtener rango de horas configurado
    const horaInicio = document.getElementById('rangoInicio')?.value || '06:00';
    const horaFin = document.getElementById('rangoFin')?.value || '22:00';
    
    // Generar array de slots base (cada 30 min)
    const slotsBase = generarRangoHoras(horaInicio, horaFin);
    
    // Recopilar TODAS las horas reales de los horarios activos
    const horasReales = new Set();
    horariosData.forEach(h => {
        if (h.estado === 'activo') {
            horasReales.add(h.hora_inicio);
        }
    });
    
    // Combinar slots base con horas reales y ordenar
    const todasLasHoras = new Set([...slotsBase, ...horasReales]);
    const horasOrdenadas = Array.from(todasLasHoras).sort();
    
    // Organizar horarios por día y hora EXACTA
    const horariosPorDia = {
        'LUNES': {}, 'MARTES': {}, 'MIERCOLES': {}, 'JUEVES': {},
        'VIERNES': {}, 'SABADO': {}, 'DOMINGO': {}
    };
    
    horariosData.forEach(h => {
        if (h.estado === 'activo') {
            if (!horariosPorDia[h.dia][h.hora_inicio]) {
                horariosPorDia[h.dia][h.hora_inicio] = [];
            }
            horariosPorDia[h.dia][h.hora_inicio].push(h);
        }
    });
    
    if (horasOrdenadas.length === 0) {
        grid.innerHTML = '<div class="col-span-8 text-center py-10 text-gray-500">Configura un rango de horas válido</div>';
        return;
    }
    
    // Renderizar cada franja horaria (incluye slots base + horarios reales)
    horasOrdenadas.forEach(hora => {
        const fila = document.createElement('div');
        fila.className = 'grid grid-cols-8 gap-2 mt-2';
        
        // Determinar si es un slot base o una hora personalizada
        const esSlotBase = slotsBase.includes(hora);
        const tieneHorarios = Object.values(horariosPorDia).some(dia => dia[hora] && dia[hora].length > 0);
        
        // Columna de hora
        const colHora = document.createElement('div');
        colHora.className = 'relative';
        
        const horaDiv = document.createElement('div');
        if (esSlotBase) {
            horaDiv.className = 'text-white p-3 rounded-lg font-bold text-center shadow-md relative';
            horaDiv.style.background = '#f97316'; // branding naranja principal
            horaDiv.style.border = '1px solid #ea580c';
        } else {
            // Hora personalizada - color diferente (amarillo/naranja)
            horaDiv.className = 'text-white p-3 rounded-lg font-bold text-center shadow-md relative';
            horaDiv.style.background = '#fb923c'; // naranja medio para horas personalizadas
            horaDiv.style.border = '1px solid #f97316';
        }
        
        // Contar cuántos horarios hay en esta hora
        const totalHorariosEnHora = Object.values(horariosPorDia).reduce((sum, dia) => {
            return sum + (dia[hora] ? dia[hora].length : 0);
        }, 0);
        
        horaDiv.innerHTML = `
            ${totalHorariosEnHora > 0 ? `
                <button onclick="event.stopPropagation(); eliminarTodosHorariosDeHora('${hora}')" 
                    class="absolute top-1 right-1 text-red-100 hover:text-white hover:bg-red-500 rounded-full p-1 transition-colors" 
                    title="Eliminar todos los horarios de las ${hora}">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            ` : ''}
            <div class="text-lg">${hora}</div>
            ${!esSlotBase ? '<div class="text-xs opacity-90">Personalizado</div>' : ''}
            ${totalHorariosEnHora > 0 ? `<div class="text-xs opacity-75 mt-1">${totalHorariosEnHora} horario${totalHorariosEnHora > 1 ? 's' : ''}</div>` : ''}
        `;
        colHora.appendChild(horaDiv);
        fila.appendChild(colHora);
        
        // Columnas de días
        ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'].forEach(dia => {
            const horariosEnSlot = horariosPorDia[dia][hora] || [];
            const colDia = document.createElement('div');
            
            if (horariosEnSlot.length > 0) {
                colDia.className = 'min-h-[100px] p-2 rounded-lg';
                
                horariosEnSlot.forEach(horario => {
                    const porcentaje = (horario.cupos_ocupados / horario.cupo_maximo) * 100;
                    let colorBg = 'bg-green-100 dark:bg-green-900 border-green-500';
                    if (porcentaje >= 100) colorBg = 'bg-red-100 dark:bg-red-900 border-red-500';
                    else if (porcentaje >= 70) colorBg = 'bg-yellow-100 dark:bg-yellow-900 border-yellow-500';
                    
                    const card = document.createElement('div');
                    card.className = `${colorBg} border-2 p-3 rounded-lg mb-2 text-xs relative hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 overflow-hidden`;
                    const nivelColor = horario.nivel === 'Premium Competitivo' ? 'bg-gradient-to-r from-yellow-500 to-amber-400' : horario.nivel === 'Competitivo' ? 'bg-blue-500' : horario.nivel === 'Básico' ? 'bg-teal-500' : horario.nivel === 'Baby Fútbol' ? 'bg-pink-500' : '';
                    const nivelTexto = horario.nivel === 'Premium Competitivo' ? '★ Premium Competitivo' : horario.nivel === 'Competitivo' ? '★ Competitivo' : horario.nivel === 'Básico' ? '○ Básico' : horario.nivel === 'Baby Fútbol' ? 'Baby Fútbol' : '';
                    const nivelTextColor = horario.nivel === 'Premium Competitivo' ? 'text-amber-600' : horario.nivel === 'Competitivo' ? 'text-blue-600' : horario.nivel === 'Baby Fútbol' ? 'text-pink-600' : 'text-teal-600';
                    card.innerHTML = `
                        ${nivelColor ? `<div class="absolute top-0 inset-x-0 h-1 ${nivelColor}"></div>` : ''}
                        <div class="absolute top-1 right-1 flex gap-1">
                            <button onclick="event.stopPropagation(); abrirModalEdicionRapida(${horario.horario_id})" class="text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full p-1 transition-colors" title="Editar rápido">
                                <span class="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button onclick="event.stopPropagation(); confirmarEliminarHorario(${horario.horario_id})" class="text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900 rounded-full p-1 transition-colors" title="Eliminar horario">
                                <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                        </div>
                        <div onclick="abrirModalEdicionRapida(${horario.horario_id})" class="cursor-pointer pr-14 ${nivelColor ? 'pt-1' : ''}">
                            <div class="font-bold text-black dark:text-white text-sm">${horario.deporte}</div>
                            <div class="text-gray-700 dark:text-gray-300 font-medium">${horario.categoria || 'Sin categoría'}</div>
                            ${nivelTexto ? `<div class="font-black uppercase tracking-wide text-[9px] ${nivelTextColor}">${nivelTexto}</div>` : ''}
                            ${horario.plan ? `<div class="text-[9px] text-gray-500 dark:text-gray-400 font-medium">${horario.plan === 'Econ\u00f3mico' || horario.plan.startsWith('Econ') ? 'Econ\u00f3mico' : horario.plan === 'Est\u00e1ndar' || horario.plan.startsWith('Est') ? 'Est\u00e1ndar' : horario.plan}</div>` : ''}
                            <div class="text-gray-600 dark:text-gray-400 mt-1">${horario.hora_inicio} - ${horario.hora_fin}</div>
                            <div class="font-bold mt-2 flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">group</span>
                                ${horario.cupos_ocupados}/${horario.cupo_maximo}
                            </div>
                        </div>
                    `;
                    colDia.appendChild(card);
                });
            } else {
                // Slot vacío - mostrar botón para agregar
                colDia.className = 'min-h-[100px] p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group';
                colDia.onclick = () => abrirModalHorarioRapido(dia, hora);
                colDia.innerHTML = `
                    <div class="h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                        <span class="material-symbols-outlined text-4xl">add_circle</span>
                        <span class="text-xs mt-1 font-medium">Agregar horario</span>
                    </div>
                `;
            }
            
            fila.appendChild(colDia);
        });
        
        grid.appendChild(fila);
    });
}

// Función auxiliar para generar rango de horas
function generarRangoHoras(inicio, fin) {
    const horas = [];
    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);
    
    let horaActual = hInicio * 60 + mInicio; // Convertir a minutos
    const horaFinal = hFin * 60 + mFin;
    
    while (horaActual <= horaFinal) {
        const h = Math.floor(horaActual / 60);
        const m = horaActual % 60;
        horas.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        horaActual += 30; // Intervalos de 30 minutos
    }
    
    return horas;
}

// Función auxiliar para calcular slot más cercano (redondeo a múltiplos de 30)
function calcularSlotCercano(horaString) {
    const [h, m] = horaString.split(':').map(Number);
    const minutosTotales = h * 60 + m;
    
    // Redondear al múltiplo de 30 más cercano hacia abajo
    const slotMinutos = Math.floor(minutosTotales / 30) * 30;
    
    const slotH = Math.floor(slotMinutos / 60);
    const slotM = slotMinutos % 60;
    
    return `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`;
}

// Nueva función para actualizar el rango de horas
function actualizarRangoHoras() {
    const inicio = document.getElementById('rangoInicio').value;
    const fin = document.getElementById('rangoFin').value;
    
    if (!inicio || !fin) {
        alert('O Debes configurar ambas horas');
        return;
    }
    
    const [hI, mI] = inicio.split(':').map(Number);
    const [hF, mF] = fin.split(':').map(Number);
    
    if ((hI * 60 + mI) >= (hF * 60 + mF)) {
        alert('O La hora de inicio debe ser Menor que la hora de fin');
        return;
    }
    
    renderizarCalendario();
}

function abrirModalHorarioRapido(dia = null, hora = null) {
    abrirModalHorario();
    if (dia) document.getElementById('horario_dia').value = dia;
    if (hora) {
        document.getElementById('horario_inicio').value = hora;
        // Calcular hora fin (1 hora después por defecto)
        const [h, m] = hora.split(':').map(Number);
        let horaFin = h + 1;
        let minFin = m;
        
        // Si es 30 min, hacer que termine en :00 de la siguiente hora
        if (m === 30) {
            horaFin = h + 1;
            minFin = 30;
        }
        
        document.getElementById('horario_fin').value = `${String(horaFin).padStart(2, '0')}:${String(minFin).padStart(2, '0')}`;
    }
}

// ==================== CRUD CATEGORÍAS ====================

async function cargarCategorias() {
    const loading = document.getElementById('loadingCategorias');
    const container = document.getElementById('tablaCategoriasContainer');
    
    loading.classList.remove('hidden');
    container.classList.add('hidden');
    
    try {
        const deporteId = document.getElementById('filtroCategoriaDeporte')?.value;
        let url = `${API_BASE}/api/admin/categorias`;
        if (deporteId) url += `?deporte_id=${deporteId}`;
        
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            categoriasData = data.categorias;
            renderizarTablaCategorias();
            container.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loading.classList.add('hidden');
    }
}

function renderizarTablaCategorias() {
    const tbody = document.getElementById('tablaCategorias');
    tbody.innerHTML = '';
    
    if (categoriasData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-8 text-center text-gray-500">No hay categorías</td></tr>';
        return;
    }
    
    categoriasData.forEach(cat => {
        const badge = cat.estado === 'activo' 
            ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Activo</span>'
            : '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactivo</span>';
        
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 text-sm">${cat.categoria_id}</td>
                <td class="px-6 py-4 text-sm">${normalizeText(cat.deporte)}</td>
                <td class="px-6 py-4 text-sm">
                    ${cat.icono ? `<span class="material-symbols-outlined align-middle">${cat.icono}</span>` : ''} 
                    ${normalizeText(cat.nombre)}
                </td>
                <td class="px-6 py-4 text-sm">${normalizeText(cat.descripcion || '-')}</td>
                <td class="px-6 py-4 text-sm">${cat.ano_min && cat.ano_max ? `${cat.ano_min}-${cat.ano_max}` : '-'}</td>
                <td class="px-6 py-4 text-sm">${cat.orden}</td>
                <td class="px-6 py-4">${badge}</td>
                <td class="px-6 py-4 text-sm">
                    <button onclick="editarCategoria(${cat.categoria_id})" class="text-primary hover:text-primary-dark"><span class="material-symbols-outlined">edit</span></button>
                    <button onclick="confirmarEliminarCategoria(${cat.categoria_id}, '${(cat.nombre || '').replace(/'/g, "\\'")}')" class="text-red-600 hover:text-red-800"><span class="material-symbols-outlined">delete</span></button>
                </td>
            </tr>
        `;
    });
}

function abrirModalCategoria(categoriaId = null) {
    modoEdicion = categoriaId !== null;
    const modal = document.getElementById('modalCategoria');
    document.getElementById('modalCategoriaTitulo').textContent = modoEdicion ? 'Editar Categoría' : 'Nueva Categoría';
    document.getElementById('formCategoria').reset();
    
    if (modoEdicion) {
        const cat = categoriasData.find(c => c.categoria_id === categoriaId);
        if (cat) {
            document.getElementById('categoria_id').value = cat.categoria_id;
            document.getElementById('categoria_deporte').value = cat.deporte_id;
            document.getElementById('categoria_nombre').value = cat.nombre;
            document.getElementById('categoria_descripcion').value = cat.descripcion || '';
            document.getElementById('categoria_ano_min').value = cat.ano_min || '';
            document.getElementById('categoria_ano_max').value = cat.ano_max || '';
            document.getElementById('categoria_icono').value = cat.icono || '';
            document.getElementById('categoria_orden').value = cat.orden || 0;
            document.getElementById('categoria_estado').value = cat.estado;
        }
    }
    
    modal.classList.remove('hidden');
}

function cerrarModalCategoria() {
    document.getElementById('modalCategoria').classList.add('hidden');
}

function editarCategoria(id) {
    abrirModalCategoria(id);
}

// Variables para el modal de confirmar categoría
let _categoriaAccionId = null;
let _categoriaAccionNombre = null;

function confirmarEliminarCategoria(id, nombre) {
    _categoriaAccionId = id;
    _categoriaAccionNombre = nombre;
    const modal = document.getElementById('modalConfirmarCategoria');
    document.getElementById('modalConfirmarCategoriaNombre').textContent = `"${nombre}"`;
    // Si ya está inactiva, deshabilitar botón desactivar
    const cat = categoriasData.find(c => c.categoria_id === id);
    const btnDesactivar = document.getElementById('btnDesactivarCategoria');
    if (cat && cat.estado === 'inactivo') {
        btnDesactivar.disabled = true;
        btnDesactivar.classList.add('opacity-40', 'cursor-not-allowed');
        btnDesactivar.title = 'Ya está inactiva';
    } else {
        btnDesactivar.disabled = false;
        btnDesactivar.classList.remove('opacity-40', 'cursor-not-allowed');
        btnDesactivar.title = '';
    }
    modal.classList.remove('hidden');
}

function cerrarModalConfirmarCategoria() {
    document.getElementById('modalConfirmarCategoria').classList.add('hidden');
    _categoriaAccionId = null;
    _categoriaAccionNombre = null;
}

async function ejecutarDesactivarCategoria() {
    if (!_categoriaAccionId) return;
    const id = _categoriaAccionId;
    cerrarModalConfirmarCategoria();
    try {
        const response = await fetch(`${API_BASE}/api/admin/categorias/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            mostrarToast('Categoría desactivada correctamente', 'success');
            cargarCategorias();
        } else {
            mostrarToast('Error: ' + data.error, 'error');
        }
    } catch (error) {
        mostrarToast('Error de conexión', 'error');
    }
}

async function ejecutarEliminarDefinitivoCategoria() {
    if (!_categoriaAccionId) return;
    const id = _categoriaAccionId;
    cerrarModalConfirmarCategoria();
    try {
        const response = await fetch(`${API_BASE}/api/admin/categorias/${id}/forzar`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            mostrarToast('Categoría eliminada definitivamente', 'success');
            cargarCategorias();
        } else {
            mostrarToast('Error: ' + data.error, 'error');
        }
    } catch (error) {
        mostrarToast('Error de conexión', 'error');
    }
}

// ==================== CRUD DEPORTES ====================

async function cargarDeportes() {
    const loading = document.getElementById('loadingDeportes');
    const container = document.getElementById('tablaDeportesContainer');
    
    loading.classList.remove('hidden');
    container.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE}/api/admin/deportes`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            deportesData = data.deportes;
            renderizarTablaDeportes();
            container.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loading.classList.add('hidden');
    }
}

function renderizarTablaDeportes() {
    const tbody = document.getElementById('tablaDeportes');
    tbody.innerHTML = '';
    
    if (deportesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No hay deportes</td></tr>';
        return;
    }
    
    deportesData.forEach(dep => {
        const badge = dep.estado === 'activo'
            ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Activo</span>'
            : '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactivo</span>';
        
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 text-sm">${dep.deporte_id}</td>
                <td class="px-6 py-4 text-sm">
                    ${dep.icono ? `<span class="material-symbols-outlined align-middle">${dep.icono}</span>` : ''} 
                    ${dep.nombre}
                </td>
                <td class="px-6 py-4 text-sm">${dep.descripcion || '-'}</td>
                <td class="px-6 py-4 text-sm">S/ ${parseFloat(dep.matricula).toFixed(2)}</td>
                <td class="px-6 py-4">${badge}</td>
                <td class="px-6 py-4 text-sm">
                    <button onclick="editarDeporte(${dep.deporte_id})" class="text-primary hover:text-primary-dark"><span class="material-symbols-outlined">edit</span></button>
                    <button onclick="confirmarEliminarDeporte(${dep.deporte_id}, '${dep.nombre.replace(/'/g, "\\'")}', '${dep.estado}')" class="text-red-600 hover:text-red-800"><span class="material-symbols-outlined">delete</span></button>
                </td>
            </tr>
        `;
    });
}

function abrirModalDeporte(deporteId = null) {
    modoEdicion = deporteId !== null;
    const modal = document.getElementById('modalDeporte');
    document.getElementById('modalDeporteTitulo').textContent = modoEdicion ? 'Editar Deporte' : 'Nuevo Deporte';
    document.getElementById('formDeporte').reset();
    
    if (modoEdicion) {
        const dep = deportesData.find(d => d.deporte_id === deporteId);
        if (dep) {
            document.getElementById('deporte_id').value = dep.deporte_id;
            document.getElementById('deporte_nombre').value = dep.nombre;
            document.getElementById('deporte_descripcion').value = dep.descripcion || '';
            document.getElementById('deporte_icono').value = dep.icono || '';
            document.getElementById('deporte_matricula').value = dep.matricula;
            document.getElementById('deporte_estado').value = dep.estado;
        }
    }
    
    modal.classList.remove('hidden');
}

function cerrarModalDeporte() {
    document.getElementById('modalDeporte').classList.add('hidden');
}

function editarDeporte(id) {
    abrirModalDeporte(id);
}

async function confirmarEliminarDeporte(id, nombre, estado) {
    mostrarModalEliminarDeporte(id, nombre, estado);
}

function mostrarModalEliminarDeporte(deporteId, deporteNombre, estadoDeporte) {
    const estaActivo = estadoDeporte === 'activo';
    
    // Opción de desactivar solo si está activo
    const opcionDesactivar = estaActivo ? `
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-yellow-600 mt-0.5">visibility_off</span>
                <div class="flex-1">
                    <h4 class="font-bold text-gray-900 dark:text-white mb-1">Desactivar</h4>
                    <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">El deporte quedará oculto pero podrás reactivarlo después. Los datos se conservan.</p>
                    <button onclick="desactivarDeporte(${deporteId}, '${deporteNombre.replace(/'/g, "\\'")}')" class="w-full px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105">
                        Desactivar Deporte
                    </button>
                </div>
            </div>
        </div>
    ` : '';
    
    // Mensaje de estado actual
    const estadoActual = estaActivo 
        ? '<span class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold"><span class="w-2 h-2 bg-green-500 rounded-full"></span>Activo</span>'
        : '<span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold"><span class="w-2 h-2 bg-gray-500 rounded-full"></span>Inactivo</span>';
    
    const modalHTML = `
        <div id="modalEliminarDeporte" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
            <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-lg w-full transform animate-scale-in">
                <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-6 rounded-t-2xl">
                    <div class="flex items-center gap-4">
                        <div class="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center">
                            <span class="material-symbols-outlined text-5xl text-red-500">warning</span>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-2xl font-bold text-white">Gestionar Deporte</h3>
                            <p class="text-red-100 text-sm mt-1">"${deporteNombre}" - ${estadoActual}</p>
                        </div>
                    </div>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        ${opcionDesactivar}
                        
                        <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                            <div class="flex items-start gap-3">
                                <span class="material-symbols-outlined text-red-600 mt-0.5">delete_forever</span>
                                <div class="flex-1">
                                    <h4 class="font-bold text-gray-900 dark:text-white mb-1">Eliminar permanentemente</h4>
                                    <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">⚠️ Esta acción NO se puede deshacer. Se eliminarán todos los datos asociados.</p>
                                    <button onclick="mostrarConfirmacionEliminarPermanente(${deporteId}, '${deporteNombre.replace(/'/g, "\\'")}')" class="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105">
                                        Eliminar permanentemente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button onclick="cerrarModalEliminarDeporte()" class="w-full mt-6 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white font-semibold rounded-lg transition-colors">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalAnterior = document.getElementById('modalEliminarDeporte');
    if (modalAnterior) modalAnterior.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function cerrarModalEliminarDeporte() {
    const modal = document.getElementById('modalEliminarDeporte');
    if (modal) {
        modal.classList.add('animate-fade-out');
        setTimeout(() => modal.remove(), 300);
    }
}

async function desactivarDeporte(id, nombre) {
    try {
        const response = await fetch(`${API_BASE}/api/admin/deportes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            cerrarModalEliminarDeporte();
            mostrarModalExito(
                'Deporte Desactivado',
                `El deporte "${nombre}" ha sido desactivado correctamente`,
                'visibility_off'
            );
            cargarDeportes();
            cargarDeportesActivos();
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error de conexión', 'error');
    }
}

function mostrarConfirmacionEliminarPermanente(id, nombre) {
    const modalHTML = `
        <div id="modalConfirmacionEliminar" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4 animate-fade-in">
            <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full transform animate-scale-in border-4 border-red-500">
                <div class="bg-gradient-to-br from-red-600 to-red-700 px-6 py-6 rounded-t-2xl text-center">
                    <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-3 animate-pulse">
                        <span class="material-symbols-outlined text-6xl text-red-600">dangerous</span>
                    </div>
                    <h3 class="text-2xl font-black text-white uppercase">¡ATENCIÓN!</h3>
                    <p class="text-red-100 text-sm mt-2 font-semibold">Acción Irreversible</p>
                </div>
                <div class="p-6">
                    <div class="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                        <p class="text-gray-900 dark:text-white font-bold text-center mb-3">
                            ¿Estás completamente seguro de ELIMINAR permanentemente?
                        </p>
                        <p class="text-center text-lg font-black text-red-600 mb-3">"${nombre}"</p>
                    </div>
                    
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                        <p class="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">Se eliminarán:</p>
                        <ul class="space-y-1.5 text-sm text-gray-800 dark:text-gray-200">
                            <li class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-red-500 text-base">close</span>
                                <span>El deporte</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-red-500 text-base">close</span>
                                <span>Todas sus categorías</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-red-500 text-base">close</span>
                                <span>Todos sus horarios</span>
                            </li>
                            <li class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-red-500 text-base">close</span>
                                <span>Todas las inscripciones</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-3 rounded mb-4">
                        <p class="text-sm text-yellow-800 dark:text-yellow-200 font-semibold">
                            ⚠️ Esta acción NO se puede deshacer
                        </p>
                    </div>
                    
                    <div class="flex gap-3">
                        <button onclick="cerrarConfirmacionEliminar()" class="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white font-bold rounded-lg transition-all">
                            Cancelar
                        </button>
                        <button onclick="ejecutarEliminacionPermanente(${id}, '${nombre.replace(/'/g, "\\\'")}')" class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg">
                            Sí, Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalAnterior = document.getElementById('modalConfirmacionEliminar');
    if (modalAnterior) modalAnterior.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function cerrarConfirmacionEliminar() {
    const modal = document.getElementById('modalConfirmacionEliminar');
    if (modal) {
        modal.classList.add('animate-fade-out');
        setTimeout(() => modal.remove(), 300);
    }
}

async function ejecutarEliminacionPermanente(id, nombre) {
    cerrarConfirmacionEliminar();
    
    try {
        const response = await fetch(`${API_BASE}/api/admin/deportes/${id}/eliminar-permanente`, { 
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            cerrarModalEliminarDeporte();
            mostrarModalExito(
                'Deporte Eliminado',
                `El deporte "${nombre}" y todos sus datos asociados han sido eliminados permanentemente`,
                'delete_forever'
            );
            cargarDeportes();
            cargarDeportesActivos();
        } else {
            mostrarNotificacion(data.error, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error de conexión', 'error');
    }
}

// ==================== CRUD HORARIOS ====================

async function cargarHorarios() {
    const loading = document.getElementById('loadingHorarios');
    const container = document.getElementById('tablaHorariosContainer');
    
    loading.classList.remove('hidden');
    container.classList.add('hidden');
    
    try {
        const deporteId = document.getElementById('filtroDeporte')?.value;
        const estado = document.getElementById('filtroEstado')?.value;
        
        let url = `${API_BASE}/api/admin/horarios?`;
        if (deporteId) url += `deporte_id=${deporteId}&`;
        if (estado) url += `estado=${estado}`;
        
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            horariosData = data.horarios;
            renderizarTablaHorarios();
            container.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loading.classList.add('hidden');
    }
}

function renderizarTablaHorarios() {
    const tbody = document.getElementById('tablaHorarios');
    tbody.innerHTML = '';
    
    if (horariosData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="px-6 py-8 text-center text-gray-500">No hay horarios</td></tr>';
        return;
    }
    
    horariosData.forEach(h => {
        const badge = h.estado === 'activo'
            ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Activo</span>'
            : '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactivo</span>';
        
        tbody.innerHTML += `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-4 py-4 text-sm">${h.horario_id}</td>
                <td class="px-4 py-4 text-sm">${h.deporte}</td>
                <td class="px-4 py-4 text-sm">${h.dia}</td>
                <td class="px-4 py-4 text-sm">${h.hora_inicio} - ${h.hora_fin}</td>
                <td class="px-4 py-4 text-sm">${h.categoria || '-'}</td>
                <td class="px-4 py-4 text-sm">${h.ano_min && h.ano_max ? `${h.ano_min}-${h.ano_max}` : '-'}</td>
                <td class="px-4 py-4 text-sm">${h.cupos_ocupados}/${h.cupo_maximo}</td>
                <td class="px-4 py-4 text-sm">S/ ${parseFloat(h.precio).toFixed(2)}</td>
                <td class="px-4 py-4">${badge}</td>
                <td class="px-4 py-4 text-sm">
                    <button onclick="editarHorario(${h.horario_id})" class="text-primary hover:text-primary-dark"><span class="material-symbols-outlined">edit</span></button>
                    <button onclick="confirmarEliminarHorario(${h.horario_id})" class="text-red-600 hover:text-red-800"><span class="material-symbols-outlined">delete</span></button>
                </td>
            </tr>
        `;
    });
}

function abrirModalHorario(horarioId = null) {
    modoEdicion = horarioId !== null;
    const modal = document.getElementById('modalHorario');
    const precioInput = document.getElementById('horario_precio');
    const infoHorario = document.getElementById('info_horario_actual');
    const diasCrear = document.getElementById('horario_dias_crear');
    const diasEditar = document.getElementById('horario_dias_editar');
    
    document.getElementById('modalHorarioTitulo').textContent = modoEdicion ? 'Edición Rápida' : 'Nuevo Horario';
    document.getElementById('formHorario').reset();

    // Limpiar checkboxes al abrir
    document.querySelectorAll('#horario_dias_checkboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    // El precio siempre es editable
    precioInput.removeAttribute('readonly');
    precioInput.classList.remove('bg-gray-100', 'dark:bg-gray-900');
    precioInput.classList.add('bg-white', 'dark:bg-gray-800');
    
    if (modoEdicion) {
        // Modo editar: mostrar select de día único, ocultar checkboxes
        diasCrear.classList.add('hidden');
        diasEditar.classList.remove('hidden');

        const h = horariosData.find(hor => hor.horario_id === horarioId);
        if (h) {
            const deporteNombre = deportesData.find(d => d.deporte_id === h.deporte_id)?.nombre || h.deporte_id;
            infoHorario.textContent = `${deporteNombre} - ${h.dia} ${h.hora_inicio} - ${h.hora_fin}`;
            infoHorario.parentElement.classList.remove('hidden');
            
            document.getElementById('horario_id').value = h.horario_id;
            document.getElementById('horario_deporte').value = h.deporte_id;
            cargarCategoriasDeporte(h.deporte_id, h.categoria);
            document.getElementById('horario_dia').value = h.dia;
            document.getElementById('horario_inicio').value = h.hora_inicio;
            document.getElementById('horario_fin').value = h.hora_fin;
            document.getElementById('horario_nivel').value = h.nivel || '';
            document.getElementById('horario_ano_min').value = h.ano_min || '';
            document.getElementById('horario_ano_max').value = h.ano_max || '';
            document.getElementById('horario_genero').value = h.genero || 'Mixto';
            document.getElementById('horario_cupo').value = h.cupo_maximo;
            document.getElementById('horario_precio').value = h.precio;
            document.getElementById('horario_plan').value = h.plan || '';
            document.getElementById('horario_estado').value = h.estado;
        }
    } else {
        // Modo crear: mostrar checkboxes, ocultar select de día único
        diasCrear.classList.remove('hidden');
        diasEditar.classList.add('hidden');
        infoHorario.parentElement.classList.add('hidden');
    }
    
    modal.classList.remove('hidden');
}

function cerrarModalHorario() {
    document.getElementById('modalHorario').classList.add('hidden');
}

function editarHorario(id) {
    abrirModalHorario(id);
}

// Variable global para guardar el ID del horario a eliminar
let horarioIdAEliminar = null;

function confirmarEliminarHorario(id) {
    horarioIdAEliminar = id;
    const modal = document.getElementById('modalEliminarHorario');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cerrarModalEliminarHorario() {
    const modal = document.getElementById('modalEliminarHorario');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    horarioIdAEliminar = null;
}

async function ejecutarDesactivarHorario() {
    if (!horarioIdAEliminar) return;
    const id = horarioIdAEliminar;
    cerrarModalEliminarHorario();
    try {
        const response = await fetch(`${API_BASE}/api/admin/horarios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            mostrarToast('Horario desactivado correctamente', 'success');
            cargarHorarios();
            cargarCalendario();
        } else {
            mostrarToast('Error: ' + data.error, 'error');
        }
    } catch (error) {
        mostrarToast('Error de conexión', 'error');
    }
}

async function ejecutarEliminarDefinitivoHorario() {
    if (!horarioIdAEliminar) return;
    const id = horarioIdAEliminar;
    cerrarModalEliminarHorario();
    try {
        const response = await fetch(`${API_BASE}/api/admin/horarios/${id}/forzar`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
            mostrarToast('Horario eliminado definitivamente', 'success');
            cargarHorarios();
            cargarCalendario();
        } else {
            mostrarToast('Error: ' + data.error, 'error');
        }
    } catch (error) {
        mostrarToast('Error de conexión', 'error');
    }
}

// mantener por compatibilidad con el calendario
async function ejecutarEliminarHorario() {
    await ejecutarDesactivarHorario();
}

async function _legacyEliminarHorarioAntiguo() {
    if (!horarioIdAEliminar) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/admin/horarios/${horarioIdAEliminar}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        cerrarModalEliminarHorario();
        
        if (data.success) {
            mostrarToast('Horario desactivado correctamente', 'success');
            cargarHorarios();
            cargarCalendario();
        } else {
            if (data.error && data.error.includes('inscripción(es) activa(s)')) {
                const match = data.error.match(/(\d+)/);
                const cantidad = match ? match[1] : '1';
                mostrarModalNoSePuedeEliminar(cantidad);
            } else {
                mostrarToast('Error: ' + data.error, 'error');
            }
        }
    } catch (error) {
        cerrarModalEliminarHorario();
        mostrarNotificacion('O Error de conexión', 'error');
    }
}

function mostrarModalNoSePuedeEliminar(cantidadInscripciones) {
    const modal = document.getElementById('modalNoSePuedeEliminar');
    const cantidadelement = document.getElementById('cantidadInscripciones');
    
    if (cantidadelement) {
        cantidadelement.textContent = cantidadInscripciones;
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function cerrarModalNoSePuedeEliminar() {
    const modal = document.getElementById('modalNoSePuedeEliminar');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
}

function irAPagos() {
    cerrarModalNoSePuedeEliminar();
    // Verificar si existe la pestaña de inscripciones
    const tabInscripciones = document.getElementById('tab-inscripciones');
    if (tabInscripciones) {
        cambiarTab('inscripciones');
    } else {
        // Si no existe, intentar con 'pagos'
        cambiarTab('pagos');
    }
}

// Cerrar modales al hacer clic fuera
function setupModalCloseHandlers() {
    const modalEliminar = document.getElementById('modalEliminarHorario');
    if (modalEliminar) {
        modalEliminar.addEventListener('click', (e) => {
            if (e.target === modalEliminar) {
                cerrarModalEliminarHorario();
            }
        });
    }
    
    const modalNoSePuede = document.getElementById('modalNoSePuedeEliminar');
    if (modalNoSePuede) {
        modalNoSePuede.addEventListener('click', (e) => {
            if (e.target === modalNoSePuede) {
                cerrarModalNoSePuedeEliminar();
            }
        });
    }
}


async function eliminarTodosHorariosDeHora(hora) {
    // Encontrar todos los horarios que empiezan a esta hora
    const horariosEnHora = horariosData.filter(h => h.hora_inicio === hora && h.estado === 'activo');
    
    if (horariosEnHora.length === 0) {
        mostrarNotificacion('No hay horarios activos en esta franja horaria', 'warning');
        return;
    }
    
    const deportesUnicos = [...new Set(horariosEnHora.map(h => normalizeText(h.deporte)).filter(Boolean))];
    const confirmado = await mostrarModalConfirmarEliminarHorariosHora(hora, horariosEnHora.length, deportesUnicos);
    if (!confirmado) return;
    
    try {
        let eliminados = 0;
        for (const horario of horariosEnHora) {
            const response = await fetch(`${API_BASE}/api/admin/horarios/${horario.horario_id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) eliminados++;
        }
        
        if (eliminados > 0) {
            mostrarModalExito('Horarios Eliminados', `Se eliminaron ${eliminados} horario(s) de las ${hora}`, 'delete_sweep');
        } else {
            mostrarNotificacion('No se pudo eliminar ningún horario', 'warning');
        }
        cargarCalendario();
    } catch (error) {
        mostrarNotificacion('Error de conexión', 'error');
    }
}

let _resolverModalEliminarHora = null;

function mostrarModalConfirmarEliminarHorariosHora(hora, cantidad, deportes = []) {
    return new Promise((resolve) => {
        _resolverModalEliminarHora = resolve;

        const modalAnterior = document.getElementById('modalConfirmarEliminarHorariosHora');
        if (modalAnterior) modalAnterior.remove();

        const listaDeportes = deportes.length > 0
            ? deportes.map(dep => `<li class="text-sm" style="color:#1f2937;">- ${dep}</li>`).join('')
            : '<li class="text-sm" style="color:#1f2937;">- Sin deporte especificado</li>';

        const modalHTML = `
            <div id="modalConfirmarEliminarHorariosHora" class="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in" style="background:rgba(0,0,0,.82);backdrop-filter:blur(4px);" onclick="cerrarModalEliminarHorariosHora(false, event)">
                <div class="rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border" style="background:#ffffff;border-color:#cbd5e1;box-shadow:0 28px 60px rgba(0,0,0,.45);" onclick="event.stopPropagation()">
                    <div class="px-6 py-5" style="background:#c2410c;">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background:#fff7ed;">
                                <span class="material-symbols-outlined text-3xl" style="color:#c2410c;">warning</span>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold" style="color:#ffffff;">Eliminar Horarios</h3>
                                <p class="text-sm font-semibold" style="color:#ffedd5;">Franja ${hora}</p>
                            </div>
                        </div>
                    </div>
                    <div class="p-6" style="background:#f8fafc;">
                        <p class="font-semibold mb-3" style="color:#0f172a;">¿Eliminar ${cantidad} horario(s) de las ${hora}?</p>
                        <div class="rounded-lg p-3 mb-4" style="background:#fff7ed;border:1px solid #fdba74;">
                            <p class="text-xs font-bold uppercase mb-2" style="color:#c2410c;">Deportes afectados</p>
                            <ul class="space-y-1 max-h-32 overflow-auto">${listaDeportes}</ul>
                        </div>
                        <div class="flex gap-3">
                            <button type="button" onclick="cerrarModalEliminarHorariosHora(false)" class="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors" style="background:#e2e8f0;color:#0f172a;">Cancelar</button>
                            <button type="button" onclick="cerrarModalEliminarHorariosHora(true)" class="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors" style="background:#dc2626;color:#ffffff;">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
    });
}

function cerrarModalEliminarHorariosHora(confirmado, event = null) {
    if (event && event.target && event.target.id !== 'modalConfirmarEliminarHorariosHora') return;

    const modal = document.getElementById('modalConfirmarEliminarHorariosHora');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = '';

    if (_resolverModalEliminarHora) {
        const resolver = _resolverModalEliminarHora;
        _resolverModalEliminarHora = null;
        resolver(Boolean(confirmado));
    }
}

// ==================== EDICI"N RÁPIDA DE HORARIOS ====================

async function abrirModalEdicionRapida(horarioId) {
    const horario = horariosData.find(h => h.horario_id === horarioId);
    if (!horario) {
        alert('Horario no encontrado');
        return;
    }

    // Cargar deportes y categorías si aún no están disponibles (ej: vista calendario)
    if (deportesData.length === 0) {
        try {
            const res = await fetch(`${API_BASE}/api/admin/deportes`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (data.success) deportesData = data.deportes;
        } catch(e) { console.error('Error cargando deportes', e); }
    }
    if (categoriasData.length === 0) {
        try {
            const res = await fetch(`${API_BASE}/api/admin/categorias`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (data.success) categoriasData = data.categorias;
        } catch(e) { console.error('Error cargando categorias', e); }
    }

    // Crear modal dinámicamente
    const modalHTML = `
        <div id="modalEdicionRapida" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-surface-dark rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div class="bg-primary text-white px-6 py-4 rounded-t-xl flex justify-between items-center sticky top-0 z-10">
                    <h3 class="text-xl font-bold">Edición Rápida</h3>
                    <button onclick="cerrarModalEdicionRapida()" class="hover:bg-white/20 rounded-full p-1">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form id="formEdicionRapida" class="p-6">
                    <input type="hidden" id="editar_horario_id" value="${horario.horario_id}">
                    
                    <!-- Información del horario -->
                    <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm mb-5">
                        <div class="font-bold text-black dark:text-white">${horario.deporte}</div>
                        <div class="text-gray-600 dark:text-gray-400">${horario.dia} ${horario.hora_inicio} - ${horario.hora_fin}</div>
                    </div>
                    
                    <!-- Grid de 2 columnas para los campos -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

                        <div>
                            <label class="block text-sm font-medium mb-2">Deporte *</label>
                            <select id="editar_deporte_id" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800" required onchange="actualizarCategoriasEdicionRapida()">
                                ${deportesData.map(d => `<option value="${d.deporte_id}" ${d.deporte_id === horario.deporte_id ? 'selected' : ''}>${d.nombre}</option>`).join('')}
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Día *</label>
                            <select id="editar_dia" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800" required>
                                ${['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO'].map(d => `<option value="${d}" ${horario.dia === d ? 'selected' : ''}>${d.charAt(0)+d.slice(1).toLowerCase()}</option>`).join('')}
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Hora Inicio *</label>
                            <input type="time" id="editar_hora_inicio" value="${horario.hora_inicio}" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800" required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Hora Fin *</label>
                            <input type="time" id="editar_hora_fin" value="${horario.hora_fin}" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800" required>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Categoría</label>
                            <select id="editar_categoria" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                                <option value="">Sin categoría</option>
                                ${categoriasData.filter(c => Number(c.deporte_id) === Number(horario.deporte_id)).map(c => `<option value="${c.nombre}" ${horario.categoria === c.nombre ? 'selected' : ''}>${c.nombre}</option>`).join('')}
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Nivel (opcional)</label>
                            <select id="editar_nivel" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                                <option value="" ${!horario.nivel ? 'selected' : ''}>Sin nivel específico</option>
                                ${nivelesData.map(n => `<option value="${n.nombre}" ${horario.nivel === n.nombre ? 'selected' : ''}>${n.nombre}</option>`).join('')}
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Género</label>
                            <select id="editar_genero" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                                <option value="Mixto" ${(horario.genero||'Mixto') === 'Mixto' ? 'selected' : ''}>Mixto</option>
                                <option value="Masculino" ${horario.genero === 'Masculino' ? 'selected' : ''}>Masculino</option>
                                <option value="Femenino" ${horario.genero === 'Femenino' ? 'selected' : ''}>Femenino</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Plan de Pago</label>
                            <select id="editar_plan" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                                <option value="">Sin plan específico</option>
                                ${planesData.map(p => `<option value="${p.nombre}" ${horario.plan === p.nombre ? 'selected' : ''}>${p.nombre}${p.tipo === 'precio_fijo' ? ` (S/${p.precio_fijo} fijo)` : [p.precio_1dia ? `1d:S/${p.precio_1dia}` : '', p.precio_2dias ? `2d:S/${p.precio_2dias}` : '', p.precio_3dias ? `3d:S/${p.precio_3dias}` : ''].filter(Boolean).map((x,i) => i===0 ? ' (' + x : x).join(' | ') + ')'}</option>`).join('')}
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Precio (S/) *</label>
                            <input type="number" id="editar_precio" value="${horario.precio || ''}" step="0.01" min="0"
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800" 
                                placeholder="Ej: 60.00">
                            <div class="text-xs text-gray-400 mt-1">Econ: 2d=S/60, 3d=S/80 | Est: 1d=S/40, 2d=S/80, 3d=S/120 | Prem: 2d=S/100, 3d=S/150</div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Cupo Máximo *</label>
                            <input type="number" id="editar_cupo_maximo" value="${horario.cupo_maximo}" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800" 
                                min="1" max="100" required>
                            <div class="text-xs text-gray-500 mt-1">Ocupados actualmente: ${horario.cupos_ocupados}</div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Año Mínimo</label>
                            <input type="number" id="editar_ano_min" value="${horario.ano_min || ''}" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800" 
                                placeholder="Ej: 1900" min="1900" max="2026">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Año Máximo</label>
                            <input type="number" id="editar_ano_max" value="${horario.ano_max || ''}" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800" 
                                placeholder="Ej: 2008" min="1900" max="2026">
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-2">Estado</label>
                            <select id="editar_estado" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                                <option value="activo" ${(horario.estado||'activo') === 'activo' ? 'selected' : ''}>Activo</option>
                                <option value="inactivo" ${horario.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
                                <option value="completo" ${horario.estado === 'completo' ? 'selected' : ''}>Completo</option>
                            </select>
                        </div>
                        
                    </div>
                    
                    <!-- Botones de acción -->
                    <div class="flex gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onclick="cerrarModalEdicionRapida()" 
                            class="flex-1 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-semibold transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" 
                            class="flex-1 px-4 py-2.5 bg-primary hover:bg-yellow-500 text-black rounded-lg font-semibold transition-colors">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const modalAnterior = document.getElementById('modalEdicionRapida');
    if (modalAnterior) modalAnterior.remove();
    
    // Agregar al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar evento submit
    document.getElementById('formEdicionRapida').addEventListener('submit', guardarEdicionRapida);
}

function cerrarModalEdicionRapida() {
    const modal = document.getElementById('modalEdicionRapida');
    if (modal) modal.remove();
}

function actualizarCategoriasEdicionRapida() {
    const deporteId = parseInt(document.getElementById('editar_deporte_id').value);
    const select = document.getElementById('editar_categoria');
    if (!select) return;
    const catsFiltradas = categoriasData.filter(c => Number(c.deporte_id) === deporteId);
    select.innerHTML = '<option value="">Sin categoría</option>' +
        catsFiltradas.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
}

async function guardarEdicionRapida(e) {
    e.preventDefault();
    
    const horarioId = document.getElementById('editar_horario_id').value;
    const formData = {
        deporte_id: parseInt(document.getElementById('editar_deporte_id').value),
        dia: document.getElementById('editar_dia').value,
        hora_inicio: document.getElementById('editar_hora_inicio').value,
        hora_fin: document.getElementById('editar_hora_fin').value,
        categoria: document.getElementById('editar_categoria').value || null,
        nivel: document.getElementById('editar_nivel').value || null,
        genero: document.getElementById('editar_genero').value || null,
        plan: document.getElementById('editar_plan').value || null,
        precio: document.getElementById('editar_precio').value ? parseFloat(document.getElementById('editar_precio').value) : null,
        cupo_maximo: parseInt(document.getElementById('editar_cupo_maximo').value),
        ano_min: document.getElementById('editar_ano_min').value ? parseInt(document.getElementById('editar_ano_min').value) : null,
        ano_max: document.getElementById('editar_ano_max').value ? parseInt(document.getElementById('editar_ano_max').value) : null,
        estado: document.getElementById('editar_estado').value || 'activo'
    };
    
    // Validación de cupos
    const horarioActual = horariosData.find(h => h.horario_id == horarioId);
    if (formData.cupo_maximo < horarioActual.cupos_ocupados) {
        alert(`O El cupo máximo no puede ser Menor que los cupos ocupados (${horarioActual.cupos_ocupados})`);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/admin/horarios/${horarioId}/edicion-rapida`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            cerrarModalEdicionRapida();
            // Recargar calendario para reflejar cambios
            await cargarCalendario();
            // Mostrar notificación de éxito
            mostrarNotificacionTemporal('o. Horario actualizado correctamente');
        } else {
            alert('O ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('O Error de conexión');
    }
}

function mostrarNotificacionTemporal(Mensaje) {
    const notif = document.createElement('div');
    notif.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down';
    notif.textContent = Mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.add('animate-fade-out-up');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

function mostrarNotificacion(Mensaje, tipo = 'info') {
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const notif = document.createElement('div');
    notif.className = `fixed top-4 right-4 ${colores[tipo]} text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-fade-in-down flex items-center gap-2`;
    notif.innerHTML = `
        <span class="material-symbols-outlined">${tipo === 'success' ? 'check_circle' : tipo === 'error' ? 'error' : 'info'}</span>
        <span>${Mensaje}</span>
    `;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.add('animate-fade-out-up');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

function mostrarModalExito(titulo, Mensaje, icono = 'check_circle') {
    const modalHTML = `
        <div id="modalExitoPersonalizado" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in" style="background:rgba(0,0,0,.78);">
            <div class="rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform animate-scale-in border" style="background:#ffffff;border-color:#cbd5e1;box-shadow:0 28px 60px rgba(0,0,0,.42);">
                <div class="px-6 py-8 text-center" style="background:#16a34a;">
                    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 animate-bounce-in" style="background:#f0fdf4;">
                        <span class="material-symbols-outlined text-6xl" style="color:#16a34a;">${icono}</span>
                    </div>
                    <h3 class="text-2xl font-bold" style="color:#ffffff;">${titulo}</h3>
                </div>
                <div class="p-6 text-center" style="background:#f8fafc;">
                    <p class="text-lg mb-6" style="color:#334155;">${Mensaje}</p>
                    <button onclick="cerrarModalExito()" class="w-full px-6 py-3 font-bold rounded-lg transition-all transform hover:scale-[1.01] shadow-lg" style="background:#f59e0b;color:#111827;">
                        ¡Entendido!
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalAnterior = document.getElementById('modalExitoPersonalizado');
    if (modalAnterior) modalAnterior.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
        const modal = document.getElementById('modalExitoPersonalizado');
        if (modal) {
            modal.classList.add('animate-fade-out');
            setTimeout(() => modal.remove(), 300);
        }
    }, 3000);
}

function cerrarModalExito() {
    const modal = document.getElementById('modalExitoPersonalizado');
    if (modal) {
        modal.classList.add('animate-fade-out');
        setTimeout(() => modal.remove(), 300);
    }
}

// ==================== AUXILIARES ====================

async function cargarDeportesActivos() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/deportes-activos`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            // Actualizar selectores
            ['filtroDeporte', 'horario_deporte', 'categoria_deporte', 'filtroCategoriaDeporte'].forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    const firstOption = select.querySelector('option');
                    select.innerHTML = firstOption ? firstOption.outerHTML : '<option value="">Selecciona</option>';
                    data.deportes.forEach(dep => {
                        select.innerHTML += `<option value="${dep.deporte_id}">${dep.nombre}</option>`;
                    });
                }
            });
            
            // Evento para cargar categorías al cambiar deporte
            const selectDeporte = document.getElementById('horario_deporte');
            if (selectDeporte) {
                selectDeporte.onchange = (e) => cargarCategoriasDeporte(e.target.value);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarCategoriasDeporte(deporteId, categoriaSeleccionada = null) {
    if (!deporteId) {
        document.getElementById('horario_categoria').innerHTML = '<option value="">Sin categoría</option>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/admin/categorias?deporte_id=${deporteId}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('horario_categoria');
            select.innerHTML = '<option value="">Sin categoría</option>';
            
            data.categorias.forEach(cat => {
                if (cat.estado === 'activo') {
                    const option = document.createElement('option');
                    option.value = cat.nombre;
                    option.textContent = `${normalizeText(cat.nombre)} (${cat.ano_min}-${cat.ano_max})`;
                    option.dataset.ano_min = cat.ano_min;
                    option.dataset.ano_max = cat.ano_max;
                    if (categoriaSeleccionada && cat.nombre === categoriaSeleccionada) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                }
            });
            
            // Auto-completar años
            select.onchange = (e) => {
                const opt = e.target.options[e.target.selectedIndex];
                if (opt.dataset.ano_min) {
                    document.getElementById('horario_ano_min').value = opt.dataset.ano_min;
                    document.getElementById('horario_ano_max').value = opt.dataset.ano_max;
                }
            };
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ==================== FORM HANDLERS ====================

function setupFormHandlers() {
    // Evento para sugerir precio según el plan seleccionado (el admin debe ajustar según días)
    const planSelect = document.getElementById('horario_plan');
    const precioInput = document.getElementById('horario_precio');
    
    if (planSelect && precioInput) {
        planSelect.addEventListener('change', function() {
            const plan = this.value;
            
            // Mostrar placeholder con sugerencia, no establecer valor automático
            switch(plan) {
                case 'Económico':
                    precioInput.placeholder = 'Ej: S/ 60 (2 días) o S/ 80 (3+ días)';
                    break;
                case 'Estándar':
                    precioInput.placeholder = 'Ej: S/ 40 (1 día), S/ 80 (2 días), S/ 120 (3 días)';
                    break;
                case 'Premium':
                    precioInput.placeholder = 'Ej: S/ 100 (2 días) o S/ 150 (3 días)';
                    break;
                case 'Baby Fútbol':
                    precioInput.placeholder = 'Ej: S/ 50 (1 día), S/ 100 (2 días), S/ 150 (3 días)';
                    break;
                default:
                    precioInput.placeholder = 'Ingrese el precio';
            }
        });
    }
    
    // Form Deporte
    document.getElementById('formDeporte').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('deporte_id').value;
        const formData = {
            nombre: document.getElementById('deporte_nombre').value,
            descripcion: document.getElementById('deporte_descripcion').value,
            icono: document.getElementById('deporte_icono').value,
            matricula: parseFloat(document.getElementById('deporte_matricula').value),
            estado: document.getElementById('deporte_estado').value
        };
        
        try {
            const url = id ? `${API_BASE}/api/admin/deportes/${id}` : `${API_BASE}/api/admin/deportes`;
            const response = await fetch(url, {
                method: id ? 'PUT' : 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                mostrarModalExito(
                    id ? 'Deporte Actualizado' : 'Deporte Creado',
                    id ? 'El deporte ha sido actualizado correctamente' : 'El nuevo deporte ha sido creado exitosamente',
                    'sports_soccer'
                );
                cerrarModalDeporte();
                cargarDeportes();
                cargarDeportesActivos();
            } else {
                mostrarNotificacion(data.error, 'error');
            }
        } catch (error) {
            mostrarNotificacion('Error de conexión', 'error');
        }
    });
    
    // Form Categoría
    document.getElementById('formCategoria').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('categoria_id').value;
        const formData = {
            deporte_id: parseInt(document.getElementById('categoria_deporte').value),
            nombre: document.getElementById('categoria_nombre').value,
            descripcion: document.getElementById('categoria_descripcion').value || null,
            ano_min: document.getElementById('categoria_ano_min').value ? parseInt(document.getElementById('categoria_ano_min').value) : null,
            ano_max: document.getElementById('categoria_ano_max').value ? parseInt(document.getElementById('categoria_ano_max').value) : null,
            icono: document.getElementById('categoria_icono').value || null,
            orden: parseInt(document.getElementById('categoria_orden').value) || 0,
            estado: document.getElementById('categoria_estado').value
        };
        
        try {
            const url = id ? `${API_BASE}/api/admin/categorias/${id}` : `${API_BASE}/api/admin/categorias`;
            const response = await fetch(url, {
                method: id ? 'PUT' : 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                mostrarModalExito(
                    id ? 'Categoría Actualizada' : 'Categoría Creada',
                    id ? 'La categoría ha sido actualizada correctamente' : 'La nueva categoría ha sido creada exitosamente',
                    'category'
                );
                cerrarModalCategoria();
                cargarCategorias();
            } else {
                mostrarNotificacion(data.error, 'error');
            }
        } catch (error) {
            mostrarNotificacion('Error de conexión', 'error');
        }
    });
    
    // Form Horario
    document.getElementById('formHorario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('horario_id').value;

        const baseData = {
            deporte_id: parseInt(document.getElementById('horario_deporte').value),
            hora_inicio: document.getElementById('horario_inicio').value,
            hora_fin: document.getElementById('horario_fin').value,
            categoria: document.getElementById('horario_categoria').value || null,
            nivel: document.getElementById('horario_nivel').value || null,
            ano_min: document.getElementById('horario_ano_min').value ? parseInt(document.getElementById('horario_ano_min').value) : null,
            ano_max: document.getElementById('horario_ano_max').value ? parseInt(document.getElementById('horario_ano_max').value) : null,
            genero: document.getElementById('horario_genero').value,
            cupo_maximo: parseInt(document.getElementById('horario_cupo').value),
            precio: parseFloat(document.getElementById('horario_precio').value),
            plan: document.getElementById('horario_plan').value || null,
            estado: document.getElementById('horario_estado').value
        };

        try {
            if (id) {
                // EDITAR: un solo horario con día del select
                const formData = { ...baseData, dia: document.getElementById('horario_dia').value };
                const response = await fetch(`${API_BASE}/api/admin/horarios/${id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(formData)
                });
                const data = await response.json();
                if (data.success) {
                    mostrarModalExito('Horario Actualizado', 'El horario ha sido actualizado correctamente', 'schedule');
                    cerrarModalHorario();
                    cargarHorarios();
                    cargarCalendario();
                } else {
                    mostrarNotificacion(data.error, 'error');
                }
            } else {
                // CREAR: uno o varios horarios según días seleccionados
                const diasSeleccionados = Array.from(
                    document.querySelectorAll('#horario_dias_checkboxes input[type="checkbox"]:checked')
                ).map(cb => cb.value);

                if (diasSeleccionados.length === 0) {
                    mostrarNotificacion('Selecciona al menos un día', 'error');
                    return;
                }

                let creados = 0;
                let errores = [];
                for (const dia of diasSeleccionados) {
                    const response = await fetch(`${API_BASE}/api/admin/horarios`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ ...baseData, dia })
                    });
                    const data = await response.json();
                    if (data.success) creados++;
                    else errores.push(`${dia}: ${data.error}`);
                }

                cerrarModalHorario();
                cargarHorarios();
                cargarCalendario();

                if (errores.length === 0) {
                    mostrarModalExito(
                        creados === 1 ? 'Horario Creado' : `${creados} Horarios Creados`,
                        creados === 1 ? 'El horario ha sido creado exitosamente' : `Se crearon ${creados} horarios correctamente`,
                        'schedule'
                    );
                } else {
                    mostrarNotificacion(`${creados} creados. Errores: ${errores.join(', ')}`, 'warning');
                }
            }
        } catch (error) {
            mostrarNotificacion('Error de conexión', 'error');
        }
    });
}
// ==================== REPORTES DE ALUMNOS ====================

let datosReporte = [];

async function cargarFiltrosReportes() {
    try {
        // Cargar deportes
        const responseDeportes = await fetch(`${API_BASE}/api/admin/deportes-activos`, {
            headers: getAuthHeaders()
        });
        const dataDeportes = await responseDeportes.json();
        
        if (dataDeportes.success) {
            const selectDeporte = document.getElementById('reporteDeporte');
            dataDeportes.deportes.forEach(dep => {
                selectDeporte.innerHTML += `<option value="${dep.deporte_id}">${dep.nombre}</option>`;
            });
        }
        
        // Cargar categorías
        const responseCategorias = await fetch(`${API_BASE}/api/admin/categorias`, {
            headers: getAuthHeaders()
        });
        const dataCategorias = await responseCategorias.json();
        
        if (dataCategorias.success) {
            const selectCategoria = document.getElementById('reporteCategoria');
            const categoriasUnicas = [...new Set(dataCategorias.categorias.map(c => c.nombre))];
            categoriasUnicas.forEach(cat => {
                selectCategoria.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
        }
    } catch (error) {
        console.error('Error al cargar filtros:', error);
    }
}

async function generarReporte() {
    const deporteId = document.getElementById('reporteDeporte').value;
    const dia = document.getElementById('reporteDia').value;
    const categoria = document.getElementById('reporteCategoria').value;
    
    try {
        let url = `${API_BASE}/api/admin/reporte-alumnos?`;
        if (deporteId) url += `deporte_id=${deporteId}&`;
        if (dia) url += `dia=${dia}&`;
        if (categoria) url += `categoria=${categoria}`;
        
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        if (data.success && data.alumnos.length > 0) {
            datosReporte = data.alumnos;
            mostrarResultadosReporte(data.alumnos);
            document.getElementById('botonesExportacion').classList.remove('hidden');
            document.getElementById('sinResultados').classList.add('hidden');
        } else {
            datosReporte = [];
            document.getElementById('resultadosReporte').classList.add('hidden');
            document.getElementById('botonesExportacion').classList.add('hidden');
            document.getElementById('sinResultados').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al generar reporte', 'error');
    }
}

function mostrarResultadosReporte(alumnos) {
    const container = document.getElementById('resultadosReporte');
    container.classList.remove('hidden');
    
    // Agrupar por horario
    const porHorario = {};
    alumnos.forEach(alumno => {
        const key = `${alumno.deporte} - ${alumno.dia} ${alumno.hora_inicio}`;
        if (!porHorario[key]) {
            porHorario[key] = {
                deporte: alumno.deporte,
                dia: alumno.dia,
                hora: `${alumno.hora_inicio} - ${alumno.hora_fin}`,
                categoria: alumno.categoria || 'Sin categoría',
                alumnos: []
            };
        }
        porHorario[key].alumnos.push(alumno);
    });
    
    let html = '';
    Object.values(porHorario).forEach(grupo => {
        html += `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6 reporte-grupo">
                <h3 class="text-xl font-bold mb-2 text-black dark:text-white">${grupo.deporte} - ${grupo.dia} ${grupo.hora}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Categoría: ${normalizeText(grupo.categoria)} | ${grupo.alumnos.length} alumnos</p>
                
                <div class="overflow-x-auto">
                    <table class="min-w-full tabla-reporte">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">#</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">DNI</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Nombres</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Apellidos</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Edad</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Sexo</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Teléfono</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Apoderado</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        `;
        
        grupo.alumnos.forEach((alumno, index) => {
            const edad = calcularEdad(alumno.fecha_nacimiento);
            html += `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${index + 1}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${alumno.dni}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${alumno.nombres}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${alumno.apellido_paterno} ${alumno.apellido_materno}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${edad}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${alumno.sexo}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${alumno.telefono || '-'}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${alumno.apoderado || '-'}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}

function exportarExcel() {
    if (datosReporte.length === 0) {
        mostrarNotificacion('No hay datos para exportar', 'error');
        return;
    }
    
    const wb = XLSX.utils.book_new();
    const wsData = [
        ['REPORTE DE ALUMNOS - JAGUARES'],
        [`Generado: ${new Date().toLocaleString('es-PE')}`],
        [''],
        ['#', 'DNI', 'Nombres', 'Apellidos', 'Edad', 'Sexo', 'Teléfono', 'Apoderado', 'Deporte', 'Día', 'Horario', 'Categoría']
    ];
    
    datosReporte.forEach((alumno, index) => {
        wsData.push([
            index + 1,
            alumno.dni,
            alumno.nombres,
            `${alumno.apellido_paterno} ${alumno.apellido_materno}`,
            calcularEdad(alumno.fecha_nacimiento),
            alumno.sexo,
            alumno.telefono || '-',
            alumno.apoderado || '-',
            alumno.deporte,
            alumno.dia,
            `${alumno.hora_inicio} - ${alumno.hora_fin}`,
            alumno.categoria || 'Sin categoría'
        ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
        { wch: 5 }, { wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 8 },
        { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 12 },
        { wch: 18 }, { wch: 20 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Alumnos');
    XLSX.writeFile(wb, `Reporte_Alumnos_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    mostrarNotificacion('o. Excel generado correctamente', 'success');
}

function exportarPDF() {
    if (datosReporte.length === 0) {
        mostrarNotificacion('No hay datos para exportar', 'error');
        return;
    }
    
    // Crear ventana para imprimir con estilos optimizados
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Reporte de Alumnos - Jaguares</title>
            <style>
                @page {
                    size: A4 landscape;
                    margin: 15mm;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    font-size: 10pt;
                    line-height: 1.3;
                    color: #000;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 3px solid #C59D5F;
                }
                
                .header h1 {
                    font-size: 20pt;
                    color: #000;
                    margin-bottom: 5px;
                }
                
                .header p {
                    font-size: 10pt;
                    color: #666;
                }
                
                .grupo {
                    page-break-inside: avoid;
                    margin-bottom: 25px;
                }
                
                .grupo-titulo {
                    background: #C59D5F;
                    color: white;
                    padding: 8px 12px;
                    font-size: 12pt;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .grupo-info {
                    background: #f5f5f5;
                    padding: 5px 12px;
                    font-size: 9pt;
                    color: #666;
                    margin-bottom: 10px;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                
                th {
                    background: #333;
                    color: white;
                    padding: 8px 6px;
                    text-align: left;
                    font-size: 9pt;
                    font-weight: 600;
                }
                
                td {
                    padding: 6px;
                    border-bottom: 1px solid #ddd;
                    font-size: 9pt;
                }
                
                tr:nth-child(even) {
                    background: #f9f9f9;
                }
                
                .footer {
                    position: fixed;
                    bottom: 10mm;
                    left: 0;
                    right: 0;
                    text-align: center;
                    font-size: 8pt;
                    color: #999;
                }
                
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ESCUELA DEPORTIVA JAGUARES</h1>
                <p>Reporte de Alumnos Inscritos</p>
                <p>Generado: ${new Date().toLocaleString('es-PE')}</p>
            </div>
    `);
    
    // Agrupar por horario
    const porHorario = {};
    datosReporte.forEach(alumno => {
        const key = `${alumno.deporte} - ${alumno.dia} ${alumno.hora_inicio}`;
        if (!porHorario[key]) {
            porHorario[key] = {
                deporte: alumno.deporte,
                dia: alumno.dia,
                hora: `${alumno.hora_inicio} - ${alumno.hora_fin}`,
                categoria: alumno.categoria || 'Sin categoría',
                alumnos: []
            };
        }
        porHorario[key].alumnos.push(alumno);
    });
    
    // Generar contenido por grupo
    Object.values(porHorario).forEach(grupo => {
        ventana.document.write(`
            <div class="grupo">
                <div class="grupo-titulo">
                    ${grupo.deporte} - ${grupo.dia} ${grupo.hora}
                </div>
                <div class="grupo-info">
                    Categoría: ${normalizeText(grupo.categoria)} | Total: ${grupo.alumnos.length} alumno(s)
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 4%">#</th>
                            <th style="width: 10%">DNI</th>
                            <th style="width: 18%">Nombres</th>
                            <th style="width: 22%">Apellidos</th>
                            <th style="width: 6%">Edad</th>
                            <th style="width: 8%">Sexo</th>
                            <th style="width: 12%">Teléfono</th>
                            <th style="width: 20%">Apoderado</th>
                        </tr>
                    </thead>
                    <tbody>
        `);
        
        grupo.alumnos.forEach((alumno, index) => {
            const edad = calcularEdad(alumno.fecha_nacimiento);
            ventana.document.write(`
                <tr>
                    <td>${index + 1}</td>
                    <td>${alumno.dni}</td>
                    <td>${alumno.nombres}</td>
                    <td>${alumno.apellido_paterno} ${alumno.apellido_materno}</td>
                    <td>${edad}</td>
                    <td>${alumno.sexo}</td>
                    <td>${alumno.telefono || '-'}</td>
                    <td>${alumno.apoderado || '-'}</td>
                </tr>
            `);
        });
        
        ventana.document.write(`
                    </tbody>
                </table>
            </div>
        `);
    });
    
    ventana.document.write(`
            <div class="footer">
                Escuela Deportiva Jaguares - Sistema de Gestión de Alumnos
            </div>
        </body>
        </html>
    `);
    
    ventana.document.close();
    
    // Esperar a que cargue, enfocar y luego imprimir
    setTimeout(() => {
        ventana.focus();
        ventana.print();
    }, 500);
}

function imprimirReporte() {
    exportarPDF(); // Usa la misma función
}

// ==================== PLANES Y NIVELES DINÁMICOS ====================

async function cargarPlanesNiveles() {
    try {
        const [resPlan, resNivel] = await Promise.all([
            fetch(`${API_BASE}/api/admin/planes`, { headers: getAuthHeaders() }),
            fetch(`${API_BASE}/api/admin/niveles`, { headers: getAuthHeaders() })
        ]);
        const [dataPlan, dataNivel] = await Promise.all([resPlan.json(), resNivel.json()]);

        if (dataPlan.success) {
            planesData = dataPlan.planes;
            // Poblar select horario_plan (Nuevo Horario)
            const selPlan = document.getElementById('horario_plan');
            if (selPlan) {
                selPlan.innerHTML = '<option value="">Sin plan específico</option>' +
                    planesData.filter(p => p.activo).map(p => {
                        const label = p.tipo === 'precio_fijo'
                            ? `${p.nombre} (S/${p.precio_fijo} fijo)`
                            : `${p.nombre}${[p.precio_1dia ? `1d:S/${p.precio_1dia}` : '', p.precio_2dias ? `2d:S/${p.precio_2dias}` : '', p.precio_3dias ? `3d:S/${p.precio_3dias}` : ''].filter(Boolean).map((x,i) => i===0 ? ' (' + x : x).join(' | ')})`
                        return `<option value="${p.nombre}">${label}</option>`;
                    }).join('');
            }
        }

        if (dataNivel.success) {
            nivelesData = dataNivel.niveles;
            // Poblar select horario_nivel (Nuevo Horario)
            const selNivel = document.getElementById('horario_nivel');
            if (selNivel) {
                selNivel.innerHTML = '<option value="">Sin nivel específico</option>' +
                    nivelesData.filter(n => n.activo).map(n =>
                        `<option value="${n.nombre}">${n.nombre}</option>`
                    ).join('');
            }
        }
    } catch (error) {
        console.error('Error cargando planes/niveles:', error);
    }
}

// ---- CRUD Planes ----

async function cargarPlanes() {
    document.getElementById('loadingPlanes').classList.remove('hidden');
    document.getElementById('tablaplanesContainer').classList.add('hidden');
    try {
        const res = await fetch(`${API_BASE}/api/admin/planes`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
            planesData = data.planes;
            renderPlanes(data.planes);
        }
    } catch (e) {
        console.error('Error cargarPlanes:', e);
    }
    // También recargar niveles
    cargarNiveles();
}

function renderPlanes(planes) {
    const tbody = document.getElementById('tablaPlanes');
    if (!tbody) return;
    tbody.innerHTML = planes.map(p => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td class="px-4 py-3 font-semibold text-sm">${p.nombre}</td>
            <td class="px-4 py-3 text-sm">${p.tipo === 'precio_fijo' ? 'Precio fijo' : 'Por días'}</td>
            <td class="px-4 py-3 text-sm">${p.precio_1dia != null ? 'S/' + p.precio_1dia : '—'}</td>
            <td class="px-4 py-3 text-sm">${p.precio_2dias != null ? 'S/' + p.precio_2dias : '—'}</td>
            <td class="px-4 py-3 text-sm">${p.precio_3dias != null ? 'S/' + p.precio_3dias : '—'}</td>
            <td class="px-4 py-3 text-sm">${p.precio_fijo != null ? 'S/' + p.precio_fijo : '—'}</td>
            <td class="px-4 py-3 text-sm">${p.minimo_dias}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${p.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}">${p.activo ? 'Activo' : 'Inactivo'}</span>
            </td>
            <td class="px-4 py-3 flex gap-2">
                <button onclick="abrirModalPlan(${p.plan_id})" class="text-blue-600 hover:text-blue-800" title="Editar">
                    <span class="material-symbols-outlined text-base">edit</span>
                </button>
                <button onclick="eliminarPlan(${p.plan_id}, '${p.nombre}')" class="text-red-600 hover:text-red-800" title="Eliminar">
                    <span class="material-symbols-outlined text-base">delete</span>
                </button>
            </td>
        </tr>
    `).join('');
    document.getElementById('loadingPlanes').classList.add('hidden');
    document.getElementById('tablaplanesContainer').classList.remove('hidden');
}

function abrirModalPlan(planId = null) {
    const plan = planId ? planesData.find(p => p.plan_id === planId) : null;
    const modal = document.createElement('div');
    modal.id = 'modalPlan';
    modal.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="bg-primary px-6 py-4 rounded-t-xl flex justify-between items-center">
                <h3 class="text-white font-bold text-xl">${plan ? 'Editar Plan' : 'Nuevo Plan'}</h3>
                <button onclick="document.getElementById('modalPlan').remove()" class="text-white hover:text-gray-200">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-semibold mb-1">Nombre *</label>
                    <input id="plan_nombre" value="${plan ? plan.nombre : ''}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="Ej: Premium">
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Tipo *</label>
                    <select id="plan_tipo" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" onchange="togglePlanTipo()">
                        <option value="por_dias" ${!plan || plan.tipo === 'por_dias' ? 'selected' : ''}>Por días</option>
                        <option value="precio_fijo" ${plan && plan.tipo === 'precio_fijo' ? 'selected' : ''}>Precio fijo</option>
                    </select>
                </div>
                <div id="campusPorDias">
                    <div class="grid grid-cols-3 gap-3">
                        <div><label class="block text-xs font-semibold mb-1">Precio 1 día</label><input id="plan_precio_1dia" type="number" step="0.01" value="${plan && plan.precio_1dia != null ? plan.precio_1dia : ''}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="—"></div>
                        <div><label class="block text-xs font-semibold mb-1">Precio 2 días</label><input id="plan_precio_2dias" type="number" step="0.01" value="${plan && plan.precio_2dias != null ? plan.precio_2dias : ''}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="—"></div>
                        <div><label class="block text-xs font-semibold mb-1">Precio 3 días</label><input id="plan_precio_3dias" type="number" step="0.01" value="${plan && plan.precio_3dias != null ? plan.precio_3dias : ''}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="—"></div>
                    </div>
                </div>
                <div id="campusPrecioFijo" class="hidden">
                    <label class="block text-sm font-semibold mb-1">Precio Fijo</label>
                    <input id="plan_precio_fijo" type="number" step="0.01" value="${plan && plan.precio_fijo != null ? plan.precio_fijo : ''}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="Ej: 60">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-sm font-semibold mb-1">Mín. días</label><input id="plan_minimo_dias" type="number" min="1" max="7" value="${plan ? plan.minimo_dias : 2}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"></div>
                    <div><label class="block text-sm font-semibold mb-1">Máx. días</label><input id="plan_maximo_dias" type="number" min="1" max="7" value="${plan ? plan.maximo_dias : 3}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"></div>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Descripción extra (opcional)</label>
                    <textarea id="plan_descripcion_extra" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" rows="2" placeholder="Ej: Incluye Fútbol 11 en estadio">${plan && plan.descripcion_extra ? plan.descripcion_extra : ''}</textarea>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-sm font-semibold mb-1">Orden</label><input id="plan_orden" type="number" min="0" value="${plan ? plan.orden : 0}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"></div>
                    <div class="flex items-end pb-1"><label class="flex items-center gap-2 text-sm font-semibold"><input id="plan_activo" type="checkbox" ${!plan || plan.activo ? 'checked' : ''}> Activo</label></div>
                </div>
            </div>
            <div class="px-6 pb-6 flex gap-3 justify-end">
                <button onclick="document.getElementById('modalPlan').remove()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
                <button onclick="guardarPlan(${planId || 'null'})" class="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm">Guardar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    togglePlanTipo();
}

function togglePlanTipo() {
    const tipo = document.getElementById('plan_tipo')?.value;
    if (!tipo) return;
    document.getElementById('campusPorDias').classList.toggle('hidden', tipo === 'precio_fijo');
    document.getElementById('campusPrecioFijo').classList.toggle('hidden', tipo !== 'precio_fijo');
}

async function guardarPlan(planId) {
    const body = {
        nombre: document.getElementById('plan_nombre').value.trim(),
        tipo: document.getElementById('plan_tipo').value,
        precio_1dia: document.getElementById('plan_precio_1dia')?.value || null,
        precio_2dias: document.getElementById('plan_precio_2dias')?.value || null,
        precio_3dias: document.getElementById('plan_precio_3dias')?.value || null,
        precio_fijo: document.getElementById('plan_precio_fijo')?.value || null,
        minimo_dias: parseInt(document.getElementById('plan_minimo_dias').value) || 2,
        maximo_dias: parseInt(document.getElementById('plan_maximo_dias').value) || 3,
        descripcion_extra: document.getElementById('plan_descripcion_extra').value.trim() || null,
        activo: document.getElementById('plan_activo').checked,
        orden: parseInt(document.getElementById('plan_orden').value) || 0
    };
    if (!body.nombre) { mostrarModal('El nombre es requerido', 'warning'); return; }
    try {
        const url = planId ? `${API_BASE}/api/admin/planes/${planId}` : `${API_BASE}/api/admin/planes`;
        const res = await fetch(url, { method: planId ? 'PUT' : 'POST', headers: getAuthHeaders(), body: JSON.stringify(body) });
        const data = await res.json();
        if (data.success) {
            document.getElementById('modalPlan')?.remove();
            mostrarModalExito(planId ? 'Plan Actualizado' : 'Plan Creado', planId ? 'Plan actualizado correctamente' : 'Plan creado correctamente', 'sell');
            cargarPlanes();
            cargarPlanesNiveles();
        } else {
            mostrarModal(data.error || 'Error al guardar', 'error');
        }
    } catch (e) {
        mostrarModal('Error de conexión', 'error');
    }
}

async function eliminarPlan(planId, nombre) {
    if (!confirm(`¿Eliminar el plan "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/admin/planes/${planId}`, { method: 'DELETE', headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
            cargarPlanes();
            cargarPlanesNiveles();
        } else {
            mostrarModal(data.error || 'Error al eliminar', 'error');
        }
    } catch (e) {
        mostrarModal('Error de conexión', 'error');
    }
}

// ---- CRUD Niveles ----

async function cargarNiveles() {
    document.getElementById('loadingNiveles').classList.remove('hidden');
    document.getElementById('tablaNivelesContainer').classList.add('hidden');
    try {
        const res = await fetch(`${API_BASE}/api/admin/niveles`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
            nivelesData = data.niveles;
            renderNiveles(data.niveles);
        }
    } catch (e) {
        console.error('Error cargarNiveles:', e);
    }
}

function renderNiveles(niveles) {
    const tbody = document.getElementById('tablaNiveles');
    if (!tbody) return;
    tbody.innerHTML = niveles.map(n => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
            <td class="px-4 py-3 font-semibold text-sm">${n.nombre}</td>
            <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                    <div class="h-3 w-8 rounded ${n.color_barra}"></div>
                    <span class="text-xs text-gray-500">${n.color_barra}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-sm">${n.orden}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${n.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}">${n.activo ? 'Activo' : 'Inactivo'}</span>
            </td>
            <td class="px-4 py-3 flex gap-2">
                <button onclick="abrirModalNivel(${n.nivel_id})" class="text-blue-600 hover:text-blue-800" title="Editar">
                    <span class="material-symbols-outlined text-base">edit</span>
                </button>
                <button onclick="eliminarNivel(${n.nivel_id}, '${n.nombre}')" class="text-red-600 hover:text-red-800" title="Eliminar">
                    <span class="material-symbols-outlined text-base">delete</span>
                </button>
            </td>
        </tr>
    `).join('');
    document.getElementById('loadingNiveles').classList.add('hidden');
    document.getElementById('tablaNivelesContainer').classList.remove('hidden');
}

function abrirModalNivel(nivelId = null) {
    const nivel = nivelId ? nivelesData.find(n => n.nivel_id === nivelId) : null;
    const modal = document.createElement('div');
    modal.id = 'modalNivel';
    modal.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md">
            <div class="bg-primary px-6 py-4 rounded-t-xl flex justify-between items-center">
                <h3 class="text-white font-bold text-xl">${nivel ? 'Editar Nivel' : 'Nuevo Nivel'}</h3>
                <button onclick="document.getElementById('modalNivel').remove()" class="text-white hover:text-gray-200">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-semibold mb-1">Nombre *</label>
                    <input id="nivel_nombre" value="${nivel ? nivel.nombre : ''}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="Ej: Competitivo">
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Color barra (clase Tailwind)</label>
                    <input id="nivel_color_barra" value="${nivel ? nivel.color_barra : 'bg-gray-500'}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="Ej: bg-blue-500">
                    <p class="text-xs text-gray-400 mt-1">Opciones: bg-teal-500, bg-blue-500, bg-pink-500, bg-amber-400, bg-purple-500</p>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Color texto (clase Tailwind)</label>
                    <input id="nivel_color_texto" value="${nivel ? nivel.color_texto : 'text-gray-600'}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600" placeholder="Ej: text-blue-600">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="block text-sm font-semibold mb-1">Orden</label><input id="nivel_orden" type="number" min="0" value="${nivel ? nivel.orden : 0}" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"></div>
                    <div class="flex items-end pb-1"><label class="flex items-center gap-2 text-sm font-semibold"><input id="nivel_activo" type="checkbox" ${!nivel || nivel.activo ? 'checked' : ''}> Activo</label></div>
                </div>
            </div>
            <div class="px-6 pb-6 flex gap-3 justify-end">
                <button onclick="document.getElementById('modalNivel').remove()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
                <button onclick="guardarNivel(${nivelId || 'null'})" class="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm">Guardar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function guardarNivel(nivelId) {
    const body = {
        nombre: document.getElementById('nivel_nombre').value.trim(),
        color_barra: document.getElementById('nivel_color_barra').value.trim() || 'bg-gray-500',
        color_texto: document.getElementById('nivel_color_texto').value.trim() || 'text-gray-600',
        activo: document.getElementById('nivel_activo').checked,
        orden: parseInt(document.getElementById('nivel_orden').value) || 0
    };
    if (!body.nombre) { mostrarModal('El nombre es requerido', 'warning'); return; }
    try {
        const url = nivelId ? `${API_BASE}/api/admin/niveles/${nivelId}` : `${API_BASE}/api/admin/niveles`;
        const res = await fetch(url, { method: nivelId ? 'PUT' : 'POST', headers: getAuthHeaders(), body: JSON.stringify(body) });
        const data = await res.json();
        if (data.success) {
            document.getElementById('modalNivel')?.remove();
            mostrarModalExito(nivelId ? 'Nivel Actualizado' : 'Nivel Creado', nivelId ? 'Nivel actualizado correctamente' : 'Nivel creado correctamente', 'military_tech');
            cargarNiveles();
            cargarPlanesNiveles();
        } else {
            mostrarModal(data.error || 'Error al guardar', 'error');
        }
    } catch (e) {
        mostrarModal('Error de conexión', 'error');
    }
}

async function eliminarNivel(nivelId, nombre) {
    if (!confirm(`¿Eliminar el nivel "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
        const res = await fetch(`${API_BASE}/api/admin/niveles/${nivelId}`, { method: 'DELETE', headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success) {
            cargarNiveles();
            cargarPlanesNiveles();
        } else {
            mostrarModal(data.error || 'Error al eliminar', 'error');
        }
    } catch (e) {
        mostrarModal('Error de conexión', 'error');
    }
}








