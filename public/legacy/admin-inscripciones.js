// ==================== GESTI�"N DE INSCRIPCIONES Y PAGOS ====================

// Helper para obtener headers con autenticación
function getAuthHeadersInscripciones() {
    // Usar helper global si existe, si no crear uno local
    if (typeof getAuthHeaders === 'function') {
        return getAuthHeaders();
    }
    const session = localStorage.getItem('adminSession');
    const token = session ? JSON.parse(session).token : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

let inscripcionesData = [];
let reporteData = [];
let paginaActual = 1;
const POR_PAGINA = 10;

/**
 * Cargar inscripciones según filtro de estado de pago
 */
async function cargarInscripciones() {
  const estadoPago = document.getElementById('filtroEstadoPago').value;
  const buscar = document.getElementById('buscarInscripcion')?.value || '';
  
  mostrarelemento('loadingInscripciones');
  ocultarelemento('tablaInscripcionesContainer');
  
  try {
    const url = `${API_BASE}/api/admin/inscripciones?estado_pago=${estadoPago}&buscar=${encodeURIComponent(buscar)}`;
    const response = await fetch(url, {
      headers: getAuthHeadersInscripciones()
    });
    const data = await response.json();
    
    if (data.success) {
      inscripcionesData = data.inscripciones;
      paginaActual = 1;
      renderizarInscripciones(data.inscripciones);
      await cargarEstadisticasInscripciones();
    } else {
      mostrarNotificacion('Error al cargar inscripciones: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error de conexión al cargar inscripciones', 'error');
  } finally {
    ocultarelemento('loadingInscripciones');
    mostrarelemento('tablaInscripcionesContainer');
  }
}

/**
 * Renderizar lista de inscripciones
 */
function renderizarInscripciones(inscripciones) {
  const container = document.querySelector('#tablaInscripcionesContainer .grid');
  
  if (!inscripciones || inscripciones.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10">
        <span class="material-symbols-outlined text-6xl text-gray-400">inbox</span>
        <p class="text-text-muted mt-4 text-lg">No se encontraron inscripciones</p>
      </div>
    `;
    renderizarPaginacion(0, 0);
    return;
  }

  const totalPaginas = Math.ceil(inscripciones.length / POR_PAGINA);
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const pagina = inscripciones.slice(inicio, inicio + POR_PAGINA);

  container.innerHTML = pagina.map(ins => `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div class="flex flex-col md:flex-row justify-between gap-4">
        <!-- Información del Usuario -->
        <div class="flex-1">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-bold text-lg text-black dark:text-white">
                ${ins.nombres} ${ins.apellidos}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">DNI: ${ins.dni}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${
              ins.estado_pago === 'confirmado' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }">
              ${ins.estado_pago === 'confirmado' ? 'Confirmado' : 'Pendiente'}
            </span>
          </div>
          
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Edad:</span>
              <span class="ml-2 text-black dark:text-white font-medium">${ins.edad} años</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Sexo:</span>
              <span class="ml-2 text-black dark:text-white font-medium">${ins.sexo}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Teléfono:</span>
              <span class="ml-2 text-black dark:text-white font-medium">${ins.telefono || 'N/A'}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Email:</span>
              <span class="ml-2 text-black dark:text-white font-medium text-xs">${ins.email || 'N/A'}</span>
            </div>
          </div>
          
          <div class="mt-3">
            <span class="text-gray-500 dark:text-gray-400 text-sm">Inscrito en:</span>
            <div class="flex flex-wrap gap-2 mt-2">
              ${ins.deportes_inscritos ? ins.deportes_inscritos.split(', ').map(deporte => 
                `<span class="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">${deporte}</span>`
              ).join('') : ''}
              ${ins.deportes_pausados ? ins.deportes_pausados.split(', ').map(deporte => 
                `<span class="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs font-medium line-through opacity-70" title="Pausado por alumno">${deporte} (pausado)</span>`
              ).join('') : ''}
              ${!ins.deportes_inscritos && !ins.deportes_pausados ? '<span class="text-gray-400 text-xs">Sin inscripciones</span>' : ''}
            </div>
          </div>
          
          ${ins.total_inscripciones > 0 ? `
            <div class="mt-3 text-sm">
              <span class="text-gray-500 dark:text-gray-400">Total de horarios:</span>
              <span class="ml-2 text-black dark:text-white font-bold">${ins.total_inscripciones}</span>
            </div>
          ` : ''}
        </div>
        
        <!-- Acciones -->
        <div class="flex flex-col gap-2 md:w-48">
          <button onclick="verDetalleInscripcion('${ins.dni}')" 
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-sm">visibility</span>
            Ver Detalle
          </button>
          
          <button onclick="verAsistenciasAlumno('${ins.dni}', '${ins.nombres} ${ins.apellidos}')" 
              class="px-4 py-2 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              style="background:#4f46e5;"
              onmouseover="this.style.background='#4338ca'"
              onmouseout="this.style.background='#4f46e5'">
            <span class="material-symbols-outlined text-sm">event_available</span>
            Ver Asistencias
          </button>
          
          <button onclick="eliminarInscripcionesUsuario('${ins.dni}', '${ins.nombres} ${ins.apellidos}')" 
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-sm">delete</span>
            Eliminar Inscripciones
          </button>
          
          <button onclick="eliminarAlumnoCompleto('${ins.dni}', '${ins.nombres} ${ins.apellidos}')" 
                  class="px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-sm">person_remove</span>
            Eliminar Alumno
          </button>
          
          ${ins.estado_pago === 'pendiente' ? `
            <button onclick="confirmarPago('${ins.dni}')" 
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-sm">check_circle</span>
              Confirmar Pago
            </button>
          ` : `
            <button onclick="rechazarPago('${ins.dni}')" 
                    class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-sm">cancel</span>
              Marcar Pendiente
            </button>
          `}
          
          ${ins.url_comprobante ? `
            <a href="${ins.url_comprobante}" target="_blank"
               class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-sm">receipt</span>
              Ver Comprobante
            </a>
          ` : ''}

          <button onclick="abrirModalObservacion('${ins.dni}', \`${(ins.notas_pago || '').replace(/`/g, "'")}\`)"
              class="px-4 py-2 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
              style="background:#f59e0b;"
              onmouseover="this.style.background='#d97706'"
              onmouseout="this.style.background='#f59e0b'">
            <span class="material-symbols-outlined text-sm">edit_note</span>
            ${ins.notas_pago ? 'Editar Observación' : 'Agregar Observación'}
          </button>
        </div>
      </div>

      ${ins.notas_pago ? `
        <div class="mt-3 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg flex items-start gap-2">
          <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-sm mt-0.5 flex-shrink-0">sticky_note_2</span>
          <p class="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">${ins.notas_pago}</p>
        </div>
      ` : ''}
      
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        Registrado: ${formatearFecha(ins.created_at)}
      </div>
    </div>
  `).join('');

  renderizarPaginacion(inscripciones.length, totalPaginas);
}

function renderizarPaginacion(total, totalPaginas) {
  let paginacionEl = document.getElementById('paginacionInscripciones');
  if (!paginacionEl) {
    const container = document.getElementById('tablaInscripcionesContainer');
    paginacionEl = document.createElement('div');
    paginacionEl.id = 'paginacionInscripciones';
    container.appendChild(paginacionEl);
  }

  if (totalPaginas <= 1) { paginacionEl.innerHTML = ''; return; }

  const inicio = (paginaActual - 1) * POR_PAGINA + 1;
  const fin = Math.min(paginaActual * POR_PAGINA, total);

  // Generar botones de página (máx 5 visibles)
  let botonesHTML = '';
  const rango = 2;
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= paginaActual - rango && i <= paginaActual + rango)) {
      botonesHTML += `<button onclick="irAPagina(${i})" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        i === paginaActual
          ? 'bg-primary text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary/20'
      }">${i}</button>`;
    } else if (i === paginaActual - rango - 1 || i === paginaActual + rango + 1) {
      botonesHTML += `<span class="px-2 py-1.5 text-gray-400 text-sm">…</span>`;
    }
  }

  paginacionEl.className = 'flex items-center justify-between px-2 py-4 mt-2 border-t border-gray-200 dark:border-gray-700';
  paginacionEl.innerHTML = `
    <p class="text-sm text-gray-500 dark:text-gray-400">Mostrando <span class="font-semibold text-black dark:text-white">${inicio}-${fin}</span> de <span class="font-semibold text-black dark:text-white">${total}</span> alumnos</p>
    <div class="flex items-center gap-1">
      <button onclick="irAPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''} class="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <span class="material-symbols-outlined text-lg">chevron_left</span>
      </button>
      ${botonesHTML}
      <button onclick="irAPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? 'disabled' : ''} class="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <span class="material-symbols-outlined text-lg">chevron_right</span>
      </button>
    </div>
  `;
}

function irAPagina(pagina) {
  const totalPaginas = Math.ceil(inscripcionesData.length / POR_PAGINA);
  if (pagina < 1 || pagina > totalPaginas) return;
  paginaActual = pagina;
  renderizarInscripciones(inscripcionesData);
  document.getElementById('tablaInscripcionesContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Buscar inscripción en tiempo real
 */
function buscarInscripcion() {
  clearTimeout(window.busquedaTimeout);
  window.busquedaTimeout = setTimeout(() => {
    cargarInscripciones();
  }, 500);
}

/**
 * Ver detalle completo de inscripción
 */
async function verDetalleInscripcion(dni) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscripciones/${dni}`, {
      headers: getAuthHeadersInscripciones()
    });
    const data = await response.json();
    
    if (data.success) {
      mostrarModalDetalleInscripcion(data);
    } else {
      mostrarNotificacion('Error al cargar detalle: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error de conexión', 'error');
  }
}

/**
 * Modal de detalle de inscripción
 */
function mostrarModalDetalleInscripcion(data) {
  console.log('=== DEBUGGING MODAL ===');
  console.log('Data completa:', data);
  console.log('Inscripciones con estados:', data.inscripciones?.map(i => ({ deporte: i.deporte, estado: i.estado_inscripcion })));
  
  const usuario = data.alumno; // Cambiar de data.usuario a data.alumno para consistencia con Google Sheets
  const inscripciones = data.inscripciones;
  const resumen = data.resumen;
  
  const modal = document.createElement('div');
  modal.id = 'modalDetalleInscripcion';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white dark:bg-surface-dark rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
        <h3 class="text-xl font-bold text-black dark:text-white">Detalle de Inscripción</h3>
        <button onclick="cerrarModalDetalle()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="p-6 space-y-6">
        <!-- Información Personal -->
        <div>
          <h4 class="font-bold text-lg mb-3 text-black dark:text-white">Información Personal</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">DNI</p>
              <p class="font-semibold text-black dark:text-white">${usuario.dni}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Nombres</p>
              <p class="font-semibold text-black dark:text-white">${usuario.nombres}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Apellidos</p>
              <p class="font-semibold text-black dark:text-white">${usuario.apellidos}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Fecha de Nacimiento</p>
              <p class="font-semibold text-black dark:text-white">${formatearFecha(usuario.fecha_nacimiento)}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Edad</p>
              <p class="font-semibold text-black dark:text-white">${usuario.edad} años</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Sexo</p>
              <p class="font-semibold text-black dark:text-white">${usuario.sexo}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
              <p class="font-semibold text-black dark:text-white">${usuario.telefono || 'N/A'}</p>
            </div>
            <div class="col-span-2">
              <p class="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p class="font-semibold text-black dark:text-white">${usuario.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        <!-- Número de Operación -->
        ${usuario.numero_operacion ? `
        <div>
          <div class="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
            <span class="material-symbols-outlined text-2xl text-amber-600">receipt_long</span>
            <div class="flex-1">
              <p class="text-xs text-amber-600 dark:text-amber-400 font-medium">Nro. de Operación</p>
              <p class="text-lg font-bold font-mono text-amber-800 dark:text-amber-200">${usuario.numero_operacion}</p>
            </div>
            <button onclick="verificarNumOpEnModal('${usuario.numero_operacion}')" 
              class="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 dark:bg-amber-800 dark:hover:bg-amber-700 text-amber-800 dark:text-amber-200 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1" title="Buscar duplicados">
              <span class="material-symbols-outlined text-base">search</span> Verificar
            </button>
          </div>
          <!-- Resultados de verificación inline -->
          <div id="resultadosVerificacionModal" class="mt-3 hidden"></div>
        </div>
        ` : ''}
        
        <!-- documentos -->
        <div>
          <h4 class="font-bold text-lg mb-3 text-black dark:text-white">documentos</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${usuario.dni_frontal_url ? `
              <a href="${usuario.dni_frontal_url}" target="_blank" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
                <span class="material-symbols-outlined text-4xl text-primary">badge</span>
                <p class="mt-2 text-sm font-semibold text-black dark:text-white">DNI Frontal</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Click para ver</p>
              </a>
            ` : '<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center"><p class="text-sm text-gray-400">DNI Frontal no disponible</p></div>'}
            
            ${usuario.dni_reverso_url ? `
              <a href="${usuario.dni_reverso_url}" target="_blank" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
                <span class="material-symbols-outlined text-4xl text-primary">badge</span>
                <p class="mt-2 text-sm font-semibold text-black dark:text-white">DNI Reverso</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Click para ver</p>
              </a>
            ` : '<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center"><p class="text-sm text-gray-400">DNI Reverso no disponible</p></div>'}
            
            ${usuario.foto_carnet_url ? `
              <a href="${usuario.foto_carnet_url}" target="_blank" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
                <span class="material-symbols-outlined text-4xl text-primary">photo_camera</span>
                <p class="mt-2 text-sm font-semibold text-black dark:text-white">Foto Carnet</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Click para ver</p>
              </a>
            ` : '<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center"><p class="text-sm text-gray-400">Foto Carnet no disponible</p></div>'}
          </div>
        </div>
        
        <!-- resumen -->
        <div>
          <h4 class="font-bold text-lg mb-3 text-black dark:text-white">resumen</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p class="text-xs text-blue-600 dark:text-blue-400">Total Inscripciones</p>
              <p class="text-2xl font-bold text-blue-700 dark:text-blue-300">${resumen.total_inscripciones}</p>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p class="text-xs text-green-600 dark:text-green-400">Deportes</p>
              <p class="text-2xl font-bold text-green-700 dark:text-green-300">${resumen.deportes_distintos}</p>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p class="text-xs text-purple-600 dark:text-purple-400">Días Activos</p>
              <p class="text-2xl font-bold text-purple-700 dark:text-purple-300">${resumen.dias_activos}</p>
            </div>
            <div class="bg-primary/10 rounded-lg p-4">
              <p class="text-xs text-primary">Monto Total</p>
              <p class="text-2xl font-bold text-primary">S/ ${resumen.monto_total.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <!-- Horarios Inscritos -->
        <div>
          <h4 class="font-bold text-lg mb-3 text-black dark:text-white">Horarios Inscritos</h4>
          <div class="space-y-3">
            ${(() => {
              if (inscripciones.length === 0) return '<p class="text-center text-gray-500 py-4">Sin inscripciones activas</p>';
              
              // Agrupar por inscripcion_id (deporte)
              const deportesMap = {};
              inscripciones.forEach(ins => {
                const key = ins.inscripcion_id;
                if (!deportesMap[key]) {
                  deportesMap[key] = {
                    inscripcion_id: ins.inscripcion_id,
                    deporte: ins.deporte,
                    categoria: ins.categoria || 'Sin categoría',
                    plan: ins.plan || 'Económico',
                    precio: ins.precio,
                    estado_inscripcion: ins.estado_inscripcion || 'activa',
                    icono: ins.icono || 'sports',
                    horarios: []
                  };
                }
                if (ins.dia) {
                  deportesMap[key].horarios.push({ dia: ins.dia, hora_inicio: ins.hora_inicio, hora_fin: ins.hora_fin });
                }
              });
              
              return Object.values(deportesMap).map(dep => {
                const esSuspendido = dep.estado_inscripcion === 'suspendida';
                const esPendiente = dep.estado_inscripcion === 'pendiente';
                
                const borderClass = esSuspendido 
                  ? 'border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 opacity-60'
                  : esPendiente
                    ? 'border-2 border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10'
                    : 'border-2 border-green-200 dark:border-green-800 bg-gray-50 dark:bg-gray-800';
                
                let estadoBadge;
                if (esSuspendido) {
                  estadoBadge = '<span class="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Pausado</span>';
                } else if (esPendiente) {
                  estadoBadge = '<span class="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pendiente de Pago</span>';
                } else {
                  estadoBadge = '<span class="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Pago Confirmado</span>';
                }
                
                const horariosHTML = dep.horarios.map(h => 
                  `<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span class="material-symbols-outlined text-xs text-primary">calendar_today</span>
                    <span>${h.dia} ${h.hora_inicio || ''} ${h.hora_fin ? '- ' + h.hora_fin : ''}</span>
                  </div>`
                ).join('');
                
                const botonActivar = esPendiente 
                  ? `<button onclick="activarInscripcion(${dep.inscripcion_id}, '${usuario.dni}')" 
                      class="mt-3 w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2">
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                      Activar ${dep.deporte}
                    </button>`
                  : '';
                
                const botonPendiente = !esPendiente && !esSuspendido
                  ? `<button onclick="marcarPendienteInscripcion(${dep.inscripcion_id}, '${usuario.dni}')" 
                      class="mt-2 w-full px-3 py-2 border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2">
                      <span class="material-symbols-outlined text-sm">pending</span>
                      Marcar Pendiente
                    </button>`
                  : '';
                
                return `
                  <div class="${borderClass} rounded-xl p-4">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-2xl ${esSuspendido ? 'text-gray-400' : 'text-primary'}">${dep.icono}</span>
                        <div>
                          <p class="font-bold text-black dark:text-white">${dep.deporte} - ${dep.categoria}</p>
                          <p class="text-xs text-gray-500">${dep.plan} | S/ ${parseFloat(dep.precio || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      ${estadoBadge}
                    </div>
                    <div class="space-y-1 ml-9">${horariosHTML}</div>
                    ${botonActivar}
                    ${botonPendiente}
                  </div>
                `;
              }).join('');
            })()}
          </div>
        </div>
      </div>
      
      <div class="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
        <button onclick="cerrarModalDetalle()" class="px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-semibold transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function cerrarModalDetalle() {
  const modal = document.getElementById('modalDetalleInscripcion');
  if (modal) modal.remove();
}

/**
 * Verificar duplicados del número de operación directamente dentro del modal de detalle
 */
async function verificarNumOpEnModal(numOp) {
  const contenedor = document.getElementById('resultadosVerificacionModal');
  if (!contenedor) return;

  contenedor.classList.remove('hidden');
  contenedor.innerHTML = `
    <div class="flex items-center gap-2 text-amber-600 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
      <span class="material-symbols-outlined animate-spin text-base">progress_activity</span>
      <span class="text-sm">Buscando duplicados...</span>
    </div>`;

  try {
    const API_BASE = (window.API_BASE_OVERRIDE && !window.API_BASE_OVERRIDE.includes('%VITE_API_BASE%'))
        ? window.API_BASE_OVERRIDE
        : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3002'
            : 'https://api.jaguarescar.com');
    const resp = await fetch(`${API_BASE}/api/admin/buscar-numero-operacion?numero_operacion=${encodeURIComponent(numOp)}`);
    const data = await resp.json();

    if (!data.success) {
      contenedor.innerHTML = `<div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"><p class="text-sm text-red-600 font-semibold">${data.error || 'Error al buscar'}</p></div>`;
      return;
    }

    if (data.total === 0) {
      contenedor.innerHTML = `
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4 flex items-center gap-3">
          <span class="material-symbols-outlined text-green-600 text-2xl">verified</span>
          <div>
            <p class="font-bold text-green-800 dark:text-green-300 text-sm">Sin duplicados</p>
            <p class="text-xs text-green-700 dark:text-green-400">No se encontraron otros registros con el número <span class="font-mono font-bold">${numOp}</span></p>
          </div>
        </div>`;
      return;
    }

    // Hay resultados
    const esDuplicado = data.es_duplicado;
    let alertaHtml = '';
    if (esDuplicado) {
      alertaHtml = `
        <div class="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-3 mb-3 flex items-start gap-2">
          <span class="material-symbols-outlined text-red-600 text-xl flex-shrink-0">warning</span>
          <div>
            <p class="font-bold text-red-800 dark:text-red-300 text-sm">${data.mensaje_duplicado}</p>
            <p class="text-xs text-red-700 dark:text-red-400 mt-1">Verifica los comprobantes antes de confirmar estos pagos.</p>
          </div>
        </div>`;
    } else {
      alertaHtml = `
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-400 rounded-lg p-3 mb-3 flex items-center gap-2">
          <span class="material-symbols-outlined text-green-600 text-xl">check_circle</span>
          <p class="text-sm font-semibold text-green-800 dark:text-green-300">Número único - sin duplicados detectados</p>
        </div>`;
    }

    const filasHtml = data.resultados.map(r => {
      const estadoColor = r.estado_pago === 'confirmado' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' :
                          r.estado_pago === 'rechazado' ? 'text-red-600 bg-red-50 dark:bg-red-900/20' :
                          'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      const fecha = r.fecha_inscripcion ? new Date(r.fecha_inscripcion).toLocaleDateString('es-PE') : '-';
      return `
        <tr class="border-b border-gray-100 dark:border-gray-700">
          <td class="px-2 py-1.5 text-xs font-mono font-bold">${r.dni}</td>
          <td class="px-2 py-1.5 text-xs font-semibold">${r.nombres} ${r.apellidos}</td>
          <td class="px-2 py-1.5"><span class="text-[11px] font-bold px-1.5 py-0.5 rounded-full ${estadoColor}">${r.estado_pago || 'pendiente'}</span></td>
          <td class="px-2 py-1.5 text-xs text-gray-500">${fecha}</td>
          <td class="px-2 py-1.5">
            ${r.comprobante_pago_url ? `<a href="${r.comprobante_pago_url}" target="_blank" class="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-sm">image</span>Ver</a>` : '<span class="text-xs text-gray-400">—</span>'}
          </td>
        </tr>`;
    }).join('');

    contenedor.innerHTML = `
      ${alertaHtml}
      <div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <th class="px-2 py-1.5 text-left text-[11px] font-bold uppercase text-gray-500">DNI</th>
              <th class="px-2 py-1.5 text-left text-[11px] font-bold uppercase text-gray-500">Alumno</th>
              <th class="px-2 py-1.5 text-left text-[11px] font-bold uppercase text-gray-500">Estado</th>
              <th class="px-2 py-1.5 text-left text-[11px] font-bold uppercase text-gray-500">Fecha</th>
              <th class="px-2 py-1.5 text-left text-[11px] font-bold uppercase text-gray-500">Comp.</th>
            </tr>
          </thead>
          <tbody>${filasHtml}</tbody>
        </table>
      </div>
      <p class="text-[11px] text-gray-400 mt-1.5">${data.total} resultado(s) con nro. <span class="font-mono font-bold">${numOp}</span></p>`;

  } catch (err) {
    console.error('Error verificando número de operación:', err);
    contenedor.innerHTML = `
      <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p class="text-sm text-red-600 font-semibold">Error de conexión al verificar.</p>
      </div>`;
  }
}

// ==================== MODALES DE CONFIRMACI�"N ====================

/**
 * Mostrar modal de confirmación personalizado
 */
function mostrarModalConfirmacion(config) {
  // Remover modal anterior si existe
  const existente = document.getElementById('modalConfirmacionPago');
  if (existente) existente.remove();

  const modal = document.createElement('div');
  modal.id = 'modalConfirmacionPago';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-fadeIn">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl ${config.iconColor}">${config.icon}</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">${config.titulo}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">${config.subtitulo}</p>
          </div>
        </div>
      </div>
      
      <!-- Contenido -->
      <div class="p-6">
        <p class="text-gray-700 dark:text-gray-300 mb-4">${config.Mensaje}</p>
        
        ${config.campos ? config.campos : ''}
      </div>
      
      <!-- Acciones -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
        <button onclick="cerrarModalConfirmacion()" 
                class="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium">
          Cancelar
        </button>
        <button onclick="${config.onConfirm}" 
                class="px-5 py-2.5 rounded-lg ${config.btnClass} text-white font-medium transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined text-lg">${config.btnIcon}</span>
          ${config.btnTexto}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  // Cerrar con Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') cerrarModalConfirmacion();
  };
  document.addEventListener('keydown', handleEscape);
  modal.dataset.escapeHandler = 'true';
  
  // Cerrar click fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModalConfirmacion();
  });
}

function cerrarModalConfirmacion() {
  const modal = document.getElementById('modalConfirmacionPago');
  if (modal) {
    modal.classList.add('animate-fadeOut');
    setTimeout(() => modal.remove(), 200);
  }
}

/**
 * Confirmar pago de un usuario
 */
function confirmarPago(dni) {
  mostrarModalConfirmacion({
    titulo: 'Confirmar Pago',
    subtitulo: `DNI: ${dni}`,
    icon: 'payments',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    Mensaje: 'Se activarán todas las inscripciones del alumno y se registrará el pago como <strong>monto completo</strong>.',
    campos: '', // TODO: saldo/deuda parcial — restaurar campos de monto y número de operación
    btnTexto: 'Confirmar Pago',
    btnIcon: 'check_circle',
    btnClass: 'bg-green-600 hover:bg-green-700',
    onConfirm: `ejecutarConfirmacionPago('${dni}')`
  });
}

async function ejecutarConfirmacionPago(dni) {
  // TODO: saldo/deuda parcial — restaurar cuando se implemente
  // const monto = document.getElementById('montoPago')?.value;
  // const numeroOp = document.getElementById('numeroOperacion')?.value;
  const monto = null;
  const numeroOp = null;
  
  // Deshabilitar botón mientras procesa
  const btn = document.querySelector('#modalConfirmacionPago button[onclick*="ejecutar"]');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Procesando...';
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscripciones/${dni}/confirmar-pago`, {
      method: 'PUT',
      headers: getAuthHeadersInscripciones(),
      body: JSON.stringify({
        monto_pago: monto ? parseFloat(monto) : null,
        numero_operacion: numeroOp || null
      })
    });
    
    const data = await response.json();
    
    cerrarModalConfirmacion();
    
    if (data.success) {
      mostrarNotificacion(`�o. Pago confirmado. ${data.inscripciones_activadas} inscripciones activadas`, 'success');
      cargarInscripciones();
    } else {
      mostrarNotificacion('Error: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    cerrarModalConfirmacion();
    mostrarNotificacion('Error de conexión', 'error');
  }
}

/**
 * Activar una inscripción específica (por deporte)
 */
function activarInscripcion(inscripcionId, dni) {
  mostrarModalConfirmacion({
    titulo: 'Activar Inscripción',
    subtitulo: `DNI: ${dni}`,
    icon: 'check_circle',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    Mensaje: '¿Confirmar la activación de esta inscripción? El alumno podrá asistir a los horarios asignados.',
    btnTexto: 'Activar',
    btnIcon: 'check_circle',
    btnClass: 'bg-green-600 hover:bg-green-700',
    onConfirm: `ejecutarActivacion(${inscripcionId}, '${dni}')`
  });
}

async function ejecutarActivacion(inscripcionId, dni) {
  cerrarModalConfirmacion();
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscripciones/activar/${inscripcionId}`, {
      method: 'PUT',
      headers: getAuthHeadersInscripciones()
    });
    
    const data = await response.json();
    
    if (data.success) {
      mostrarNotificacion(data.mensaje, 'success');
      cerrarModalDetalle();
      verDetalleInscripcion(dni);
      cargarInscripciones();
    } else {
      mostrarNotificacion('Error: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error de conexión', 'error');
  }
}

function marcarPendienteInscripcion(inscripcionId, dni) {
  mostrarModalConfirmacion({
    titulo: 'Marcar Pendiente',
    subtitulo: `DNI: ${dni}`,
    icon: 'pending',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    Mensaje: '¿Marcar esta inscripción como pendiente de pago?',
    btnTexto: 'Marcar Pendiente',
    btnIcon: 'pending',
    btnClass: 'bg-yellow-500 hover:bg-yellow-600',
    onConfirm: `ejecutarMarcarPendiente(${inscripcionId}, '${dni}')`
  });
}

async function ejecutarMarcarPendiente(inscripcionId, dni) {
  cerrarModalConfirmacion();
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscripciones/pendiente/${inscripcionId}`, {
      method: 'PUT',
      headers: getAuthHeadersInscripciones()
    });
    
    const data = await response.json();
    
    if (data.success) {
      mostrarNotificacion(data.mensaje, 'success');
      cerrarModalDetalle();
      verDetalleInscripcion(dni);
      cargarInscripciones();
    } else {
      mostrarNotificacion('Error: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error de conexión', 'error');
  }
}

/**
 * Rechazar pago
 */
function rechazarPago(dni) {
  mostrarModalConfirmacion({
    titulo: 'Rechazar Pago',
    subtitulo: `DNI: ${dni}`,
    icon: 'cancel',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    Mensaje: 'Indica el motivo del rechazo para notificar al usuario.',
    campos: `
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo del rechazo *</label>
        <textarea id="motivoRechazo" rows="3" placeholder="Ej: Comprobante ilegible, monto incorrecto..."
                  class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white resize-none"></textarea>
      </div>
    `,
    btnTexto: 'Rechazar Pago',
    btnIcon: 'do_not_disturb',
    btnClass: 'bg-red-600 hover:bg-red-700',
    onConfirm: `ejecutarRechazo('${dni}')`
  });
}

async function ejecutarRechazo(dni) {
  const motivo = document.getElementById('motivoRechazo')?.value?.trim();
  
  if (!motivo) {
    document.getElementById('motivoRechazo').classList.add('border-red-500', 'ring-2', 'ring-red-200');
    document.getElementById('motivoRechazo').focus();
    return;
  }
  
  // Deshabilitar botón mientras procesa
  const btn = document.querySelector('#modalConfirmacionPago button[onclick*="ejecutar"]');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Procesando...';
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscripciones/${dni}/rechazar-pago`, {
      method: 'PUT',
      headers: getAuthHeadersInscripciones(),
      body: JSON.stringify({ motivo })
    });
    
    const data = await response.json();
    
    cerrarModalConfirmacion();
    
    if (data.success) {
      mostrarNotificacion('�o. Pago rechazado correctamente', 'success');
      cargarInscripciones();
    } else {
      mostrarNotificacion('Error: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    cerrarModalConfirmacion();
    mostrarNotificacion('Error de conexión', 'error');
  }
}

/**
 * Cargar estadísticas de inscripciones
 */
async function cargarEstadisticasInscripciones() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/estadisticas/inscripciones`, {
      headers: getAuthHeadersInscripciones()
    });
    const data = await response.json();
    
    if (data.success) {
      const stats = data.estadisticas;
      const container = document.getElementById('estadisticasInscripciones');
      
      const pendientes = stats.estados_pago.find(e => e.estado_pago === 'pendiente')?.cantidad || 0;
      const confirmados = stats.estados_pago.find(e => e.estado_pago === 'confirmado')?.cantidad || 0;
      
      container.innerHTML = `
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p class="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Usuarios</p>
          <p class="text-2xl font-bold text-blue-700 dark:text-blue-300">${stats.total_usuarios}</p>
        </div>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <p class="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Pagos Pendientes</p>
          <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-300">${pendientes}</p>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p class="text-xs text-green-600 dark:text-green-400 mb-1">Pagos Confirmados</p>
          <p class="text-2xl font-bold text-green-700 dark:text-green-300">${confirmados}</p>
        </div>
        <div class="bg-primary/10 rounded-lg p-4">
          <p class="text-xs text-primary mb-1">Ingresos Totales</p>
          <p class="text-2xl font-bold text-primary">S/ ${stats.ingresos_confirmados.toFixed(2)}</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
}

// ==================== REPORTES ====================

/**
 * Generar reporte de alumnos
 */
async function generarReporte() {
  const deporteId = document.getElementById('reporteDeporte').value;
  const dia = document.getElementById('reporteDia')?.value;
  const categoria = document.getElementById('reporteCategoria')?.value;
  
  try {
    const params = new URLSearchParams();
    if (deporteId) params.append('deporte_id', deporteId);
    if (dia) params.append('dia', dia);
    if (categoria) params.append('categoria', categoria);
    // Solo muestra inscripciones activas (alumnos con pago confirmado)
    params.append('estado', 'activa');
    
    const response = await fetch(`${API_BASE}/api/admin/reportes/alumnos?${params}`, {
      headers: getAuthHeadersInscripciones()
    });
    const data = await response.json();
    
    if (data.success) {
      reporteData = data.agrupado;
      renderizarReporte(data.agrupado, data.total_alumnos);
    } else {
      mostrarNotificacion('Error: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error de conexión', 'error');
  }
}

/**
 * Renderizar reporte
 */
function renderizarReporte(agrupado, totalAlumnos) {
  const container = document.getElementById('resultadosReporte');
  const sinResultados = document.getElementById('sinResultados');
  const botonesExportacion = document.getElementById('botonesExportacion');
  
  if (!agrupado || agrupado.length === 0) {
    ocultarelemento('resultadosReporte');
    ocultarelemento('botonesExportacion');
    mostrarelemento('sinResultados');
    return;
  }
  
  mostrarelemento('resultadosReporte');
  mostrarelemento('botonesExportacion');
  ocultarelemento('sinResultados');
  
  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-black dark:text-white">Resultados</h3>
        <span class="px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold">
          ${totalAlumnos} alumnos encontrados
        </span>
      </div>
      
      <div class="space-y-6">
        ${agrupado.map(grupo => `
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h4 class="font-bold text-black dark:text-white">${grupo.deporte} - ${grupo.dia} ${grupo.hora_inicio}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                ${grupo.categoria ? `Categoría: ${grupo.categoria}` : ''} 
                ${grupo.nivel ? `| Nivel: ${grupo.nivel}` : ''}
                | ${grupo.alumnos.length} alumnos
              </p>
            </div>
            <div class="p-4">
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead>
                    <tr class="border-b border-gray-200 dark:border-gray-700">
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">#</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">DNI</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Nombres</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Apellidos</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Edad</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Sexo</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Teléfono</th>
                      <th class="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Apoderado</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${grupo.alumnos.map((alumno, idx) => `
                      <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td class="py-2 px-3 text-sm">${idx + 1}</td>
                        <td class="py-2 px-3 text-sm font-medium">${alumno.dni}</td>
                        <td class="py-2 px-3 text-sm">${alumno.nombres}</td>
                        <td class="py-2 px-3 text-sm">${alumno.apellidos}</td>
                        <td class="py-2 px-3 text-sm">${alumno.edad}</td>
                        <td class="py-2 px-3 text-sm">${alumno.sexo}</td>
                        <td class="py-2 px-3 text-sm">${alumno.telefono || 'N/A'}</td>
                        <td class="py-2 px-3 text-sm">${alumno.apoderado || 'N/A'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Exportar a Excel
 */
function exportarExcel() {
  if (!reporteData || reporteData.length === 0) {
    mostrarNotificacion('No hay datos para exportar', 'error');
    return;
  }
  
  // Convertir datos a CSV con separador de punto y coma para mejor compatibilidad con Excel
  let csv = 'Deporte;Dia;Hora;Categoria;DNI;Nombres;Apellidos;Edad;Sexo;Telefono;Apoderado\n';
  
  reporteData.forEach(grupo => {
    grupo.alumnos.forEach(alumno => {
      const deporte = (grupo.deporte || '').replace(/;/g, ',');
      const dia = (grupo.dia || '').replace(/;/g, ',');
      const hora = (grupo.hora_inicio || '').replace(/;/g, ',');
      const categoria = (grupo.categoria || '').replace(/;/g, ',');
      const dni = (alumno.dni || '').toString().replace(/;/g, ',');
      const nombres = (alumno.nombres || '').replace(/;/g, ',');
      const apellidos = (alumno.apellidos || '').replace(/;/g, ',');
      const edad = (alumno.edad || '').toString().replace(/;/g, ',');
      const sexo = (alumno.sexo || '').replace(/;/g, ',');
      const telefono = (alumno.telefono || '').replace(/;/g, ',');
      const apoderado = (alumno.apoderado || '').replace(/;/g, ',');
      
      csv += `${deporte};${dia};${hora};${categoria};${dni};${nombres};${apellidos};${edad};${sexo};${telefono};${apoderado}\n`;
    });
  });
  
  // Descargar con BOM para UTF-8
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `reporte-alumnos-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  mostrarNotificacion('�o. Excel generado exitosamente', 'success');
}

/**
 * Exportar a PDF (usando window.print)
 */
function exportarPDF() {
  window.print();
}

/**
 * Imprimir reporte
 */
function imprimirReporte() {
  window.print();
}

/**
 * Formatear fecha
 */
function formatearFecha(fecha) {
  if (!fecha) return 'N/A';
  // Extraer solo la parte YYYY-MM-DD (funciona tanto para "2016-06-19" como "2016-06-19T00:00:00.000Z")
  // y usar T12:00:00 para evitar desfase UTC-5 (Perú)
  const datePart = typeof fecha === 'string' ? fecha.substring(0, 10) : null;
  const d = datePart ? new Date(datePart + 'T12:00:00') : new Date(fecha);
  return d.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// ==================== INICIALIZACI�"N ====================

// Cargar filtros de reportes
async function cargarFiltrosReportes() {
  try {
    // Cargar deportes
    const response = await fetch(`${API_BASE}/api/admin/deportes`, {
      headers: getAuthHeadersInscripciones()
    });
    const data = await response.json();
    
    if (data.success) {
      const select = document.getElementById('reporteDeporte');
      select.innerHTML = '<option value="">Todos los deportes</option>' +
        data.deportes.map(d => `<option value="${d.deporte_id}">${d.nombre}</option>`).join('');
    }
    
    // Cargar categorías
    const responseCat = await fetch(`${API_BASE}/api/admin/categorias`, {
      headers: getAuthHeadersInscripciones()
    });
    const dataCat = await responseCat.json();
    
    if (dataCat.success) {
      const select = document.getElementById('reporteCategoria');
      const categorias = [...new Set(dataCat.categorias.map(c => c.nombre))];
      select.innerHTML = '<option value="">Todas las categorías</option>' +
        categorias.map(c => `<option value="${c}">${c}</option>`).join('');
    }
  } catch (error) {
    console.error('Error al cargar filtros:', error);
  }
}

// ==================== FUNCIONES AUXILIARES ====================

function mostrarelemento(id) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.classList.remove('hidden');
}

function ocultarelemento(id) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.classList.add('hidden');
}

// ==================== ELIMINAR INSCRIPCIONES ====================

let _asistenciasData = null; // cache data para re-render del calendario

async function verAsistenciasAlumno(dni, nombre) {
    const modal = document.createElement('div');
    modal.id = 'modalAsistenciasAlumno';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-surface-dark rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
          <div class="text-white px-6 py-4 rounded-t-xl flex justify-between items-center flex-shrink-0" style="background:#4f46e5;">
                <div>
                    <h3 class="text-lg font-bold">Asistencias</h3>
              <p class="text-sm" style="color:#e0e7ff;">${nombre} &bull; DNI: ${dni}</p>
                </div>
                <button onclick="document.getElementById('modalAsistenciasAlumno').remove()" class="hover:bg-white/20 rounded-full p-1">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div id="asistenciasBody" class="flex-1 overflow-y-auto p-5">
                <div class="flex justify-center py-10">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2" style="border-color:#4f46e5;"></div>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);

    try {
        const res = await fetch(`${API_BASE}/api/admin/alumnos/${dni}/asistencias`, { headers: getAuthHeadersInscripciones() });
        const data = await res.json();
        const body = document.getElementById('asistenciasBody');

        if (!data.success || data.asistencias.length === 0) {
            body.innerHTML = `<div class="text-center py-10 text-gray-400">
                <span class="material-symbols-outlined" style="font-size:48px">event_busy</span>
                <p class="mt-2 font-medium">Sin registros de asistencia</p>
            </div>`;
            return;
        }

        _asistenciasData = data;

        // Determinar mes más reciente con datos
        const fechas = data.asistencias.map(a => {
            const solo = a.fecha.split('T')[0];
            return new Date(solo + 'T12:00:00');
        });
        const maxFecha = new Date(Math.max(...fechas));
        renderCalendarioAsistencias(maxFecha.getFullYear(), maxFecha.getMonth(), data);
    } catch (e) {
        document.getElementById('asistenciasBody').innerHTML = `<p class="text-red-500 text-center py-8">Error al cargar asistencias</p>`;
    }
}

function renderCalendarioAsistencias(anio, mes, data, filtroDeporte) {
    const body = document.getElementById('asistenciasBody');
    if (!body) return;

    // Paleta de colores por deporte (base: color del badge)
    const PALETA = [
        { base:'#3b82f6', light:'#eff6ff', dark:'#1d4ed8' },  // azul
        { base:'#8b5cf6', light:'#f5f3ff', dark:'#6d28d9' },  // violeta
        { base:'#f59e0b', light:'#fffbeb', dark:'#b45309' },  // ámbar
        { base:'#ec4899', light:'#fdf2f8', dark:'#be185d' },  // rosa
        { base:'#06b6d4', light:'#ecfeff', dark:'#0e7490' },  // cyan
        { base:'#10b981', light:'#ecfdf5', dark:'#047857' },  // esmeralda
        { base:'#f97316', light:'#fff7ed', dark:'#c2410c' },  // naranja
        { base:'#6366f1', light:'#eef2ff', dark:'#4338ca' },  // índigo
    ];

    // Deportes únicos en toda la data
    const deportesUnicos = [...new Set(data.asistencias.map(a => a.deporte))].sort();
    const colorPorDeporte = {};
    deportesUnicos.forEach((dep, i) => { colorPorDeporte[dep] = PALETA[i % PALETA.length]; });

    // Abreviatura de 3-4 letras para cada deporte
    function abrev(nombre) {
        const palabras = nombre.trim().split(/\s+/);
        if (palabras.length === 1) return nombre.substring(0, 4).toUpperCase();
        return palabras.map(p => p[0]).join('').substring(0, 4).toUpperCase();
    }

    // Filtrar asistencias según deporte seleccionado
    const asistenciasFiltradas = filtroDeporte
        ? data.asistencias.filter(a => a.deporte === filtroDeporte)
        : data.asistencias;

    // Recalcular estadísticas con filtro
    const total = asistenciasFiltradas.length;
    const presentes = asistenciasFiltradas.filter(a => a.presente).length;
    const ausentes = total - presentes;
    const pct = total > 0 ? Math.round((presentes / total) * 100) : 0;
    const pctColor = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';

    // Mapa de fecha → asistencias filtradas del día
    const mapaFechas = {};
    asistenciasFiltradas.forEach(a => {
        const key = a.fecha.split('T')[0].substring(0, 10);
        if (!mapaFechas[key]) mapaFechas[key] = [];
        mapaFechas[key].push(a);
    });

    // Calcular meses disponibles (sobre datos filtrados o todos para navegación)
    const mesesConDatos = [...new Set(asistenciasFiltradas.map(a => {
        const d = new Date(a.fecha.split('T')[0] + 'T12:00:00');
        return `${d.getFullYear()}-${d.getMonth()}`;
    }))].sort().reverse();
    const mesActualKey = `${anio}-${mes}`;
    const idxMes = mesesConDatos.indexOf(mesActualKey);
    const hayAnterior = idxMes < mesesConDatos.length - 1;
    const haySiguiente = idxMes > 0;

    const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

    // Construir grilla del mes
    const primerDia = new Date(anio, mes, 1).getDay();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const hoy = new Date();

    // Argumento filtro serializado para los onclick
    const filtroArg = filtroDeporte ? `'${filtroDeporte.replace(/'/g, "\\'")}'` : 'null';

    let celdas = '';
    for (let i = 0; i < primerDia; i++) {
        celdas += `<div></div>`;
    }
    for (let d = 1; d <= diasEnMes; d++) {
        const mm = String(mes + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        const key = `${anio}-${mm}-${dd}`;
        const registros = mapaFechas[key];
        const esHoy = hoy.getFullYear() === anio && hoy.getMonth() === mes && hoy.getDate() === d;

        const borderHoy = esHoy ? 'box-shadow:0 0 0 2px #7c3aed;' : '';
        const bgCelda = registros ? '' : 'background:#f9fafb;';

        let badgesHTML = '';
        if (registros) {
            badgesHTML = registros.map(r => {
                const c = colorPorDeporte[r.deporte] || PALETA[0];
                const bgB = r.presente ? '#dcfce7' : '#fee2e2';
                const colorB = r.presente ? '#15803d' : '#dc2626';
                const borderB = r.presente ? '#86efac' : '#fca5a5';
                return `<div style="background:${bgB};color:${colorB};border:1px solid ${borderB};border-radius:4px;font-size:9px;font-weight:700;padding:1px 3px;margin:1px 0;text-align:center;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${abrev(r.deporte)}
                </div>`;
            }).join('');
        }

        const numColor = registros ? '#1f2937' : '#9ca3af';
        celdas += `
            <div style="text-align:center;padding:3px 2px;border-radius:8px;cursor:${registros ? 'pointer' : 'default'};${bgCelda}${borderHoy};min-height:52px;font-size:12px;font-weight:600;color:${numColor};position:relative;border:1px solid ${registros ? 'transparent' : '#f3f4f6'};"
                 onclick="${registros ? `mostrarDetalleDiaAsistencia('${key}', ${JSON.stringify(registros).replace(/"/g, '&quot;')})` : ''}">
                <div style="margin-bottom:2px;">${d}</div>
                <div style="display:flex;flex-direction:column;gap:1px;">
                    ${badgesHTML}
                </div>
            </div>`;
    }

    // Mes anterior/siguiente
    let prevAnio = anio, prevMes = mes - 1;
    if (prevMes < 0) { prevMes = 11; prevAnio--; }
    let nextAnio = anio, nextMes = mes + 1;
    if (nextMes > 11) { nextMes = 0; nextAnio++; }
    if (hayAnterior) {
        const [pa, pm] = mesesConDatos[idxMes + 1].split('-').map(Number);
        prevAnio = pa; prevMes = pm;
    }
    if (haySiguiente) {
        const [na, nm] = mesesConDatos[idxMes - 1].split('-').map(Number);
        nextAnio = na; nextMes = nm;
    }

    // Pills de filtro por deporte
    const pillsTodos = `<button onclick="renderCalendarioAsistencias(${anio},${mes},_asistenciasData,null)"
        style="padding:4px 10px;border-radius:9999px;font-size:11px;font-weight:600;border:2px solid ${!filtroDeporte ? '#7c3aed' : '#e5e7eb'};background:${!filtroDeporte ? '#7c3aed' : '#fff'};color:${!filtroDeporte ? '#fff' : '#6b7280'};cursor:pointer;">
        Todos
    </button>`;
    const pillsDeportes = deportesUnicos.map(dep => {
        const c = colorPorDeporte[dep];
        const activo = filtroDeporte === dep;
        return `<button onclick="renderCalendarioAsistencias(${anio},${mes},_asistenciasData,'${dep.replace(/'/g, "\\'")}')"
            style="padding:4px 10px;border-radius:9999px;font-size:11px;font-weight:600;border:2px solid ${activo ? c.base : '#e5e7eb'};background:${activo ? c.base : '#fff'};color:${activo ? '#fff' : '#6b7280'};cursor:pointer;">
            ${abrev(dep)} · ${dep}
        </button>`;
    }).join('');

    // Stats por deporte (solo si se muestran todos)
    let statsPorDeporte = '';
    if (!filtroDeporte && deportesUnicos.length >= 1) {
        statsPorDeporte = `<div style="margin-bottom:14px;">
            <div style="font-size:11px;font-weight:600;color:#9ca3af;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em;">Resumen por deporte</div>
            ${deportesUnicos.map(dep => {
                const c = colorPorDeporte[dep];
                const depAsis = data.asistencias.filter(a => a.deporte === dep);
                const dp = depAsis.filter(a => a.presente).length;
                const dt = depAsis.length;
                const da = dt - dp;
                const dpct = dt > 0 ? Math.round((dp/dt)*100) : 0;
                return `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:8px;background:${c.light};margin-bottom:4px;">
                    <div style="width:10px;height:10px;border-radius:50%;background:${c.base};flex-shrink:0;"></div>
                    <span style="font-size:12px;font-weight:600;color:${c.dark};flex:1;">${dep}</span>
                    <span style="font-size:11px;color:#16a34a;font-weight:600;">${dp}P</span>
                    <span style="font-size:11px;color:#dc2626;font-weight:600;">${da}F</span>
                    <div style="width:50px;background:#e5e7eb;border-radius:9999px;height:6px;">
                        <div style="background:${c.base};height:6px;border-radius:9999px;width:${dpct}%;"></div>
                    </div>
                    <span style="font-size:11px;font-weight:700;color:${c.dark};min-width:30px;text-align:right;">${dpct}%</span>
                </div>`;
            }).join('')}
        </div>`;
    }

    body.innerHTML = `
        <!-- Resumen stats -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
            <div style="background:#f9fafb;border-radius:10px;padding:8px;text-align:center;">
                <div style="font-size:20px;font-weight:700;color:#374151;">${total}</div>
                <div style="font-size:11px;color:#9ca3af;">Total clases</div>
            </div>
            <div style="background:#f0fdf4;border-radius:10px;padding:8px;text-align:center;">
                <div style="font-size:20px;font-weight:700;color:#16a34a;">${presentes}</div>
                <div style="font-size:11px;color:#9ca3af;">Asistencias</div>
            </div>
            <div style="background:#fff1f2;border-radius:10px;padding:8px;text-align:center;">
                <div style="font-size:20px;font-weight:700;color:#dc2626;">${ausentes}</div>
                <div style="font-size:11px;color:#9ca3af;">Faltas</div>
            </div>
        </div>

        <!-- Barra de progreso -->
        <div style="display:flex;align-items:center;gap:10px;background:#f9fafb;border-radius:10px;padding:8px 12px;margin-bottom:12px;">
            <div style="flex:1;background:#e5e7eb;border-radius:9999px;height:8px;">
                <div style="background:#16a34a;height:8px;border-radius:9999px;width:${pct}%;transition:width 0.4s;"></div>
            </div>
            <span style="font-weight:700;color:${pctColor};min-width:38px;">${pct}%</span>
            <span style="font-size:12px;color:#9ca3af;">asistencia</span>
        </div>

        <!-- Stats por deporte -->
        ${statsPorDeporte}

        <!-- Filtro por deporte -->
        ${deportesUnicos.length >= 1 ? `
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;align-items:center;">
            <span style="font-size:11px;color:#9ca3af;font-weight:600;">Filtrar:</span>
            ${pillsTodos}
            ${pillsDeportes}
        </div>` : ''}

        <!-- Navegación mes -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <button onclick="${hayAnterior ? `renderCalendarioAsistencias(${prevAnio},${prevMes},_asistenciasData,${filtroArg})` : ''}"
                style="padding:5px 10px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;cursor:${hayAnterior ? 'pointer' : 'not-allowed'};opacity:${hayAnterior ? '1' : '0.35'};font-size:18px;color:#6b7280;">&#8249;</button>
            <span style="font-weight:700;font-size:15px;color:#374151;">${MESES[mes]} ${anio}</span>
            <button onclick="${haySiguiente ? `renderCalendarioAsistencias(${nextAnio},${nextMes},_asistenciasData,${filtroArg})` : ''}"
                style="padding:5px 10px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;cursor:${haySiguiente ? 'pointer' : 'not-allowed'};opacity:${haySiguiente ? '1' : '0.35'};font-size:18px;color:#6b7280;">&#8250;</button>
        </div>

        <!-- Cabecera días semana -->
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:4px;">
            ${DIAS_SEMANA.map(d => `<div style="text-align:center;font-size:10px;font-weight:600;color:#9ca3af;">${d}</div>`).join('')}
        </div>

        <!-- Grilla días -->
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;">
            ${celdas}
        </div>

        <!-- Leyenda -->
        <div style="display:flex;gap:14px;margin-top:12px;justify-content:center;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:#6b7280;">
                <div style="width:20px;height:10px;border-radius:3px;background:#dcfce7;border:1px solid #86efac;"></div> Presente
            </div>
            <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:#6b7280;">
                <div style="width:20px;height:10px;border-radius:3px;background:#fee2e2;border:1px solid #fca5a5;"></div> Ausente
            </div>
            <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:#6b7280;">
                <div style="width:12px;height:12px;border-radius:50%;background:#7c3aed;opacity:0.8;"></div> Hoy
            </div>
        </div>

        <!-- Detalle día -->
        <div id="detalleDiaAsistencia"></div>
    `;
}

function mostrarDetalleDiaAsistencia(fecha, registros) {
    const cont = document.getElementById('detalleDiaAsistencia');
    if (!cont) return;
    const d = new Date(fecha + 'T12:00:00');
    const fechaStr = d.toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    cont.innerHTML = `
        <div style="margin-top:14px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <div style="background:#7c3aed;color:#fff;padding:8px 14px;font-size:13px;font-weight:600;">${fechaStr}</div>
            ${registros.map(r => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-bottom:1px solid #f3f4f6;font-size:13px;">
                    <span style="color:#374151;">${r.deporte}${r.categoria ? ` · ${r.categoria}` : ''}</span>
                    <span style="padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:600;background:${r.presente ? '#dcfce7' : '#fee2e2'};color:${r.presente ? '#15803d' : '#dc2626'};">
                        ${r.presente ? '✓ Presente' : '✗ Ausente'}
                    </span>
                </div>
            `).join('')}
        </div>`;
}

function eliminarAlumnoCompleto(dni, nombre) {
  mostrarModalConfirmacion({
    titulo: 'Eliminar Alumno',
    subtitulo: nombre,
    icon: 'person_remove',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    Mensaje: 'Se borrarán sus datos, inscripciones, pagos y todo registro. <strong class="text-red-600">Esta acción NO se puede deshacer.</strong>',
    campos: '',
    onConfirm: `ejecutarEliminarAlumno('${dni}')`,
    btnClass: 'bg-red-600 hover:bg-red-700',
    btnIcon: 'person_remove',
    btnTexto: 'Eliminar Alumno'
  });
}

async function ejecutarEliminarAlumno(dni) {
  cerrarModalConfirmacion();
  try {
    const response = await fetch(`${API_BASE}/api/admin/alumnos/${dni}`, {
      method: 'DELETE',
      headers: getAuthHeadersInscripciones()
    });
    const data = await response.json();
    if (data.success) {
      mostrarNotificacion('Alumno eliminado correctamente', 'success');
      await cargarInscripciones();
    } else {
      mostrarNotificacion('Error: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error de conexión al eliminar alumno', 'error');
  }
}

function eliminarInscripcionesUsuario(dni, nombre) {
  mostrarModalConfirmacion({
    titulo: 'Eliminar Inscripciones',
    subtitulo: nombre,
    icon: 'delete',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    Mensaje: 'Se eliminarán <strong>todas las inscripciones</strong> de este alumno y se liberarán los cupos en los horarios donde esté inscrito.',
    campos: '',
    onConfirm: `ejecutarEliminarInscripciones('${dni}')`,
    btnClass: 'bg-orange-600 hover:bg-orange-700',
    btnIcon: 'delete',
    btnTexto: 'Eliminar Inscripciones'
  });
}

async function ejecutarEliminarInscripciones(dni) {
  cerrarModalConfirmacion();
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscripciones/${dni}`, {
      method: 'DELETE',
      headers: getAuthHeadersInscripciones()
    });
    const data = await response.json();
    if (data.success) {
      mostrarNotificacion(`Inscripciones eliminadas: ${data.eliminadas} horarios liberados`, 'success');
      await cargarInscripciones();
      // Recargar horarios si estamos en la vista de calendario
      if (typeof cargarHorarios === 'function') {
        await cargarHorarios();
      }
    } else {
      mostrarNotificacion('Error: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error de conexión al eliminar inscripciones', 'error');
  }
}

function abrirModalObservacion(dni, notaActual) {
  const existente = document.getElementById('modalObservacion');
  if (existente) existente.remove();

  const modal = document.createElement('div');
  modal.id = 'modalObservacion';
  modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl text-amber-600 dark:text-amber-400">edit_note</span>
          </div>
          <div>
            <h3 class="text-lg font-black text-black dark:text-white uppercase">Observación</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">DNI: ${dni}</p>
          </div>
        </div>
      </div>
      <div class="p-6">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Motivo o nota de pago</label>
        <textarea id="inputObservacion" rows="4"
          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          placeholder="Ej: Paga S/.60 hasta el 15/03 y luego solo sábados...">${notaActual}</textarea>
      </div>
      <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
        <button onclick="document.getElementById('modalObservacion').remove()"
                class="px-5 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold uppercase text-sm">
          Cancelar
        </button>
        <button onclick="guardarObservacion('${dni}')"
                class="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase text-sm transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined text-lg">save</span>
          Guardar
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  setTimeout(() => document.getElementById('inputObservacion')?.focus(), 100);
}

async function guardarObservacion(dni) {
  const notas = document.getElementById('inputObservacion')?.value?.trim() || '';
  const btn = document.querySelector('#modalObservacion button:last-child');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div><span>Guardando...</span>'; }

  try {
    const res = await fetch(`${API_BASE}/api/admin/alumnos/${dni}/notas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
      body: JSON.stringify({ notas })
    });
    const data = await res.json();
    document.getElementById('modalObservacion')?.remove();
    if (data.success) {
      mostrarNotificacion('Observación guardada correctamente', 'success');
      cargarInscripciones(); // recargar la lista
    } else {
      mostrarNotificacion(data.error || 'Error al guardar', 'error');
    }
  } catch (e) {
    mostrarNotificacion('Error de conexión', 'error');
    document.getElementById('modalObservacion')?.remove();
  }
}

function mostrarNotificacion(Mensaje, tipo = 'info') {
  const colores = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600'
  };
  
  const notif = document.createElement('div');
  notif.className = `fixed top-4 right-4 ${colores[tipo]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all`;
  notif.textContent = Mensaje;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}





