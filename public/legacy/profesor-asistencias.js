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
            cargarHistorialAsistencias(horarioSeleccionado.horario_id);
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
        presente: cb.checked
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
                fecha: getFechaLocalPeru(),
                asistencias: asistencias
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const eraActualizacion = asistenciaYaRegistrada;
            asistenciaYaRegistrada = true;
            // Actualizar checkboxes con estado guardado
            document.querySelectorAll('#listaAlumnos input[type="checkbox"]').forEach(cb => {
                const alumno = alumnosClase.find(a => a.alumno_id === parseInt(cb.dataset.alumnoId));
                if (alumno) alumno.asistencia_registrada = 1;
            });
            document.getElementById('modalConfirmacionTitulo').textContent =
                eraActualizacion ? '¡Asistencia Actualizada!' : '¡Asistencia Guardada!';
            document.getElementById('modalConfirmacionSubtitulo').textContent =
                eraActualizacion
                    ? `Se actualizaron ${data.message?.match(/\d+/)?.[0] || asistencias.length} registros correctamente.`
                    : `Se registró la asistencia para ${asistencias.length} alumno(s).`;
            document.getElementById('modalConfirmacion').classList.remove('hidden');
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
    // No redirigir — el profesor puede seguir viendo/editando la asistencia
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
            cargarHistorialAsistencias(horarioId);
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

            const div = document.createElement('div');
            div.className = 'flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/60';
            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-primary text-base">event</span>
                    <span class="text-sm font-semibold text-black dark:text-white">${fechaTexto}</span>
                </div>
                <div class="flex items-center gap-4 text-sm">
                    <span class="text-green-600 font-bold">${item.presentes} presentes</span>
                    <span class="text-red-500">${item.ausentes} ausentes</span>
                    <span class="${pctColor} font-black w-12 text-right">${pct}%</span>
                </div>
            `;
            lista.appendChild(div);
        });

        container.classList.remove('hidden');
    } catch (error) {
        console.error('Error al cargar historial:', error);
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






