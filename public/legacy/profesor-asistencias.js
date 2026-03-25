/**
 * JavaScript para Tomar Asistencia
 */

const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
    ? window.API_BASE_OVERRIDE
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002'
        : 'https://api.jaguarescar.com');

// Helper para obtener fecha local de Perú (UTC-5)
function getFechaLocalPeru() {
    const ahora = new Date();
    const offsetPeru = -5 * 60;
    const offsetLocal = ahora.getTimezoneOffset();
    const diferencia = offsetPeru - offsetLocal;
    const fechaPeru = new Date(ahora.getTime() + diferencia * 60 * 1000);
    return fechaPeru.toISOString().split('T')[0];
}

let profesorData = null;
let deportesDisponibles = [];
let categoriasDisponibles = [];
let horariosDisponibles = [];
let alumnosClase = [];
let horarioSeleccionado = null;
let asistenciaYaRegistrada = false;
let _fechaEdicion = null; // null = hoy, 'YYYY-MM-DD' = editando fecha pasada
let _horarioIdHistorial = null; // horario_id(s) usado para historial

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    inicializarEventos();
    mostrarFechaActual();
    cargarDeportesProfesor();
    
    // Si viene de un horario específico (desde dashboard)
    const urlParams = new URLSearchParams(window.location.search);
    const horarioId = urlParams.get('horario');
    if (horarioId) {
        cargarClaseDirecta(horarioId);
    }
});

/**
 * Verifica que el usuario tenga sesión activa y sea profesor
 */
function verificarSesion() {
    const session = localStorage.getItem('adminSession');
    
    if (!session) {
        window.location.href = '/admin-login';
        return;
    }
    
    const data = JSON.parse(session);
    
    if (data.admin.rol !== 'profesor') {
        alert('Acceso denegado. Esta área es solo para profesores.');
        window.location.href = '/admin-login';
        return;
    }
    
    const sessionTime = new Date(data.timestamp).getTime();
    const now = new Date().getTime();
    const hoursElapsed = (now - sessionTime) / (1000 * 60 * 60);
    
    if (hoursElapsed >= 8) {
        alert('Tu sesión ha expirado.');
        localStorage.removeItem('adminSession');
        localStorage.removeItem('admin_token');
        window.location.href = '/admin-login';
        return;
    }
    
    profesorData = data.admin;
    document.getElementById('profesorNombre').textContent = profesorData.nombre_completo || profesorData.email;
}

/**
 * Mostrar fecha actual
 */
function mostrarFechaActual() {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const hoy = new Date();
    const textoFecha = `${dias[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
    
    document.getElementById('fechaActual').textContent = textoFecha;
}

/**
 * Inicializar eventos
 */
function inicializarEventos() {
    document.getElementById('filtroDeporte').addEventListener('change', onDeporteChange);
    document.getElementById('filtroCategoria').addEventListener('change', onCategoriaChange);
    document.getElementById('filtroDia').addEventListener('change', onDiaChange);
    document.getElementById('btnCargarAlumnos').addEventListener('click', cargarAlumnos);
    document.getElementById('btnMarcarTodos').addEventListener('click', marcarTodos);
    document.getElementById('btnDesmarcarTodos').addEventListener('click', desmarcarTodos);
    document.getElementById('btnGuardarAsistencia').addEventListener('click', guardarAsistencia);
    document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal);
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
        
        const data = await response.json();
        
        if (data.success && data.deportes) {
            deportesDisponibles = data.deportes;
            
            const select = document.getElementById('filtroDeporte');
            select.innerHTML = '<option value="">Seleccione un deporte...</option>';
            
            data.deportes.forEach(deporte => {
                const option = document.createElement('option');
                option.value = deporte.deporte_id;
                option.textContent = deporte.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar deportes:', error);
        mostrarError('Error al cargar deportes asignados');
    }
}

/**
 * Cuando cambia el deporte seleccionado
 */
async function onDeporteChange(e) {
    const deporteId = e.target.value;
    const selectCategoria = document.getElementById('filtroCategoria');
    const selectHorario = document.getElementById('filtroHorario');
    const btnCargar = document.getElementById('btnCargarAlumnos');
    
    // Resetear
    selectCategoria.innerHTML = '<option value="">Cargando...</option>';
    selectCategoria.disabled = true;
    selectHorario.innerHTML = '<option value="">Primero seleccione categoría</option>';
    selectHorario.disabled = true;
    btnCargar.disabled = true;
    
    if (!deporteId) {
        selectCategoria.innerHTML = '<option value="">Primero seleccione deporte</option>';
        return;
    }
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const response = await fetch(`${API_BASE}/api/profesor/categorias-deporte/${deporteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.categorias) {
            categoriasDisponibles = data.categorias;
            
            selectCategoria.innerHTML = '<option value="">Seleccione una categoría...</option>';
            
            data.categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.categoria;
                option.textContent = cat.categoria;
                selectCategoria.appendChild(option);
            });
            
            selectCategoria.disabled = false;
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        selectCategoria.innerHTML = '<option value="">Error al cargar</option>';
    }
}

/**
 * Cuando cambia la categoría seleccionada - cargar días disponibles
 */
async function onCategoriaChange(e) {
    const deporteId = document.getElementById('filtroDeporte').value;
    const categoria = e.target.value;
    const selectDia = document.getElementById('filtroDia');
    const selectHorario = document.getElementById('filtroHorario');
    const btnCargar = document.getElementById('btnCargarAlumnos');
    
    selectDia.innerHTML = '<option value="">Cargando...</option>';
    selectDia.disabled = true;
    selectHorario.innerHTML = '<option value="">Primero seleccione día</option>';
    selectHorario.disabled = true;
    btnCargar.disabled = true;
    
    if (!categoria) {
        selectDia.innerHTML = '<option value="">Primero seleccione categoría</option>';
        return;
    }
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        // Obtener días disponibles para esta categoría
        const response = await fetch(
            `${API_BASE}/api/profesor/dias-categoria?deporte_id=${deporteId}&categoria=${encodeURIComponent(categoria)}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const data = await response.json();
        
        if (data.success && data.dias && data.dias.length > 0) {
            selectDia.innerHTML = '<option value="">Seleccione un día...</option>';
            
            const ordenDias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
            const diasOrdenados = data.dias.sort((a, b) => ordenDias.indexOf(a) - ordenDias.indexOf(b));
            
            diasOrdenados.forEach(dia => {
                const option = document.createElement('option');
                option.value = dia;
                option.textContent = dia.charAt(0) + dia.slice(1).toLowerCase();
                selectDia.appendChild(option);
            });
            
            selectDia.disabled = false;
        } else {
            selectDia.innerHTML = '<option value="">No hay días disponibles</option>';
        }
    } catch (error) {
        console.error('Error al cargar días:', error);
        selectDia.innerHTML = '<option value="">Error al cargar</option>';
    }
}

/**
 * Cuando cambia el día seleccionado - cargar horarios
 */
async function onDiaChange(e) {
    const deporteId = document.getElementById('filtroDeporte').value;
    const categoria = document.getElementById('filtroCategoria').value;
    const dia = e.target.value;
    const selectHorario = document.getElementById('filtroHorario');
    const btnCargar = document.getElementById('btnCargarAlumnos');
    
    selectHorario.innerHTML = '<option value="">Cargando...</option>';
    selectHorario.disabled = true;
    btnCargar.disabled = true;
    
    if (!dia) {
        selectHorario.innerHTML = '<option value="">Primero seleccione día</option>';
        return;
    }
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const response = await fetch(
            `${API_BASE}/api/profesor/horarios-categoria?deporte_id=${deporteId}&categoria=${encodeURIComponent(categoria)}&dia=${dia}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const data = await response.json();
        
        if (data.success && data.horarios) {
            horariosDisponibles = data.horarios;
            
            selectHorario.innerHTML = '<option value="">Seleccione un horario...</option>';
            
            data.horarios.forEach(horario => {
                const option = document.createElement('option');
                option.value = horario.horario_id;
                option.textContent = `${horario.hora_inicio} - ${horario.hora_fin}`;
                selectHorario.appendChild(option);
            });
            
            selectHorario.disabled = false;
            selectHorario.addEventListener('change', () => {
                btnCargar.disabled = !selectHorario.value;
            });
        } else {
            selectHorario.innerHTML = '<option value="">No hay horarios disponibles</option>';
        }
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        selectHorario.innerHTML = '<option value="">Error al cargar</option>';
    }
}

/**
 * Cargar alumnos de la clase seleccionada
 */
async function cargarAlumnos() {
    const horarioId = document.getElementById('filtroHorario').value;
    
    if (!horarioId) {
        alert('Por favor seleccione un horario');
        return;
    }
    
    const loadingContainer = document.getElementById('loadingContainer');
    const alumnosContainer = document.getElementById('alumnosContainer');
    const sinAlumnos = document.getElementById('sinAlumnos');
    const infoClase = document.getElementById('infoClase');
    
    loadingContainer.classList.remove('hidden');
    alumnosContainer.classList.add('hidden');
    sinAlumnos.classList.add('hidden');
    infoClase.classList.add('hidden');
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const fechaHoy = getFechaLocalPeru();
        const response = await fetch(`${API_BASE}/api/profesor/alumnos-clase/${horarioId}?fecha=${fechaHoy}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        loadingContainer.classList.add('hidden');
        
        if (data.success && data.alumnos && data.alumnos.length > 0) {
            alumnosClase = data.alumnos;
            horarioSeleccionado = data.horario;

            // Detectar si ya se tomó asistencia hoy
            asistenciaYaRegistrada = data.alumnos.some(a => a.asistencia_registrada);
            actualizarEstadoBotonGuardar();
            
            // Mostrar info de la clase
            document.getElementById('claseNombre').textContent = `${horarioSeleccionado.deporte} - ${horarioSeleccionado.categoria}`;
            document.getElementById('claseDetalle').textContent = `${horarioSeleccionado.dia} | ${horarioSeleccionado.hora_inicio} - ${horarioSeleccionado.hora_fin}`;
            infoClase.classList.remove('hidden');
            
            // Mostrar alumnos
            renderizarAlumnos();
            alumnosContainer.classList.remove('hidden');
            cargarHistorialAsistencias(horarioSeleccionado.horario_ids || horarioSeleccionado.horario_id);
        } else {
            sinAlumnos.classList.remove('hidden');
            document.getElementById('bannerYaRegistrada').classList.add('hidden');
        }
        
    } catch (error) {
        console.error('Error al cargar alumnos:', error);
        loadingContainer.classList.add('hidden');
        mostrarToast('Error al cargar alumnos. Intenta nuevamente.', 'error');
    }
}

function actualizarEstadoBotonGuardar() {
    const btn = document.getElementById('btnGuardarAsistencia');
    const banner = document.getElementById('bannerYaRegistrada');
    if (asistenciaYaRegistrada) {
        banner.classList.remove('hidden');
        btn.innerHTML = '<span class="material-symbols-outlined text-2xl">edit_calendar</span> Actualizar Asistencia';
        btn.className = 'mt-6 w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black uppercase tracking-wide rounded-xl transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2';
    } else {
        banner.classList.add('hidden');
        btn.innerHTML = '<span class="material-symbols-outlined text-2xl">save</span> Guardar Asistencia';
        btn.className = 'mt-6 w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-black uppercase tracking-wide rounded-xl transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2';
    }
}

/**
 * Renderizar lista de alumnos
 */
function renderizarAlumnos() {
    const lista = document.getElementById('listaAlumnos');
    const contador = document.getElementById('contadorAlumnos');
    
    lista.innerHTML = '';
    contador.textContent = `(${alumnosClase.length})`;
    
    alumnosClase.forEach((alumno, index) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors';
        
        const presente = alumno.asistencia_registrada ? alumno.presente : true; // Por defecto marcar presente
        
        div.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="w-8 h-8 flex items-center justify-center bg-primary text-white font-bold rounded-full text-sm">
                    ${index + 1}
                </span>
                <div>
                    <p class="font-semibold text-black dark:text-white">${alumno.nombre_completo}</p>
                    <p class="text-sm text-text-muted dark:text-gray-400">DNI: ${alumno.dni}</p>
                </div>
            </div>
            
            <div class="flex items-center gap-3">
                <button onclick="abrirModalPuntaje(${alumno.alumno_id}, '${alumno.nombre_completo.replace(/'/g, "\\'")}')" 
                    class="p-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/50 rounded-lg transition-colors" 
                    title="Asignar puntaje">
                    <span class="material-symbols-outlined text-yellow-600">star</span>
                </button>
                <label class="flex items-center gap-3 cursor-pointer">
                    <span class="text-sm font-semibold ${presente ? 'text-green-600' : 'text-red-600'}">
                        ${presente ? 'Presente' : 'Ausente'}
                    </span>
                    <input type="checkbox" 
                           data-alumno-id="${alumno.alumno_id}"
                           data-horario-id="${alumno.alumno_horario_id || ''}"
                           ${presente ? 'checked' : ''}
                           class="w-6 h-6 rounded border-gray-300 text-green-600 focus:ring-green-500">
                </label>
            </div>
        `;
        
        const checkbox = div.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            const span = div.querySelector('span.text-sm');
            if (e.target.checked) {
                span.textContent = 'Presente';
                span.className = 'text-sm font-semibold text-green-600';
            } else {
                span.textContent = 'Ausente';
                span.className = 'text-sm font-semibold text-red-600';
            }
        });
        
        lista.appendChild(div);
    });
}

/**
 * Marcar todos como presentes
 */
function marcarTodos() {
    const checkboxes = document.querySelectorAll('#listaAlumnos input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
    });
}

/**
 * Desmarcar todos (marcar ausentes)
 */
function desmarcarTodos() {
    const checkboxes = document.querySelectorAll('#listaAlumnos input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = false;
        cb.dispatchEvent(new Event('change'));
    });
}

/**
 * Guardar asistencia en la base de datos
 */
async function guardarAsistencia() {
    const checkboxes = document.querySelectorAll('#listaAlumnos input[type="checkbox"]');
    
    const asistencias = Array.from(checkboxes).map(cb => ({
        alumno_id: parseInt(cb.dataset.alumnoId),
        presente: cb.checked,
        horario_id: cb.dataset.horarioId ? parseInt(cb.dataset.horarioId) : undefined
    }));
    
    const btnGuardar = document.getElementById('btnGuardarAsistencia');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Guardando...';
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const response = await fetch(`${API_BASE}/api/profesor/guardar-asistencia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                horario_id: horarioSeleccionado.horario_id,
                fecha: _fechaEdicion || getFechaLocalPeru(),
                asistencias: asistencias
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const eraEdicionPasada = !!_fechaEdicion;
            const eraActualizacion = asistenciaYaRegistrada;
            asistenciaYaRegistrada = true;
            // Actualizar checkboxes con estado guardado
            document.querySelectorAll('#listaAlumnos input[type="checkbox"]').forEach(cb => {
                const alumno = alumnosClase.find(a => a.alumno_id === parseInt(cb.dataset.alumnoId));
                if (alumno) alumno.asistencia_registrada = 1;
            });
            document.getElementById('modalConfirmacionTitulo').textContent =
                eraEdicionPasada ? '¡Asistencia Corregida!' :
                eraActualizacion ? '¡Asistencia Actualizada!' : '¡Asistencia Guardada!';
            document.getElementById('modalConfirmacionSubtitulo').textContent =
                eraEdicionPasada
                    ? `Se corrigió la asistencia de ${asistencias.length} alumno(s) para la fecha seleccionada.`
                    : eraActualizacion
                    ? `Se actualizaron ${data.message?.match(/\d+/)?.[0] || asistencias.length} registros correctamente.`
                    : `Se registró la asistencia para ${asistencias.length} alumno(s).`;
            document.getElementById('modalConfirmacion').classList.remove('hidden');

            // Si estaba editando fecha pasada, volver a hoy después de cerrar el modal
            if (eraEdicionPasada) {
                _fechaEdicion = null;
            }
        } else {
            mostrarToast(data.error || 'Error al guardar asistencia', 'error');
        }
        
    } catch (error) {
        console.error('Error al guardar asistencia:', error);
        mostrarToast('Error al guardar asistencia. Intenta nuevamente.', 'error');
    } finally {
        btnGuardar.disabled = false;
        actualizarEstadoBotonGuardar();
    }
}

/**
 * Cerrar modal y recargar
 */
function cerrarModal() {
    document.getElementById('modalConfirmacion').classList.add('hidden');
    // Si acabamos de guardar asistencia pasada, recargar la clase actual (fecha de hoy)
    if (horarioSeleccionado) {
        const hIds = horarioSeleccionado.horario_ids || horarioSeleccionado.horario_id;
        cargarClaseDirecta(hIds);
    }
}

/**
 * Cargar clase directa desde URL (viene del dashboard con horario_id)
 */
async function cargarClaseDirecta(horarioId) {
    // Ocultar el bloque de filtros — el profesor ya eligió la clase desde el dashboard
    const filtersBlock = document.getElementById('filtrosClase');
    if (filtersBlock) filtersBlock.classList.add('hidden');

    const loadingContainer = document.getElementById('loadingContainer');
    const alumnosContainer = document.getElementById('alumnosContainer');
    const sinAlumnos = document.getElementById('sinAlumnos');
    const infoClase = document.getElementById('infoClase');

    loadingContainer.classList.remove('hidden');
    alumnosContainer.classList.add('hidden');
    sinAlumnos.classList.add('hidden');
    infoClase.classList.add('hidden');

    // Limpiar estado de edición pasada
    _fechaEdicion = null;
    const bannerEdicion = document.getElementById('bannerEdicionPasada');
    if (bannerEdicion) bannerEdicion.classList.add('hidden');

    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);

        const fechaHoy = getFechaLocalPeru();
        const response = await fetch(`${API_BASE}/api/profesor/alumnos-clase/${horarioId}?fecha=${fechaHoy}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        loadingContainer.classList.add('hidden');

        if (data.success && data.alumnos && data.alumnos.length > 0) {
            alumnosClase = data.alumnos;
            horarioSeleccionado = data.horario;

            asistenciaYaRegistrada = data.alumnos.some(a => a.asistencia_registrada);
            actualizarEstadoBotonGuardar();

            document.getElementById('claseNombre').textContent = `${horarioSeleccionado.deporte} - ${horarioSeleccionado.categoria}`;
            document.getElementById('claseDetalle').textContent = `${horarioSeleccionado.dia} | ${horarioSeleccionado.hora_inicio} - ${horarioSeleccionado.hora_fin}`;
            infoClase.classList.remove('hidden');

            renderizarAlumnos();
            alumnosContainer.classList.remove('hidden');
            cargarHistorialAsistencias(horarioSeleccionado.horario_ids || horarioId);
        } else if (data.success && (!data.alumnos || data.alumnos.length === 0)) {
            sinAlumnos.classList.remove('hidden');
        } else {
            mostrarError(data.error || 'No se pudo cargar la clase');
        }
    } catch (error) {
        document.getElementById('loadingContainer').classList.add('hidden');
        mostrarError('Error al cargar la clase');
        console.error('Error en cargarClaseDirecta:', error);
    }
}

/**
 * Cargar historial de fechas con asistencia registrada para un horario
 */
async function cargarHistorialAsistencias(horarioId) {
    const container = document.getElementById('historialContainer');
    const lista = document.getElementById('historialLista');
    if (!container || !lista) return;
    container.classList.add('hidden');
    _horarioIdHistorial = horarioId;

    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);

        const response = await fetch(`${API_BASE}/api/profesor/historial-asistencias/${horarioId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!data.success || !data.historial || data.historial.length === 0) return;

        lista.innerHTML = '';
        const diasNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const mesesNombres = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

        data.historial.forEach(item => {
            const fecha = new Date(item.fecha + 'T12:00:00');
            const fechaTexto = `${diasNombres[fecha.getDay()]} ${fecha.getDate()} ${mesesNombres[fecha.getMonth()]} ${fecha.getFullYear()}`;
            const pct = item.total > 0 ? Math.round((item.presentes / item.total) * 100) : 0;
            const pctColor = pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500';
            const fechaStr = item.fecha;

            const wrapper = document.createElement('div');
            wrapper.className = 'rounded-lg overflow-hidden';

            // Fila principal (clickeable)
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800/60 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors select-none';
            div.onclick = () => toggleDetalleHistorial(fechaStr, wrapper);
            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-primary text-base transition-transform duration-200" id="chevron-${fechaStr}">expand_more</span>
                    <span class="text-sm font-semibold text-black dark:text-white">${fechaTexto}</span>
                </div>
                <div class="flex items-center gap-4 text-sm">
                    <span class="text-green-600 font-bold">${item.presentes} presentes</span>
                    <span class="text-red-500">${item.ausentes} ausentes</span>
                    <span class="${pctColor} font-black w-12 text-right">${pct}%</span>
                </div>
            `;

            // Contenedor del detalle (oculto por defecto)
            const detalle = document.createElement('div');
            detalle.id = `detalle-${fechaStr}`;
            detalle.className = 'hidden bg-white dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-700 px-4 py-3';

            wrapper.appendChild(div);
            wrapper.appendChild(detalle);
            lista.appendChild(wrapper);
        });

        container.classList.remove('hidden');
    } catch (error) {
        console.error('Error al cargar historial:', error);
    }
}

/**
 * Expandir/colapsar detalle de una fecha en el historial
 */
async function toggleDetalleHistorial(fecha, wrapper) {
    const detalle = document.getElementById(`detalle-${fecha}`);
    const chevron = document.getElementById(`chevron-${fecha}`);
    if (!detalle) return;

    // Si ya está visible, colapsar
    if (!detalle.classList.contains('hidden')) {
        detalle.classList.add('hidden');
        if (chevron) chevron.style.transform = '';
        return;
    }

    // Expandir
    if (chevron) chevron.style.transform = 'rotate(180deg)';
    detalle.classList.remove('hidden');

    // Si ya tiene contenido cargado, no recargar
    if (detalle.dataset.loaded) return;

    detalle.innerHTML = '<div class="text-center py-3"><span class="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>';

    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        const hId = _horarioIdHistorial || horarioSeleccionado?.horario_ids || horarioSeleccionado?.horario_id;

        const response = await fetch(`${API_BASE}/api/profesor/alumnos-clase/${hId}?fecha=${fecha}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!data.success || !data.alumnos) {
            detalle.innerHTML = '<p class="text-sm text-red-500">No se pudieron cargar los detalles</p>';
            return;
        }

        const presentes = data.alumnos.filter(a => a.asistencia_registrada && a.presente);
        const ausentes = data.alumnos.filter(a => a.asistencia_registrada && !a.presente);

        let html = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">';

        // Columna presentes
        html += '<div>';
        html += `<p class="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Presentes (${presentes.length})</p>`;
        if (presentes.length > 0) {
            presentes.forEach(a => {
                html += `<p class="text-sm text-gray-700 dark:text-gray-300 py-0.5 flex items-center gap-1">
                    <span class="material-symbols-outlined text-green-500 text-xs">check_circle</span>
                    ${a.nombre_completo}
                </p>`;
            });
        } else {
            html += '<p class="text-xs text-gray-400 italic">Ninguno</p>';
        }
        html += '</div>';

        // Columna ausentes
        html += '<div>';
        html += `<p class="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Ausentes (${ausentes.length})</p>`;
        if (ausentes.length > 0) {
            ausentes.forEach(a => {
                html += `<p class="text-sm text-gray-700 dark:text-gray-300 py-0.5 flex items-center gap-1">
                    <span class="material-symbols-outlined text-red-400 text-xs">cancel</span>
                    ${a.nombre_completo}
                </p>`;
            });
        } else {
            html += '<p class="text-xs text-gray-400 italic">Ninguno</p>';
        }
        html += '</div></div>';

        // Botón editar
        html += `<button onclick="editarAsistenciaFecha('${fecha}')" class="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">edit</span>
            Editar asistencia de este día
        </button>`;

        detalle.innerHTML = html;
        detalle.dataset.loaded = 'true';
    } catch (error) {
        console.error('Error al cargar detalle historial:', error);
        detalle.innerHTML = '<p class="text-sm text-red-500">Error al cargar detalles</p>';
    }
}

/**
 * Entrar en modo de edición para una fecha pasada
 */
async function editarAsistenciaFecha(fecha) {
    _fechaEdicion = fecha;

    const hId = _horarioIdHistorial || horarioSeleccionado?.horario_ids || horarioSeleccionado?.horario_id;
    if (!hId) return;

    // Mostrar banner de edición pasada
    const bannerEdicion = document.getElementById('bannerEdicionPasada');
    const bannerHoy = document.getElementById('bannerYaRegistrada');
    if (bannerHoy) bannerHoy.classList.add('hidden');
    if (bannerEdicion) {
        const fechaObj = new Date(fecha + 'T12:00:00');
        const diasNombres = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
        const mesesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const fechaTexto = `${diasNombres[fechaObj.getDay()]} ${fechaObj.getDate()} de ${mesesNombres[fechaObj.getMonth()]} de ${fechaObj.getFullYear()}`;
        document.getElementById('bannerEdicionFechaTexto').textContent = `Corrigiendo la lista del ${fechaTexto}. Se guardará para esa fecha.`;
        bannerEdicion.classList.remove('hidden');
    }

    // Cargar alumnos con asistencia de esa fecha
    const loadingContainer = document.getElementById('loadingContainer');
    const alumnosContainer = document.getElementById('alumnosContainer');
    loadingContainer.classList.remove('hidden');
    alumnosContainer.classList.add('hidden');

    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);

        const response = await fetch(`${API_BASE}/api/profesor/alumnos-clase/${hId}?fecha=${fecha}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        loadingContainer.classList.add('hidden');

        if (data.success && data.alumnos && data.alumnos.length > 0) {
            alumnosClase = data.alumnos;
            if (data.horario) horarioSeleccionado = data.horario;

            asistenciaYaRegistrada = data.alumnos.some(a => a.asistencia_registrada);
            renderizarAlumnos();
            alumnosContainer.classList.remove('hidden');

            // Cambiar texto del botón guardar
            const btnGuardar = document.getElementById('btnGuardarAsistencia');
            btnGuardar.innerHTML = '<span class="material-symbols-outlined text-2xl">edit_calendar</span> Guardar Corrección';
            btnGuardar.className = 'mt-6 w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black uppercase tracking-wide rounded-xl transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2';
            btnGuardar.disabled = false;

            // Scroll hacia la lista de alumnos
            alumnosContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (error) {
        loadingContainer.classList.add('hidden');
        console.error('Error al cargar alumnos para edición:', error);
        mostrarToast('Error al cargar la lista para edición', 'error');
    }
}

/**
 * Cancelar edición de fecha pasada y volver a la vista de hoy
 */
function cancelarEdicionPasada() {
    _fechaEdicion = null;
    document.getElementById('bannerEdicionPasada').classList.add('hidden');

    // Recargar la clase con la fecha de hoy
    const hId = _horarioIdHistorial || horarioSeleccionado?.horario_ids || horarioSeleccionado?.horario_id;
    if (hId) {
        cargarClaseDirecta(hId);
    }
}

/**
 * Mostrar Mensaje de error
 */
function mostrarError(Mensaje) {
    alert(Mensaje);
}

/**
 * Abrir modal para asignar puntaje
 */
function abrirModalPuntaje(alumnoId, nombreAlumno) {
    document.getElementById('puntaje-alumno-id').value = alumnoId;
    document.getElementById('puntaje-alumno-nombre').textContent = nombreAlumno;
    document.getElementById('puntaje-valor').value = '';
    document.getElementById('puntaje-motivo').value = '';
    document.getElementById('modalPuntaje').classList.remove('hidden');
}

/**
 * Cerrar modal de puntaje
 */
function cerrarModalPuntaje() {
    document.getElementById('modalPuntaje').classList.add('hidden');
}

/**
 * Guardar puntaje del alumno
 */
async function guardarPuntaje() {
    const alumnoId = document.getElementById('puntaje-alumno-id').value;
    const puntos = parseInt(document.getElementById('puntaje-valor').value);
    const motivo = document.getElementById('puntaje-motivo').value;
    
    if (isNaN(puntos) || puntos < 0 || puntos > 100) {
        mostrarToast('El puntaje debe estar entre 0 y 100', 'error');
        return;
    }
    
    if (!horarioSeleccionado || !horarioSeleccionado.horario_id) {
        mostrarToast('Error: No hay clase seleccionada', 'error');
        return;
    }
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const response = await fetch(`${API_BASE}/api/profesor/asignar-puntaje`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                alumno_id: parseInt(alumnoId),
                horario_id: horarioSeleccionado.horario_id,
                puntos: puntos,
                motivo: motivo || null
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            cerrarModalPuntaje();
            mostrarToast(`¡${puntos} puntos asignados correctamente!`);
        } else {
            mostrarToast('Error: ' + (data.error || 'No se pudo guardar el puntaje'), 'error');
        }
    } catch (error) {
        console.error('Error al guardar puntaje:', error);
        mostrarToast('Error al guardar puntaje', 'error');
    }
}

function mostrarToast(mensaje, tipo = 'success') {
    let toast = document.getElementById('toastAsistencias');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastAsistencias';
        toast.className = 'fixed bottom-4 right-4 z-50 transition-all';
        document.body.appendChild(toast);
    }
    const color = tipo === 'error' ? 'bg-red-600' : tipo === 'warning' ? 'bg-amber-600' : 'bg-green-600';
    const icon = tipo === 'error' ? 'error' : tipo === 'warning' ? 'warning' : 'check_circle';
    toast.innerHTML = `<div class="${color} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-semibold">
        <span class="material-symbols-outlined text-lg">${icon}</span>
        <span>${mensaje}</span>
    </div>`;
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.opacity = '0'; }, 3500);
}






